import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Settings as SettingsIcon, Save, RefreshCw, Sliders, BellRing, Anchor, Fuel } from "lucide-react";

function Settings() {
  const [ports, setPorts] = useState([]);
  
  // Settings State
  const [fuelMultiplier, setFuelMultiplier] = useState("0.8");
  const [lowThreshold, setLowThreshold] = useState("3000");
  const [mediumThreshold, setMediumThreshold] = useState("7000");
  const [defaultOrigin, setDefaultOrigin] = useState("Shanghai");
  const [defaultDestination, setDefaultDestination] = useState("Los Angeles");
  
  // Notification Toggles
  const [notifyAll, setNotifyAll] = useState(true);
  const [notifyHighRisk, setNotifyHighRisk] = useState(true);
  const [notifyWeather, setNotifyWeather] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load ports
    fetch("http://127.0.0.1:5000/ports")
      .then((res) => res.json())
      .then((data) => setPorts(data))
      .catch((err) => console.error(err));

    // Load settings from localStorage if available
    const savedFuel = localStorage.getItem("setting_fuel_multiplier");
    const savedLow = localStorage.getItem("setting_low_threshold");
    const savedMedium = localStorage.getItem("setting_medium_threshold");
    const savedOrigin = localStorage.getItem("setting_default_origin");
    const savedDest = localStorage.getItem("setting_default_destination");
    
    if (savedFuel) setFuelMultiplier(savedFuel);
    if (savedLow) setLowThreshold(savedLow);
    if (savedMedium) setMediumThreshold(savedMedium);
    if (savedOrigin) setDefaultOrigin(savedOrigin);
    if (savedDest) setDefaultDestination(savedDest);
  }, []);

  const saveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Save to local storage
    localStorage.setItem("setting_fuel_multiplier", fuelMultiplier);
    localStorage.setItem("setting_low_threshold", lowThreshold);
    localStorage.setItem("setting_medium_threshold", mediumThreshold);
    localStorage.setItem("setting_default_origin", defaultOrigin);
    localStorage.setItem("setting_default_destination", defaultDestination);
    
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="flex-1 p-7 overflow-y-auto">
      {/* Navbar */}
      <Navbar />

      <form onSubmit={saveSettings} className="grid grid-cols-3 gap-6 mt-8">
        {/* Cost & Threshold Settings */}
        <div className="col-span-2 space-y-6">
          {/* General Config */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
              <Sliders size={20} className="text-blue-400" />
              Platform Configuration
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Fuel Multiplier */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Fuel size={16} className="text-purple-400" />
                  Fuel Cost Multiplier ($/km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelMultiplier}
                  onChange={(e) => setFuelMultiplier(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. 0.8"
                />
                <p className="text-xs text-gray-500">Rate multiplier applied to routing distance for fuel estimation.</p>
              </div>

              {/* Empty slot for balance */}
              <div></div>

              {/* Risk Threshold Low */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 block">
                  Low Risk Distance Threshold (km)
                </label>
                <input
                  type="number"
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. 3000"
                />
                <p className="text-xs text-gray-500">Distances below this value are classified as Low Risk.</p>
              </div>

              {/* Risk Threshold Medium */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 block">
                  Medium Risk Distance Threshold (km)
                </label>
                <input
                  type="number"
                  value={mediumThreshold}
                  onChange={(e) => setMediumThreshold(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. 7000"
                />
                <p className="text-xs text-gray-500">Distances below this value (and above low) are Medium Risk.</p>
              </div>
            </div>
          </div>

          {/* Default Ports Config */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
              <Anchor size={20} className="text-emerald-400" />
              Default Simulation Ports
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Default Origin */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 block">Default Origin Port</label>
                <select
                  value={defaultOrigin}
                  onChange={(e) => setDefaultOrigin(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Origin Port</option>
                  {ports.map((port) => (
                    <option key={`origin-settings-${port}`} value={port} className="bg-slate-900 text-white">
                      {port}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default Destination */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 block">Default Destination Port</label>
                <select
                  value={defaultDestination}
                  onChange={(e) => setDefaultDestination(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Destination Port</option>
                  {ports.map((port) => (
                    <option key={`dest-settings-${port}`} value={port} className="bg-slate-900 text-white">
                      {port}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Notifications & Save */}
        <div className="col-span-1 space-y-6">
          {/* Notifications config */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
              <BellRing size={20} className="text-yellow-400" />
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Real-Time Alerts</p>
                  <p className="text-xs text-gray-500">Enable overall alert generation</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyAll}
                  onChange={(e) => setNotifyAll(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-black/35 focus:ring-blue-500 text-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">High Risk Warnings</p>
                  <p className="text-xs text-gray-500">Notify for high disruption routes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyHighRisk}
                  onChange={(e) => setNotifyHighRisk(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-black/35 focus:ring-blue-500 text-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Weather Warnings</p>
                  <p className="text-xs text-gray-500">Notify on gale or severe typhoons</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyWeather}
                  onChange={(e) => setNotifyWeather(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-black/35 focus:ring-blue-500 text-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Audio Notification</p>
                  <p className="text-xs text-gray-500">Play chime on incident alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-white/10 bg-black/35 focus:ring-blue-500 text-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              Save Platform Configuration
            </button>

            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl text-center text-xs font-semibold animate-pulse">
                Configuration saved successfully!
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default Settings;
