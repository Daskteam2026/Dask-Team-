// Attendance functionality using Backend API

// Get current user
const user = getCurrentUser();

// Initialize attendance page
async function initAttendance() {
    if (!user) {
        window.location.href = "home.html";
        return;
    }

    // Show appropriate view based on role
    const employeeView = document.getElementById("employeeAttendance");
    const adminView = document.getElementById("adminAttendance");

    if (user.role === "admin") {
        employeeView.style.display = "none";
        adminView.style.display = "block";
        await loadAdminAttendance();
    } else {
        employeeView.style.display = "block";
        adminView.style.display = "none";
        await loadEmployeeAttendance(user.id);
    }
}

// Load admin attendance view
async function loadAdminAttendance() {
    try {
        const records = await apiRequest("/attendance/today");
        const tableBody = document.getElementById("attendanceTableBody");
        tableBody.innerHTML = "";

        records.forEach(record => {
            const row = `
                <tr>
                    <td>${record.employee_name || "Unknown"}</td>
                    <td>${record.date}</td>
                    <td>${record.check_in || "-"}</td>
                    <td>${record.check_out || "-"}</td>
                    <td>${calculateHours(record.check_in, record.check_out)}</td>
                    <td><span class="status-${record.status.toLowerCase()}">${record.status}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load attendance:", error);
    }
}

// Load employee attendance view
async function loadEmployeeAttendance(employeeId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const records = await apiRequest(`/attendance/employee/${employeeId}`);
        
        // Find today's record
        const todayRecord = records.find(r => r.date === today);
        
        const checkInBtn = document.getElementById("checkInBtn");
        const checkOutBtn = document.getElementById("checkOutBtn");
        const todayStatus = document.getElementById("todayStatus");

        if (todayRecord) {
            if (todayRecord.check_in && !todayRecord.check_out) {
                // Checked in, waiting for checkout
                checkInBtn.disabled = true;
                checkOutBtn.disabled = false;
                todayStatus.innerText = `Checked in at ${todayRecord.check_in}`;
                startTimer(todayRecord.check_in);
            } else if (todayRecord.check_in && todayRecord.check_out) {
                // Already completed for today
                checkInBtn.disabled = true;
                checkOutBtn.disabled = true;
                todayStatus.innerText = `Completed - ${todayRecord.check_in} to ${todayRecord.check_out}`;
            }
        } else {
            // Not checked in yet
            checkInBtn.disabled = false;
            checkOutBtn.disabled = true;
            todayStatus.innerText = "Not Checked In";
        }
    } catch (error) {
        console.error("Failed to load attendance:", error);
    }
}

// Check in
async function checkIn() {
    try {
        await apiRequest(`/attendance/check-in`, "POST", { employee_id: user.id });
        alert("Checked in successfully!");
         window.location.reload();
    } catch (error) {
        alert("Check-in failed: " + error.message);
    }
}

// Check out
async function checkOut() {
    try {
        await apiRequest(`/attendance/check-out`, "POST", { employee_id: user.id });
        alert("Checked out successfully!");
        window.location.reload();
    } catch (error) {
        alert("Check-out failed: " + error.message);
    }
}

// Calculate hours worked
function calculateHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) return "-";
    
    const [inHour, inMin] = checkIn.split(":").map(Number);
    const [outHour, outMin] = checkOut.split(":").map(Number);
    
    const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    return `${hours}h ${mins}m`;
}

// Timer for work duration
let timerInterval;
function startTimer(checkInTime) {
    const [inHour, inMin] = checkInTime.split(":").map(Number);
    const workStart = new Date();
    workStart.setHours(inHour, inMin, 0);
    
    timerInterval = setInterval(() => {
        const now = new Date();
        const diff = now - workStart;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        const timerEl = document.getElementById("workTimer");
        if (timerEl) {
            timerEl.innerText = 
                `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// Initialize on page load
window.onload = initAttendance;

// Button event listeners
document.addEventListener("DOMContentLoaded", function() {
    const checkInBtn = document.getElementById("checkInBtn");
    const checkOutBtn = document.getElementById("checkOutBtn");
    
    if (checkInBtn) {
        checkInBtn.addEventListener("click", checkIn);
    }
    if (checkOutBtn) {
        checkOutBtn.addEventListener("click", checkOut);
    }
});

