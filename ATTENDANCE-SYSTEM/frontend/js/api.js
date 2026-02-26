// when the frontend is served from the same FastAPI backend we can use relative paths
const BASE_URL = "";

async function apiRequest(endpoint, method = "GET", data = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error('API error: ${response.status}');
  }
  return await response.json();
}