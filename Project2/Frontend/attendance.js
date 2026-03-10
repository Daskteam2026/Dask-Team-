// 🔐 Get logged in user from localStorage (from user.js)
// const currentUser = JSON.parse(localStorage.getItem("currentUser"));


const isAdmin = currentUser?.role?.toLowerCase() === "admin";
// const isAdmin = currentUser?.role?.toLowerCase() === "admin";
if(!currentUser){
  alert("User not logged in");
  window.location.href = "login.html";
}
console.log("Logged user:", currentUser);
console.log("Is Admin:", isAdmin);

// GLOBAL VARIABLES (must be outside DOMContentLoaded)
let checkInBtn, checkOutBtn, timerText, statusText;

let checkInTime = "";
// let records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
let alreadyCheckedInToday = false;
let timerInterval = null;
let secondsWorked = 0;

// Office timing
const officeStartHour = 9;
const officeStartMin = 30;


// 🚀 PAGE LOAD
document.addEventListener("DOMContentLoaded", function () {

  renderTable();


  

  // grab elements AFTER page loads
  checkInBtn = document.getElementById("checkInBtn");
  checkOutBtn = document.getElementById("checkOutBtn");
  timerText = document.getElementById("workTimer");
  statusText = document.getElementById("todayStatus");

  // ROLE VIEW SWITCH
  if(isAdmin){
    document.getElementById("employeeAttendance").style.display = "none";
    document.getElementById("adminAttendance").style.display = "block";

  

    loadAdminEmployeeDropdown();   // ⭐ ADD THIS LINE
  }else{
    document.getElementById("employeeAttendance").style.display = "block";
    document.getElementById("adminAttendance").style.display = "none";
  }

  document.getElementById("todayDate").innerText =
      new Date().toDateString();

  


  // attach button events
  if(checkInBtn) checkInBtn.addEventListener("click", checkIn);
  if(checkOutBtn) checkOutBtn.addEventListener("click", checkOut);

  // Live clock
setInterval(()=>{
  document.getElementById("liveClock").innerText =
      new Date().toLocaleTimeString();
},1000);

// Fill employee name
document.getElementById("empNameBig").innerText = currentUser.name;
document.getElementById("empAvatarBig").innerText = currentUser.name[0];


  // 🔄 Restore running timer if user already checked in
const savedSession = JSON.parse(localStorage.getItem("activeCheckIn"));

if(savedSession && savedSession.employee === currentUser.name){

  checkInTime = new Date(savedSession.time);
  alreadyCheckedInToday = true;

  if(checkInBtn) checkInBtn.disabled = true;
  if(checkOutBtn) checkOutBtn.disabled = false;

  startTimerFromSavedTime();
}

});


function startTimerFromSavedTime(){

  const now = new Date();
  secondsWorked = Math.floor((now - checkInTime) / 1000);

  timerInterval = setInterval(() => {
    secondsWorked++;

    const hrs = String(Math.floor(secondsWorked / 3600)).padStart(2,'0');
    const mins = String(Math.floor((secondsWorked % 3600) / 60)).padStart(2,'0');
    const secs = String(secondsWorked % 60).padStart(2,'0');

    timerText.innerText = `${hrs}:${mins}:${secs}`;
  }, 1000);
}


// 🟢 CHECK IN
function checkIn() {

  if (alreadyCheckedInToday) {
    alert("You already checked in today!");
    return;
  }

  const now = new Date();
  checkInTime = now;


  // show start time on UI
document.getElementById("startTimeText").innerText =
      now.toLocaleTimeString();

  // 💾 Save active session
localStorage.setItem("activeCheckIn", JSON.stringify({
  time: now,
  employee: currentUser.name
}));

  alreadyCheckedInToday = true;
  checkInBtn.disabled = true;
  checkOutBtn.disabled = false;

  statusText.innerText = "Checked in at " + now.toLocaleTimeString();

  // ▶ START LIVE TIMER
  secondsWorked = 0;
  timerInterval = setInterval(() => {
    secondsWorked++;

    const hrs = String(Math.floor(secondsWorked / 3600)).padStart(2,'0');
    const mins = String(Math.floor((secondsWorked % 3600) / 60)).padStart(2,'0');
    const secs = String(secondsWorked % 60).padStart(2,'0');

    timerText.innerText = `${hrs}:${mins}:${secs}`;
  }, 1000);
}


// 🔴 CHECK OUT
async function checkOut() {

  if (!checkInTime) {
    alert("Please check in first!");
    return;
  }

  clearInterval(timerInterval);

  const now = new Date();
  // show end time on UI
document.getElementById("endTimeText").innerText =
      now.toLocaleTimeString();

  const diffMs = now - checkInTime;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  const lateTime = new Date();
  lateTime.setHours(officeStartHour, officeStartMin, 0);

  let status = "On Time";
  if (checkInTime > lateTime) status = "Late";

  const today = new Date().toLocaleDateString();

  await fetch("http://127.0.0.1:8000/attendance",{
  method:"POST",
  headers:{
    "Content-Type":"application/json"
  },
  body:JSON.stringify({
    employee: currentUser.name,
    date: today,
    check_in: checkInTime.toLocaleTimeString(),
    check_out: now.toLocaleTimeString(),
    status: "Present"
  })
});
  localStorage.removeItem("activeCheckIn");
  statusText.innerText = "Checked out at " + now.toLocaleTimeString();

// refresh table + monthly stats after checkout
renderTable();

  checkInTime = "";
  checkOutBtn.disabled = true;
  timerText.innerText = "00:00:00";
  secondsWorked = 0;

  if(isAdmin) renderAdminTable();
  document.getElementById("startTimeText").innerText = "--:--";
document.getElementById("endTimeText").innerText = "--:--";
}


// 👨‍💼 ADMIN TABLE
// async function renderTable(){

//   const response = await fetch("http://127.0.0.1:8000/attendance");

//   const records = await response.json();

//   const tbody = document.getElementById("attendanceBody");

//   if(!tbody) return;

//   tbody.innerHTML = "";

//   const myRecords = records.filter(r => r.employee === currentUser.name);

//   if(myRecords.length === 0){
//     tbody.innerHTML = "<tr><td colspan='4'>No attendance yet</td></tr>";
//     return;
//   }

//   myRecords.reverse().forEach(r=>{
//     tbody.innerHTML += `
//       <tr>
//         <td>${r.date}</td>
//         <td>${r.check_in}</td>
//         <td>${r.check_out}</td>
//         <td>${r.status}</td>
//       </tr>
//     `;
//   });
// }

async function renderTable(){

  // If admin, don't load employee table
  if(isAdmin) return;

  const response = await fetch("http://127.0.0.1:8000/attendance");
  const records = await response.json();

  console.log("Attendance data:", records);

  const tbody = document.getElementById("attendanceBody");

  if(!tbody) return;

  tbody.innerHTML = "";

  const myRecords = records.filter(r => r.employee === currentUser.name);

  if(myRecords.length === 0){
    tbody.innerHTML = "<tr><td colspan='4'>No attendance yet</td></tr>";
    return;
  }

  myRecords.reverse().forEach(r=>{
    tbody.innerHTML += `
      <tr>
        <td>${r.date}</td>
        <td>${r.check_in}</td>
        <td>${r.check_out}</td>
        <td>${r.status}</td>
      </tr>
    `;
  });
}

function showAdminTab(tab){

  document.getElementById("adminDailyTab").classList.add("hidden");
  document.getElementById("adminMonthlyTab").classList.add("hidden");


  if(tab === "daily")
    document.getElementById("adminDailyTab").classList.remove("hidden");

  if(tab === "monthly")
    document.getElementById("adminMonthlyTab").classList.remove("hidden");
}

// ================= ADMIN ATTENDANCE MODULE =================

// Load employees into dropdown
async function loadAdminEmployeeDropdown(){

  const res = await fetch("http://127.0.0.1:8000/employees");
  const employees = await res.json();

  const markSelect = document.getElementById("adminEmployeeSelect");
  const monthlySelect = document.getElementById("monthlyEmployeeSelect");

  if(markSelect) markSelect.innerHTML = "<option value=''>Select Employee</option>";
  if(monthlySelect) monthlySelect.innerHTML = "<option value=''>Select Employee</option>";

  employees.forEach(emp => {

    if(emp.role === "Employee"){

      if(markSelect)
        markSelect.innerHTML += `<option value="${emp.name}">${emp.name}</option>`;

      if(monthlySelect)
        monthlySelect.innerHTML += `<option value="${emp.name}">${emp.name}</option>`;

    }

  });

}

function submitAdminAttendance(){

  const employee = document.getElementById("adminEmployeeSelect").value;
  const date = document.getElementById("adminDate").value;
  const checkIn = document.getElementById("adminCheckIn").value;
  const checkOut = document.getElementById("adminCheckOut").value;
  const status = document.getElementById("adminStatus").value;

  if(!employee || !date){
    alert("Please select employee and date");
    return;
  }

  let records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

  // Prevent duplicate entry for same employee & date
  const exists = records.find(r =>
      r.employee === employee && r.date === date
  );

  if(exists){
    alert("Attendance already marked for this employee on this date.");
    return;
  }

  records.push({
    employee: employee,
    date: date,
    in: checkIn || "-",
    out: checkOut || "-",
    totalHours: "-",
    status: status
  });

  localStorage.setItem("attendanceRecords", JSON.stringify(records));

  alert("Attendance saved successfully!");

  // Clear form
  document.getElementById("adminDate").value = "";
  document.getElementById("adminCheckIn").value = "";
  document.getElementById("adminCheckOut").value = "";
}
async function loadDailyView(){

  const date = document.getElementById("dailyViewDate").value;
  const tbody = document.getElementById("dailyViewBody");

  if(!date){
    alert("Please select a date");
    return;
  }

  const empRes = await fetch("http://127.0.0.1:8000/employees");
  const employees = await empRes.json();

  const attRes = await fetch("http://127.0.0.1:8000/attendance");
  const records = await attRes.json();

  tbody.innerHTML = "";

  employees.forEach(emp => {

    const record = records.find(r =>
        r.employee === emp.name && r.date === date
    );

    let status = record ? record.status : "Absent";

    tbody.innerHTML += `
      <tr>
        <td>${emp.name}</td>
        <td>${status}</td>
      </tr>
    `;

  });

}

async function loadMonthlyCalendar(){

  const employee = document.getElementById("monthlyEmployeeSelect").value;
  const monthValue = document.getElementById("monthlySelect").value;

  if(!employee || !monthValue){
    alert("Select employee & month");
    return;
  }

  const res = await fetch("http://127.0.0.1:8000/attendance");
  const records = await res.json();

  const grid = document.getElementById("calendarGrid");

  const date = new Date(monthValue);
  const month = date.getMonth();
  const year = date.getFullYear();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  let present=0, absent=0, half=0;

  grid.innerHTML="";

  for(let d=1; d<=daysInMonth; d++){

    const fullDate = new Date(year, month, d).toLocaleDateString();

    const record = records.find(r =>
        r.employee === employee && r.date === fullDate
    );

    let status = "Absent";
    if(record) status = record.status;

    if(status==="Present") present++;
    if(status==="Absent") absent++;
    if(status==="Half-day") half++;

    let borderClass = "status-absent-border";

    if(status === "Present") borderClass = "status-present-border";
    if(status === "Half-day") borderClass = "status-half-border";

    grid.innerHTML += `
      <div class="day-box ${borderClass}">
        <b>${d}</b>
      </div>
    `;
  }

  document.getElementById("statPresent").innerText = present;
  document.getElementById("statAbsent").innerText = absent;
  document.getElementById("statHalf").innerText = half;
}

function adminMarkAttendance(){

  const employee = document.getElementById("employeeSelect").value;
  const date = document.getElementById("attendanceDate").value;
  const status = document.getElementById("attendanceStatus").value;

  if(!date){
    alert("Please select date");
    return;
  }

  let records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

  // check if already marked for same date
  const alreadyMarked = records.find(r =>
      r.employee === employee && r.date === date
  );

  if(alreadyMarked){
    alert("Attendance already marked for this employee on this date");
    return;
  }

  records.push({
    employee: employee,
    date: date,
    status: status,
    in: "-",
    out: "-",
    totalHours: "-"
  });

  localStorage.setItem("attendanceRecords", JSON.stringify(records));

  alert("Attendance marked successfully!");
}




// ================= EMPLOYEE RECENT TABLE =================
// function renderTable(){

//   const tbody = document.getElementById("attendanceBody");
//   if(!tbody) return;

//   const myRecords = records.filter(r => r.employee === currentUser.name);

//   tbody.innerHTML = "";

//   if(myRecords.length === 0){
//     tbody.innerHTML = "<tr><td colspan='4'>No attendance yet</td></tr>";
//     return;
//   }

//   // show latest first
//   myRecords.reverse().slice(0,7).forEach(r=>{
//     tbody.innerHTML += `
//       <tr>
//         <td>${r.date}</td>
//         <td>${r.in}</td>
//         <td>${r.out}</td>
//         <td>${r.status}</td>
//       </tr>
//     `;
//   });
// }


function loadMonthlyCalendar(){

  const employee = document.getElementById("monthlyEmployeeSelect").value;
  const monthValue = document.getElementById("monthlySelect").value;

  if(!employee || !monthValue){
    alert("Select employee & month");
    return;
  }

  const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
  const grid = document.getElementById("calendarGrid");

  const date = new Date(monthValue);
  const month = date.getMonth();
  const year = date.getFullYear();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  let present=0, absent=0, half=0;
  grid.innerHTML="";

  for(let d=1; d<=daysInMonth; d++){

    const fullDate = new Date(year, month, d).toLocaleDateString();

    const record = records.find(r =>
        r.employee === employee && r.date === fullDate
    );

    let status = "Absent";
    if(record) status = record.status;

    if(status==="Present") present++;
    if(status==="Absent") absent++;
    if(status==="Half-day") half++;

let borderClass = "status-absent-border"; // default

if(status === "Present") borderClass = "status-present-border";
if(status === "Half-day") borderClass = "status-half-border";

grid.innerHTML += `
  <div class="day-box ${borderClass}">
    <b>${d}</b>
  </div>
`;
  }

  document.getElementById("statPresent").innerText = present;
  document.getElementById("statAbsent").innerText = absent;
  document.getElementById("statHalf").innerText = half;
}