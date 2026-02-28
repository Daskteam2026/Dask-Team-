// Reports functionality using Backend API

// Get current user
const user = getCurrentUser();

// Initialize reports page
async function initReports() {
    if (!user) {
        window.location.href = "home.html";
        return;
    }

    // If admin, load employee list
    if (user.role === "admin") {
        await loadEmployeeList();
    } else {
        // Employee sees their own reports
        await loadEmployeeReports(user.id);
    }
}

// Load employee list for admin
async function loadEmployeeList() {
    try {
        const employees = await apiRequest("/employees");
        const select = document.getElementById("employeeSelect");
        
        // Add current user as first option
        const currentOption = document.createElement("option");
        currentOption.value = user.id;
        currentOption.textContent = user.name + " (You)";
        select.appendChild(currentOption);
        
        // Add other employees
        employees.forEach(emp => {
            if (emp.id !== user.id) {
                const option = document.createElement("option");
                option.value = emp.id;
                option.textContent = emp.name;
                select.appendChild(option);
            }
        });
        
        // If employee, auto-load their reports
        if (user.role !== "admin") {
            await loadEmployeeReports(user.id);
        }
    } catch (error) {
        console.error("Failed to load employees:", error);
    }
}

// Load employee reports
async function loadEmployeeReports(employeeId) {
    if (!employeeId) return;
    
    try {
        // Get attendance summary
        const attendanceData = await apiRequest(`/reports/attendance-summary/${employeeId}`);
        displayAttendanceSummary(attendanceData);
        
        // Get leave summary
        const leaveData = await apiRequest(`/reports/leave-summary/${employeeId}`);
        displayLeaveSummary(leaveData);
    } catch (error) {
        console.error("Failed to load reports:", error);
    }
}

// Display attendance summary
function displayAttendanceSummary(data) {
    const container = document.getElementById("attendanceSummary");
    if (!container) return;
    
    container.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Present</h4>
                <p class="present-count">${data.Present || 0}</p>
            </div>
            <div class="summary-card">
                <h4>Absent</h4>
                <p class="absent-count">${data.Absent || 0}</p>
            </div>
            <div class="summary-card">
                <h4>Late</h4>
                <p class="late-count">${data.Late || 0}</p>
            </div>
            <div class="summary-card">
                <h4>On Leave</h4>
                <p class="leave-count">${data.Leave || 0}</p>
            </div>
        </div>
        <p class="total">Total Records: ${data.Total || 0}</p>
    `;
}

// Display leave summary
function displayLeaveSummary(data) {
    const container = document.getElementById("leaveSummary");
    if (!container) return;
    
    container.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <h4>Approved</h4>
                <p class="approved-count">${data.Approved || 0}</p>
            </div>
            <div class="summary-card">
                <h4>Pending</h4>
                <p class="pending-count">${data.Pending || 0}</p>
            </div>
            <div class="summary-card">
                <h4>Rejected</h4>
                <p class="rejected-count">${data.Rejected || 0}</p>
            </div>
        </div>
        <p class="total">Total Requests: ${data.Total || 0}</p>
    `;
}

// Initialize on page load
window.onload = initReports;

