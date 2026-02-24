let leaves = [];

function applyLeave() {
  const type = document.getElementById("leaveType").value;
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  const reason = document.getElementById("reason").value;

  if (!from || !to || !reason) {
    alert("Please fill all fields");
    return;
  }

  leaves.push({
    type,
    from,
    to,
    reason,
    status: "Pending"
  });

  renderLeaves();
  clearForm();
}

function renderLeaves() {
  const table = document.getElementById("leaveTable");
  table.innerHTML = "";

  leaves.forEach(l => {
    table.innerHTML += `
      <tr>
        <td>${l.type}</td>
        <td>${l.from}</td>
        <td>${l.to}</td>
        <td>${l.reason}</td>
        <td>${l.status}</td>
      </tr>`;
  });
}

function clearForm() {
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";
  document.getElementById("reason").value = "";
}