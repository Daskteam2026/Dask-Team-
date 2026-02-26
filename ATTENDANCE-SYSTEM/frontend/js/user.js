// Get logged user
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// If not logged in → go to home
if (!currentUser) {
  window.location.href = "/home.html";
}

// Show name + role in navbar
const profileText = document.querySelector(".profile span");

if (profileText) {
  profileText.innerText = currentUser.name + " (" + currentUser.role + ")";
}