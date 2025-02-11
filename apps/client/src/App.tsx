import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CameraAccessDemo from "./pages/CameraAccessDemo";
import LiveVideoDemo from "./pages/LiveVideoDemo";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/camera-access" element={<CameraAccessDemo />} />
            <Route path="/live-video" element={<LiveVideoDemo />} />
            <Route
              path="/"
              element={
                <div className="p-4">
                  <h1 className="text-2xl font-bold">Welcome to WebRTC Lab</h1>
                  <p className="mt-4">
                    Select a demo from the sidebar to get started.
                  </p>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
