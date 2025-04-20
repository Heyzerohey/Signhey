import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { UserProvider } from "./components/user-context";

const container = document.getElementById("root");
createRoot(container!).render(
  <UserProvider>
    <App />
  </UserProvider>
);
