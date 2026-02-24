// Modal controls

let selectedRole = "employee";

function setRole(role) {
  selectedRole = role;

  document.getElementById("empBtn").classList.remove("active");
  document.getElementById("adminBtn").classList.remove("active");

  if (role === "employee") {
    document.getElementById("empBtn").classList.add("active");
    document.getElementById("registerLink").style.display = "block";
  } else {
    document.getElementById("adminBtn").classList.add("active");
    document.getElementById("registerLink").style.display = "none";
    showLogin(); // always show login for admin
  }
}

function closeModal() {
  document.getElementById("authModal").classList.remove("active");
}

function openLogin(){
  document.getElementById("authModal").classList.add("active");
  showLogin();
}

function openRegister(){
  document.getElementById("authModal").classList.add("active");
  showRegister();
}

function showRegister(){
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "block";
}

function showLogin(){
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

// Register user
function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPass").value;
  const role = "employee";  // Admin cannot register

  const user = { name, email, pass, role };
  localStorage.setItem(email, JSON.stringify(user));

  alert("Registered successfully!");
  window.location.href = "login.html";
}

// Login user
function login() {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  const savedUser = JSON.parse(localStorage.getItem(email));

  if (!savedUser || savedUser.pass !== pass) {
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("loggedInUser", email);
  window.location.href = "index.html";
}


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