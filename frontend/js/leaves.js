// Load leave requests from storage
let leaveRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [];

// Get logged user
// const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// Check admin
const isAdmin = currentUser && currentUser.role === "Admin";


// ⭐ Role based data source
function getVisibleLeaves(){
  if(isAdmin) return leaveRequests;
  return leaveRequests.filter(l => l.employee === currentUser.name);
}


function isAdminUser(){
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user && user.role === "Admin";
}

// let leaveRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [];

// let currentUser = JSON.parse(localStorage.getItem("currentUser"));
// const isAdmin = currentUser && currentUser.role === "Admin";

function openLeaveModal(){
  document.getElementById("leaveModal").style.display="flex";
}

function closeLeaveModal(){
  document.getElementById("leaveModal").style.display="none";
}

function applyLeave(){

  const type = document.getElementById("leaveType").value;
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  const reason = document.getElementById("reason").value;

  if(!from || !to || !reason){
    alert("Please fill all fields");
    return;
  }

const user = JSON.parse(localStorage.getItem("currentUser"));

const newLeave = {
  employee: currentUser.name,   // ⭐ NEW
  role: currentUser.role,       // ⭐ NEW
  type: type,
  from: from,
  to: to,
  reason: reason,
  status: "Pending"
};

  leaveRequests.push(newLeave);
  localStorage.setItem("leaveRequests", JSON.stringify(leaveRequests));

  updateRequestsTable();

  updateSummaryTable();

  closeLeaveModal();
}

function updateRequestsTable(){

  const tableBody = document.getElementById("requestsTableBody");
  tableBody.innerHTML = "";

  getVisibleLeaves().forEach((req,index) => {

    let actionButtons = "";

    // show buttons ONLY if admin
   // ADMIN buttons
if (isAdminUser() && req.status === "Pending") {
  actionButtons = `
    <button class="approve-btn" onclick="approveLeave(${index})">Approve</button>
    <button class="reject-btn" onclick="rejectLeave(${index})">Reject</button>
  `;
}

// EMPLOYEE cancel button
if (!isAdminUser() && 
    req.status === "Pending" && 
    req.employee === currentUser.name) {

  actionButtons = `
    <button class="cancel-btn" onclick="cancelLeave(${index})">Cancel</button>
  `;
}

    const row = `
    <tr>
  <td>${req.employee}</td>
  <td>${req.type}</td>
  <td>${req.from}</td>
  <td>${req.to}</td>
  <td>${req.reason}</td>
  <td><span class="status-badge status-${req.status}">${req.status}</span></td>
  <td>${actionButtons}</td>
</tr>
    `;

    tableBody.innerHTML += row;
  });
}

// function updateSummaryTable(){

  // Hide empty state
//   document.getElementById("emptyState").style.display="none";
//   document.getElementById("leaveTable").style.display="table";

//   const tableBody = document.getElementById("leaveTableBody");
//   tableBody.innerHTML = "";

//   leaveRequests
//   .filter(req => isAdmin || req.employee === currentUser.name)
//   .forEach((req,index) => {
//     const row = `
//   <tr>
//     <td>${req.employee}</td>
//     <td>${req.type}</td>
//     <td>${req.from}</td>
//     <td>${req.to}</td>
//     <td>${req.reason}</td>
//     <td><span class="status-badge status-${req.status}">${req.status}</span></td>
//     <td>${actionButtons}</td>
//   </tr>
// `;
//     tableBody.innerHTML += row;
//   });
// }

function updateSummaryTable(){

  document.getElementById("emptyState").style.display="none";
  document.getElementById("leaveTable").style.display="table";

  const tableBody = document.getElementById("leaveTableBody");
  tableBody.innerHTML = "";

  getVisibleLeaves().forEach(req => {

    const row = `
      <tr>
        <td>${req.employee}</td>
        <td>${req.type}</td>
        <td>${req.from}</td>
        <td>${req.to}</td>
        <td>${req.reason}</td>
        <td><span class="status-badge status-${req.status}">${req.status}</span></td>
      </tr>
    `;

    tableBody.innerHTML += row;
  });
}

function showTab(tab, btn){

  document.getElementById("summaryTab").style.display="none";
  document.getElementById("balanceTab").style.display="none";
  document.getElementById("requestsTab").style.display="none";

  document.getElementById(tab+"Tab").style.display="block";

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
}


function filterRequests(){

  const filter = document.getElementById("statusFilter").value;
  const tableBody = document.getElementById("requestsTableBody");
  tableBody.innerHTML = "";

  leaveRequests
    getVisibleLeaves()
  .filter(req => filter === "All" || req.status === filter)
  .forEach((req,index) => {

      let actionButtons = "";

      if(isAdminUser() && req.status === "Pending"){
        actionButtons = `
          <button class="approve-btn" onclick="approveLeave(${index})">Approve</button>
          <button class="reject-btn" onclick="rejectLeave(${index})">Reject</button>
        `;
      }

      const row = `
        <tr>
          <td>${req.type}</td>
          <td>${req.from}</td>
          <td>${req.to}</td>
          <td>${req.reason}</td>
          <td><span class="status-badge status-${req.status}">${req.status}</span></td>
          <td>${actionButtons}</td>
        </tr>
      `;

      tableBody.innerHTML += row;
    });
}


function approveLeave(index){
  leaveRequests[index].status = "Approved";
  localStorage.setItem("leaveRequests", JSON.stringify(leaveRequests));
  updateRequestsTable();
  updateSummaryTable();
}

function rejectLeave(index){
  leaveRequests[index].status = "Rejected";
  localStorage.setItem("leaveRequests", JSON.stringify(leaveRequests));
  updateRequestsTable();
  updateSummaryTable();
}


// ===== PAGE INIT =====
window.onload = function(){

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if(!user){
    alert("Please login first");
    window.location.href = "home.html";
    return;
  }

  // Show profile
  const profileText = document.querySelector(".profile span");
  if(profileText){
    profileText.innerText = user.name + " (" + user.role + ")";
  }

  // ⭐ LOAD DATA FROM STORAGE AGAIN
  leaveRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [];

  updateRequestsTable();
  updateSummaryTable();
  calculateLeaveBalance();

  if(isAdmin){
   document.getElementById("adminBalanceTable").style.display = "block";
   renderEmployeeLeaveBalance();
}
};

function cancelLeave(index){
  if(confirm("Cancel this leave request?")){
    leaveRequests[index].status = "Cancelled";
    localStorage.setItem("leaveRequests", JSON.stringify(leaveRequests));
    updateRequestsTable();
    updateSummaryTable();
  }
}


// ===============================
// 📊 LEAVE BALANCE CALCULATOR
// ===============================

function calculateLeaveBalance(){

  const user = JSON.parse(localStorage.getItem("currentUser"));
  if(!user) return;

  const allLeaves = JSON.parse(localStorage.getItem("leaveRequests")) || [];

  // only current employee approved leaves
  const myApprovedLeaves = allLeaves.filter(l => 
      l.employee === user.name && l.status === "Approved"
  );

  // 🎯 Leave quotas
  let casualQuota = 12;
  let sickQuota = 10;
  let earnedQuota = 15;

  let casualUsed = 0;
  let sickUsed = 0;
  let earnedUsed = 0;

  // 🧮 count days used per leave
  myApprovedLeaves.forEach(l => {

    const from = new Date(l.from);
    const to = new Date(l.to);
    const days = (to - from) / (1000*60*60*24) + 1;

    if(l.type === "Casual Leave") casualUsed += days;
    if(l.type === "Sick Leave") sickUsed += days;
    if(l.type === "Earned Leave") earnedUsed += days;

  });

  // 🎉 Remaining balance
  const casualRemaining = casualQuota - casualUsed;
  const sickRemaining = sickQuota - sickUsed;
  const earnedRemaining = earnedQuota - earnedUsed;

  // 🖥️ Update UI cards
  const casualEl = document.getElementById("casualBalance");
  const sickEl = document.getElementById("sickBalance");
  const earnedEl = document.getElementById("earnedBalance");

  if(casualEl) casualEl.innerText = casualRemaining + " Days Left";
  if(sickEl) sickEl.innerText = sickRemaining + " Days Left";
  if(earnedEl) earnedEl.innerText = earnedRemaining + " Days Left";

}


// ================= ADMIN EMPLOYEE LEAVE BALANCE =================
function renderEmployeeLeaveBalance(){

  const tbody = document.getElementById("employeeBalanceBody");
  if(!tbody) return;

  tbody.innerHTML = "";

  const leaves = JSON.parse(localStorage.getItem("leaveRequests")) || [];

  // Group leaves by employee
  const employees = {};

  leaves.forEach(l => {
    if(l.status !== "Approved") return;

    if(!employees[l.employee]){
      employees[l.employee] = { casual:0, sick:0, earned:0 };
    }

    if(l.type === "Casual Leave") employees[l.employee].casual++;
    if(l.type === "Sick Leave") employees[l.employee].sick++;
    if(l.type === "Earned Leave") employees[l.employee].earned++;
  });

  // Company quota
  const casualQuota = 12;
  const sickQuota = 10;
  const earnedQuota = 15;

  for(let emp in employees){

    const row = `
      <tr>
        <td>${emp}</td>
        <td>${casualQuota - employees[emp].casual}</td>
        <td>${sickQuota - employees[emp].sick}</td>
        <td>${earnedQuota - employees[emp].earned}</td>
      </tr>
    `;

    tbody.innerHTML += row;
  }
}