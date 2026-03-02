// 🔐 Logged user
const user = JSON.parse(localStorage.getItem("currentUser"));

const adminCards = document.getElementById("adminCards");
const employeeCards = document.getElementById("employeeCards");

// 📦 Load stored data
const users = JSON.parse(localStorage.getItem("users")) || [];
const attendance = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
const leaves = JSON.parse(localStorage.getItem("leaveRequests")) || [];

// 📅 Today's date
const today = new Date().toLocaleDateString();


// ================= ADMIN DASHBOARD =================
if(user.role.toLowerCase() === "admin"){

   adminCards.style.display = "grid";
   employeeCards.style.display = "none";

   // 👥 Total Employees
   const employees = users.filter(u => u.role.toLowerCase() === "employee");
   document.getElementById("totalEmployees").innerText = employees.length;

   // ✅ Present Today
  // Get today's attendance records
const todayRecords = attendance.filter(a => a.date === today && a.status !== "Absent");

// Get UNIQUE employee names
const uniqueEmployees = [...new Set(todayRecords.map(a => a.employee))];

// Show count
document.getElementById("presentToday").innerText = uniqueEmployees.length;

   // 🏖 On Leave Today

   const todayDate = new Date();

const onLeave = leaves.filter(l => {
  if(l.status !== "Approved") return false;

  const from = new Date(l.from);
  const to = new Date(l.to);

  return todayDate >= from && todayDate <= to;
});

document.getElementById("onLeave").innerText = onLeave.length;
  //  const onLeave = leaves.filter(l => l.status === "Approved" && l.from === today);
  //  document.getElementById("leaveCount").innerText = onLeave.length;

   // ⏰ Late Entries
  const lateRecords = attendance.filter(a => a.status === "Late" && a.date === today);
const uniqueLate = [...new Set(lateRecords.map(a => a.employee))];

document.getElementById("lateEntries").innerText = uniqueLate.length;
}


// ================= EMPLOYEE DASHBOARD =================
else{

   adminCards.style.display = "none";
   employeeCards.style.display = "grid";

   const myAttendance = attendance.filter(a => a.employee === user.name);
   const myLeaves = leaves.filter(l => l.employee === user.name);

   // UNIQUE WORKING DAYS
   const uniqueWorkDays = [...new Set(myAttendance.map(a => a.date))];

   document.getElementById("daysWorked").innerText = uniqueWorkDays.length;

   // Leaves applied
   document.getElementById("leavesApplied").innerText = myLeaves.length;

   // Pending requests
   const pending = myLeaves.filter(l => l.status === "Pending");
   document.getElementById("pendingRequests").innerText = pending.length;

   // Leave balance calculation
   const approvedLeaves = myLeaves.filter(l => l.status === "Approved");

   const totalQuota = 37;

   let usedDays = 0;

   approvedLeaves.forEach(l => {
      const from = new Date(l.from);
      const to = new Date(l.to);
      const diffDays = (to - from) / (1000 * 60 * 60 * 24) + 1;
      usedDays += diffDays;
   });

   const remaining = totalQuota - usedDays;

   document.getElementById("leavesRemaining").innerText = remaining;
}

// =====================================================
// 📊 FINAL ROLE BASED CHARTS (MONTHLY % BASED)
// =====================================================

const ctx1 = document.getElementById("attendanceChart");
const ctx2 = document.getElementById("leaveChart");

if(ctx1 && ctx2){

  const todayObj = new Date();
  const currentMonth = todayObj.getMonth();
  const currentYear = todayObj.getFullYear();
  const todayDate = todayObj.getDate();

  const employees = users.filter(u => u.role.toLowerCase() === "employee");
  const totalEmployees = employees.length;

  // Dates of current month till today
  const daysArray = [];
  for(let d=1; d<=todayDate; d++){
    const dateObj = new Date(currentYear, currentMonth, d);
    daysArray.push(dateObj.toLocaleDateString());
  }

  // ================= ADMIN LINE CHART =================
  if(user.role.toLowerCase() === "admin"){

    const dailyPercentages = daysArray.map(day=>{
      const records = attendance.filter(a => a.date === day && a.status !== "Absent");
      const uniqueEmployees = [...new Set(records.map(r=>r.employee))].length;
      return totalEmployees ? Math.round((uniqueEmployees/totalEmployees)*100) : 0;
    });

    new Chart(ctx1,{
      type:"line",
      data:{
        labels: daysArray.map(d => new Date(d).getDate()),
        datasets:[{
          label:"Company Attendance %",
          data: dailyPercentages,
          borderColor:"#3b82f6",
          backgroundColor:"rgba(59,130,246,0.2)",
          fill:true,
          tension:0.4
        }]
      },
      options:{ scales:{ y:{ beginAtZero:true, max:100 } } }
    });

  }

  // ================= EMPLOYEE LINE CHART =================
  else{

    const myAttendance = attendance.filter(a => a.employee === user.name);

    const dailyPercentages = daysArray.map(day=>{
      const worked = myAttendance.some(a => a.date === day && a.status !== "Absent");
      return worked ? 100 : 0;
    });

    new Chart(ctx1,{
      type:"line",
      data:{
        labels: daysArray.map(d => new Date(d).getDate()),
        datasets:[{
          label:"My Attendance %",
          data: dailyPercentages,
          borderColor:"#10b981",
          backgroundColor:"rgba(16,185,129,0.2)",
          fill:true,
          tension:0.4
        }]
      },
      options:{ scales:{ y:{ beginAtZero:true, max:100 } } }
    });

  }

  // ================= DEPARTMENT BAR CHART =================
  const deptData = {};

  employees.forEach(emp=>{
    const dept = emp.department || "General";

    const empRecords = attendance.filter(a =>
      a.employee === emp.name &&
      new Date(a.date).getMonth() === currentMonth &&
      new Date(a.date).getFullYear() === currentYear &&
      a.status !== "Absent"
    );

    const daysWorked = [...new Set(empRecords.map(r=>r.date))].length;
    const percent = Math.round((daysWorked/todayDate)*100);

    if(!deptData[dept]) deptData[dept] = [];
    deptData[dept].push(percent);
  });

  const deptLabels = Object.keys(deptData);
  const deptAvg = deptLabels.map(dept=>{
    const arr = deptData[dept];
    return Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
  });

  new Chart(ctx2,{
    type:"bar",
    data:{
      labels: deptLabels,
      datasets:[{
        label:"Department Attendance %",
        data: deptAvg,
        backgroundColor:"#f59e0b"
      }]
    },
    options:{ scales:{ y:{ beginAtZero:true, max:100 } } }
  });

}