let incomeData = JSON.parse(localStorage.getItem("incomeData") || "[]");
let expenseData = JSON.parse(localStorage.getItem("expenseData") || "[]");

document.addEventListener("DOMContentLoaded", function () {
  let userName = document.getElementById('username');
  userName.innerText=localStorage.getItem('expenseuserName') || "User";
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
    closeMobileSidebar();
  }
}

// Updated sidebar functions for new responsive design
function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

function checkMobileView() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (window.innerWidth > 768) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  }
}

function getCurentDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const year = today.getFullYear();
  return `${month}/${day}/${year}`;
}

// ------ Income Form Handler---------
document.getElementById("incomeForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const source = document.getElementById("incomeSource").value;
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  const mode = document.getElementById("incomeMode").value;
  const dateInput = document.getElementById("incomeDate").value;
  const date = dateInput || getCurrentDate();

  if (source && amount > 0 && mode) {
    const incomeEntry = {
      id: "income-" + Date.now(), // Generating a unique ID
      source: source,
      amount: amount,
      mode: mode,
      date: date,
      timestamp: Date.now(),
      type: "Income",
    };

    incomeData.push(incomeEntry);
    localStorage.setItem("incomeData", JSON.stringify(incomeData));
    this.reset();

    // ---- Updating UI ---
    updateStats();
    updateRecentTransactions();
    updateChart();

    // ---- Showing success message ---
    showNotification("Income added successfully!", "success");
  } else {
    showNotification("Please fill all income fields correctly.", "error");
  }
});

// --- --- Expense Form Handler ----------
document.getElementById("expenseForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const category = document.getElementById("expenseCategory").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const mode = document.getElementById("expenseMode").value;
  const dateInput = document.getElementById("expenseDate").value;
  const date = dateInput || getCurrentDate();

  if (category && amount > 0 && mode) {
    const expenseEntry = {
      id: "expense-" + Date.now(), // Generating a unique ID
      category: category,
      amount: amount,
      mode: mode,
      date: date,
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

    showNotification("Expense added successfully!", "success");
  } else {
    showNotification("Please fill all expense fields correctly.", "error");
  }
});

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

function updateRecentTransactions() {
  const tbody = document.getElementById("recentTransactions");
  const allTransactions = [
    ...incomeData.map((item) => ({ ...item, category: item.source })),
    ...expenseData,
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  renderTransactionTable(tbody, allTransactions);
}

function renderTransactionTable(tbodyElement, transactions) {
  if (transactions.length === 0) {
    tbodyElement.innerHTML =
      '<tr><td colspan="6" style="text-align: center; color: #718096;">No transactions yet</td></tr>';
    return;
  }

  tbodyElement.innerHTML = transactions
    .map(
      (transaction) => `
                        <tr data-id="${transaction.id}" data-type="${
        transaction.type
      }">
                            <td>
                                <span style="color: ${
                                  transaction.type === "Income"
                                    ? "#27ae60"
                                    : "#c0392b"
                                };">
                                    ${transaction.type}
                                </span>
                            </td>
                            <td data-field="category">${
                              transaction.category
                            }</td>
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

  row.dataset.originalCategory = categoryField.textContent;
  row.dataset.originalAmount = transaction.amount;
  row.dataset.originalMode = modeField.textContent;
  row.dataset.originalDate = dateField.textContent;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.value = categoryField.textContent;
  categoryInput.className = "form-input form-input-inline";
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
  dateInput.type = "date";
  const dateParts = dateField.textContent.split("/");
  if (dateParts.length === 3) {
    dateInput.value = `${dateParts[2]}-${dateParts[0].padStart(
      2,
      "0"
    )}-${dateParts[1].padStart(2, "0")}`;
  }
  dateInput.className = "form-input form-input-inline";
  dateField.innerHTML = "";
  dateField.appendChild(dateInput);

  actionsCell.innerHTML = `
                <button class="btn btn-primary btn-sm" onclick="saveTransaction('${id}')"><i class="fas fa-save"></i></button>
                <button class="btn btn-secondary btn-sm" onclick="cancelEdit('${id}')"><i class="fas fa-times"></i></button>
            `;
}

function saveTransaction(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const type = row.dataset.type;
  const categoryInput = row.querySelector('[data-field="category"] input');
  const amountInput = row.querySelector('[data-field="amount"] input');
  const modeInput = row.querySelector('[data-field="mode"] input');
  const dateInput = row.querySelector('[data-field="date"] input');

  const newCategory = categoryInput.value.trim();
  const newAmount = parseFloat(amountInput.value);
  const newMode = modeInput.value.trim();
  let newDate = dateInput.value;

  // Handle date conversion
  if (newDate && dateInput.type === "date") {
    const dateObj = new Date(newDate);
    if (!isNaN(dateObj.getTime())) {
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const year = dateObj.getFullYear();
      newDate = `${month}/${day}/${year}`;
    } else {
      newDate = row.dataset.originalDate; // Use original date if invalid
    }
  } else if (!newDate) {
    newDate = row.dataset.originalDate; // Use original date if empty
  }

  // More flexible validation
  if (!newCategory) {
    showNotification("Category/Source cannot be empty.", "error");
    return;
  }

  if (isNaN(newAmount) || newAmount <= 0) {
    showNotification("Please enter a valid amount greater than 0.", "error");
    return;
  }

  if (!newMode) {
    showNotification("Mode of transaction cannot be empty.", "error");
    return;
  }

  if (!newDate) {
    showNotification("Please enter a valid date.", "error");
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
  updateChart();
}

function cancelEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const categoryField = row.querySelector('[data-field="category"]');
  const amountField = row.querySelector('[data-field="amount"]');
  const modeField = row.querySelector('[data-field="mode"]');
  const dateField = row.querySelector('[data-field="date"]');
  const actionsCell = row.querySelector("td:last-child");

  categoryField.textContent = row.dataset.originalCategory;
  amountField.textContent = `₹${parseFloat(row.dataset.originalAmount).toFixed(
    2
  )}`;
  modeField.textContent = row.dataset.originalMode;
  dateField.textContent = row.dataset.originalDate;

  actionsCell.innerHTML = `
                <button class="btn btn-secondary btn-sm" onclick="editTransaction('${id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteTransaction('${id}')"><i class="fas fa-trash-alt"></i></button>
            `;
}

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

function showNotification(message, type = "success") {
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
                };
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

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

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

window.addEventListener("resize", checkMobileView);

checkMonthlyNotification();

setInterval(() => {
  localStorage.setItem("incomeData", JSON.stringify(incomeData));
  localStorage.setItem("expenseData", JSON.stringify(expenseData));
}, 30000);
