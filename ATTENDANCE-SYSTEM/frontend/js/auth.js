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
  const department = document.getElementById("regDept").value;

  // register user in backend as employee record
  apiRequest("/employees/", "POST", { name, department })
    .catch(e => console.warn("backend registration failed", e));

  const user = { name, email, pass, role };
  localStorage.setItem(email, JSON.stringify(user));

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

  // get role from toggle (Employee/Admin)
  const role = document.querySelector(".role-toggle .active").innerText;

  // create fake user session
  const user = {
    name: email.split("@")[0],
    role: role
  };

  // save user in browser
  localStorage.setItem("currentUser", JSON.stringify(user));

  // redirect to dashboard
  window.location.href = "/index.html";
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


async function login(username, password) {
  return await apiRequest("/auth/login", "POST", { username, password });
}

async function logout() {
  return await apiRequest("/auth/logout", "POST");
}