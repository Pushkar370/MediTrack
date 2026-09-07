// Lightweight, dependency-free SVG charts for a clean SaaS look.
// Easy to replace with a charting library (Recharts/Chart.js) later.

export function BarChart({ labels = [], data = [], color = "#2F6F68", height = 180 }) {
  const max = Math.max(...data, 1);
  const w = 100;
  const gap = 4;
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        {data.map((v, i) => {
          const h = (v / max) * (height - 20);
          return (
            <g key={i}>
              <rect x={i * (bw + gap)} y={height - h - 10} width={bw} height={h} rx={1.5} fill={color} />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-ink/40 mt-1 px-0.5">
        {labels.map((l, i) => <span key={i} className="truncate">{l}</span>)}
      </div>
    </div>
  );
}

export function LineChart({ labels = [], data = [], color = "#2F6F68", height = 180 }) {
  const max = Math.max(...data, 1);
  const w = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = height - (v / max) * (height - 20) - 10;
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${path} L ${w} ${height} L 0 ${height} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d={area} fill={color} opacity="0.12" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flex justify-between text-[10px] text-ink/40 mt-1">
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

export function DonutChart({ labels = [], data = [], colors = ["#2F6F68", "#8FB9B2", "#F4C95D", "#D9534F"], size = 160 }) {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  let offset = 0;
  const radius = 60;
  const circ = 2 * Math.PI * radius;
  return (
    <div className="flex items-center gap-5 flex-wrap justify-center">
      <svg width={size} height={size} viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E6EFEC" strokeWidth="18" />
        {data.map((v, i) => {
          const frac = v / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={i}
              cx="80" cy="80" r={radius} fill="none"
              stroke={colors[i % colors.length]} strokeWidth="18"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="80" y="78" textAnchor="middle" className="fill-ink" fontSize="18" fontWeight="700">{total}</text>
        <text x="80" y="94" textAnchor="middle" className="fill-ink/50" fontSize="9">Total</text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {labels.map((l, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: colors[i % colors.length] }} />
            <span className="text-ink/70">{l}</span>
            <span className="font-medium text-ink ml-auto">{data[i]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
