import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  title?: string;
  data: any[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  colors?: string[];
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PieChart({
  title,
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showLegend = true,
  showLabels = true,
  colors = DEFAULT_COLORS,
}: PieChartProps) {
  const renderLabel = (entry: any) => {
    if (!showLabels) return '';
    const percent = ((entry.value / data.reduce((sum, item) => sum + item[dataKey], 0)) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-medium mb-3">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={renderLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
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
              verticalAlign="bottom"
              height={36}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
