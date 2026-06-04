import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", risk: 35 },
  { month: "Feb", risk: 52 },
  { month: "Mar", risk: 48 },
  { month: "Apr", risk: 70 },
  { month: "May", risk: 62 },
  { month: "Jun", risk: 85 },
];

function RiskChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>

      <LineChart data={data}>

        <XAxis
          dataKey="month"
          stroke="#94a3b8"
        />

        <YAxis stroke="#94a3b8" />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="risk"
          stroke="#a855f7"
          strokeWidth={3}
        />

      </LineChart>

    </ResponsiveContainer>
  );
}

export default RiskChart;