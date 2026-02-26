// Show today's date on top
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  document.getElementById("todayDate").innerText =
    today.toDateString();
});

let checkInTime = "";
let records = [];
let alreadyCheckedInToday = false;

// Office timing (change if you want)
const officeStartHour = 9;   // 9 AM
const officeStartMin = 30;   // 9:30 AM

// Check In
function checkIn() {

  if (alreadyCheckedInToday) {
    alert("You already checked in today!");
    return;
  }

  const now = new Date();
  checkInTime = now;

  alreadyCheckedInToday = true;
  document.querySelector(".checkin").disabled = true;

  document.getElementById("statusMsg").innerText =
    "Checked in at " + now.toLocaleTimeString();
}

// Check Out
function checkOut() {

  if (!checkInTime) {
    alert("Please check in first!");
    return;
  }

  const now = new Date();

  // Calculate working hours
  const diffMs = now - checkInTime;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

  // Late or On-time check
  const lateTime = new Date();
  lateTime.setHours(officeStartHour, officeStartMin, 0);

  let status = "On Time";
  if (checkInTime > lateTime) status = "Late";

  const today = new Date().toLocaleDateString();

  records.push({
    date: today,
    in: checkInTime.toLocaleTimeString(),
    out: now.toLocaleTimeString(),
    status: status + " (" + hours + "h " + minutes + "m)"
  });

  document.getElementById("statusMsg").innerText =
    "Checked out at " + now.toLocaleTimeString();

  renderTable();

  // Reset for tomorrow demo
  checkInTime = "";
}

// Render table
function renderTable() {
  const tbody = document.getElementById("attendanceBody");
  tbody.innerHTML = "";

  records.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td>${r.date}</td>
        <td>${r.in}</td>
        <td>${r.out}</td>
        <td>${r.status}</td>
      </tr>`;
  });
}

document.getElementById("attendanceForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    employee_id: parseInt(document.getElementById("employeeId").value),
    date: document.getElementById("date").value,
    status: document.getElementById("status").value
  };

  try {
    const result = await apiRequest("/attendance/", "POST", data);
    document.getElementById("output").textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    alert("Error: " + err.message);
  }
});

async function getAttendance(employeeId) {
  const records = await apiRequest(`/attendance/employee/${employeeId}`);
  document.getElementById("attendanceOutput").textContent = JSON.stringify(records, null, 2);
}