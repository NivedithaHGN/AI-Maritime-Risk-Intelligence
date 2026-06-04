import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MapComponent from "../components/MapComponent";
import StatCard from "../components/StatCard";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  AlertTriangle,
  PackageCheck,
  Clock3,
  Globe,
  Activity,
  ShieldAlert,
  TrendingUp,
  Route as RouteIcon,
  DollarSign,
  Info,
  Layers,
  CloudLightning,
  RefreshCw,
  Compass,
  ArrowRight,
  Anchor,
  Flame,
  FlameKindling,
  Sliders,
  Sparkles,
  Calendar
} from "lucide-react";

function Dashboard() {
  // Selector inputs - start completely blank
  const [ports, setPorts] = useState([]);
  const [originPort, setOriginPort] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem("active_simulated_month") || "";
  });
  const [forceHighRisk, setForceHighRisk] = useState(false);
  
  // Truly empty dashboard states initially
  const [stats, setStats] = useState({
    global_shipments: 0,
    critical_routes: 0,
    optimized_routes: 0,
    average_eta: 0,
    average_cost: 0,
    success_rate: 0,
    risk_index: 0,
    top_risk_regions: [],
    recent_alerts: [],
    ai_recommendations: [],
    selected_month: "",
    monthly_index: 0,
    top_risk_month: ""
  });
  
  const [history, setHistory] = useState([]);
  const [routeResult, setRouteResult] = useState(() => {
    try {
      const saved = localStorage.getItem("active_simulated_route");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load ports, defaults, and stats on mount
  useEffect(() => {
    fetch("http://127.0.0.1:5000/ports")
      .then((res) => res.json())
      .then((data) => {
        setPorts(data);
        // Do not preselect any default ports on startup - start empty!
        setOriginPort("");
        setDestinationPort("");
      })
      .catch((err) => console.error("Error loading ports:", err));

    refreshDashboardStats(selectedMonth);
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

  // Sync stats when selected month changes
  useEffect(() => {
    if (selectedMonth) {
      localStorage.setItem("active_simulated_month", selectedMonth);
      refreshDashboardStats(selectedMonth);
    }
  }, [selectedMonth]);

  const refreshDashboardStats = (monthVal = selectedMonth) => {
    const statsUrl = monthVal 
      ? `http://127.0.0.1:5000/dashboard-stats?month=${encodeURIComponent(monthVal)}`
      : "http://127.0.0.1:5000/dashboard-stats";

    // Fetch stats from history database
    fetch(statsUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.global_shipments !== "undefined") {
          setStats(data);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err));

    // Fetch history
    fetch("http://127.0.0.1:5000/route-history")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
          // Set last route result if present
          if (data.length > 0 && !routeResult) {
            const savedRoute = localStorage.getItem("active_simulated_route");
            if (savedRoute) {
              try {
                setRouteResult(JSON.parse(savedRoute));
              } catch (e) {
                const highRiskRoute = data.find((r) => r.risk === "HIGH");
                setRouteResult(highRiskRoute || data[data.length - 1]);
              }
            } else {
              const highRiskRoute = data.find((r) => r.risk === "HIGH");
              const initialRoute = highRiskRoute || data[data.length - 1];
              setRouteResult(initialRoute);
              localStorage.setItem("active_simulated_route", JSON.stringify(initialRoute));
            }
          }
        }
      })
      .catch((err) => console.error("Error loading history:", err));
  };

  const analyzeRoute = async () => {
    if (!originPort || !destinationPort || !selectedMonth) {
      setErrorMsg("Please select origin, destination, and month.");
      return;
    }
    
    setErrorMsg("");
    setLoading(true);
    
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
          fuel_multiplier: Number(savedFuel),
          force_high_risk: forceHighRisk
        }),
      });

      const data = await response.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setRouteResult(data);
        localStorage.setItem("active_simulated_route", JSON.stringify(data));
        // Fetch latest route history to update the voyage list instantly without page reload
        fetch("http://127.0.0.1:5000/route-history")
          .then((res) => res.json())
          .then((histData) => {
            if (Array.isArray(histData)) {
              setHistory(histData);
            }
          })
          .catch((err) => console.error("Error updating history:", err));
        // Refresh dynamic stats
        refreshDashboardStats(selectedMonth);
      }
    } catch (error) {
      console.error("Error analyzing route:", error);
      setErrorMsg("Failed to communicate with Flask intelligence server.");
    } finally {
      setLoading(false);
    }
  };

  // Helper button to instantly run a high risk scenario
  const generateHighRiskScenario = () => {
    setOriginPort("Shanghai");
    setDestinationPort("Rotterdam");
    setSelectedMonth("August");
    setForceHighRisk(false);
    // Trigger analysis in next cycle after states apply
    setTimeout(() => {
      document.getElementById("btn-simulate-corridor")?.click();
    }, 100);
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
  const isHistoryEmpty = history.length === 0;

  // Riskiest simulated routes
  const riskiestRoutes = [...history]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10);

  // Top riskiest ports
  const portAverages = {};
  history.forEach((run) => {
    const port = run.destination;
    const score = run.risk_score;
    if (!portAverages[port]) portAverages[port] = [];
    portAverages[port].push(score);
  });
  const riskiestPorts = Object.keys(portAverages)
    .map((port) => ({
      port,
      avg_score: Math.round(portAverages[port].reduce((s, x) => s + x, 0) / portAverages[port].length)
    }))
    .sort((a, b) => b.avg_score - a.avg_score)
    .slice(0, 10);

  return (
    <div className="flex-1 p-7 overflow-y-auto bg-[#081028] text-white">
      {/* Navbar */}
      <Navbar />

      {/* TOP KPI CARDS - MULTI-METRIC COST INTELLIGENCE */}
      <div className="grid grid-cols-4 gap-6 mt-8">
        <StatCard
          title="Active Shipments"
          value={stats.global_shipments > 0 ? stats.global_shipments.toLocaleString() : "0"}
          trend={stats.global_shipments > 0 ? `+${stats.global_shipments} runs` : ""}
          icon={<Truck size={28} />}
          color="bg-blue-600"
        />

        <StatCard
          title="Logistics Success Rate"
          value={stats.global_shipments > 0 ? `${stats.success_rate}%` : "--"}
          trend={stats.global_shipments > 0 ? "Nominal status" : ""}
          icon={<PackageCheck size={28} />}
          color="bg-emerald-600"
        />

        <StatCard
          title="Critical Risk Corridors"
          value={stats.global_shipments > 0 ? stats.critical_routes.toString() : "0"}
          trend={stats.global_shipments > 0 ? `${stats.critical_routes} Active` : ""}
          icon={<AlertTriangle size={28} />}
          color="bg-red-600"
        />

        <StatCard
          title="Average Risk Score"
          value={stats.global_shipments > 0 ? `${stats.risk_index}/100` : "--/100"}
          trend={stats.global_shipments > 0 ? "Real-time index" : ""}
          icon={<Activity size={28} />}
          color="bg-purple-600"
        />
      </div>

      {/* SEASONAL INTELLIGENCE WIDGETS */}
      <div className="grid grid-cols-4 gap-6 mt-6">
        <StatCard
          title="Simulated Month"
          value={selectedMonth || "None Selected"}
          trend="Target climate window"
          icon={<Calendar size={28} />}
          color="bg-indigo-600"
        />

        <StatCard
          title="Seasonal Risk Rating"
          value={routeResult ? `${routeResult.risk} (${routeResult.risk_score}/100)` : "--"}
          trend={routeResult ? `${routeResult.month} corridor assessment` : ""}
          icon={<CloudLightning size={28} />}
          color={routeResult?.risk === "HIGH" ? "bg-red-600" : (routeResult?.risk === "MEDIUM" ? "bg-amber-600" : "bg-emerald-600")}
        />

        <StatCard
          title="Monthly Average Index"
          value={stats.monthly_index > 0 ? `${stats.monthly_index}/100` : "--"}
          trend={`Average for ${selectedMonth || "selected month"}`}
          icon={<TrendingUp size={28} />}
          color="bg-purple-600"
        />

        <StatCard
          title="Peak Risk Month"
          value={stats.top_risk_month || "--"}
          trend="Highest historical hazards"
          icon={<Flame size={28} />}
          color="bg-pink-600"
        />
      </div>

      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        
        {/* LEFT COLUMN (MAP & TRACKER TABLE) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* GLOBAL MAP INTERACTION PANEL */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <div className="absolute w-80 h-80 bg-blue-600/15 blur-3xl rounded-full -top-20 -right-20 pointer-events-none"></div>

            <div className="relative z-10 flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  <Globe size={24} className="text-blue-400" />
                  Maritime Logistics Intelligence Map
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  AI route optimization, storm weather zones, and rotating shipping tracking
                </p>
              </div>

              <Link to="/global-map" className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-2xl text-xs font-bold transition text-white no-underline shadow-md">
                Interactive Mapping
              </Link>
            </div>

            <div className="relative z-10 h-[450px] rounded-3xl border border-white/10 bg-slate-950 overflow-hidden shadow-inner">
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

          {/* DYNAMIC VOYAGE TRACKER TABLE */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2">
                  <Compass size={24} className="text-blue-400" />
                  Persistent Voyage Registry
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Log of historical simulated transits and AI rerouting calculations
                </p>
              </div>
              
              <button 
                onClick={refreshDashboardStats}
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition text-gray-300 animate-pulse"
                title="Sync Database"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="pb-4">Lane ID</th>
                    <th className="pb-4">Origin Hub</th>
                    <th className="pb-4">Target Hub</th>
                    <th className="pb-4">Rerouted Alternative</th>
                    <th className="pb-4">Risk Rating</th>
                    <th className="pb-4">Logistics Cost</th>
                    <th className="pb-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.slice(-5).reverse().map((run) => (
                    <tr key={run.id} className="hover:bg-white/5 transition duration-150 cursor-pointer" onClick={() => setRouteResult(run)}>
                      <td className="py-4 font-mono font-bold text-blue-400">#LOG{run.id}</td>
                      <td>{run.origin}</td>
                      <td>{run.destination}</td>
                      <td className={run.risk === "HIGH" ? "text-emerald-400 font-bold" : "text-gray-400"}>
                        {run.risk === "HIGH" ? run.alternative_port : "Direct Route"}
                      </td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${getRiskBg(run.risk)} ${getRiskColor(run.risk)}`}>
                          {run.risk} ({run.risk_score})
                        </span>
                      </td>
                      <td className="font-mono font-bold text-purple-400">
                        ${run.original_cost?.total?.toLocaleString()}
                      </td>
                      <td className="text-xs text-gray-400">{run.timestamp ? run.timestamp.split(" ")[0] : "Recent"}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        No shipping voyages recorded. Run the simulator below to start logging.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DYNAMIC LEADERBOARDS & RISK HEATMAP GRID */}
          {!isHistoryEmpty && (
            <div className="space-y-6 mt-6">
              
              {/* Upper Grid: Top 10 High Risk Ports & Global Heatmap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 10 High Risk Ports */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
                  <h3 className="text-base font-extrabold mb-4 flex items-center gap-2 text-yellow-400">
                    <FlameKindling size={16} />
                    Top 10 High Risk Ports
                  </h3>
                  
                  <div className="space-y-2.5 text-[11px]">
                    {riskiestPorts.map((p, idx) => (
                      <div key={`risk-port-${idx}`} className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                        <span className="font-semibold text-white truncate">
                          {idx + 1}. {p.port}
                        </span>
                        <span className="font-extrabold text-yellow-400 font-mono shrink-0">{p.avg_score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Risk Heatmap Grid Matrix */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] flex flex-col">
                  <h3 className="text-base font-extrabold mb-4 flex items-center gap-2 text-purple-400">
                    <Layers size={16} />
                    Global Risk Heatmap Matrix
                  </h3>
                  <p className="text-gray-400 text-[10px] mb-3">
                    Real-time threat status across active shipping grids. Click node to track.
                  </p>

                  <div className="grid grid-cols-5 gap-2 flex-1 items-center">
                    {history.slice(-15).map((run, idx) => {
                      const bg = run.risk === "HIGH" ? "bg-red-500/80 shadow-[0_0_12px_#ef4444]" : (run.risk === "MEDIUM" ? "bg-yellow-500/80 shadow-[0_0_12px_#f59e0b]" : "bg-emerald-500/80 shadow-[0_0_12px_#10b981]");
                      return (
                        <div 
                          key={`heatmap-dot-${idx}`}
                          className={`h-9 rounded-lg flex items-center justify-center text-[9px] font-extrabold text-slate-950 cursor-pointer transition transform hover:scale-110 ${bg}`}
                          onClick={() => setRouteResult(run)}
                          title={`${run.origin} to ${run.destination}: Risk ${run.risk_score}/100`}
                        >
                          #{run.id}
                        </div>
                      );
                    })}
                    {history.length < 15 && (
                      Array.from({ length: 15 - history.length }).map((_, i) => (
                        <div key={`heatmap-placeholder-${i}`} className="h-9 rounded-lg bg-white/5 border border-white/5 border-dashed flex items-center justify-center text-gray-600 text-[9px]">
                          VACANT
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Lower Section: Top 10 Riskiest Simulated Routes Leaderboard */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
                <h3 className="text-base font-extrabold mb-4 flex items-center gap-2 text-red-400">
                  <Flame size={16} className="animate-pulse" />
                  Top 10 Riskiest Simulated Routes
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {riskiestRoutes.map((run, idx) => (
                    <div 
                      key={`risk-route-${idx}`} 
                      className="flex justify-between items-center bg-black/20 p-3.5 rounded-2xl border border-white/5 hover:border-red-500/30 cursor-pointer transition hover:bg-black/40" 
                      onClick={() => setRouteResult(run)}
                    >
                      <span className="font-semibold text-white flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono">#{idx + 1}</span>
                        <span>{run.origin}</span>
                        <ArrowRight size={12} className="text-gray-500 shrink-0" />
                        <span className="text-red-400 font-bold">{run.destination}</span>
                      </span>
                      <span className="font-extrabold text-red-400 font-mono shrink-0 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">{run.risk_score}/100</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN (HUD CONTROLS & SIMULATOR) */}
        <div className="space-y-6">

          {/* AI WATERWAY SIMULATOR */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <div className="absolute w-48 h-48 bg-purple-600/10 blur-3xl rounded-full -top-10 -left-10 pointer-events-none"></div>
            
            <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4">
              <Compass size={20} className="text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
              Waterway Risk Simulator
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed mb-5">
              Simulate maritime routing, load dynamic WPI details, check storm zones, and request alternative port recommendations.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-2">Departure Port</label>
                <select
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="">Select Origin Port</option>
                  {ports.map((p) => (
                    <option key={`orig-sel-${p}`} value={p} className="bg-[#081028] text-white">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-2">Destination Port</label>
                <select
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="">Select Destination Port</option>
                  {ports.map((p) => (
                    <option key={`dest-sel-${p}`} value={p} className="bg-[#081028] text-white">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-gray-400 mb-2">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition"
                >
                  <option value="">Select Month</option>
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((m) => (
                    <option key={`month-sel-${m}`} value={m} className="bg-[#081028] text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Force High-Risk Development Toggle Switch */}
              <div className="bg-black/25 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={14} className="text-purple-400 animate-pulse" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block text-purple-300">Force High Risk</span>
                    <span className="text-[8px] text-gray-400 block">Trigger AI detour protocols</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={forceHighRisk} 
                    onChange={(e) => setForceHighRisk(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                </label>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-2xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={generateHighRiskScenario}
                  type="button"
                  className="bg-[#6366f1]/15 hover:bg-[#6366f1]/25 border border-[#6366f1]/35 text-[#a5b4fc] py-3.5 rounded-2xl font-bold transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Instantly generate high risk route"
                >
                  <Sparkles size={14} className="animate-spin" style={{ animationDuration: '5s' }} />
                  Demo High Risk
                </button>

                <button
                  id="btn-simulate-corridor"
                  onClick={analyzeRoute}
                  type="button"
                  disabled={loading || !originPort || !destinationPort}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-md"
                >
                  {loading ? <RefreshCw className="animate-spin" size={14} /> : <Activity size={14} />}
                  {loading ? "Simulating..." : "Analyze Lane"}
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC COMPARISON HUD WITH RISK BREAKDOWN PROGRESS BARS */}
          <AnimatePresence mode="wait">
            {routeResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] space-y-4"
              >
                <h2 className="text-lg font-extrabold flex items-center gap-2 border-b border-white/10 pb-3">
                  <RouteIcon size={18} className="text-purple-400" />
                  Route Comparison Summary
                </h2>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* Original column */}
                  <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-3.5 space-y-3">
                    <p className="font-extrabold text-[10px] text-red-400 uppercase tracking-wider">Original Route</p>
                    <div>
                      <p className="text-gray-400 text-[9px] uppercase font-bold">Overall Risk</p>
                      <p className="text-base font-extrabold text-red-400">{routeResult.risk_score}/100</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[9px] uppercase font-bold">Transit Time</p>
                      <p className="font-bold text-white">{routeResult.travel_days} Days</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[9px] uppercase font-bold">Est Cost</p>
                      <p className="font-bold text-white font-mono">${routeResult.original_cost?.total?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Optimized column */}
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3.5 space-y-3">
                    <p className="font-extrabold text-[10px] text-emerald-400 uppercase tracking-wider">Optimized Route</p>
                    <div>
                      <p className="text-gray-400 text-[9px] uppercase font-bold">Overall Risk</p>
                      <p className="text-base font-extrabold text-emerald-400">
                        {hasOptimization ? Math.max(10, Math.round(routeResult.risk_score - (routeResult.risk_reduction || 0))) : routeResult.risk_score}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[9px] uppercase font-bold">Transit Time</p>
                      <p className="font-bold text-white">
                        {hasOptimization ? (routeResult.travel_days - (routeResult.eta_improvement || 0)).toFixed(1) : routeResult.travel_days} Days
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[9px] uppercase font-bold">Est Cost</p>
                      <p className="font-bold text-emerald-400 font-mono">
                        ${routeResult.optimized_cost?.total?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Route Path Details */}
                <div className="bg-black/25 border border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Original Destination:</span>
                    <strong className="text-white">{routeResult.destination}</strong>
                  </div>
                  {hasOptimization && (
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Alternative Destination:</span>
                      <strong className="text-emerald-400">{routeResult.alternative_port}</strong>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-gray-400 border-t border-white/5 pt-2">
                    <span>Path:</span>
                    <span className="text-white font-semibold">
                      {routeResult.origin} → {hasOptimization ? (
                        <>
                          <span className="text-red-400 line-through mr-1">{routeResult.destination}</span>
                          <span className="text-emerald-400">{routeResult.alternative_port}</span>
                        </>
                      ) : routeResult.destination}
                    </span>
                  </div>
                </div>

                {/* ALWAYS DISPLAY RISK BREAKDOWN PROGRESS BARS */}
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-xs space-y-3">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-wider">Simulated Risk Factor Breakdown</span>
                  
                  {/* Distance Risk */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-300 font-semibold">
                      <span>Distance Risk Impact</span>
                      <span className="font-mono">{routeResult.risk_breakdown?.distance_risk || Math.round(routeResult.risk_score * 0.4)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${routeResult.risk_breakdown?.distance_risk || routeResult.risk_score * 0.4}%` }}></div>
                    </div>
                  </div>

                  {/* Weather Risk */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-300 font-semibold">
                      <span>Weather Threat Overlay</span>
                      <span className="font-mono">{routeResult.risk_breakdown?.weather_risk || Math.round(routeResult.weather_risk_score)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${routeResult.risk_breakdown?.weather_risk || routeResult.weather_risk_score}%` }}></div>
                    </div>
                  </div>

                  {/* Congestion Risk */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-300 font-semibold">
                      <span>Port Congestion Risk</span>
                      <span className="font-mono">{routeResult.risk_breakdown?.congestion_risk || Math.round(routeResult.risk_score * 0.25)}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${routeResult.risk_breakdown?.congestion_risk || routeResult.risk_score * 0.25}%` }}></div>
                    </div>
                  </div>

                  {/* Port Capacity Risk */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-300 font-semibold">
                      <span>Berthing Capacity Risk</span>
                      <span className="font-mono">{routeResult.risk_breakdown?.capacity_risk || 50}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${routeResult.risk_breakdown?.capacity_risk || 50}%` }}></div>
                    </div>
                  </div>
                </div>

                {hasOptimization ? (
                  <div className="bg-emerald-500/15 border border-emerald-500/20 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex justify-between items-center text-emerald-400 font-extrabold uppercase text-[10px]">
                      <span>Optimization Savings Summary</span>
                      <span>Enforced</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1 text-white">
                      <div className="bg-black/20 p-2 rounded-xl">
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Cost Avoided</p>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">${(routeResult.cost_savings || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-xl">
                        <p className="text-[8px] text-gray-400 font-bold uppercase">ETA Improvement</p>
                        <p className="text-xs font-bold text-emerald-400 mt-0.5">{routeResult.eta_improvement || 0} Days</p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-xl">
                        <p className="text-[8px] text-gray-400 font-bold uppercase">Risk Reduction</p>
                        <p className="text-xs font-bold text-emerald-400 mt-0.5">{routeResult.risk_reduction || 0}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs p-4 rounded-2xl text-center font-semibold">
                    Current corridor risk is nominal. Direct route is active.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC AI INTELLIGENCE CENTRE (ROOT CAUSES & FACTORS) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
            <h2 className="text-lg font-extrabold flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <ShieldAlert size={18} className="text-blue-400" />
              AI Intelligence Center
            </h2>

            <div className="space-y-4 text-xs leading-relaxed text-gray-300">
              {isHistoryEmpty ? (
                <div className="bg-black/25 border border-white/5 p-4 rounded-2xl flex items-start gap-3 text-gray-400">
                  <Info size={16} className="text-gray-500 shrink-0 mt-0.5" />
                  <p>Simulate voyages to calculate AI Root Cause analysis and Risk Factors.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {routeResult && (
                    <div className="bg-red-500/10 border border-red-500/15 p-4 rounded-2xl space-y-2">
                      <span className="text-red-400 font-extrabold uppercase text-[9px] tracking-wider block">AI Root Cause Analysis</span>
                      <p className="text-gray-200">{routeResult.explanation}</p>
                    </div>
                  )}

                  {routeResult?.weather_risk_score > 30 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/15 p-4 rounded-2xl">
                      <span className="text-yellow-400 font-extrabold uppercase text-[9px] tracking-wider block">Active Risk Factors</span>
                      <p className="text-gray-300 mt-1">Gale warnings or storms present within proximity grids. Dynamic weather impact score raised to {routeResult.weather_risk_score}/100.</p>
                    </div>
                  )}

                  {hasOptimization && (
                    <div className="bg-emerald-500/10 border border-emerald-500/15 p-4 rounded-2xl space-y-2">
                      <span className="text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider block">Optimization Payoffs</span>
                      <ul className="list-disc pl-4 space-y-1 text-gray-300">
                        <li>Avoided Risk Overhead: <strong className="text-emerald-400">${routeResult.savings?.risk?.toLocaleString()}</strong></li>
                        <li>Avoided Delay Penalties: <strong className="text-emerald-400">${routeResult.savings?.delay?.toLocaleString()}</strong></li>
                        <li>Total Avoidance: <strong className="text-emerald-400 font-mono">${routeResult.savings?.total?.toLocaleString()}</strong></li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LIVE OPERATIONS ALERTS */}
          {stats.recent_alerts && stats.recent_alerts.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] relative overflow-hidden">
              <h2 className="text-lg font-extrabold flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <AlertTriangle size={18} className="text-red-400 animate-pulse" />
                Live Operations Alerts
              </h2>
              
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {stats.recent_alerts.map((alert, idx) => (
                  <div key={`alert-${idx}`} className="bg-black/25 border border-white/5 p-3 rounded-2xl text-xs space-y-1.5 hover:border-white/10 transition animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        alert.severity === "CRITICAL" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">{alert.timestamp?.split(" ")[1] || "Active"}</span>
                    </div>
                    <p className="font-bold text-white text-xs">{alert.title}</p>
                    <p className="text-gray-400 text-[11px] leading-relaxed">{alert.message}</p>
                    {alert.action && (
                      <p className="text-blue-400 text-[10px] font-semibold pt-1 border-t border-white/5 flex items-center gap-1">
                        <Activity size={10} />
                        Action: {alert.action}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PORT CAPACITY HUD */}
          {routeResult && !isHistoryEmpty && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
              <h2 className="text-lg font-extrabold flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Anchor size={18} className="text-emerald-400" />
                Port Intelligence HUD
              </h2>
              
              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-red-400">{routeResult.destination}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Terminal Load</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${routeResult.destination_intelligence?.port_capacity_pct || 50}%` }}
                    ></div>
                  </div>
                </div>

                {hasOptimization && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-emerald-400">{routeResult.alternative_port}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Terminal Load</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${routeResult.alternative_intelligence?.port_capacity_pct || 30}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;