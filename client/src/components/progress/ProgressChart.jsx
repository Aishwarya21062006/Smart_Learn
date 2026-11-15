import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ProgressChart = ({ data = [], height = 260 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-400">
        No quiz score data available yet.
      </div>
    );
  }

  // Format chart data
  const formattedData = [...data].reverse().map((item, idx) => ({
    name: item.topicTitle ? item.topicTitle.slice(0, 15) + (item.topicTitle.length > 15 ? '...' : '') : `Attempt ${idx + 1}`,
    score: Number(item.score) || 0,
    fullTitle: item.topicTitle || 'Quiz'
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0];
      return (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs">
          <p className="font-bold text-slate-900">{p.payload.fullTitle}</p>
          <p className="text-teal-600 font-semibold mt-1">Score: {p.value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="score"
            fill="#0d9488"
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
