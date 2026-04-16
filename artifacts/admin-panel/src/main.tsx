import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { getToken, clearToken } from "./lib/auth";

// Set up global fetch interceptor for auth token and 401 handling
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", "Bearer " + token);
  }
  
  const response = await originalFetch(input, { ...init, headers });
  
  if (response.status === 401) {
    clearToken();
    // In a real app we might redirect here, but we'll let the React components handle it
  }
  
  return response;
};

// Force dark mode on document body
document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);