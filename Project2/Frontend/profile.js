// const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let users = JSON.parse(localStorage.getItem("users")) || [];

if(!currentUser){
  window.location.href = "login.html";
}

window.onload = function(){

  document.getElementById("profileName").value = currentUser.name;
  document.getElementById("profileEmail").value = currentUser.email;

  if(currentUser.department){
    document.getElementById("profileDept").value = currentUser.department;
  }

  document.getElementById("roleBadge").innerText = currentUser.role;

  if(currentUser.role === "Admin"){
    document.getElementById("deptContainer").style.display = "none";
  }

  document.getElementById("navUser").innerText = currentUser.name;

 // 🔥 Get full user object (with photo) from users array
const fullUser = users.find(u => u.email === currentUser.email);

if(fullUser && fullUser.photo){
  document.getElementById("profileImage").src = fullUser.photo;
}else{
  document.getElementById("profileImage").src = "default-avatar.png";
}

const navAvatar = document.getElementById("navAvatar");

if(fullUser && fullUser.photo){
  navAvatar.innerHTML = `<img src="${fullUser.photo}" class="sidebar-avatar-img">`;
}else{
  navAvatar.innerText = currentUser.name[0];
}
};

document.getElementById("imageUpload").addEventListener("change", function(){
  const file = this.files[0];
  const reader = new FileReader();

  reader.onload = function(e){
    document.getElementById("profileImage").src = e.target.result;
  };

  reader.readAsDataURL(file);
});

function saveProfile(){

  const updatedName = document.getElementById("profileName").value;
  const updatedEmail = document.getElementById("profileEmail").value;
  const updatedDept = document.getElementById("profileDept")
                      ? document.getElementById("profileDept").value
                      : null;

  const updatedPhoto = document.getElementById("profileImage").src;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Update users array (store photo here)
  users = users.map(user => {
    if(user.email === currentUser.email){
      return {
        ...user,
        name: updatedName,
        email: updatedEmail,
        department: updatedDept,
        photo: updatedPhoto
      };
    }
    return user;
  });

  // Update currentUser WITHOUT photo
  currentUser.name = updatedName;
  currentUser.email = updatedEmail;
  currentUser.department = updatedDept;

  // DO NOT store photo again in currentUser
  delete currentUser.photo;

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  alert("Profile updated successfully!");
}