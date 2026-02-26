let leaveRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [];

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const isAdmin = currentUser && currentUser.role === "Admin";

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
  employee: user.name,   // ⭐ NEW
  role: user.role,       // ⭐ NEW
  type,
  from,
  to,
  reason,
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

  leaveRequests.forEach((req,index) => {

    let actionButtons = "";

    // show buttons ONLY if admin
    if(isAdmin && req.status === "Pending"){
      actionButtons = `
        <button class="approve-btn" onclick="approveLeave(${index})">Approve</button>
        <button class="reject-btn" onclick="rejectLeave(${index})">Reject</button>
      `;
    }

    const row = `
     
    `;

    tableBody.innerHTML += row;
  });
}

function updateSummaryTable(){

  // Hide empty state
  document.getElementById("emptyState").style.display="none";
  document.getElementById("leaveTable").style.display="table";

  const tableBody = document.getElementById("leaveTableBody");
  tableBody.innerHTML = "";

  leaveRequests
  .filter(req => isAdmin || req.employee === currentUser.name)
  .forEach((req,index) => {
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
    .filter(req => filter === "All" || req.status === filter)
    .forEach((req,index) => {

      let actionButtons = "";

      if(isAdmin && req.status === "Pending"){
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
    window.location.href = "/home.html";
    return;
  }

  // ⭐ Show role in navbar
  document.querySelector(".profile span").innerText =
    user.name + " (" + user.role + ")";

  // ⭐ Render tables on load
  updateRequestsTable();
  updateSummaryTable();
}

document.getElementById("leaveForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    employee_id: parseInt(document.getElementById("employeeId").value),
    start_date: document.getElementById("startDate").value,
    end_date: document.getElementById("endDate").value,
    reason: document.getElementById("reason").value
  };

  try {
    const result = await apiRequest("/leaves/", "POST", data);
    document.getElementById("leaveOutput").textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    alert("Error: " + err.message);
  }
});