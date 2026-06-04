import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  Map,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";

function Sidebar() {

  const menu = [
    {
      title:"Dashboard",
      path: "/dashboard",
      icon:<LayoutDashboard size={20} />,
    },

    {
      title:"Risk Prediction",
      path: "/risk-prediction",
      icon:<ShieldAlert size={20} />,
    },

    {
      title:"Global Map",
      path: "/global-map",
      icon:<Map size={20} />,
    },

    {
      title:"Analytics",
      path: "/analytics",
      icon:<BarChart3 size={20} />,
    },

    {
      title:"Alerts",
      path: "/alerts",
      icon:<Bell size={20} />,
    },

    {
      title:"Settings",
      path: "/settings",
      icon:<Settings size={20} />,
    },
  ];

  return (
    <div className="
      w-64
      min-h-screen
      border-r border-white/10
      bg-black/10
      backdrop-blur-xl
      p-6
    ">

      {/* Logo */}
      <div className="mb-12">

        <h1 className="text-3xl font-bold">
          LogiAI
        </h1>

        <p className="text-blue-400 text-sm mt-1">
          Intelligence Platform
        </p>

      </div>

      {/* Menu */}
      <div className="space-y-3">

        {menu.map((item,index)=>(
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3
              p-4
              rounded-2xl
              cursor-pointer
              transition-all
              duration-300
              text-white
              decoration-none

              ${
                isActive
                ?
                "bg-blue-600 shadow-lg shadow-blue-500/30"
                :
                "hover:bg-white/5"
              }
            `}
          >

            {item.icon}

            <span className="text-sm font-medium">
              {item.title}
            </span>

          </NavLink>
        ))}

      </div>

    </div>
  );
}

export default Sidebar;