let incomeData = JSON.parse(localStorage.getItem("incomeData") || "[]");
let expenseData = JSON.parse(localStorage.getItem("expenseData") || "[]");
let currentChart = null;

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  updateStats();
  updateRecentTransactions();
  initializeChart("expenses");
  checkMobileView();
});


function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });
  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  document
    .querySelector(`.nav-item[onclick="showPage('${pageId}')"]`)
    .classList.add("active");

  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("mobile-open");
  }

  if (pageId === "graphs") {
    const activeGraphBtn = document.querySelector(
      "#graphs .control-btn.active"
    );
    const chartType = activeGraphBtn
      ? activeGraphBtn.dataset.chartType
      : "expenses";
    showChart(chartType, activeGraphBtn);
  }
}

// Only for mobile sidebar toggle (hamburger menu)
function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("mobile-open");
}

// Check view on load and resize
function checkMobileView() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const mobileBtn = document.querySelector(".mobile-menu-btn");

  if (window.innerWidth <= 768) {
    // Mobile view: Sidebar is hidden by default, controlled by hamburger
    sidebar.style.position = "fixed";
    sidebar.style.width = "80px";
    mainContent.style.marginLeft = "0";
    mobileBtn.style.display = "block"; // Ensure hamburger is visible

    // If it's already open, keep it open, otherwise keep it collapsed.
    // But generally, on load or resize, default to collapsed for mobile.
    if (sidebar.classList.contains("mobile-open")) {
      sidebar.classList.remove("mobile-open"); // Collapse on resize if it was open
    }
  } else {
    // Desktop view: Sidebar is always expanded
    sidebar.style.position = "fixed";
    sidebar.style.width = "280px";
    mainContent.style.marginLeft = "280px";
    mobileBtn.style.display = "none"; // Hide hamburger on desktop
    sidebar.classList.remove("mobile-open"); // Ensure mobile-open class is removed on desktop
  }
}

// Income Form Handler
document.getElementById("incomeForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const source = document.getElementById("incomeSource").value;
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  const mode = document.getElementById("incomeMode").value;

  if (source && amount > 0 && mode) {
    const incomeEntry = {
      id: "income-" + Date.now(), // Unique ID
      source: source,
      amount: amount,
      mode: mode,
      date: new Date().toLocaleDateString("en-US"), // Consistent date format
      timestamp: Date.now(),
      type: "Income",
    };

    incomeData.push(incomeEntry);
    localStorage.setItem("incomeData", JSON.stringify(incomeData));

    // Reset form
    this.reset();

    // Update UI
    updateStats();
    updateRecentTransactions();
    updateChart();

    // Show success message
    showNotification("Income added successfully!", "success");
  } else {
    showNotification("Please fill all income fields correctly.", "error");
  }
});

// Expense Form Handler
document.getElementById("expenseForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const category = document.getElementById("expenseCategory").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const mode = document.getElementById("expenseMode").value;

  if (category && amount > 0 && mode) {
    const expenseEntry = {
      id: "expense-" + Date.now(), // Unique ID
      category: category,
      amount: amount,
      mode: mode,
      date: new Date().toLocaleDateString("en-US"), // Consistent date format
      timestamp: Date.now(),
      type: "Expense",
    };

    expenseData.push(expenseEntry);
    localStorage.setItem("expenseData", JSON.stringify(expenseData));

    // Reset form
    this.reset();

    // Update UI
    updateStats();
    updateRecentTransactions();
    updateChart();

    // Show success message
    showNotification("Expense added successfully!", "success");
  } else {
    showNotification("Please fill all expense fields correctly.", "error");
  }
});

// Update Statistics
function updateStats() {
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;

  document.getElementById("totalIncome").textContent = `₹${totalIncome.toFixed(
    2
  )}`;
  document.getElementById(
    "totalExpense"
  ).textContent = `₹${totalExpense.toFixed(2)}`;
  document.getElementById("totalBalance").textContent = `₹${balance.toFixed(
    2
  )}`;
}

// Update Recent Transactions
function updateRecentTransactions() {
  const tbody = document.getElementById("recentTransactions");
  const allTransactions = [
    ...incomeData.map((item) => ({ ...item, category: item.source })), // income.source becomes category for display
    ...expenseData,
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5); // Get last 5

  renderTransactionTable(tbody, allTransactions);
}

// Generic function to render transaction table rows
function renderTransactionTable(tbodyElement, transactions) {
  if (transactions.length === 0) {
    tbodyElement.innerHTML =
      '<tr><td colspan="6" style="text-align: center; color: #718096;">No transactions yet</td></tr>';
    return;
  }

  tbodyElement.innerHTML = transactions
    .map(
      (transaction) => `
                <tr data-id="${transaction.id}" data-type="${transaction.type}">
                    <td>
                        <span style="color: ${
                          transaction.type === "Income" ? "#27ae60" : "#c0392b"
                        };">
                            ${transaction.type}
                        </span>
                    </td>
                    <td data-field="category">${transaction.category}</td>
                    <td data-field="amount">₹${transaction.amount.toFixed(
                      2
                    )}</td>
                    <td data-field="mode">${transaction.mode}</td>
                    <td data-field="date">${transaction.date}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="editTransaction('${
                          transaction.id
                        }')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="deleteTransaction('${
                          transaction.id
                        }')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `
    )
    .join("");
}

// Edit Transaction
function editTransaction(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const type = row.dataset.type;
  const transaction =
    type === "Income"
      ? incomeData.find((item) => item.id === id)
      : expenseData.find((item) => item.id === id);

  if (!transaction) return;

  const categoryField = row.querySelector('[data-field="category"]');
  const amountField = row.querySelector('[data-field="amount"]');
  const modeField = row.querySelector('[data-field="mode"]');
  const dateField = row.querySelector('[data-field="date"]');
  const actionsCell = row.querySelector("td:last-child");

  // Store original content to revert on cancel
  row.dataset.originalCategory = categoryField.textContent;
  row.dataset.originalAmount = transaction.amount; // Store raw amount
  row.dataset.originalMode = modeField.textContent;
  row.dataset.originalDate = dateField.textContent;

  // Make fields editable
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.value = categoryField.textContent;
  categoryInput.className = "form-input form-input-inline"; // Add a class for inline styling
  categoryField.innerHTML = "";
  categoryField.appendChild(categoryInput);

  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.step = "0.01";
  amountInput.value = transaction.amount;
  amountInput.className = "form-input form-input-inline";
  amountField.innerHTML = "";
  amountField.appendChild(amountInput);

  const modeInput = document.createElement("input");
  modeInput.type = "text";
  modeInput.value = modeField.textContent;
  modeInput.className = "form-input form-input-inline";
  modeField.innerHTML = "";
  modeField.appendChild(modeInput);

  const dateInput = document.createElement("input");
  dateInput.type = "text"; // Can use 'date' type for date picker
  dateInput.value = dateField.textContent;
  dateInput.className = "form-input form-input-inline";
  dateField.innerHTML = "";
  dateField.appendChild(dateInput);

  // Change action buttons
  actionsCell.innerHTML = `
                <button class="btn btn-primary btn-sm" onclick="saveTransaction('${id}')"><i class="fas fa-save"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="cancelEdit('${id}')"><i class="fas fa-times"></i></button>
            `;
}

// Save Transaction
function saveTransaction(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const type = row.dataset.type;
  const categoryInput = row.querySelector('[data-field="category"] input');
  const amountInput = row.querySelector('[data-field="amount"] input');
  const modeInput = row.querySelector('[data-field="mode"] input');
  const dateInput = row.querySelector('[data-field="date"] input');

  const newCategory = categoryInput.value;
  const newAmount = parseFloat(amountInput.value);
  const newMode = modeInput.value;
  const newDate = dateInput.value;

  if (
    !newCategory ||
    isNaN(newAmount) ||
    newAmount <= 0 ||
    !newMode ||
    !newDate
  ) {
    showNotification("Please enter valid data for all fields.", "error");
    return;
  }

  if (type === "Income") {
    const index = incomeData.findIndex((item) => item.id === id);
    if (index !== -1) {
      incomeData[index].source = newCategory;
      incomeData[index].amount = newAmount;
      incomeData[index].mode = newMode;
      incomeData[index].date = newDate;
    }
    localStorage.setItem("incomeData", JSON.stringify(incomeData));
  } else {
    // Expense
    const index = expenseData.findIndex((item) => item.id === id);
    if (index !== -1) {
      expenseData[index].category = newCategory;
      expenseData[index].amount = newAmount;
      expenseData[index].mode = newMode;
      expenseData[index].date = newDate;
    }
    localStorage.setItem("expenseData", JSON.stringify(expenseData));
  }

  showNotification("Transaction updated successfully!", "success");
  updateStats();
  updateRecentTransactions();
  updateChart(); // Update charts as data changed
}

// Cancel Edit
function cancelEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const categoryField = row.querySelector('[data-field="category"]');
  const amountField = row.querySelector('[data-field="amount"]');
  const modeField = row.querySelector('[data-field="mode"]');
  const dateField = row.querySelector('[data-field="date"]');
  const actionsCell = row.querySelector("td:last-child");

  // Restore original content
  categoryField.textContent = row.dataset.originalCategory;
  amountField.textContent = `₹${parseFloat(row.dataset.originalAmount).toFixed(
    2
  )}`;
  modeField.textContent = row.dataset.originalMode;
  dateField.textContent = row.dataset.originalDate;

  // Restore action buttons
  actionsCell.innerHTML = `
                <button class="btn btn-secondary btn-sm" onclick="editTransaction('${id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteTransaction('${id}')"><i class="fas fa-trash-alt"></i></button>
            `;
}

// Delete Transaction
function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) {
    return;
  }

  const type = id.startsWith("income-") ? "Income" : "Expense";

  if (type === "Income") {
    incomeData = incomeData.filter((item) => item.id !== id);
    localStorage.setItem("incomeData", JSON.stringify(incomeData));
  } else {
    expenseData = expenseData.filter((item) => item.id !== id);
    localStorage.setItem("expenseData", JSON.stringify(expenseData));
  }

  showNotification("Transaction deleted successfully!", "success");
  updateStats();
  updateRecentTransactions();
  updateChart();
}

// Chart Functions
function initializeChart(type) {
  // No need for getContext here, it will be done in showChart
  const defaultChartBtn = document.querySelector(
    `.control-btn[data-chart-type="${type}"]`
  );
  if (defaultChartBtn) {
    showChart(type, defaultChartBtn);
  } else {
    showChart("expenses", document.querySelector(".control-btn.active")); // Fallback to expenses if no matching type button found
  }
}

function showChart(type, clickedButton) {
  // Update active button
  document.querySelectorAll(".graph-controls .control-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  if (clickedButton) {
    clickedButton.classList.add("active");
    clickedButton.dataset.chartType = type; // Store the chart type on the button
  } else {
    // Fallback if no button is passed (e.g., initial load)
    const targetBtn = document.querySelector(
      `.graph-controls .control-btn[onclick*="showChart('${type}')"]`
    );
    if (targetBtn) targetBtn.classList.add("active");
  }

  if (currentChart) {
    currentChart.destroy();
  }

  const ctx = document.getElementById("mainChart").getContext("2d");

  switch (type) {
    case "expenses":
      currentChart = createExpenseChart(ctx);
      break;
    case "income":
      currentChart = createIncomeChart(ctx);
      break;
    case "trends":
      currentChart = createTrendsChart(ctx);
      break;
  }
}

function createExpenseChart(ctx) {
  const categoryTotals = {};
  expenseData.forEach((expense) => {
    categoryTotals[expense.category] =
      (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#E74C3C",
    "#2ECC71",
  ];

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["No expenses yet"],
      datasets: [
        {
          data: data.length ? data : [1],
          backgroundColor: colors.slice(0, labels.length || 1), // Use only necessary colors
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              family: "Inter",
            },
          },
        },
        title: {
          display: true,
          text: "Expenses by Category",
          font: {
            size: 18,
            weight: "bold",
            family: "Inter",
          },
          color: "#333",
        },
      },
    },
  });
}

function createIncomeChart(ctx) {
  const sourceTotals = {};
  incomeData.forEach((income) => {
    sourceTotals[income.source] =
      (sourceTotals[income.source] || 0) + income.amount;
  });

  const labels = Object.keys(sourceTotals);
  const data = Object.values(sourceTotals);
  const colors = [
    "#27AE60",
    "#6A82FB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#3498DB",
    "#1ABC9C",
  ];

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["No income yet"],
      datasets: [
        {
          label: "Income Amount (₹)",
          data: data.length ? data : [0],
          backgroundColor: colors.slice(0, labels.length || 1),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Income by Source",
          font: {
            size: 18,
            weight: "bold",
            family: "Inter",
          },
          color: "#333",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "₹" + value;
            },
            font: {
              family: "Inter",
            },
          },
          grid: {
            color: "rgba(0,0,0,0.05)",
          },
        },
        x: {
          ticks: {
            font: {
              family: "Inter",
            },
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

function createTrendsChart(ctx) {
  // Get last 7 days data
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date.toLocaleDateString("en-US"), // Ensure consistent date format for comparison
      income: 0,
      expense: 0,
    });
  }

  // Calculate daily totals
  incomeData.forEach((income) => {
    const dayData = last7Days.find((day) => day.date === income.date);
    if (dayData) {
      dayData.income += income.amount;
    }
  });

  expenseData.forEach((expense) => {
    const dayData = last7Days.find((day) => day.date === expense.date);
    if (dayData) {
      dayData.expense += expense.amount;
    }
  });

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: last7Days.map((day) => day.date),
      datasets: [
        {
          label: "Income",
          data: last7Days.map((day) => day.income),
          borderColor: "#27ae60",
          backgroundColor: "rgba(39, 174, 96, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
        {
          label: "Expenses",
          data: last7Days.map((day) => day.expense),
          borderColor: "#c0392b",
          backgroundColor: "rgba(192, 57, 43, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Income vs Expenses - Last 7 Days",
          font: {
            size: 18,
            weight: "bold",
            family: "Inter",
          },
          color: "#333",
        },
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              family: "Inter",
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "₹" + value;
            },
            font: {
              family: "Inter",
            },
          },
          grid: {
            color: "rgba(0,0,0,0.05)",
          },
        },
        x: {
          ticks: {
            font: {
              family: "Inter",
            },
          },
          grid: {
            display: false,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });
}

function updateChart() {
  if (currentChart) {
    const activeBtn = document.querySelector("#graphs .control-btn.active");
    if (activeBtn) {
      const chartType = activeBtn.dataset.chartType; // Retrieve stored chart type
      showChart(chartType, activeBtn); // Pass the button to ensure active state is maintained
    }
  }
}

// Notification System
function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${
                  type === "success"
                    ? "#27ae60"
                    : type === "error"
                    ? "#c0392b"
                    : "#3498db"
                }; /* More distinct colors */
                color: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                font-weight: 500;
                font-family: 'Inter', sans-serif;
            `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Monthly Notification Check
function checkMonthlyNotification() {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  if (today.getDate() === lastDay.getDate()) {
    showNotification(
      "It's the end of the month! Please check your expenses.",
      "info"
    );
  }
}

// Window resize handler
window.addEventListener("resize", checkMobileView);

// Initialize monthly notification check
checkMonthlyNotification();

// Auto-save data periodically
setInterval(() => {
  localStorage.setItem("incomeData", JSON.stringify(incomeData));
  localStorage.setItem("expenseData", JSON.stringify(expenseData));
}, 30000); 
