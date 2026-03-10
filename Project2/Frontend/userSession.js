function loadSidebarProfile(){

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if(!currentUser) return;

  const fullUser = users.find(u => u.email === currentUser.email);

  const navAvatar = document.getElementById("navAvatar");
  const navUser = document.getElementById("navUser");

  if(navUser){
    navUser.innerText = currentUser.name;
  }

  if(navAvatar){
    if(fullUser && fullUser.photo){
      navAvatar.innerHTML = `<img src="${fullUser.photo}" class="sidebar-avatar-img">`;
    }else{
      navAvatar.innerText = currentUser.name[0];
    }
  }
}