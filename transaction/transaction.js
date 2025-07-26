 class TransactionManager {
      constructor() {
        this.allTransactions = [];
        this.filteredTransactions = [];
        this.init();
      }

      init() {
        this.loadTransactions();
        this.populateCategoryFilter();
        this.setupEventListeners();
        this.updateStats();
        this.renderTransactions();
      }

      loadTransactions() {
        const incomeData = JSON.parse(localStorage.getItem("incomeData") || "[]");
        const expenseData = JSON.parse(localStorage.getItem("expenseData") || "[]");
        
        // Combine and format all transactions
        this.allTransactions = [
          ...incomeData.map(item => ({
            ...item,
            category: item.source,
            type: 'Income'
          })),
          ...expenseData.map(item => ({
            ...item,
            type: 'Expense'
          }))
        ].sort((a, b) => b.timestamp - a.timestamp);

        this.filteredTransactions = [...this.allTransactions];
      }

      populateCategoryFilter() {
        const categories = new Set();
        this.allTransactions.forEach(transaction => {
          if (transaction.category) {
            categories.add(transaction.category);
          }
        });

        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        
        Array.from(categories).sort().forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
          categoryFilter.appendChild(option);
        });
      }

      setupEventListeners() {
        const filters = ['timeFilter', 'typeFilter', 'categoryFilter', 'sortBy'];
        filters.forEach(filterId => {
          document.getElementById(filterId).addEventListener('change', () => {
            this.applyFilters();
          });
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
          this.clearAllFilters();
        });
      }

      applyFilters() {
        let filtered = [...this.allTransactions];

        // Time filter
        const timeFilter = document.getElementById('timeFilter').value;
        if (timeFilter !== 'all') {
          filtered = this.filterByTime(filtered, timeFilter);
        }

        // Type filter
        const typeFilter = document.getElementById('typeFilter').value;
        if (typeFilter !== 'all') {
          filtered = filtered.filter(t => t.type === typeFilter);
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter').value;
        if (categoryFilter !== 'all') {
          filtered = filtered.filter(t => t.category === categoryFilter);
        }

        // Sort
        const sortBy = document.getElementById('sortBy').value;
        filtered = this.sortTransactions(filtered, sortBy);

        this.filteredTransactions = filtered;
        this.updateStats();
        this.renderTransactions();
      }

      filterByTime(transactions, timeFilter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          const transactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
          
          switch (timeFilter) {
            case 'today':
              return transactionDay.getTime() === today.getTime();
            case 'yesterday':
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              return transactionDay.getTime() === yesterday.getTime();
            case 'last7days':
              const sevenDaysAgo = new Date(today);
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return transactionDay >= sevenDaysAgo;
            case 'last30days':
              const thirtyDaysAgo = new Date(today);
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return transactionDay >= thirtyDaysAgo;
            case 'thisMonth':
              return transactionDate.getMonth() === now.getMonth() && 
                     transactionDate.getFullYear() === now.getFullYear();
            default:
              return true;
          }
        });
      }

      sortTransactions(transactions, sortBy) {
        return transactions.sort((a, b) => {
          switch (sortBy) {
            case 'date':
              return b.timestamp - a.timestamp;
            case 'dateOld':
              return a.timestamp - b.timestamp;
            case 'amountHigh':
              return b.amount - a.amount;
            case 'amountLow':
              return a.amount - b.amount;
            case 'category':
              return (a.category || '').localeCompare(b.category || '');
            default:
              return b.timestamp - a.timestamp;
          }
        });
      }

      updateStats() {
        document.getElementById('resultsCount').textContent = 
          `Showing ${this.filteredTransactions.length} of ${this.allTransactions.length} transactions`;
      }

      renderTransactions() {
        const container = document.getElementById('transactions');
        
        if (this.filteredTransactions.length === 0) {
          container.innerHTML = `
            <div class="no-transactions">
              <i class="fas fa-inbox"></i>
              <h3>No transactions found</h3>
              <p>Try adjusting your filters or add some transactions first.</p>
            </div>
          `;
          return;
        }

        container.innerHTML = this.filteredTransactions.map(transaction => `
          <div class="transaction ${transaction.type.toLowerCase()}">
            <div class="transaction-header">
              <div class="transaction-info">
                <h3>${transaction.category || 'Uncategorized'}</h3>
              </div>
            </div>
            <div class="transaction-meta">
              <div class="meta-item">
                <i class="fas fa-${transaction.type === 'Income' ? 'plus' : 'minus'}"></i>
                <span>${transaction.type}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-credit-card"></i>
                <span>${transaction.mode || 'N/A'}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>${transaction.date}</span>
              </div>
            </div>
            <div class="transaction-footer">
              <div class="amount ${transaction.type === 'Income' ? 'positive' : 'negative'}">
                <i class="fas fa-rupee-sign"></i>
                ${transaction.amount.toFixed(2)}
              </div>
              <div class="category-tag">
                ${transaction.category || 'General'}
              </div>
            </div>
          </div>
        `).join('');
      }

      clearAllFilters() {
        document.getElementById('timeFilter').value = 'all';
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('sortBy').value = 'date';
        this.applyFilters();
      }
    }

    // Initialize the transaction manager when the page loads
    document.addEventListener('DOMContentLoaded', () => {
      new TransactionManager();
    });