// Bar Chart - Attendance
const ctx1 = document.getElementById('attendanceChart');

new Chart(ctx1, {
  type: 'bar',
  data: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat'],
    datasets: [{
      label: 'Employees Present',
      data: [20, 18, 22, 19, 21, 17],
      backgroundColor: '#3b82f6'
    }]
  }
});

// Pie Chart - Leaves
const ctx2 = document.getElementById('leaveChart');

new Chart(ctx2, {
  type: 'pie',
  data: {
    labels: ['Sick Leave','Casual Leave','WFH'],
    datasets: [{
      data: [5, 3, 2],
      backgroundColor: ['#ef4444','#3b82f6','#10b981']
    }]
  }
});