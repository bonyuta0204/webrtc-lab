import { Link } from 'react-router-dom'

export function Sidebar() {
  return (
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
  )
}

export default Sidebar
