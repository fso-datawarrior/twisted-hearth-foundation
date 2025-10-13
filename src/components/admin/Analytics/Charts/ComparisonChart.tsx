import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ComparisonChartProps {
  title?: string;
  data: any[];
  currentKey: string;
  previousKey: string;
  currentLabel?: string;
  previousLabel?: string;
  height?: number;
  xAxisKey?: string;
}

export function ComparisonChart({
  title,
  data,
  currentKey,
  previousKey,
  currentLabel = 'Current',
  previousLabel = 'Previous',
  height = 300,
  xAxisKey = 'name',
}: ComparisonChartProps) {
  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar
            dataKey={currentKey}
            fill="#3b82f6"
            name={currentLabel}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey={previousKey}
            fill="#94a3b8"
            name={previousLabel}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
