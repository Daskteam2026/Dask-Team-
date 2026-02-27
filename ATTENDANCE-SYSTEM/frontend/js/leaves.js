// Leave management using Backend API

// Get current user
const user = getCurrentUser();

// Initialize leaves page
async function initLeaves() {
    if (!user) {
        window.location.href = "home.html";
        return;
    }

    // Load leave data
    await loadLeaves();
    await calculateLeaveBalance();
}

// Load leaves
async function loadLeaves() {
    try {
        if (user.role === "admin") {
            // Admin sees all leaves
            const allLeaves = await apiRequest("/leaves/all");
            displayLeaveTable(allLeaves, true);
        } else {
            // Employee sees their own leaves
            const myLeaves = await apiRequest(`/leaves/employee/${user.id}`);
            displayLeaveTable(myLeaves, false);
        }
    } catch (error) {
        console.error("Failed to load leaves:", error);
    }
}

// Display leave table
function displayLeaveTable(leaves, isAdmin) {
    const tableBody = document.getElementById("leaveTableBody");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";

    leaves.forEach(leave => {
        const row = `
            <tr>
                <td>${leave.employee_name || "Unknown"}</td>
                <td>${leave.leave_type}</td>
                <td>${leave.start_date}</td>
                <td>${leave.end_date}</td>
                <td>${leave.reason}</td>
                <td><span class="status-${leave.status}">${leave.status}</span></td>
                ${isAdmin && leave.status === "Pending" ? `
                    <td>
                        <button class="approve-btn" onclick="updateLeaveStatus(${leave.id}, 'Approved')">Approve</button>
                        <button class="reject-btn" onclick="updateLeaveStatus(${leave.id}, 'Rejected')">Reject</button>
                    </td>
                ` : ''}
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    // Also display in requests table
    const requestsTableBody = document.getElementById("requestsTableBody");
    if (requestsTableBody) {
        requestsTableBody.innerHTML = "";
        leaves.forEach(leave => {
            let actionButtons = "";
            
            if (isAdmin && leave.status === "Pending") {
                actionButtons = `
                    <button class="approve-btn" onclick="updateLeaveStatus(${leave.id}, 'Approved')">Approve</button>
                    <button class="reject-btn" onclick="updateLeaveStatus(${leave.id}, 'Rejected')">Reject</button>
                `;
            } else if (!isAdmin && leave.status === "Pending") {
                actionButtons = `
                    <button class="cancel-btn" onclick="cancelLeave(${leave.id})">Cancel</button>
                `;
            }

            const row = `
                <tr>
                    <td>${leave.employee_name || user.name}</td>
                    <td>${leave.leave_type}</td>
                    <td>${leave.start_date}</td>
                    <td>${leave.end_date}</td>
                    <td>${leave.reason}</td>
                    <td><span class="status-${leave.status}">${leave.status}</span></td>
                    <td>${actionButtons}</td>
                </tr>
            `;
            requestsTableBody.innerHTML += row;
        });
    }
}

// Open leave modal
function openLeaveModal() {
    const modal = document.getElementById("leaveModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

// Close leave modal
function closeLeaveModal() {
    const modal = document.getElementById("leaveModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Apply for leave
async function applyLeave() {
    const leaveType = document.getElementById("leaveType").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const reason = document.getElementById("reason").value;

    if (!leaveType || !fromDate || !toDate || !reason) {
        alert("Please fill all fields");
        return;
    }

    try {
        await apiRequest("/leaves/", "POST", {
            employee_id: user.id,
            leave_type: leaveType,
            start_date: fromDate,
            end_date: toDate,
            reason: reason
        });

        alert("Leave applied successfully!");
        closeLeaveModal();
        await loadLeaves();
    } catch (error) {
        alert("Failed to apply leave: " + error.message);
    }
}

// Update leave status
async function updateLeaveStatus(leaveId, status) {
    try {
        await apiRequest(`/leaves/${leaveId}/status`, "PUT", { status: status });
        alert(`Leave ${status}!`);
        await loadLeaves();
    } catch (error) {
        alert("Failed to update leave: " + error.message);
    }
}

// Cancel leave
async function cancelLeave(leaveId) {
    if (!confirm("Cancel this leave request?")) return;
    
    try {
        await apiRequest(`/leaves/${leaveId}`, "DELETE");
        alert("Leave cancelled!");
        await loadLeaves();
    } catch (error) {
        alert("Failed to cancel leave: " + error.message);
    }
}

// Calculate leave balance
async function calculateLeaveBalance() {
    try {
        const leaves = await apiRequest(`/leaves/employee/${user.id}`);
        const approved = leaves.filter(l => l.status === "Approved");
        
        let casualUsed = 0;
        let sickUsed = 0;
        let earnedUsed = 0;
        
        approved.forEach(l => {
            const from = new Date(l.start_date);
            const to = new Date(l.end_date);
            const days = (to - from) / (1000 * 60 * 60 * 24) + 1;
            
            if (l.leave_type === "Casual Leave") casualUsed += days;
            if (l.leave_type === "Sick Leave") sickUsed += days;
            if (l.leave_type === "Earned Leave") earnedUsed += days;
        });
        
        const casualEl = document.getElementById("casualBalance");
        const sickEl = document.getElementById("sickBalance");
        const earnedEl = document.getElementById("earnedBalance");
        
        if (casualEl) casualEl.innerText = (12 - casualUsed) + " Days Left";
        if (sickEl) sickEl.innerText = (10 - sickUsed) + " Days Left";
        if (earnedEl) earnedEl.innerText = (15 - earnedUsed) + " Days Left";
    } catch (error) {
        console.error("Failed to calculate balance:", error);
    }
}

// Show tab
function showTab(tab, btn) {
    document.getElementById("summaryTab").style.display = "none";
    document.getElementById("balanceTab").style.display = "none";
    document.getElementById("requestsTab").style.display = "none";

    document.getElementById(tab + "Tab").style.display = "block";

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
}

// Filter requests
function filterRequests() {
    const filter = document.getElementById("statusFilter").value;
    loadLeaves().then(() => {
        if (filter !== "All") {
            const rows = document.querySelectorAll("#requestsTableBody tr");
            rows.forEach(row => {
                const status = row.querySelector(".status-badge");
                if (status) {
                    row.style.display = status.classList.contains(`status-${filter}`) ? "" : "none";
                }
            });
        }
    });
}

// Initialize on page load
window.onload = initLeaves;

