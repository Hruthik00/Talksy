import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Toaster } from "react-hot-toast";

// Apply theme from localStorage on initial load
const themeStorage = localStorage.getItem("theme-storage");
let initialTheme = "coffee"; // Default theme

if (themeStorage) {
  try {
    const parsedStorage = JSON.parse(themeStorage);
    if (parsedStorage.state && parsedStorage.state.theme) {
      initialTheme = parsedStorage.state.theme;
      console.log("Initial theme from storage:", initialTheme);
    }
  } catch (e) {
    console.error("Error parsing theme from storage:", e);
  }
}

// Apply theme immediately before rendering
document.documentElement.setAttribute("data-theme", initialTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <App />
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--b1)',
              color: 'var(--bc)',
              border: '1px solid var(--b3)',
            },
          }}
        />
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);
