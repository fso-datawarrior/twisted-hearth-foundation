import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface GaugeChartProps {
  title?: string;
  value: number;
  max?: number;
  height?: number;
  showLabel?: boolean;
}

export function GaugeChart({
  title,
  value,
  max = 100,
  height = 200,
  showLabel = true,
}: GaugeChartProps) {
  const percentage = Math.min(100, (value / max) * 100);
  
  const getColor = () => {
    if (percentage >= 75) return '#10b981'; // green
    if (percentage >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const data = [
    { name: 'value', value: percentage },
    { name: 'remaining', value: 100 - percentage },
  ];

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium mb-3 text-center">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
          >
            <Cell fill={getColor()} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {showLabel && (
        <div className="text-center mt-[-40px]">
          <div className="text-3xl font-bold" style={{ color: getColor() }}>
            {percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {value} / {max}
          </div>
        </div>
      )}
    </div>
  );
}
