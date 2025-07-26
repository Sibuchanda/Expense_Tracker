
const iconMap = {
  Food: "🍔",
  Travel: "✈️",
  Bills: "💡",
  Groceries: "🛒",
  Rent: "🏠",
  Taxi: "🚕",
  Shopping: "🛍️",
  Dining: "🍕",
  Entertainment: "🎬",
  Health: "💊",
  Education: "📚",
  Salary: "💰",
  Investment: "📈",
};


function showSuggestions() {
  const input = document.getElementById("categoryInput").value.toLowerCase();
  const suggestionsList = document.getElementById("suggestionsList");
  suggestionsList.innerHTML = "";

  if (input.length < 1) return;

  const matched = Object.keys(iconMap).filter(cat => cat.toLowerCase().includes(input));

  matched.forEach(match => {
    const li = document.createElement("li");
    li.textContent = match;
    li.onclick = () => selectCategory(match);
    suggestionsList.appendChild(li);
  });
}
//select catagory 
function selectCategory(category) {
  const matchedKey = Object.keys(iconMap).find(
    key => key.toLowerCase() === category.toLowerCase()
  );

  if (!matchedKey) return; // fail-safe: category not found

  const categoryInput = document.getElementById("categoryInput");
  const iconDisplay = document.getElementById("iconDisplay");
  const suggestionsList = document.getElementById("suggestionsList");
  const descriptionDropdown = document.getElementById("description");

  categoryInput.value = matchedKey;
  iconDisplay.textContent = iconMap[matchedKey] || "🎯";
  suggestionsList.innerHTML = "";

  // Reset and fill new options
  descriptionDropdown.innerHTML = "<option disabled selected>Select Description</option>";
  descriptionDropdown.disabled = true;

  if (descriptionMap[matchedKey]) {
    descriptionMap[matchedKey].forEach(desc => {
      const option = document.createElement("option");
      option.value = desc.toLowerCase();
      option.textContent = desc;
      descriptionDropdown.appendChild(option);
    });
    descriptionDropdown.disabled = false;
  }
}


document.getElementById("description").addEventListener("change", function () {
  const selectedValue = this.value;
  const selectedText = this.options[this.selectedIndex].text;

  this.innerHTML = "";
  const selectedOption = document.createElement("option");
  selectedOption.value = selectedValue;
  selectedOption.textContent = selectedText;
  this.appendChild(selectedOption);

  checkIfAmountCanBeEnabled();
});


const descriptionMap = {
  Food: ["Lunch", "Snacks", "Groceries"],
  Travel: ["Flight", "Train Ticket", "Hotel Booking"],
  Bills: ["Electricity", "Water", "Internet"],
  Groceries: ["Vegetables", "Supermarket", "Organic Store"],
  Rent: ["Monthly Rent", "Advance Payment"],
  Taxi: ["Uber", "Ola", "Local Taxi"],
  Shopping: ["Clothes", "Shoes", "Online Order"],
  Dining: ["Dinner", "Restaurant", "Cafe"],
  Entertainment: ["Movie", "Streaming", "Concert"],
  Health: ["Medicine", "Doctor Visit", "Health Insurance"],
  Education: ["Books", "Course", "Tuition"],
  Salary: ["Base Salary", "Bonus", "Freelance"],
  Investment: ["Stocks", "Crypto", "Mutual Funds"]
};


function selectCategory(category) {
  const iconDisplay = document.getElementById("iconDisplay");
  const categoryInput = document.getElementById("categoryInput");
  const suggestionsList = document.getElementById("suggestionsList");
  const descriptionDropdown = document.getElementById("description");

  categoryInput.value = category;
  iconDisplay.textContent = iconMap[category] || "🎯";
  suggestionsList.innerHTML = "";

  // Update description dropdown
  descriptionDropdown.innerHTML = "<option disabled selected>Select Description</option>"; // Reset
  if (descriptionMap[category]) {
    descriptionMap[category].forEach(desc => {
      const option = document.createElement("option");
      option.value = desc.toLowerCase();
      option.textContent = desc;
      descriptionDropdown.appendChild(option);
    });
    descriptionDropdown.disabled = false;
  } else {
    descriptionDropdown.disabled = true;
  }

  checkIfAmountCanBeEnabled();
}


//retrieve selected values later
const selectedDescriptions = Array.from(document.getElementById("description").selectedOptions)
                                  .map(option => option.value);
console.log(selectedDescriptions); // e.g., ["flight", "hotel booking"]


//ammount
let totalAmount = 0; //track of the running balance

// Get elements
const amountDisplay = document.getElementById("amountDisplay");
const amountInput = document.getElementById("amountInput");
const incomeBtn = document.querySelector(".income");
const expenseBtn = document.querySelector(".expense");

// Format INR nicely
function formatINR(amount) {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

// Update display
function updateAmountDisplay() {
  amountDisplay.textContent = formatINR(totalAmount);
}


// // Handle income
incomeBtn.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);
  if (!isNaN(amount) && amount > 0) {
    totalAmount += amount;
    updateAmountDisplay();
    displaySummary("Income");
    // amountInput.value = "";
  }
});
// // Handle expense
expenseBtn.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);
  if (!isNaN(amount) && amount > 0) {
    totalAmount -= amount;
    updateAmountDisplay();
    displaySummary("Expense");
    // amountInput.value = "";
  }
});


//ammount
function checkIfAmountCanBeEnabled() {
  const category = document.getElementById("categoryInput").value.trim();
  const description = document.getElementById("description").value;
  const amountInput = document.getElementById("amountInput");

  if (
    category &&
    description &&
    description !== "Description" &&
    description !== "Select Description"
  ) {
    amountInput.disabled = false;
  } else {
    amountInput.disabled = true;
  }
}

//display meassege
function getFormattedDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function displaySummary(type) {
  const category = document.getElementById("categoryInput").value.trim();
  const descriptionDropdown = document.getElementById("description");
  const description = descriptionDropdown.options[0]?.text || "";
  const amount = parseFloat(amountInput.value);
  const date = document.getElementById("date").value;
  const summaryDiv = document.getElementById("summaryMessage");

  if (!category || !description || isNaN(amount) || amount <= 0 || !date) {
    summaryDiv.textContent = ""; // clear if form is incomplete
    return;
  }

  const formattedDate = getFormattedDate(date);
  const formattedAmount = formatINR(amount);

  summaryDiv.textContent = `You added a ${type.toLowerCase()} of ${formattedAmount} for "${description}" under "${category}" on ${formattedDate}.`;
}



//continue button
const continueBtn = document.querySelector(".continue-btn");

continueBtn.addEventListener("click", () => {
  const category = document.getElementById("categoryInput").value.trim();
  const descriptionDropdown = document.getElementById("description");
  const description = descriptionDropdown.options[0]?.text || "";
  const amount = parseFloat(amountInput.value);
  const date = document.getElementById("date").value;
  const summaryMessage = document.getElementById("summaryMessage").textContent;

  // Determine transaction type from message
  let transactionType = "";
  if (summaryMessage.toLowerCase().includes("income")) {
    transactionType = "Income";
  } else if (summaryMessage.toLowerCase().includes("expense")) {
    transactionType = "Expense";
  }

  // Validate all inputs
  if (!category || !description || isNaN(amount) || amount <= 0 || !date || !transactionType) {
    alert("Please complete all fields and select Income or Expense before continuing.");
    return;
  }

  // Save transaction to localStorage
  const transaction = {
    type: transactionType,
    category: category,
    description: description,
    amount: amount,
    date: date
  };

  localStorage.setItem("transaction", JSON.stringify(transaction));

  // Redirect to next page
  window.location.href = "next.html";
});
