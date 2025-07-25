// Profile page functionality
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupEventListeners();
    }

    // Load user profile from localStorage or API
    loadUserProfile() {
        const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        if (userData.username) {
            document.querySelector('.username').textContent = userData.username;
        }
        
        if (userData.profileImage) {
            document.getElementById('profileImage').src = userData.profileImage;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Profile image upload
        const profileImage = document.getElementById('profileImage');
        const editOverlay = document.querySelector('.edit-overlay');
        
        editOverlay.addEventListener('click', () => this.uploadProfileImage());
        
        // Handle image upload error
        profileImage.addEventListener('error', () => {
            profileImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDRBNCA0IDAgMCAxIDE2IDhBNCA0IDAgMCAxIDEyIDEyQTQgNCAwIDAgMSA4IDhBNCA0IDAgMCAxIDEyIDRNMTIgMTRDMTYuNDIgMTQgMjAgMTUuNzkgMjAgMThWMjBINFYxOEM0IDE1Ljc5IDcuNTggMTQgMTIgMTQiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K';
        });
    }

    // Upload profile image
    uploadProfileImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    document.getElementById('profileImage').src = imageUrl;
                    
                    // Save to localStorage
                    const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
                    userData.profileImage = imageUrl;
                    localStorage.setItem('userProfile', JSON.stringify(userData));
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    // Update username
    updateUsername(newUsername) {
        document.querySelector('.username').textContent = newUsername;
        
        const userData = JSON.parse(localStorage.getItem('userProfile') || '{}');
        userData.username = newUsername;
        localStorage.setItem('userProfile', JSON.stringify(userData));
    }
}

// Navigation functions
function navigateTo(page) {
    console.log(`Navigating to ${page}`);
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current page
    const currentItem = document.querySelector(`[onclick="navigateTo('${page}')"]`);
    if (currentItem) {
        currentItem.classList.add('active');
    }
    
    // Handle navigation based on your routing system
    switch(page) {
        case 'home':
            window.location.href = 'index.html';
            break;
        case 'transaction':
            window.location.href = 'transactions.html';
            break;
        case 'add':
            window.location.href = 'add-expense.html';
            break;
        case 'budget':
            window.location.href = 'budget.html';
            break;
        case 'profile':
            // Already on profile page
            break;
        case 'account':
            showAccountSettings();
            break;
        case 'settings':
            showAppSettings();
            break;
        case 'export':
            exportData();
            break;
    }
}

function editProfile() {
    const currentUsername = document.querySelector('.username').textContent;
    const newUsername = prompt('Enter new username:', currentUsername);
    
    if (newUsername && newUsername.trim() !== '') {
        profileManager.updateUsername(newUsername.trim());
    }
}

function showAccountSettings() {
    // Implement account settings modal or page
    alert('Account settings coming soon!');
}

function showAppSettings() {
    // Implement app settings modal or page
    alert('App settings coming soon!');
}

function exportData() {
    // Implement data export functionality
    const userData = JSON.parse(localStorage.getItem('expenseData') || '[]');
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'expense-data.json';
    link.click();
    
    URL.revokeObjectURL(link.href);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear user data
        localStorage.removeItem('userProfile');
        localStorage.removeItem('authToken');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Initialize profile manager when page loads
let profileManager;
document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});
