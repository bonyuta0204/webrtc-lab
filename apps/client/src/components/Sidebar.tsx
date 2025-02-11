import { Link } from "react-router-dom";
type SidebarItem = {
  label: string;
  path: string;
};

const sidebarItems: SidebarItem[] = [
  { label: "Camera Access Demo", path: "/camera-access" },
  { label: "Live Video Demo", path: "/live-video" },
  { label: "Web RTC Demo", path: "/web-rtc-video" },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 text-gray-600 p-4">
      <h1 className="text-xl font-bold mb-4">WebRTC Lab</h1>
      <nav>
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="block p-2 hover:bg-gray-300 rounded"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
