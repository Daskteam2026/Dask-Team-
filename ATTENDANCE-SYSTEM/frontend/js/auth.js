// Authentication using Backend API

let selectedRole = "employee";

function setRole(role) {
  selectedRole = role;
  document.getElementById("empBtn").classList.remove("active");
  document.getElementById("adminBtn").classList.remove("active");

  if (role === "employee") {
    document.getElementById("empBtn").classList.add("active");
  } else {
    document.getElementById("adminBtn").classList.add("active");
  }
}

function closeModal() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function openLogin() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.add("active");
  }
  showLogin();
}

function openRegister() {
  const modal = document.getElementById("authModal");
  if (modal) {
    modal.classList.add("active");
  }
  showRegister();
}

function showRegister() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  if (loginForm) loginForm.style.display = "none";
  if (registerForm) registerForm.style.display = "block";
}

function showLogin() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  if (loginForm) loginForm.style.display = "block";
  if (registerForm) registerForm.style.display = "none";
}

// Register user
async function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPass").value;
  const dept = document.getElementById("regDept") ? document.getElementById("regDept").value : "General";

  if (!name || !email || !pass) {
    alert("Please fill all fields");
    return;
  }

  try {
    // Try to register via API
    const response = await apiRequest("/auth/register", "POST", {
      name: name,
      email: email,
      password: pass,
      department: dept,
      role: selectedRole
    });

    alert("Registered successfully! Please login.");
    showLogin();
  } catch (error) {
    // Fallback: create local user for demo
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    if (users.find(u => u.email === email)) {
      alert("User already exists!");
      return;
    }

    users.push({
      id: users.length + 1,
      name: name,
      email: email,
      password: pass,
      department: dept,
      role: selectedRole
    });
    
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registered successfully! Please login.");
    showLogin();
  }
}

// Login user
async function login() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  if (!email || !pass) {
    alert("Enter email and password");
    return;
  }

  try {
    // Try to login via API
    const response = await apiRequest("/auth/login", "POST", {
      email: email,
      password: pass
    });

    // Save user session - handle both response formats
    localStorage.setItem("currentUser", JSON.stringify(response.user));
    localStorage.setItem("token", response.access_token || response.token || "");
    
    // Redirect to dashboard
    window.location.href = "index.html";
  } catch (error) {
    // Fallback: check local users for demo
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === pass);

    if (!user) {
      // Check for default admin
      if (email === "admin@dask.com" && pass === "admin123") {
        const adminUser = {
          id: 0,
          name: "Admin",
          email: "admin@dask.com",
          role: "admin"
        };
        localStorage.setItem("currentUser", JSON.stringify(adminUser));
        window.location.href = "index.html";
        return;
      }
      
      alert("Invalid credentials!");
      return;
    }

    // Save user session
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "index.html";
  }
}

// Logout
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
  window.location.href = "home.html";
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return null;
  return JSON.parse(userStr);
}

// Initialize user info on pages
function initUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const navUser = document.getElementById("navUser");
  const navAvatar = document.getElementById("navAvatar");
  
  if (navUser) {
    navUser.innerText = user.name || user.email;
  }
  if (navAvatar) {
    navAvatar.innerText = (user.name || user.email).charAt(0).toUpperCase();
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
  initUserInfo();
});

// Close when clicking outside modal
window.onclick = function(e) {
  const modal = document.getElementById("authModal");
  if (e.target === modal) {
    closeModal();
  }
};

// Close with ESC key
document.addEventListener("keydown", function(e){
  if (e.key === "Escape") closeModal();
});

