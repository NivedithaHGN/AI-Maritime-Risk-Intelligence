import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend,
  LineChart,
  Line
} from "recharts";
import { 
  DollarSign, 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Navigation, 
  RefreshCw, 
  AlertTriangle,
  Zap,
  Info,
  Calendar,
  Sparkles
} from "lucide-react";

// Curated dark theme colors
const COLORS = ["#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#ef4444"];
const RISK_COLORS = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444"
};

function Analytics() {
  const [ports, setPorts] = useState([]);
  const [originPort, setOriginPort] = useState(() => {
    return localStorage.getItem("active_analytics_origin") || "";
  });
  const [destinationPort, setDestinationPort] = useState(() => {
    return localStorage.getItem("active_analytics_destination") || "";
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem("active_analytics_month") || "";
  });
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(() => {
    try {
      const saved = localStorage.getItem("active_analytics_route");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  // Truly empty states initially - no mock values
  const [analyticsData, setAnalyticsData] = useState({
    risk_distribution: [],
    risk_trends: [],
    route_distances: [],
    cost_breakdown: [],
    top_risky_ports: [],
    top_optimized_routes: [],
    avg_cost_trends: [],
    ai_insights: []
  });

  const [costs, setCosts] = useState(() => {
    try {
      const saved = localStorage.getItem("active_analytics_costs");
      return saved ? JSON.parse(saved) : {
        transport: 0,
        fuel: 0,
        insurance: 0,
        delay: 0,
        risk: 0,
        total: 0,
        distance: 0
      };
    } catch (e) {
      return {
        transport: 0,
        fuel: 0,
        insurance: 0,
        delay: 0,
        risk: 0,
        total: 0,
        distance: 0
      };
    }
  });

  useEffect(() => {
    // 1. Fetch ports
    fetch("http://127.0.0.1:5000/ports")
      .then((res) => res.json())
      .then((data) => {
        setPorts(data);
      })
      .catch((err) => console.error("Error loading ports:", err));

    // 2. Fetch analytics
    refreshAnalyticsStats();
  }, []);

  // Sync selectors with active route selection
  useEffect(() => {
    if (routeResult) {
      setOriginPort(routeResult.origin || "");
      setDestinationPort(routeResult.destination || "");
      if (routeResult.month) {
        setSelectedMonth(routeResult.month);
        localStorage.setItem("active_analytics_month", routeResult.month);
      }
    }
  }, [routeResult]);

  const refreshAnalyticsStats = () => {
    fetch("http://127.0.0.1:5000/analytics-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.risk_distribution)) {
          setAnalyticsData({
            risk_distribution: data.risk_distribution || [],
            risk_trends: data.risk_trends || [],
            route_distances: data.route_distances || [],
            cost_breakdown: data.cost_breakdown || [],
            top_risky_ports: data.top_risky_ports || [],
            top_optimized_routes: data.top_optimized_routes || [],
            avg_cost_trends: data.avg_cost_trends || [],
            monthly_shipment_volume: data.monthly_shipment_volume || [],
            ai_insights: data.ai_insights || []
          });
        }
      })
      .catch((err) => console.error("Error loading analytics data:", err));
  };

  const computeRouteCosts = async () => {
    if (!originPort || !destinationPort || !selectedMonth) return;
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
          fuel_multiplier: Number(savedFuel)
        }),
      });

      if (!response.ok) {
        console.error("HTTP error: Status", response.status);
        setRouteResult(null);
        return;
      }

      const data = await response.json();
      if (!data || data.error || !data.original_cost) {
        console.error("Route analysis failed or invalid response:", data);
        setRouteResult(null);
        return;
      }

      setRouteResult(data);
      localStorage.setItem("active_analytics_route", JSON.stringify(data));
      
      const activeCost = data.risk === "HIGH" ? data.optimized_cost : data.original_cost;
      if (activeCost) {
        const newCosts = {
          transport: activeCost?.transport || 0,
          fuel: activeCost?.fuel || 0,
          insurance: activeCost?.insurance || 0,
          delay: activeCost?.delay || 0,
          risk: activeCost?.risk || 0,
          total: activeCost?.total || 0,
          distance: data?.distance_km || 0
        };
        setCosts(newCosts);
        localStorage.setItem("active_analytics_costs", JSON.stringify(newCosts));
      }

      refreshAnalyticsStats();
    } catch (error) {
      console.error("Error computing costs:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentCostData = routeResult 
    ? [
        { name: "Transportation Cost", value: costs?.transport || 0 },
        { name: "Fuel Cost", value: costs?.fuel || 0 },
        { name: "Insurance Cost", value: costs?.insurance || 0 },
        { name: "Delay Cost", value: costs?.delay || 0 },
        { name: "Risk Cost", value: costs?.risk || 0 }
      ]
    : (analyticsData?.cost_breakdown || []);

  const totalCostAggregate = (currentCostData || []).reduce((sum, item) => sum + (item?.value || 0), 0);
  const isAnalyticsEmpty = !analyticsData?.route_distances || analyticsData.route_distances.length === 0;

  // Monthly shipment volume simulated from database entries
  const monthlyShipmentVolume = analyticsData?.monthly_shipment_volume || [];

  return (
    <div className="flex-1 p-7 overflow-y-auto bg-[#081028] text-white">
      {/* Navbar */}
      <Navbar />

      {isAnalyticsEmpty ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center text-gray-400 min-h-[500px] flex flex-col justify-center items-center shadow-[0_0_50px_rgba(0,0,0,0.3)] mt-8">
          <BarChart3 size={80} className="text-purple-500 animate-pulse mb-6" />
          <h2 className="text-3xl font-extrabold text-white mb-3">No route analyses performed yet.</h2>
          <p className="text-sm max-w-md mx-auto text-gray-400 leading-relaxed">
            Execute shipping voyages on the <strong>Dashboard Waterway Risk Simulator</strong> to generate dynamic analytics.
          </p>
        </div>
      ) : (
        <>
          {/* AI ANALYTICS INSIGHTS BANNER */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] mt-8 relative overflow-hidden">
            <div className="absolute w-64 h-64 bg-blue-600/10 blur-3xl rounded-full -top-10 -left-10 pointer-events-none"></div>
            
            <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-blue-400">
              <Sparkles size={20} className="animate-pulse" />
              AI Operational Analytics Insights
            </h2>

            <div className="grid grid-cols-4 gap-4">
              {analyticsData.ai_insights.map((insight, idx) => (
                <div key={`insight-item-${idx}`} className="bg-black/25 border border-white/5 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-[0_0_8px_#3b82f6]"></div>
                  <p className="text-xs leading-relaxed text-gray-300 font-semibold">{insight}</p>
                </div>
              ))}
              {analyticsData.ai_insights.length === 0 && (
                <p className="text-gray-500 text-xs py-4 col-span-4 text-center">Calculating insights...</p>
              )}
            </div>
          </div>

          {/* Row 1: Cost Intelligence Control and Cost Visualizer */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            
            {/* Cost Intelligence Calculator */}
            <div className="col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign size={22} className="text-purple-400 animate-pulse" />
                Cost Intelligence Calculator
              </h2>
              <p className="text-gray-400 text-xs mb-5 leading-relaxed">
                Configure fuel cost multipliers and threshold configurations in settings to tailor shipping parameters.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Origin Port</label>
                <select
                  value={originPort}
                  onChange={(e) => {
                    setOriginPort(e.target.value);
                    localStorage.setItem("active_analytics_origin", e.target.value);
                  }}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
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
                  onChange={(e) => {
                    setDestinationPort(e.target.value);
                    localStorage.setItem("active_analytics_destination", e.target.value);
                  }}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
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
                    localStorage.setItem("active_analytics_month", e.target.value);
                  }}
                  className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Month</option>
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((m) => (
                    <option key={`month-analytics-${m}`} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

                <button
                  onClick={computeRouteCosts}
                  type="button"
                  disabled={loading || !originPort || !destinationPort || !selectedMonth}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 mt-2 cursor-pointer text-sm shadow-md"
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : "Compute Intelligent Costs"}
                </button>
              </div>
            </div>

            {/* Cost Breakdown Donut Chart */}
            <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] grid grid-cols-2 gap-6 items-center">
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentCostData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {currentCostData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0c1530", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                      formatter={(value) => [`$${(value || 0).toLocaleString()}`, "Estimated Cost"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase">Simulated Distance</p>
                  <h3 className="text-xl font-extrabold text-blue-400 font-mono mt-0.5">
                    {routeResult ? `${(routeResult?.distance_km || 0).toLocaleString()} km` : "Average Corridors"}
                  </h3>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase">Transit Risk Index</p>
                  <h3 className="text-xl font-extrabold uppercase mt-0.5" style={{ color: routeResult ? (RISK_COLORS[routeResult?.risk] || "#3b82f6") : "#3b82f6" }}>
                    {routeResult ? `${routeResult?.risk || "NOMINAL"} (${routeResult?.risk_score || 0}/100)` : "NOMINAL"}
                  </h3>
                </div>
                
                <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                  {currentCostData.map((item, idx) => (
                    <div key={`cost-list-${idx}`} className="flex justify-between text-gray-300">
                      <span className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        {item.name}
                      </span>
                      <span className="font-bold font-mono">${(item.value || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-white/10 pt-2 font-extrabold text-sm">
                    <span>Total Operational Cost</span>
                    <span className="text-purple-400 font-mono text-base">${(totalCostAggregate || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Pie and Area Charts */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            
            {/* Risk Distribution Pie Chart */}
            <div className="col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] flex flex-col justify-between">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-400" />
                Risk Distribution Registry
              </h3>
              
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.risk_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={70}
                      label={(entry) => {
                        if (!entry) return "";
                        const name = entry.name || "";
                        const percent = entry.percent || 0;
                        return `${name} ${(percent * 100).toFixed(0)}%`;
                      }}
                      dataKey="value"
                    >
                      {analyticsData.risk_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry?.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0c1530", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-[10px] text-gray-400 mt-2 text-center font-semibold">
                Percentage of simulated shipments cataloged in database
              </div>
            </div>

            {/* Risk Trends Stacked Area Chart */}
            <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" />
                Historical Risk Density (Stacked Area Chart)
              </h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.risk_trends}>
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#0c1530", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} />
                    <Legend verticalAlign="top" height={36} />
                    <Area type="monotone" dataKey="low" name="Low Risk (%)" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="medium" name="Medium Risk (%)" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="high" name="High Risk (%)" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 3: Monthly Shipment Volume and Average Cost Trends */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            
            {/* Monthly Shipment Volume (Line Chart) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
                <Calendar size={18} />
                Monthly simulated shipment volumes
              </h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyShipmentVolume}>
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#0c1530", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }} />
                    <Line type="monotone" dataKey="shipments" name="Voyages Run" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Cost Trends (Bar Chart) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
                <DollarSign size={18} />
                Monthly Average Logistics Cost Trends
              </h3>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.avg_cost_trends}>
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0c1530", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                      formatter={(value) => [`$${(value || 0).toLocaleString()}`, "Avg Cost"]}
                    />
                    <Bar dataKey="avg_cost" name="Average Cost ($)" fill="#a855f7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Row 4: Route Distance and Riskiest Ports */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            
            {/* Route Distance Bar Chart */}
            <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-400" />
                Route Distance Analysis & Volatility
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.route_distances}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0c1530", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                      formatter={(value) => [`${(value || 0).toLocaleString()} km`, "Distance"]}
                    />
                    <Bar dataKey="distance" name="Corridor Distance" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                      {analyticsData.route_distances.map((entry, index) => {
                        let barColor = "#3b82f6";
                        if (entry?.risk === "HIGH") barColor = "#ef4444";
                        else if (entry?.risk === "MEDIUM") barColor = "#f59e0b";
                        else if (entry?.risk === "LOW") barColor = "#10b981";
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Risky Ports List */}
            <div className="col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-yellow-400" />
                  Top Riskiest Ports
                </h3>
                <p className="text-gray-400 text-xs mb-4">
                  Ports exhibiting the highest average risk parameters.
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                {analyticsData.top_risky_ports.map((p, idx) => (
                  <div key={`risky-port-${idx}`} className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
                    <span className="font-extrabold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      {p?.port || "Unknown Port"}
                    </span>
                    <span className="font-bold text-red-400 font-mono">{p?.avg_score || 0}/100</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Row 5: Top Optimized Savings Log */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] mt-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap size={18} className="text-emerald-400 animate-pulse" />
              AI Optimization Route Leaderboard (Savings & Risk Mitigation)
            </h3>

            <div className="overflow-x-auto text-xs text-left">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 uppercase text-[9px] font-extrabold tracking-wider">
                    <th className="pb-3">Origin Hub</th>
                    <th className="pb-3">Target Hub</th>
                    <th className="pb-3">AI Alternative Hub</th>
                    <th className="pb-3">Risk Index Reduced</th>
                    <th className="pb-3">Projected Cost Saved</th>
                    <th className="pb-3">Action Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {analyticsData.top_optimized_routes.map((route, index) => (
                    <tr key={`opt-route-${index}`} className="hover:bg-white/5 transition duration-150">
                      <td className="py-3 font-semibold">{route?.origin || "Unknown"}</td>
                      <td className="py-3 font-semibold text-red-400">{route?.destination || "Unknown"}</td>
                      <td className="py-3 font-extrabold text-emerald-400">{route?.alternative || "Unknown"}</td>
                      <td className="py-3 font-bold font-mono text-blue-400">-{route?.risk_reduction || 0}%</td>
                      <td className="py-3 font-extrabold text-emerald-400 font-mono">${(route?.savings || 0).toLocaleString()}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          REROUTE ENFORCED
                        </span>
                      </td>
                    </tr>
                  ))}
                  {analyticsData.top_optimized_routes.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No optimized pathways recorded. Run high-risk simulations on the dashboard to populate registry.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default Analytics;
