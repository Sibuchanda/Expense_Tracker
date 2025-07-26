const sampleTransactions = [
  {
    title: "Shopping",
    desc: "Buy some grocery",
    time: "10:00 AM",
    date: "2025-07-24",
    amount: -5120,
    category: "grocery",
  },
  {
    title: "Food",
    desc: "Arabian Hut",
    time: "07:30 PM",
    date: "2025-07-23",
    amount: -532,
    category: "food",
  },
  {
    title: "Salary",
    desc: "Salary for August",
    time: "04:30 PM",
    date: "2025-07-22",
    amount: 50000,
    category: "salary",
  },
  {
    title: "Subscription",
    desc: "Disney+ Annual..",
    time: "03:30 PM",
    date: "2025-07-20",
    amount: -1180,
    category: "subscription",
  },
  {
    title: "Fuel",
    desc: "Kozhikode",
    time: "07:30 PM",
    date: "2025-07-21",
    amount: -1032,
    category: "fuel",
  },
  {
    title: "Cinema",
    desc: "Lulu Mall",
    time: "07:30 PM",
    date: "2025-07-19",
    amount: -532,
    category: "movie",
  },
];

// Store sample data in localStorage (if not already there)
if (!localStorage.getItem("transactions")) {
  localStorage.setItem("transactions", JSON.stringify(sampleTransactions));
}

// Get DOM elements
const transactionsContainer = document.getElementById("transactions");
const timeFilter = document.getElementById("timeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const sortBy = document.getElementById("sortBy");

function getTransactionsFromStorage() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

function filterByTimeRange(transactions, timeRange) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  switch (timeRange) {
    case "today":
      return transactions.filter((t) => t.date === todayStr);

    case "yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      return transactions.filter((t) => t.date === yesterdayStr);

    case "last7days":
      const week = new Date(today);
      week.setDate(week.getDate() - 7);
      return transactions.filter((t) => new Date(t.date) >= week);

    case "last30days":
      const month = new Date(today);
      month.setDate(month.getDate() - 30);
      return transactions.filter((t) => new Date(t.date) >= month);

    case "thisMonth":
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      return transactions.filter((t) => {
        const transDate = new Date(t.date);
        return (
          transDate.getMonth() === currentMonth &&
          transDate.getFullYear() === currentYear
        );
      });

    default:
      return transactions;
  }
}

function sortTransactions(transactions, sortOption) {
  const sorted = [...transactions];

  switch (sortOption) {
    case "date":
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));

    case "dateOld":
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));

    case "amountHigh":
      return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    case "amountLow":
      return sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));

    case "category":
      return sorted.sort((a, b) => a.category.localeCompare(b.category));

    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    default:
      return sorted;
  }
}

function renderTransactions() {
  const selectedCategory = categoryFilter.value;
  const selectedTime = timeFilter.value;
  const selectedSort = sortBy.value;

  let filtered = getTransactionsFromStorage();

  // Apply category filter
  if (selectedCategory !== "all") {
    filtered = filtered.filter((t) => t.category === selectedCategory);
  }

  // Apply time filter
  filtered = filterByTimeRange(filtered, selectedTime);

  // Apply sorting
  filtered = sortTransactions(filtered, selectedSort);

  // Clear container
  transactionsContainer.innerHTML = "";

  if (filtered.length === 0) {
    transactionsContainer.innerHTML = `
          <div class="no-transactions">
            <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;">📊</div>
            <h3>No transactions found</h3>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        `;
    return;
  }

  filtered.forEach((t) => {
    const div = document.createElement("div");
    div.className = "transaction";

    const formattedDate = new Date(t.date).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    div.innerHTML = `
          <div class="transaction-header">
            <div>
              <h3>${t.title}</h3>
              <span class="category-tag">${t.category}</span>
            </div>
            <div class="amount ${t.amount >= 0 ? "positive" : "negative"}">
              ${t.amount >= 0 ? "+" : ""}₹${Math.abs(t.amount).toLocaleString()}
            </div>
          </div>
          <p>${t.desc}</p>
          <div class="transaction-footer">
            <div class="date-time">
              ${formattedDate} • ${t.time}
            </div>
          </div>
        `;
    transactionsContainer.appendChild(div);
  });
}

// Event Listeners
timeFilter.addEventListener("change", renderTransactions);
categoryFilter.addEventListener("change", renderTransactions);
sortBy.addEventListener("change", renderTransactions);

// Initial Render
renderTransactions();
