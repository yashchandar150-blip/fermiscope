import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CLASS_COLORS, VERIFICATION_COLORS } from "../utils/constants";

const AXIS = { stroke: "#9aa3c7", fontSize: 12 };
const TOOLTIP = {
  contentStyle: { background: "#141b3a", border: "1px solid #263059", borderRadius: 8, color: "#e6e9f5" },
  labelStyle: { color: "#e6e9f5" },
  itemStyle: { color: "#e6e9f5" },
  cursor: { fill: "rgba(79,140,255,0.08)" },
};

function ChartCard({ title, children, height = 260 }) {
  return (
    <div className="space-card p-3 h-100">
      <div className="card-title-sm">{title}</div>
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

const Empty = () => (
  <div className="h-100 d-flex align-items-center justify-content-center text-muted-space small">
    No data yet
  </div>
);

// 1. Classification distribution (donut)
export function ClassificationPie({ data }) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <ChartCard title="Signal classification distribution">
      {!hasData ? (
        <Empty />
      ) : (
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data.filter((d) => d.value > 0)} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="none">
              {data.filter((d) => d.value > 0).map((d) => (
                <Cell key={d.name} fill={CLASS_COLORS[d.name]} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// 2. Observation trends (line, per month)
export function TrendLine({ data }) {
  return (
    <ChartCard title="Observation trends (last 6 months)">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
          <CartesianGrid stroke="#263059" strokeDasharray="3 3" />
          <XAxis dataKey="month" {...AXIS} />
          <YAxis allowDecimals={false} {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Line type="monotone" dataKey="count" name="Observations" stroke="#4f8cff" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6" }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 3. Signal frequency distribution (bar)
export function FrequencyBar({ data }) {
  return (
    <ChartCard title="Signal frequency distribution (MHz)">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
          <CartesianGrid stroke="#263059" strokeDasharray="3 3" />
          <XAxis dataKey="range" {...AXIS} interval={0} fontSize={11} />
          <YAxis allowDecimals={false} {...AXIS} />
          <Tooltip {...TOOLTIP} />
          <Bar dataKey="count" name="Signals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 4. Verification status distribution (horizontal bar)
export function VerificationBar({ data }) {
  return (
    <ChartCard title="Verification status distribution">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 0 }}>
          <CartesianGrid stroke="#263059" strokeDasharray="3 3" />
          <XAxis type="number" allowDecimals={false} {...AXIS} />
          <YAxis type="category" dataKey="name" width={150} {...AXIS} fontSize={11} />
          <Tooltip {...TOOLTIP} />
          <Bar dataKey="value" name="Signals" radius={[0, 4, 4, 0]}>
            {data.map((d) => (
              <Cell key={d.name} fill={VERIFICATION_COLORS[d.name]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 5. Confidence score breakdown (used on the analysis result page)
export function BreakdownBar({ data }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid stroke="#263059" strokeDasharray="3 3" />
        <XAxis type="number" {...AXIS} />
        <YAxis type="category" dataKey="label" width={170} {...AXIS} fontSize={11} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="points" name="Points" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.points < 0 ? "#f87171" : "#4f8cff"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
