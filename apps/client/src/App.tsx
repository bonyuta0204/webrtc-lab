import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import CameraAccessDemo from './pages/CameraAccessDemo'
import LiveVideoDemo from './pages/LiveVideoDemo'
import './App.css'

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-4">
          <h1 className="text-xl font-bold mb-4">WebRTC Lab</h1>
          <nav>
            <ul className="space-y-2">
              <li>
                <Link to="/camera-access" className="block p-2 hover:bg-gray-700 rounded">
                  Camera Access Demo
                </Link>
              </li>
              <li>
                <Link to="/live-video" className="block p-2 hover:bg-gray-700 rounded">
                  Live Video Demo
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/camera-access" element={<CameraAccessDemo />} />
            <Route path="/live-video" element={<LiveVideoDemo />} />
            <Route path="/" element={
              <div className="p-4">
                <h1 className="text-2xl font-bold">Welcome to WebRTC Lab</h1>
                <p className="mt-4">Select a demo from the sidebar to get started.</p>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
