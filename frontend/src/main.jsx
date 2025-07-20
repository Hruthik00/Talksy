import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Toaster } from "react-hot-toast";

// Apply theme from localStorage on initial load
const savedTheme = localStorage.getItem("theme-storage")
  ? JSON.parse(localStorage.getItem("theme-storage"))?.state?.theme
  : "coffee";
document.documentElement.setAttribute("data-theme", savedTheme || "coffee");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <App />
        <Toaster position="top-center" />
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);
