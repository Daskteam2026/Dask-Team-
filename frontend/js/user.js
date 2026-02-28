// User helper functions

// Get current user from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return null;
  return JSON.parse(userStr);
}

// Initialize user display in navbar
function initUserDisplay() {
  const user = getCurrentUser();
  if (!user) return;

  const navUser = document.getElementById("navUser");
  const navAvatar = document.getElementById("navAvatar");
  
  if (navUser) {
    navUser.innerText = user.name || user.email || user.role;
  }
  if (navAvatar) {
    const initial = (user.name || user.email || user.role).charAt(0).toUpperCase();
    navAvatar.innerText = initial;
  }
}

// Logout function
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
  window.location.href = "home.html";
}

// Check if user is logged in
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "home.html";
    return false;
  }
  return true;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
  initUserDisplay();
  
  // Profile dropdown toggle
  const profileMenu = document.getElementById("profileMenu");
  const profileDropdown = document.getElementById("profileDropdown");
  
  if (profileMenu && profileDropdown) {
    profileMenu.addEventListener("click", function(e) {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
    });
    
    document.addEventListener("click", function() {
      profileDropdown.classList.remove("show");
    });
  }
});

