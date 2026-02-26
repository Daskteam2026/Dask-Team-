async function getReports(employeeId) {
  const attendanceData = await apiRequest(`/reports/attendance-summary/${employeeId}`);
  const leaveData = await apiRequest(`/reports/leave-summary/${employeeId}`);

  document.getElementById("reportOutput").textContent =
    "Attendance:\n" + JSON.stringify(attendanceData, null, 2) +
    "\n\nLeaves:\n" + JSON.stringify(leaveData, null, 2);
}