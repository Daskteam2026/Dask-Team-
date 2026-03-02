// API helper functions with JWT token support

const BASE_URL = "https://your-netlify-backend.netlify.app";

// Get stored token
function getToken() {
    return localStorage.getItem("token");
}

// API request helper
async function apiRequest(endpoint, method = "GET", data = null) {
    const options = {
        method,
        headers: { 
            "Content-Type": "application/json"
        }
    };
    
    // Add authorization header if token exists
    const token = getToken();
    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }
    
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "API error" }));
        throw new Error(error.detail || `API error: ${response.status}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    if (!text) return null;
    
    return JSON.parse(text);
}

// Check if user is logged in
function isLoggedIn() {
    return getToken() !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

// Clear auth data
function clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
}

// Set auth data
function setAuthData(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
}

