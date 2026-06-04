import {
  Bell,
  Search,
  Moon,
} from "lucide-react";

function Navbar() {
  return (
    <div className="flex justify-between items-center">

      {/* Left */}
      <div>

        <h1 className="text-3xl font-bold">
          Supply Chain Dashboard
        </h1>

        <p className="text-gray-400 mt-1">
          Live disruption monitoring & analytics
        </p>

      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="
          flex items-center gap-3
          bg-white/5
          backdrop-blur-xl
          border border-white/10
          px-5 py-3
          rounded-2xl
          w-80
        ">

          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search anything..."
            className="
              bg-transparent
              outline-none
              text-sm
              w-full
            "
          />

        </div>

        {/* Icons */}
        <div className="
          w-12 h-12
          rounded-2xl
          bg-white/5
          border border-white/10
          flex items-center justify-center
          cursor-pointer
        ">
          <Bell size={18} />
        </div>

        <div className="
          w-12 h-12
          rounded-2xl
          bg-white/5
          border border-white/10
          flex items-center justify-center
          cursor-pointer
        ">
          <Moon size={18} />
        </div>

      </div>

    </div>
  );
}

export default Navbar;