// Dashboard functionality using Backend API

// Get current user
const user = getCurrentUser();

// Initialize dashboard
async function initDashboard() {
    if (!user) {
        window.location.href = "home.html";
        return;
    }

    // Show appropriate cards based on role
    const adminCards = document.getElementById("adminCards");
    const employeeCards = document.getElementById("employeeCards");

    if (user.role === "admin") {
        adminCards.style.display = "grid";
        employeeCards.style.display = "none";
        await loadAdminStats();
    } else {
        adminCards.style.display = "none";
        employeeCards.style.display = "grid";
        await loadEmployeeStats(user.id);
    }
}

// Load admin dashboard stats
async function loadAdminStats() {
    try {
        const stats = await apiRequest("/reports/dashboard-stats");
        
        document.getElementById("empCount").innerText = stats.totalEmployees || 0;
        document.getElementById("presentCount").innerText = stats.presentToday || 0;
        document.getElementById("leaveCount").innerText = stats.onLeaveToday || 0;
        document.getElementById("lateCount").innerText = stats.lateToday || 0;
        
        // Load chart data
        await loadCharts();
    } catch (error) {
        console.error("Failed to load admin stats:", error);
    }
}

// Load employee dashboard stats
async function loadEmployeeStats(employeeId) {
    try {
        // Get attendance
        const attendance = await apiRequest(`/attendance/employee/${employeeId}`);
        document.getElementById("daysWorked").innerText = attendance.length;

        // Get leaves
        const leaves = await apiRequest(`/leaves/employee/${employeeId}`);
        const myLeaves = leaves;
        
        document.getElementById("myTotalLeaves").innerText = myLeaves.length;
        
        const pending = myLeaves.filter(l => l.status === "Pending").length;
        document.getElementById("myPendingLeaves").innerText = pending;
        
        // Calculate leave balance
        const approved = myLeaves.filter(l => l.status === "Approved");
        let usedDays = 0;
        approved.forEach(l => {
            const from = new Date(l.start_date);
            const to = new Date(l.end_date);
            const days = (to - from) / (1000 * 60 * 60 * 24) + 1;
            usedDays += days;
        });
        
        const totalQuota = 37;
        const remaining = totalQuota - usedDays;
        document.getElementById("leavesAvailable").innerText = Math.max(0, remaining);
        
    } catch (error) {
        console.error("Failed to load employee stats:", error);
    }
}

// Load charts
async function loadCharts() {
    try {
        // Get all employees
        const employees = await apiRequest("/employees");
        
        // Weekly attendance data
        const last7Days = getLast7Days();
        const attendanceData = await Promise.all(
            last7Days.map(async (day) => {
                const records = await apiRequest(`/attendance?date=${day}`);
                return records.length;
            })
        );
        
        // Render attendance chart if canvas exists
        const ctx1 = document.getElementById("attendanceChart");
        if (ctx1) {
            new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
                    datasets: [{
                        label: 'Employees Present',
                        data: attendanceData,
                        backgroundColor: '#3b82f6'
                    }]
                }
            });
        }

        // Leave distribution
        const allLeaves = await apiRequest("/leaves/all");
        const casual = allLeaves.filter(l => l.leave_type === "Casual Leave" && l.status === "Approved").length;
        const sick = allLeaves.filter(l => l.leave_type === "Sick Leave" && l.status === "Approved").length;
        const earned = allLeaves.filter(l => l.leave_type === "Earned Leave" && l.status === "Approved").length;

        const ctx2 = document.getElementById("leaveChart");
        if (ctx2) {
            new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: ['Casual Leave', 'Sick Leave', 'Earned Leave'],
                    datasets: [{
                        data: [casual, sick, earned],
                        backgroundColor: ['#f59e0b', '#ef4444', '#10b981']
                    }]
                }
            });
        }
    } catch (error) {
        console.error("Failed to load charts:", error);
    }
}

// Get last 7 days
function getLast7Days() {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }
    return days;
}

// Initialize on page load
window.onload = initDashboard;

