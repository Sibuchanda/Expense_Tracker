document.addEventListener("DOMContentLoaded", () => {
  initializeChart("expenses");
});

let currentChart = null;

// -- Getting Income data from Localstorage --
function getIncomeData() {
  return JSON.parse(localStorage.getItem("incomeData") || "[]");
}

// -- Getting Expense data from Localstorage --
function getExpenseData() {
  return JSON.parse(localStorage.getItem("expenseData") || "[]");
}

// ---Initializing the charts ----
function initializeChart(type) {
  const defaultChartBtn = document.querySelector(
    `.control-btn[data-chart-type="${type}"]`
  );
  if (defaultChartBtn) {
    showChart(type, defaultChartBtn);
  } else {
    showChart("expenses", document.querySelector(".control-btn.active"));
  }
}
// -- For showing Charts --------
function showChart(type, clickedButton) {
  document.querySelectorAll(".graph-controls .control-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  if (clickedButton) {
    clickedButton.classList.add("active");
    clickedButton.dataset.chartType = type;
  } else {
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


// --- Creates a chart by using Total Expense data ---
function createExpenseChart(ctx) {
  const expenseData = getExpenseData();
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


// --- Creates a chart by using Total Income data ---
function createIncomeChart(ctx) {
  const incomeData = getIncomeData();
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

// --- This shows Income/Expense trends ---
function createTrendsChart(ctx) {
  const incomeData = getIncomeData(); 
  const expenseData = getExpenseData();

  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // Match YYYY-MM-DD

    last7Days.push({
      date: formattedDate,
      income: 0,
      expense: 0,
    });
  }

  incomeData.forEach((income) => {
    const incomeFormatted = new Date(income.date).toISOString().split("T")[0];
    const dayData = last7Days.find((day) => day.date === incomeFormatted);
    if (dayData) {
      dayData.income += income.amount;
    }
  });

  expenseData.forEach((expense) => {
    const expenseFormatted = new Date(expense.date).toISOString().split("T")[0];
    const dayData = last7Days.find((day) => day.date === expenseFormatted);
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


// -- Updaing Chart details -----
function updateChart() {
  if (currentChart) {
    const activeBtn = document.querySelector("#graphs .control-btn.active");
    if (activeBtn) {
      const chartType = activeBtn.dataset.chartType;
      showChart(chartType, activeBtn);
    }
  }
}