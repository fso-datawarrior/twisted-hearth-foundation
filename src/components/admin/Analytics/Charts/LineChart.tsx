import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface LineConfig {
  dataKey: string;
  color: string;
  name: string;
}

interface LineChartProps {
  title?: string;
  data: any[];
  lines: LineConfig[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisKey?: string;
}

export function LineChart({
  title,
  data,
  lines,
  height = 300,
  showGrid = true,
  showLegend = true,
  xAxisKey = 'name',
}: LineChartProps) {
  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
          <XAxis 
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          {showLegend && (
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              name={line.name}
              strokeWidth={2}
              dot={{ fill: line.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
