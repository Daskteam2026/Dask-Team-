let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let currentProfile = null;
let profilePhoto = null;

if (!currentUser) {
  window.location.href = "home.html";
}

async function fetchEmployees() {
  const response = await fetch("/api/employees");
  return await response.json();
}

async function loadProfile() {
  const employees = await fetchEmployees();
  const employee = employees.find((item) => item.id === currentUser.id);

  if (!employee) {
    alert("Profile not found");
    return;
  }

  currentProfile = employee;

  document.getElementById("profileName").value = employee.name;
  document.getElementById("profileEmail").value = employee.email;
  document.getElementById("roleBadge").innerText = employee.role;
  document.getElementById("navUser").innerText = employee.name;

  if (employee.department) {
    document.getElementById("profileDept").value = employee.department;
  }

  if (employee.role === "Admin") {
    document.getElementById("deptContainer").style.display = "none";
  }

  const navAvatar = document.getElementById("navAvatar");
  navAvatar.innerText = employee.name[0];

  if (profilePhoto) {
    document.getElementById("profileImage").src = profilePhoto;
    navAvatar.innerHTML = `<img src="${profilePhoto}" class="sidebar-avatar-img">`;
  } else {
    document.getElementById("profileImage").src = "default-avatar.png";
  }
}

window.onload = function () {
  loadProfile();
};

document.getElementById("imageUpload").addEventListener("change", function () {
  const file = this.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    profilePhoto = event.target.result;
    document.getElementById("profileImage").src = profilePhoto;
  };

  reader.readAsDataURL(file);
});

async function saveProfile() {
  if (!currentProfile) {
    alert("Profile not loaded yet");
    return;
  }

  const updatedName = document.getElementById("profileName").value.trim();
  const updatedEmail = document.getElementById("profileEmail").value.trim();
  const deptInput = document.getElementById("profileDept");
  const updatedDept = deptInput ? deptInput.value.trim() : null;

  const response = await fetch(`/api/employees/${currentProfile.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: updatedName,
      email: updatedEmail,
      department: updatedDept || null
    })
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.detail || "Failed to update profile");
    return;
  }

  const updatedUser = await response.json();

  currentUser = {
    ...currentUser,
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    department: updatedUser.department
  };

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  document.getElementById("navUser").innerText = updatedUser.name;

  if (!profilePhoto) {
    document.getElementById("navAvatar").innerText = updatedUser.name[0];
  }

  alert("Profile updated successfully!");
}
