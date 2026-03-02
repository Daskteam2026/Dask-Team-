// Create default admin if not exists
let users = JSON.parse(localStorage.getItem("users")) || [];

if(!users.find(u => u.role === "Admin")){
  users.push({
    name: "Suraj",
    email: "admin@dask.com",
    pass: "admin123",
    role: "Admin"
  });
  localStorage.setItem("users", JSON.stringify(users));
}

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
  const salary = Number(document.getElementById("salary").value);
  const department = document.getElementById("department").value;

  const role = "Employee";

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const exists = users.find(u => u.email === email);
  if(exists){
    alert("User already exists!");
    return;
  }

  const newUser = {
    name,
    email,
    pass,
    role,
    salary,
    department
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registered successfully!");
  closeModal();
  showLogin();
}

// Login user
function login(){

  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  if(!email || !pass){
    alert("Enter email and password");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const foundUser = users.find(u => u.email === email && u.pass === pass);

  if(!foundUser){
    alert("Invalid credentials");
    return;
  }

  // ⭐ SAVE REAL USER (VERY IMPORTANT)
  localStorage.setItem("currentUser", JSON.stringify(foundUser));

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