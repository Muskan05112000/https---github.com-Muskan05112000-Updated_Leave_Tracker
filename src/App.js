import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ApplyLeave from "./components/ApplyLeave";
import Users from "./components/Users";
import Analysis from "./components/Analysis";
import { AppProvider } from "./context/AppContext";

const App = () => (
  <AppProvider>
    <Router>
      <Sidebar />
      <div style={{ marginLeft: 220 }}>
        <Routes>
          <Route path="/" element={<ApplyLeave />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </div>
    </Router>
  </AppProvider>
);

export default App;
