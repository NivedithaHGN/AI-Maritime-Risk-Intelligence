import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { ShieldAlert, Cpu, Sparkles, TrendingUp, DollarSign, Activity, HelpCircle, Package, Clock, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

function RiskPrediction() {
  const [stockLevel, setStockLevel] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [manufacturingCost, setManufacturingCost] = useState("");
  const [defectRate, setDefectRate] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskResult, setRiskResult] = useState(null);

  const predictRisk = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock_level: Number(stockLevel),
          lead_time: Number(leadTime),
          shipping_cost: Number(shippingCost),
          manufacturing_cost: Number(manufacturingCost),
          defect_rate: Number(defectRate),
        }),
      });

      const data = await response.json();
      
      // Calculate dynamic risk scores & explanations based on input metrics
      let score = 15;
      let factors = [];
      let explanation = "";
      let action = "";

      if (data.risk === "HIGH") {
        score = Math.round(65 + (Number(defectRate) * 5) + (Number(leadTime) * 0.8));
        score = Math.min(100, Math.max(60, score));
        
        if (Number(defectRate) > 2.0) factors.push("Elevated defect rate on factory line");
        if (Number(leadTime) > 18) factors.push("Extremely long supplier lead times");
        if (Number(stockLevel) < 40) factors.push("Critically low safety raw stock level");
        if (factors.length === 0) factors.push("Accumulated minor operational bottlenecks");
        
        explanation = "AI classification flagged this operational setup due to unstable throughput parameters, projecting inventory exhaustion or carrier failures.";
        action = "Deploy supplementary raw material caches and transfer short-term carrier routing to secondary priority lines.";
      } else {
        score = Math.round(10 + (Number(defectRate) * 3) + (Number(leadTime) * 0.4));
        score = Math.min(59, Math.max(5, score));
        
        factors.push("Healthy stock to orders ratio", "Manufacturing quality within tolerances");
        explanation = "System diagnostics indicate excellent manufacturing quality and nominal lead times. The probability of logistical bottlenecks is negligible.";
        action = "Routine maintenance of supplier relationships; continue baseline monitoring.";
      }

      setRiskResult({
        class: data.risk,
        score,
        factors,
        explanation,
        action
      });
    } catch (error) {
      console.error(error);
      setRiskResult({
        class: "ERROR",
        score: 0,
        factors: ["Communications failure"],
        explanation: "Could not retrieve inference payload from Flask model server.",
        action: "Check server connections."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-7 overflow-y-auto bg-[#081028] text-white">
      {/* Navbar */}
      <Navbar />

      <div className="grid grid-cols-3 gap-6 mt-8">
        {/* Left Inputs Panel */}
        <form onSubmit={predictRisk} className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Cpu size={24} className="text-blue-400" />
                AI Risk Predictor
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Evaluate inventory levels, supplier lead times, and manufacturing quality metrics using our ML Classifier.
              </p>
            </div>
            <Sparkles className="text-blue-400 animate-pulse" size={24} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Stock Level */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Package size={16} className="text-blue-400" />
                Stock Level (Units)
              </label>
              <input
                type="number"
                required
                value={stockLevel}
                onChange={(e) => setStockLevel(e.target.value)}
                className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter stock units (e.g., 50)"
              />
              <p className="text-xs text-gray-500">Current safety and active inventory levels</p>
            </div>

            {/* Lead Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Clock size={16} className="text-yellow-400" />
                Lead Time (Days)
              </label>
              <input
                type="number"
                required
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter lead days (e.g., 15)"
              />
              <p className="text-xs text-gray-500">Time elapsed from order to fulfillment</p>
            </div>

            {/* Shipping Cost */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <DollarSign size={16} className="text-emerald-400" />
                Shipping Cost ($)
              </label>
              <input
                type="number"
                required
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter shipping cost (e.g., 150)"
              />
              <p className="text-xs text-gray-500">Average shipping and carriage costs</p>
            </div>

            {/* Manufacturing Cost */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <DollarSign size={16} className="text-purple-400" />
                Manufacturing Cost ($)
              </label>
              <input
                type="number"
                required
                value={manufacturingCost}
                onChange={(e) => setManufacturingCost(e.target.value)}
                className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter production cost (e.g., 45)"
              />
              <p className="text-xs text-gray-500">Per-unit production and machining cost</p>
            </div>

            {/* Defect Rate */}
            <div className="space-y-2 col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Activity size={16} className="text-red-400" />
                Defect Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={defectRate}
                onChange={(e) => setDefectRate(e.target.value)}
                className="w-full bg-black/35 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter defect percentage (e.g., 1.5)"
              />
              <p className="text-xs text-gray-500">Percentage of defective products produced</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-lg shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="animate-spin" size={20} /> Running ML Classifier...
              </span>
            ) : (
              "Predict Disruption Risk"
            )}
          </button>
        </form>

        {/* Right Results Panel */}
        <div className="col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] h-full flex flex-col justify-between min-h-[500px]">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldAlert size={20} className="text-blue-400" />
                AI Inference Result
              </h2>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                Evaluates supply chain vulnerability dynamically based on manufacturing parameters.
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <AnimatePresence mode="wait">
                {!riskResult ? (
                  <motion.div
                    key="no-result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center space-y-3"
                  >
                    <HelpCircle size={64} className="mx-auto text-gray-600 animate-pulse" />
                    <p className="text-gray-400 text-sm">Waiting for model inputs...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="has-result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center space-y-5 w-full"
                  >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border shadow-lg ${
                      riskResult.class === "HIGH" 
                        ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10" 
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                    }`}>
                      <ShieldAlert size={40} />
                    </div>

                    <div className="space-y-2">
                      <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border ${
                        riskResult.class === "HIGH" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {riskResult.class} RISK RATING
                      </span>
                      <h3 className="text-4xl font-black font-mono mt-2" style={{ color: riskResult.class === "HIGH" ? "#f87171" : "#34d399" }}>
                        {riskResult.score}/100
                      </h3>
                    </div>

                    <div className="border-t border-white/5 pt-4 text-left space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-gray-400 block tracking-wider">Contributing Risk Factors</span>
                        <ul className="list-disc pl-4 space-y-1 mt-1 text-gray-300">
                          {riskResult.factors.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-black/20 p-3.5 rounded-2xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-blue-400 block tracking-wider">AI Explanation</span>
                        <p className="text-gray-300 leading-relaxed">{riskResult.explanation}</p>
                      </div>

                      <div className="bg-emerald-500/10 border border-emerald-500/15 p-3.5 rounded-2xl flex gap-2.5">
                        <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold uppercase text-emerald-400 block tracking-wider">Recommended Action</span>
                          <p className="text-gray-200 font-normal leading-relaxed">{riskResult.action}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-white/10 pt-4 text-center">
              <span className="text-[10px] text-gray-500 font-mono">
                Model: RandomForestClassifier (100 Trees)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskPrediction;
