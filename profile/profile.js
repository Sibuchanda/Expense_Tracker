let userData = {
  username: localStorage.getItem("expenseuserName") || "User",
};

let expenseData = JSON.parse(localStorage.getItem("expenseData") || "[]");
let incomeData = JSON.parse(localStorage.getItem("incomeData") || "[]");

document.addEventListener("DOMContentLoaded", function () {
  loadUserData();
  updateStats();
});

function loadUserData() {
  userData.username = localStorage.getItem("expenseuserName") || "User";
  expenseData = JSON.parse(localStorage.getItem("expenseData") || "[]");
  incomeData = JSON.parse(localStorage.getItem("incomeData") || "[]");

  document.getElementById("usernameDisplay").textContent = userData.username;
  document.getElementById("profileCircle").textContent = userData.username
    .charAt(0)
    .toUpperCase();
}

function updateStats() {
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  document.getElementById(
    "totalIncome"
  ).textContent = `₹${totalIncome.toLocaleString()}`;
  document.getElementById(
    "totalExpense"
  ).textContent = `₹${totalExpense.toLocaleString()}`;
  document.getElementById(
    "currentBalance"
  ).textContent = `₹${currentBalance.toLocaleString()}`;

  const balanceCard = document.querySelector(".stat-card.balance");
  balanceCard.classList.remove("positive", "negative");
  balanceCard.classList.add(currentBalance >= 0 ? "positive" : "negative");
}

function editName() {
  document.getElementById("editBtn").classList.add("hidden");
  document.getElementById("editMode").classList.remove("hidden");
  document.getElementById("usernameInput").value = userData.username;
  document.getElementById("usernameInput").focus();
}

function saveName() {
  const newName = document.getElementById("usernameInput").value.trim();
  if (newName) {
    userData.username = newName;
    localStorage.setItem("expenseuserName", newName);

    document.getElementById("usernameDisplay").textContent = newName;
    document.getElementById("profileCircle").textContent = newName
      .charAt(0)
      .toUpperCase();
  }
  cancelEdit();
}

function cancelEdit() {
  document.getElementById("editBtn").classList.remove("hidden");
  document.getElementById("editMode").classList.add("hidden");
}

function showSection(sectionName) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  document.getElementById(sectionName + "Section").classList.add("active");
  event.target.classList.add("active");
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set font to support Unicode characters
  doc.setFont("helvetica");
  
  doc.setFontSize(20);
  doc.text("Expense Tracker Report", 20, 20);

  // User info and date
  doc.setFontSize(14);
  doc.text(`User: ${userData.username}`, 20, 40);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);

  // Calculations
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  // Summary section
  doc.text("Summary:", 20, 70);
  doc.text(`Total Income: \u20B9${totalIncome.toLocaleString()}`, 30, 80);
  doc.text(`Total Expense: \u20B9${totalExpense.toLocaleString()}`, 30, 90);
  
  doc.setTextColor(currentBalance >= 0 ? 40 : 220, currentBalance >= 0 ? 167 : 53, currentBalance >= 0 ? 69 : 69);
  doc.text(`Current Balance: \u20B9${currentBalance.toLocaleString()}`, 30, 100);
  
  doc.setTextColor(0, 0, 0);

  // Income Details
  doc.text("Income Details:", 20, 120);
  let yPos = 130;
  if (incomeData.length === 0) {
    doc.setFontSize(10);
    doc.text("No income records found.", 30, yPos);
    yPos += 15;
  } else {
    incomeData.forEach((item) => {
      doc.setFontSize(10);
      doc.text(
        `${item.date} - ${item.source}: \u20B9${item.amount.toLocaleString()} (${item.mode})`,
        30,
        yPos
      );
      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }
  
  yPos += 10;
  
  // Expense Details
  doc.setFontSize(14);
  doc.text("Expense Details:", 20, yPos);
  yPos += 10;
  
  if (expenseData.length === 0) {
    doc.setFontSize(10);
    doc.text("No expense records found.", 30, yPos);
  } else {
    expenseData.forEach((item) => {
      doc.setFontSize(10);
      doc.text(
        `${item.date} - ${item.category}: \u20B9${item.amount.toLocaleString()} (${item.mode})`,
        30,
        yPos
      );
      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }

  doc.save("expense-report.pdf");
}

function exportToExcel() {
  const wb = XLSX.utils.book_new();
  
  // Calculate totals
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const currentBalance = totalIncome - totalExpense;
  
  // Summary sheet with detailed information
  const summaryData = [
    ["Expense Tracker Report"],
    [""],
    ["User:", userData.username],
    ["Generated on:", new Date().toLocaleDateString()],
    ["Generated at:", new Date().toLocaleTimeString()],
    [""],
    ["Summary"],
    ["Total Income", `₹${totalIncome.toLocaleString()}`],
    ["Total Expense", `₹${totalExpense.toLocaleString()}`],
    ["Current Balance", `₹${currentBalance.toLocaleString()}`],
    [""],
    ["Statistics"],
    ["Number of Income Entries", incomeData.length],
    ["Number of Expense Entries", expenseData.length],
    ["Total Transactions", incomeData.length + expenseData.length],
    [""],
    ["Balance Status", currentBalance >= 0 ? "Positive" : "Negative"]
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Style the summary sheet (set column widths)
  summaryWs['!cols'] = [
    { wch: 20 },
    { wch: 20 }  
  ];
  
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // Income sheet with all transaction details
  if (incomeData.length > 0) {
    // Create header row
    const incomeHeaders = ["Date", "Source", "Amount", "Payment Mode", "Description"];
    const incomeRows = [incomeHeaders];
    
    // Add all income transactions
    incomeData.forEach(item => {
      incomeRows.push([
        item.date || 'N/A',
        item.source || 'N/A',
        `₹${item.amount ? item.amount.toLocaleString() : '0'}`,
        item.mode || 'N/A',
        item.description || item.note || 'N/A'
      ]);
    });
    
    // Add total row
    incomeRows.push(['', '', '', '', '']);
    incomeRows.push(['TOTAL INCOME', '', `₹${totalIncome.toLocaleString()}`, '', '']);
    
    const incomeSheet = XLSX.utils.aoa_to_sheet(incomeRows);
    
    // Set column widths for income sheet
    incomeSheet['!cols'] = [
      { wch: 12 }, 
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 25 }  
    ];
    
    XLSX.utils.book_append_sheet(wb, incomeSheet, "Income Details");
  } else {
    // Create empty sheet with headers if no data
    const emptyIncomeSheet = XLSX.utils.aoa_to_sheet([
      ["Date", "Source", "Amount", "Payment Mode", "Description"],
      ["", "", "", "", ""],
      ["No income records found", "", "", "", ""]
    ]);
    XLSX.utils.book_append_sheet(wb, emptyIncomeSheet, "Income Details");
  }

  // Expense sheet with all transaction details
  if (expenseData.length > 0) {
    const expenseHeaders = ["Date", "Category", "Amount", "Payment Mode", "Description"];
    const expenseRows = [expenseHeaders];
    
    // Add all expense transactions
    expenseData.forEach(item => {
      expenseRows.push([
        item.date || 'N/A',
        item.category || 'N/A',
        `₹${item.amount ? item.amount.toLocaleString() : '0'}`,
        item.mode || 'N/A',
        item.description || item.note || 'N/A'
      ]);
    });
    
    // Add total row
    expenseRows.push(['', '', '', '', '']);
    expenseRows.push(['TOTAL EXPENSES', '', `₹${totalExpense.toLocaleString()}`, '', '']);
    
    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseRows);
    
    // Set column widths for expense sheet
    expenseSheet['!cols'] = [
      { wch: 12 }, 
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 25 }  
    ];
    
    XLSX.utils.book_append_sheet(wb, expenseSheet, "Expense Details");
  } else {
    // Create empty sheet with headers if no data
    const emptyExpenseSheet = XLSX.utils.aoa_to_sheet([
      ["Date", "Category", "Amount", "Payment Mode", "Description"],
      ["", "", "", "", ""],
      ["No expense records found", "", "", "", ""]
    ]);
    XLSX.utils.book_append_sheet(wb, emptyExpenseSheet, "Expense Details");
  }

  // All Transactions sheet (combined view)
  const allTransactionsHeaders = ["Date", "Type", "Category/Source", "Amount", "Payment Mode", "Description"];
  const allTransactionsRows = [allTransactionsHeaders];
  
  // Add all income transactions
  incomeData.forEach(item => {
    allTransactionsRows.push([
      item.date || 'N/A',
      'Income',
      item.source || 'N/A',
      `₹${item.amount ? item.amount.toLocaleString() : '0'}`,
      item.mode || 'N/A',
      item.description || item.note || 'N/A'
    ]);
  });
  
  // Add all expense transactions
  expenseData.forEach(item => {
    allTransactionsRows.push([
      item.date || 'N/A',
      'Expense',
      item.category || 'N/A',
      `₹${item.amount ? item.amount.toLocaleString() : '0'}`,
      item.mode || 'N/A',
      item.description || item.note || 'N/A'
    ]);
  });
  
  const transactionData = allTransactionsRows.slice(1);
  transactionData.sort((a, b) => new Date(b[0]) - new Date(a[0]));
  const sortedAllTransactions = [allTransactionsHeaders, ...transactionData];
  
  const allTransactionsSheet = XLSX.utils.aoa_to_sheet(sortedAllTransactions);
  allTransactionsSheet['!cols'] = [
    { wch: 12 }, 
    { wch: 10 }, 
    { wch: 20 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 25 } 
  ];
  
  XLSX.utils.book_append_sheet(wb, allTransactionsSheet, "All Transactions");
  XLSX.writeFile(wb, "expense-report.xlsx");
}

document.addEventListener("keydown", function (e) {
  if (
    e.key === "Enter" &&
    !document.getElementById("editMode").classList.contains("hidden")
  ) {
    saveName();
  }
  if (
    e.key === "Escape" &&
    !document.getElementById("editMode").classList.contains("hidden")
  ) {
    cancelEdit();
  }
});