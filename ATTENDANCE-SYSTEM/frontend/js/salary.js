async function getSalary(employeeId, month, year, baseSalary) {
  const data = { employee_id: employeeId, month, year, base_salary: baseSalary };
  const result = await apiRequest("/salary/calculate", "POST", data);

  document.getElementById("salaryOutput").textContent = JSON.stringify(result, null, 2);
}