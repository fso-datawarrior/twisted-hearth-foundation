# Analytics Phase 5 & 6: Advanced Charts + Export/Customization

## 🎯 Objective
Complete the analytics system with professional-grade chart visualizations using Recharts AND implement widget customization with CSV/PDF export capabilities.

**Estimated Time**: 6-8 hours total (4-5 hours Phase 5, 2-3 hours Phase 6)

---

## 📋 Prerequisites

✅ Phase 1-4 Complete (verified)
✅ 7 widgets operational with 35+ metrics
✅ Dashboard displaying real-time data
✅ Cron automation active

---

## PHASE 5: ADVANCED CHART COMPONENTS (4-5 hours)

### Step 1: Install Recharts Library

```bash
npm install recharts
```

Or add to package.json:
```json
{
  "dependencies": {
    "recharts": "^2.10.3"
  }
}
```

---

### Step 2: Create Chart Component Directory

```bash
mkdir -p src/components/admin/Analytics/Charts
```

---

### Step 3: Build Chart Components

#### Chart 1: LineChart Component

Create: `src/components/admin/Analytics/Charts/LineChart.tsx`

```typescript
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  title: string;
  data: DataPoint[];
  lines: {
    dataKey: string;
    color: string;
    name: string;
  }[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export const LineChart = ({
  title,
  data,
  lines,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true
}: LineChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                name={line.name}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

**Use Case**: Time series data (RSVPs over time, page views trends, session duration)

---

#### Chart 2: BarChart Component

Create: `src/components/admin/Analytics/Charts/BarChart.tsx`

```typescript
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  title: string;
  data: DataPoint[];
  bars: {
    dataKey: string;
    color: string;
    name: string;
  }[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  horizontal?: boolean;
}

export const BarChart = ({
  title,
  data,
  bars,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  horizontal = false
}: BarChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart 
            data={data}
            layout={horizontal ? 'vertical' : 'horizontal'}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            {horizontal ? (
              <>
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis type="category" dataKey={xAxisKey} stroke="#6b7280" style={{ fontSize: '12px' }} />
              </>
            ) : (
              <>
                <XAxis dataKey={xAxisKey} stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              </>
            )}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.color}
                name={bar.name}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

**Use Case**: Categorical comparisons (photos by category, top pages, device breakdown)

---

#### Chart 3: PieChart Component

Create: `src/components/admin/Analytics/Charts/PieChart.tsx`

```typescript
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  name: string;
  value: number;
}

interface PieChartProps {
  title: string;
  data: DataPoint[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number; // For donut chart
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

export const PieChart = ({
  title,
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  showLegend = true,
  innerRadius = 0
}: PieChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            {showLegend && (
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

**Use Case**: Distribution data (RSVP status breakdown, device types, browser distribution)

---

#### Chart 4: AreaChart Component

Create: `src/components/admin/Analytics/Charts/AreaChart.tsx`

```typescript
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  title: string;
  data: DataPoint[];
  areas: {
    dataKey: string;
    color: string;
    name: string;
  }[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export const AreaChart = ({
  title,
  data,
  areas,
  xAxisKey = 'name',
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false
}: AreaChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsAreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
            {areas.map((area) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                stroke={area.color}
                fill={area.color}
                fillOpacity={0.6}
                name={area.name}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

**Use Case**: Cumulative trends (total users over time, cumulative page views)

---

#### Chart 5: ComparisonChart Component

Create: `src/components/admin/Analytics/Charts/ComparisonChart.tsx`

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DataPoint {
  name: string;
  current: number;
  previous: number;
}

interface ComparisonChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  currentLabel?: string;
  previousLabel?: string;
  height?: number;
}

export const ComparisonChart = ({
  title,
  description,
  data,
  currentLabel = 'This Period',
  previousLabel = 'Previous Period',
  height = 300
}: ComparisonChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar 
              dataKey="previous" 
              fill="#94a3b8" 
              name={previousLabel}
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="current" 
              fill="#3b82f6" 
              name={currentLabel}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
```

**Use Case**: Week vs week, month vs month comparisons

---

#### Chart 6: GaugeChart Component

Create: `src/components/admin/Analytics/Charts/GaugeChart.tsx`

```typescript
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface GaugeChartProps {
  title: string;
  description?: string;
  value: number; // 0-100
  maxValue?: number;
  height?: number;
  color?: string;
  label?: string;
}

export const GaugeChart = ({
  title,
  description,
  value,
  maxValue = 100,
  height = 200,
  color,
  label
}: GaugeChartProps) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Determine color based on percentage if not provided
  const gaugeColor = color || (
    percentage >= 80 ? '#10b981' : // green
    percentage >= 50 ? '#f59e0b' : // amber
    '#ef4444' // red
  );

  const data = [
    { name: 'completed', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={gaugeColor} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center -mt-12">
          <div className="text-4xl font-bold" style={{ color: gaugeColor }}>
            {percentage.toFixed(0)}%
          </div>
          {label && (
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

**Use Case**: Single metric progress (hunt completion rate, storage usage)

---

### Step 4: Create Enhanced Analytics Page with Charts

Create: `src/pages/AnalyticsDashboard.tsx` (New page for advanced analytics)

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart } from '@/components/admin/Analytics/Charts/LineChart';
import { BarChart } from '@/components/admin/Analytics/Charts/BarChart';
import { PieChart } from '@/components/admin/Analytics/Charts/PieChart';
import { AreaChart } from '@/components/admin/Analytics/Charts/AreaChart';
import { ComparisonChart } from '@/components/admin/Analytics/Charts/ComparisonChart';
import { GaugeChart } from '@/components/admin/Analytics/Charts/GaugeChart';

export const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch time series data for LineChart
  const { data: timeSeriesData } = useQuery({
    queryKey: ['analytics-time-series', dateRange],
    queryFn: async () => {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_daily_aggregates')
        .select('date, total_page_views, unique_visitors, active_sessions')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return data?.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pageViews: d.total_page_views,
        visitors: d.unique_visitors,
        sessions: d.active_sessions
      })) || [];
    }
  });

  // Fetch device breakdown for PieChart
  const { data: deviceData } = useQuery({
    queryKey: ['analytics-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('device_type');

      if (error) throw error;

      const counts = data?.reduce((acc: Record<string, number>, session) => {
        const device = session.device_type || 'Unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts || {}).map(([name, value]) => ({
        name,
        value
      }));
    }
  });

  // Fetch browser breakdown for BarChart
  const { data: browserData } = useQuery({
    queryKey: ['analytics-browsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('browser');

      if (error) throw error;

      const counts = data?.reduce((acc: Record<string, number>, session) => {
        const browser = session.browser || 'Unknown';
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    }
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Traffic Over Time */}
        <div className="lg:col-span-2">
          <LineChart
            title="Traffic Trends"
            data={timeSeriesData || []}
            lines={[
              { dataKey: 'pageViews', color: '#3b82f6', name: 'Page Views' },
              { dataKey: 'visitors', color: '#10b981', name: 'Unique Visitors' },
              { dataKey: 'sessions', color: '#f59e0b', name: 'Active Sessions' }
            ]}
            height={350}
          />
        </div>

        {/* Pie Chart - Device Breakdown */}
        <PieChart
          title="Device Distribution"
          data={deviceData || []}
          height={300}
        />

        {/* Bar Chart - Browser Usage */}
        <BarChart
          title="Top Browsers"
          data={browserData || []}
          bars={[
            { dataKey: 'value', color: '#3b82f6', name: 'Sessions' }
          ]}
          xAxisKey="name"
          height={300}
        />
      </div>
    </div>
  );
};
```

---

### Step 5: Add Charts to Existing Widgets

Update widgets to use new chart components where appropriate:

**Example: Enhance RsvpTrendsWidget**

Replace the mini bar chart with:
```typescript
import { LineChart } from '@/components/admin/Analytics/Charts/LineChart';

// Inside the widget component:
<LineChart
  title="RSVP Trend (7 Days)"
  data={data?.rsvpsByDay || []}
  lines={[
    { dataKey: 'count', color: '#3b82f6', name: 'RSVPs' }
  ]}
  height={200}
  showGrid={false}
  showLegend={false}
/>
```

---

## PHASE 6: WIDGET CUSTOMIZATION & EXPORT (2-3 hours)

### Step 1: Install Export Dependencies

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

---

### Step 2: Create Dashboard Settings Component

Create: `src/components/admin/DashboardSettings.tsx`

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings } from 'lucide-react';

export interface WidgetVisibility {
  userEngagement: boolean;
  contentMetrics: boolean;
  rsvpTrends: boolean;
  photoPopularity: boolean;
  guestbookActivity: boolean;
  systemHealth: boolean;
  realtimeActivity: boolean;
}

interface DashboardSettingsProps {
  visibility: WidgetVisibility;
  onVisibilityChange: (visibility: WidgetVisibility) => void;
}

export const DashboardSettings = ({ visibility, onVisibilityChange }: DashboardSettingsProps) => {
  const [localVisibility, setLocalVisibility] = useState(visibility);

  const widgets = [
    { key: 'userEngagement', label: 'User Engagement Widget' },
    { key: 'contentMetrics', label: 'Content Metrics Widget' },
    { key: 'rsvpTrends', label: 'RSVP Trends Widget' },
    { key: 'photoPopularity', label: 'Photo Popularity Widget' },
    { key: 'guestbookActivity', label: 'Guestbook Activity Widget' },
    { key: 'systemHealth', label: 'System Health Widget' },
    { key: 'realtimeActivity', label: 'Realtime Activity Feed' },
  ];

  const handleSave = () => {
    onVisibilityChange(localVisibility);
    // Save to localStorage
    localStorage.setItem('dashboard-widget-visibility', JSON.stringify(localVisibility));
  };

  const toggleWidget = (key: keyof WidgetVisibility) => {
    setLocalVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Dashboard Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Widget Visibility</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {widgets.map(widget => (
            <div key={widget.key} className="flex items-center space-x-2">
              <Checkbox
                id={widget.key}
                checked={localVisibility[widget.key as keyof WidgetVisibility]}
                onCheckedChange={() => toggleWidget(widget.key as keyof WidgetVisibility)}
              />
              <Label htmlFor={widget.key} className="cursor-pointer">
                {widget.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setLocalVisibility(visibility)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

### Step 3: Create Export Utility

Create: `src/lib/analytics-export.ts`

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  title: string;
  dateRange: string;
  metrics: {
    label: string;
    value: string | number;
  }[];
  tables?: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }[];
}

export const exportToCSV = (data: ExportData) => {
  let csvContent = `${data.title}\nDate Range: ${data.dateRange}\n\n`;
  
  // Add metrics
  csvContent += "Metric,Value\n";
  data.metrics.forEach(metric => {
    csvContent += `"${metric.label}","${metric.value}"\n`;
  });

  // Add tables
  if (data.tables) {
    data.tables.forEach(table => {
      csvContent += `\n\n${table.title}\n`;
      csvContent += table.headers.join(',') + '\n';
      table.rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
    });
  }

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `analytics-export-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.text(data.title, 14, yPosition);
  yPosition += 10;

  // Date range
  doc.setFontSize(10);
  doc.text(`Date Range: ${data.dateRange}`, 14, yPosition);
  yPosition += 15;

  // Metrics summary
  doc.setFontSize(14);
  doc.text('Key Metrics', 14, yPosition);
  yPosition += 10;

  const metricsData = data.metrics.map(m => [m.label, String(m.value)]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Tables
  if (data.tables) {
    data.tables.forEach(table => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(table.title, 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [table.headers],
        body: table.rows,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`analytics-report-${Date.now()}.pdf`);
};
```

---

### Step 4: Add Export Buttons to AnalyticsWidgets

Update: `src/components/analytics/AnalyticsWidgets.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { DashboardSettings, WidgetVisibility } from '@/components/admin/DashboardSettings';
import { exportToCSV, exportToPDF } from '@/lib/analytics-export';

export const AnalyticsWidgets = () => {
  // Load visibility preferences from localStorage
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(() => {
    const saved = localStorage.getItem('dashboard-widget-visibility');
    return saved ? JSON.parse(saved) : {
      userEngagement: true,
      contentMetrics: true,
      rsvpTrends: true,
      photoPopularity: true,
      guestbookActivity: true,
      systemHealth: true,
      realtimeActivity: true,
    };
  });

  const handleExportCSV = async () => {
    // Gather all metrics data
    const exportData = {
      title: 'Analytics Dashboard Export',
      dateRange: `${new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      metrics: [
        { label: 'Total Sessions', value: sessionCount },
        { label: 'Total Page Views', value: pageViewCount },
        { label: 'Total Actions', value: actionCount },
        // Add more metrics as needed
      ],
      tables: [
        {
          title: 'Top Pages',
          headers: ['Page', 'Views'],
          rows: [
            // Fetch and format data
          ]
        }
      ]
    };

    exportToCSV(exportData);
  };

  const handleExportPDF = async () => {
    // Similar to CSV but for PDF
    const exportData = {
      title: 'Analytics Dashboard Report',
      dateRange: `${new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      metrics: [
        { label: 'Total Sessions', value: sessionCount },
        { label: 'Total Page Views', value: pageViewCount },
        { label: 'Total Actions', value: actionCount },
      ]
    };

    exportToPDF(exportData);
  };

  return (
    <div className="space-y-6">
      {/* Header with export buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <DashboardSettings
            visibility={widgetVisibility}
            onVisibilityChange={setWidgetVisibility}
          />
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Conditional widget rendering based on visibility */}
      {widgetVisibility.userEngagement && <UserEngagementWidget />}
      {widgetVisibility.contentMetrics && <ContentMetricsWidget />}
      {/* ... rest of widgets */}
    </div>
  );
};
```

---

## 🧪 TESTING CHECKLIST

### Phase 5: Charts
- [ ] Recharts installed successfully
- [ ] All 6 chart components render without errors
- [ ] LineChart displays time series data correctly
- [ ] BarChart shows categorical comparisons
- [ ] PieChart renders distribution data
- [ ] AreaChart displays cumulative trends
- [ ] ComparisonChart shows period-over-period data
- [ ] GaugeChart displays percentage progress
- [ ] Charts are responsive on mobile/desktop
- [ ] Tooltips work on hover
- [ ] Colors match design system

### Phase 6: Export & Customization
- [ ] jsPDF and jspdf-autotable installed
- [ ] DashboardSettings dialog opens
- [ ] Widget visibility toggles work
- [ ] Settings persist in localStorage
- [ ] CSV export downloads file
- [ ] CSV contains all metrics
- [ ] PDF export generates document
- [ ] PDF formatting looks professional
- [ ] Export buttons accessible
- [ ] No TypeScript errors

---

## 📊 SUCCESS CRITERIA

### Phase 5 Complete When:
- ✅ 6 chart components created and working
- ✅ Charts integrated into existing widgets or new analytics page
- ✅ All charts responsive and interactive
- ✅ Data displayed accurately
- ✅ Professional appearance matching design system

### Phase 6 Complete When:
- ✅ Widget visibility customization working
- ✅ Settings persist across sessions
- ✅ CSV export functional with all data
- ✅ PDF export generates professional reports
- ✅ Export buttons integrated in dashboard
- ✅ No UI/UX regressions

---

## 🎯 DELIVERABLES

Provide report including:

1. **Chart Implementation Status**
   - All 6 chart components created
   - Integration locations (widgets/pages)
   - Sample screenshots (optional)

2. **Export Functionality Status**
   - CSV export working (test file generated)
   - PDF export working (test file generated)
   - Sample export files attached (optional)

3. **Customization Status**
   - Widget visibility toggles working
   - Settings persistence verified
   - LocalStorage implementation confirmed

4. **Testing Results**
   - All checklist items verified
   - Any issues encountered and resolved
   - Performance impact assessment

5. **Final Integration**
   - All components integrated in AdminDashboard
   - No TypeScript/linting errors
   - Production-ready confirmation

---

## ⏱️ ESTIMATED TIMELINE

**Phase 5: Charts** - 4-5 hours
- Chart components (6): 3-4 hours
- Integration: 1 hour

**Phase 6: Export** - 2-3 hours
- Settings component: 1 hour
- Export utilities: 1-1.5 hours
- Integration & testing: 0.5-1 hour

**Total: 6-8 hours**

---

## 🎉 FINAL RESULT

After Phases 5 & 6, you'll have:

✅ **Professional Chart Library**
- 6 reusable chart components
- Recharts-powered visualizations
- Interactive and responsive

✅ **Full Export Capabilities**
- CSV export (all metrics)
- PDF export (formatted reports)
- Professional documentation

✅ **Customizable Dashboard**
- Show/hide widgets
- Per-admin preferences
- Settings persistence

✅ **Enterprise-Grade Analytics**
- 35+ metrics
- Beautiful visualizations
- Export for stakeholders
- Customizable views
- Zero maintenance

**This completes the ULTIMATE analytics dashboard! 🚀**

---

**Ready to build the final pieces? Let's do this!** 💪

