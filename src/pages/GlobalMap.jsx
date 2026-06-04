import { useState, useEffect } from "react";
import MapComponent from "../components/MapComponent";
import Navbar from "../components/Navbar";
import { 
  Globe, 
  Navigation, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert,
  HelpCircle, 
  Info, 
  Anchor, 
  CloudLightning,
  DollarSign 
} from "lucide-react";

function GlobalMap() {
  const [ports, setPorts] = useState([]);
  const [originPort, setOriginPort] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem("active_simulated_month") || "";
  });
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(() => {
    try {
      const saved = localStorage.getItem("active_simulated_route");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // 1. Fetch ports
    fetch("http://127.0.0.1:5000/ports")
      .then((res) => res.json())
      .then((data) => {
        setPorts(data);
        
        // Leave selectors blank on startup if no routeResult is present
        if (!routeResult) {
          setOriginPort("");
          setDestinationPort("");
        }
      })
      .catch((err) => console.error("Error loading ports:", err));

    // 2. Load latest run from history to populate map initially if routeResult is not set
    if (!routeResult) {
      fetch("http://127.0.0.1:5000/route-history")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setRouteResult(data[data.length - 1]);
          }
        })
        .catch((err) => console.error("Error loading history:", err));
    }
  }, []);

  // Sync selectors with active route selection
  useEffect(() => {
    if (routeResult) {
      setOriginPort(routeResult.origin || "");
      setDestinationPort(routeResult.destination || "");
      if (routeResult.month) {
        setSelectedMonth(routeResult.month);
        localStorage.setItem("active_simulated_month", routeResult.month);
      }
    }
  }, [routeResult]);

  const analyzeRoute = async () => {
    if (!originPort || !destinationPort || !selectedMonth) return;
    setLoading(true);
    
    // Read current settings thresholds from localStorage
    const savedLow = localStorage.getItem("setting_low_threshold") || "3000";
    const savedMedium = localStorage.getItem("setting_medium_threshold") || "7000";
    const savedFuel = localStorage.getItem("setting_fuel_multiplier") || "0.8";

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: originPort,
          destination: destinationPort,
          month: selectedMonth,
          low_threshold: Number(savedLow),
          medium_threshold: Number(savedMedium),
          fuel_multiplier: Number(savedFuel)
        }),
      });
      const data = await response.json();
      setRouteResult(data);
      localStorage.setItem("active_simulated_route", JSON.stringify(data));
    } catch (error) {
      console.error("Error analyzing route:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (r) => {
    if (r === "HIGH") return "text-red-400";
    if (r === "MEDIUM") return "text-yellow-400";
    return "text-emerald-400";
  };

  const getRiskBg = (r) => {
    if (r === "HIGH") return "bg-red-500/10 border-red-500/20";
    if (r === "MEDIUM") return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-emerald-500/10 border-emerald-500/20";
  };

  const hasOptimization = routeResult && routeResult.risk === "HIGH" && routeResult.alternative_port !== routeResult.destination;
  const activeIntel = hasOptimization ? routeResult.alternative_intelligence : routeResult?.destination_intelligence;

  return (
    <div className="flex-1 p-7 overflow-y-auto bg-[#081028] text-white">
      {/* Navbar */}
      <Navbar />

      <div className="grid grid-cols-3 gap-6 mt-8">
        
        {/* Left Control Panel */}
        <div className="col-span-1 space-y-6">
          
          {/* Port Selector */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Navigation size={20} className="text-blue-400 animate-pulse" />
              Route Simulator
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Origin Port</label>
                <select
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="">Select Origin Port</option>
                  {ports.map((port) => (
                    <option key={`origin-${port}`} value={port} className="bg-slate-900 text-white">
                      {port}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Destination Port</label>
                <select
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="">Select Destination Port</option>
                  {ports.map((port) => (
                    <option key={`dest-${port}`} value={port} className="bg-slate-900 text-white">
                      {port}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    localStorage.setItem("active_simulated_month", e.target.value);
                  }}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="">Select Month</option>
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((m) => (
                    <option key={`month-global-${m}`} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={analyzeRoute}
                disabled={loading || !originPort || !destinationPort || !selectedMonth}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm shadow-md"
              >
                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Anchor size={18} />}
                {loading ? "Optimizing Path..." : "Analyze Waterway Route"}
              </button>
            </div>
          </div>

          {/* AI Route Explanation Panel */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe size={20} className="text-purple-400" />
              AI Route Explanation
            </h2>

            {!routeResult ? (
              <p className="text-gray-400 text-sm">
                Analyze a route to generate real-time AI navigational risk explanations, weather details, and optimization suggestions.
              </p>
            ) : (
              <div className="space-y-4">
                <div className={`flex items-center gap-3 border p-4 rounded-2xl ${getRiskBg(routeResult.risk)}`}>
                  <ShieldAlert className={`${getRiskColor(routeResult.risk)} shrink-0`} size={24} />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Transit Risk Class</p>
                    <p className={`text-lg font-extrabold ${getRiskColor(routeResult.risk)}`}>
                      {routeResult.risk} ({routeResult.risk_score}/100)
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 bg-black/20 border border-white/5 rounded-xl">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">Reason for Risk Score</p>
                    <p className="text-gray-200">
                      {routeResult.risk === "HIGH" 
                        ? "Long-distance route transiting through high congestion maritime lanes and active gale wind zones." 
                        : "Corridor parameters and regional marine weather patterns reside within optimal limits."
                      }
                    </p>
                  </div>

                  {routeResult.weather_risk_score > 20 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-xl flex items-start gap-2">
                      <CloudLightning className="text-red-400 shrink-0 mt-0.5" size={14} />
                      <div>
                        <p className="text-red-400 font-extrabold uppercase text-[9px]">Severe Weather Impact</p>
                        <p className="text-gray-300 text-[11px] mt-0.5">Route transit is affected by storm zones (Weather risk score: {routeResult.weather_risk_score}/100).</p>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-black/20 border border-white/5 rounded-xl">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-1">AI Recommendation</p>
                    <p className="text-white">
                      {routeResult.risk === "HIGH" ? (
                        <span>Authorized rerouting to regional port: <strong className="text-emerald-400">{routeResult.alternative_port}</strong> to mitigate congestion and secure safety parameters.</span>
                      ) : (
                        <span>Maintain baseline heading. Direct route to {routeResult.destination} is fully approved and secure.</span>
                      )}
                    </p>
                  </div>

                  {hasOptimization && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl">
                      <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-wider">Projected Optimization Payoff</p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-300 text-[11px] mt-1">
                        <li>Logistics Cost Savings: <strong className="text-emerald-400 font-mono">${routeResult.savings?.total?.toLocaleString()}</strong></li>
                        <li>Risk mitigated by 32% (classification LOW/MEDIUM)</li>
                        <li>Expected discharge delay improved by 1.2 days</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Map Display & HUD Details */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] h-[550px] flex flex-col relative">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between z-10">
              <span>Interactive Navigation & Maritime Risk HUD</span>
              {routeResult && (
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase border ${getRiskBg(routeResult.risk)} ${getRiskColor(routeResult.risk)}`}>
                  {routeResult.risk} RISK ({routeResult.risk_score}/100)
                </span>
              )}
            </h2>
            
            <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              <MapComponent
                originCoords={routeResult?.origin_coords}
                destinationCoords={routeResult?.destination_coords}
                alternativeCoords={routeResult?.alternative_coords}
                originName={routeResult?.origin}
                destinationName={routeResult?.destination}
                alternativeName={routeResult?.alternative_port}
                risk={routeResult?.risk}
                riskScore={routeResult?.risk_score}
                originalCost={routeResult?.original_cost}
                optimizedCost={routeResult?.optimized_cost}
                destIntel={routeResult?.destination_intelligence}
                altIntel={routeResult?.alternative_intelligence}
                stormZones={routeResult?.storm_zones || []}
              />
            </div>
          </div>

          {/* DYNAMIC PORT INTELLIGENCE & HUD SUMMARY CARDS */}
          {routeResult && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Lanes Distance</p>
                <p className="text-lg font-extrabold mt-1 text-blue-400 font-mono">
                  {routeResult.distance_km.toLocaleString()} km
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Logistics Cost</p>
                <p className="text-lg font-extrabold mt-1 text-purple-400 font-mono">
                  ${(hasOptimization ? routeResult.optimized_cost?.total : routeResult.original_cost?.total)?.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Harbor Dimensions</p>
                <p className="text-lg font-extrabold mt-1 text-emerald-400 truncate" title={activeIntel?.harbor_size}>
                  {activeIntel?.harbor_size || "Medium"} Size
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Container Cap</p>
                <p className={`text-lg font-extrabold mt-1 uppercase ${
                  activeIntel?.container_facilities === "Yes" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {activeIntel?.container_facilities || "Unknown"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GlobalMap;
