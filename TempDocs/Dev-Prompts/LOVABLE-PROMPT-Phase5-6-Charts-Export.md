# 🚀 Analytics Phase 5 & 6: Professional Charts + Export - LOVABLE PROMPT

## 🎯 Mission
Complete the ULTIMATE analytics dashboard with professional Recharts visualizations AND export capabilities (CSV/PDF).

**Reference Documentation**: `TempDocs/Dev-Prompts/Analytics-Phase5-6-Charts-Export.md`

**Estimated Time**: 6-8 hours total

---

## 📦 PHASE 5: ADVANCED CHART COMPONENTS (4-5 hours)

### Step 1: Install Recharts

```bash
npm install recharts
```

### Step 2: Create Chart Components Directory

```bash
mkdir -p src/components/admin/Analytics/Charts
```

### Step 3: Build Chart Components (6 files)

Create these chart components with Recharts. All charts should:
- Use ResponsiveContainer for responsive design
- Have consistent styling (gray grid, 12px fonts, white tooltips)
- Accept title, data, height, and customization props
- Be wrapped in Card component with CardHeader/CardContent

#### 1. LineChart.tsx
**Location**: `src/components/admin/Analytics/Charts/LineChart.tsx`

**Features**:
- Multiple line support with custom colors
- XAxis, YAxis, CartesianGrid, Tooltip, Legend
- Configurable grid and legend visibility
- Props: title, data, lines (array), xAxisKey, height, showGrid, showLegend

**Use Case**: Time series data (traffic trends, RSVPs over time)

**Example Usage**:
```typescript
<LineChart
  title="Traffic Trends"
  data={[{ date: 'Jan 1', views: 100, visitors: 50 }]}
  lines={[
    { dataKey: 'views', color: '#3b82f6', name: 'Page Views' },
    { dataKey: 'visitors', color: '#10b981', name: 'Visitors' }
  ]}
  height={300}
/>
```

---

#### 2. BarChart.tsx
**Location**: `src/components/admin/Analytics/Charts/BarChart.tsx`

**Features**:
- Multiple bars with custom colors
- Horizontal/vertical orientation support
- Props: title, data, bars (array), xAxisKey, height, showGrid, showLegend, horizontal

**Use Case**: Categorical comparisons (top browsers, top pages)

**Example Usage**:
```typescript
<BarChart
  title="Top Browsers"
  data={[{ name: 'Chrome', count: 150 }]}
  bars={[{ dataKey: 'count', color: '#3b82f6', name: 'Sessions' }]}
  height={300}
/>
```

---

#### 3. PieChart.tsx
**Location**: `src/components/admin/Analytics/Charts/PieChart.tsx`

**Features**:
- Percentage labels on segments
- Custom color array support
- Legend with right alignment
- Optional innerRadius for donut charts
- Props: title, data, colors, height, showLegend, innerRadius

**Use Case**: Distribution data (device types, RSVP status breakdown)

**Example Usage**:
```typescript
<PieChart
  title="Device Distribution"
  data={[{ name: 'Desktop', value: 150 }, { name: 'Mobile', value: 100 }]}
  height={300}
/>
```

---

#### 4. AreaChart.tsx
**Location**: `src/components/admin/Analytics/Charts/AreaChart.tsx`

**Features**:
- Multiple areas with opacity
- Stacked/unstacked support
- Fill colors with 60% opacity
- Props: title, data, areas (array), xAxisKey, height, showGrid, showLegend, stacked

**Use Case**: Cumulative trends (total users over time, cumulative page views)

**Example Usage**:
```typescript
<AreaChart
  title="Cumulative Users"
  data={[{ date: 'Jan 1', total: 100 }]}
  areas={[{ dataKey: 'total', color: '#3b82f6', name: 'Total Users' }]}
  stacked={false}
/>
```

---

#### 5. ComparisonChart.tsx
**Location**: `src/components/admin/Analytics/Charts/ComparisonChart.tsx`

**Features**:
- Side-by-side bars for current vs previous period
- Previous period in gray, current in blue
- Props: title, description, data, currentLabel, previousLabel, height

**Data Format**: `{ name: string, current: number, previous: number }[]`

**Use Case**: Week vs week, month vs month comparisons

**Example Usage**:
```typescript
<ComparisonChart
  title="Week Comparison"
  data={[{ name: 'Mon', current: 50, previous: 40 }]}
  currentLabel="This Week"
  previousLabel="Last Week"
/>
```

---

#### 6. GaugeChart.tsx
**Location**: `src/components/admin/Analytics/Charts/GaugeChart.tsx`

**Features**:
- Semi-circle gauge (180° to 0°)
- Color-coded: green (80%+), amber (50-79%), red (<50%)
- Large percentage display in center
- Props: title, description, value, maxValue, height, color, label

**Use Case**: Single metric progress (hunt completion rate, storage usage %)

**Example Usage**:
```typescript
<GaugeChart
  title="Hunt Completion"
  value={75}
  maxValue={100}
  label="Completed"
/>
```

---

### Step 4: Enhance RsvpTrendsWidget

**File**: `src/components/admin/DashboardWidgets/RsvpTrendsWidget.tsx`

**Update**: Replace the mini bar chart (divs with heights) with the new LineChart component:

```typescript
import { LineChart } from '@/components/admin/Analytics/Charts/LineChart';

// Replace the mini chart section with:
<LineChart
  title=""
  data={data?.rsvpsByDay || []}
  lines={[
    { dataKey: 'count', color: '#3b82f6', name: 'RSVPs' }
  ]}
  height={150}
  showGrid={false}
  showLegend={false}
/>
```

---

### Step 5: Create Advanced Analytics Page (Optional but Recommended)

**File**: `src/pages/AnalyticsDashboard.tsx`

**Features**:
- Full-page analytics with larger charts
- 7d/30d/90d date range toggle
- Multiple chart types showcasing the new components:
  - LineChart: Traffic trends (page views, visitors, sessions over time)
  - PieChart: Device distribution
  - BarChart: Top 10 browsers

**Data Sources**:
- Query `analytics_daily_aggregates` for time series
- Query `user_sessions` for device/browser breakdowns
- Use React Query with appropriate date filters

---

## 📊 PHASE 6: EXPORT & CUSTOMIZATION (2-3 hours)

### Step 1: Install Export Libraries

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

### Step 2: Create Dashboard Settings Component

**File**: `src/components/admin/DashboardSettings.tsx`

**Features**:
- Dialog with Settings icon trigger button
- 7 checkboxes for widget visibility:
  - userEngagement
  - contentMetrics
  - rsvpTrends
  - photoPopularity
  - guestbookActivity
  - systemHealth
  - realtimeActivity
- Save/Cancel buttons
- Save to localStorage: `dashboard-widget-visibility`

**Interface**:
```typescript
export interface WidgetVisibility {
  userEngagement: boolean;
  contentMetrics: boolean;
  rsvpTrends: boolean;
  photoPopularity: boolean;
  guestbookActivity: boolean;
  systemHealth: boolean;
  realtimeActivity: boolean;
}
```

---

### Step 3: Create Export Utilities

**File**: `src/lib/analytics-export.ts`

**Exports**: Two functions with shared interface

**Interface**:
```typescript
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
```

**Function 1: exportToCSV(data: ExportData)**
- Generate CSV content from metrics and tables
- Create blob and download file
- Filename: `analytics-export-${Date.now()}.csv`

**Function 2: exportToPDF(data: ExportData)**
- Use jsPDF to create document
- Title at top (fontSize 18)
- Date range (fontSize 10)
- Metrics table using autoTable (blue header)
- Additional tables if provided
- Page numbers in footer
- Filename: `analytics-report-${Date.now()}.pdf`

---

### Step 4: Integrate into AnalyticsWidgets

**File**: `src/components/analytics/AnalyticsWidgets.tsx`

**Add at the top**:
```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { DashboardSettings, WidgetVisibility } from '@/components/admin/DashboardSettings';
import { exportToCSV, exportToPDF, ExportData } from '@/lib/analytics-export';
```

**Add state for widget visibility**:
```typescript
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
```

**Add header with buttons**:
```typescript
<div className="flex items-center justify-between mb-6">
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
```

**Add export handlers**:
```typescript
const handleExportCSV = () => {
  const exportData: ExportData = {
    title: 'Analytics Dashboard Export',
    dateRange: `Last 30 Days - ${new Date().toLocaleDateString()}`,
    metrics: [
      { label: 'Total Sessions', value: sessionCount },
      { label: 'Total Page Views', value: pageViewCount },
      { label: 'Total User Actions', value: actionCount },
      { label: 'Unique Visitors', value: uniqueVisitors },
    ],
  };
  exportToCSV(exportData);
};

const handleExportPDF = () => {
  const exportData: ExportData = {
    title: 'Analytics Dashboard Report',
    dateRange: `Last 30 Days - ${new Date().toLocaleDateString()}`,
    metrics: [
      { label: 'Total Sessions', value: sessionCount },
      { label: 'Total Page Views', value: pageViewCount },
      { label: 'Total User Actions', value: actionCount },
      { label: 'Unique Visitors', value: uniqueVisitors },
    ],
  };
  exportToPDF(exportData);
};
```

**Conditionally render widgets**:
```typescript
{widgetVisibility.userEngagement && <UserEngagementWidget />}
{widgetVisibility.contentMetrics && <ContentMetricsWidget />}
{widgetVisibility.rsvpTrends && <RsvpTrendsWidget />}
{widgetVisibility.photoPopularity && <PhotoPopularityWidget />}
{widgetVisibility.guestbookActivity && <GuestbookActivityWidget />}
{widgetVisibility.systemHealth && <SystemHealthWidget />}
{widgetVisibility.realtimeActivity && <RealtimeActivityFeed />}
```

---

## 🎨 STYLING GUIDELINES

**Recharts Consistent Styling**:
- Grid color: `#e5e7eb`
- Axis stroke: `#6b7280`
- Font size: `12px`
- Tooltip background: `#fff`
- Tooltip border: `1px solid #e5e7eb`
- Tooltip border-radius: `6px`

**Default Colors**:
- Blue: `#3b82f6`
- Green: `#10b981`
- Amber: `#f59e0b`
- Red: `#ef4444`
- Violet: `#8b5cf6`
- Pink: `#ec4899`
- Cyan: `#06b6d4`
- Lime: `#84cc16`

**Chart Defaults**:
- Default height: 300px
- Line stroke width: 2
- Dot radius: 3, active: 5
- Bar radius: [4, 4, 0, 0]
- Area fill opacity: 0.6

---

## 🧪 TESTING CHECKLIST

### Phase 5: Charts
- [ ] Recharts installed (`npm list recharts`)
- [ ] All 6 chart components created
- [ ] LineChart renders with multiple lines
- [ ] BarChart renders vertical and horizontal
- [ ] PieChart shows percentages correctly
- [ ] AreaChart displays cumulative data
- [ ] ComparisonChart shows side-by-side bars
- [ ] GaugeChart displays semi-circle with %
- [ ] RsvpTrendsWidget uses new LineChart
- [ ] All charts responsive on mobile/desktop
- [ ] Tooltips work on hover
- [ ] No TypeScript errors

### Phase 6: Export & Customization
- [ ] jsPDF and jspdf-autotable installed
- [ ] DashboardSettings component created
- [ ] Settings dialog opens/closes
- [ ] All 7 widget checkboxes present
- [ ] Widget visibility toggles work
- [ ] Settings save to localStorage
- [ ] Settings persist on page refresh
- [ ] Export utilities file created
- [ ] CSV export downloads file
- [ ] CSV contains metrics data
- [ ] PDF export generates document
- [ ] PDF has title, metrics table, page numbers
- [ ] Export buttons in AnalyticsWidgets header
- [ ] Widgets conditionally render based on settings
- [ ] No TypeScript errors

---

## 📋 DELIVERABLES CHECKLIST

When complete, confirm:

### Phase 5 Deliverables:
- [ ] 6 chart component files created in `src/components/admin/Analytics/Charts/`
- [ ] LineChart.tsx ✓
- [ ] BarChart.tsx ✓
- [ ] PieChart.tsx ✓
- [ ] AreaChart.tsx ✓
- [ ] ComparisonChart.tsx ✓
- [ ] GaugeChart.tsx ✓
- [ ] RsvpTrendsWidget.tsx updated with LineChart
- [ ] (Optional) AnalyticsDashboard.tsx page created
- [ ] All charts render real data
- [ ] Responsive design verified

### Phase 6 Deliverables:
- [ ] DashboardSettings.tsx component created
- [ ] analytics-export.ts utility file created
- [ ] AnalyticsWidgets.tsx updated with:
  - [ ] Export buttons (CSV & PDF)
  - [ ] Settings button
  - [ ] Widget visibility state management
  - [ ] Conditional widget rendering
  - [ ] Export handler functions
- [ ] Test CSV file generated successfully
- [ ] Test PDF file generated successfully
- [ ] Widget visibility persists in localStorage

---

## 📊 SUCCESS CRITERIA

**Phase 5 Complete When**:
✅ All 6 chart components working with real data
✅ Charts are interactive (tooltips, legends)
✅ Charts are responsive (mobile/desktop)
✅ RsvpTrendsWidget enhanced with LineChart
✅ Professional appearance matching design system
✅ No TypeScript/build errors

**Phase 6 Complete When**:
✅ Widget customization working (show/hide)
✅ Settings persist across browser sessions
✅ CSV export generates valid file with metrics
✅ PDF export generates formatted report
✅ All buttons accessible and functional
✅ No UI/UX regressions
✅ No TypeScript/build errors

---

## 🎯 FINAL RESULT

After completing Phases 5 & 6, the analytics system will have:

### Current Features (Already Complete):
✅ 6 analytics tables with 32 RLS policies
✅ Real-time data collection (sessions, page views, actions, interactions)
✅ Automated daily aggregation (cron job at 1 AM UTC)
✅ 7 specialized widgets displaying 35+ metrics
✅ Auto-refresh (5 min standard, 30 sec feed, 2 min health)
✅ Admin dashboard with responsive layout

### NEW Features (This Implementation):
🎨 **6 Professional Chart Components**
- LineChart, BarChart, PieChart, AreaChart, ComparisonChart, GaugeChart
- Recharts-powered interactive visualizations
- Consistent styling and responsive design

📊 **Enhanced Visualizations**
- RSVP trends with professional line chart
- Optional advanced analytics page with larger charts

💾 **Export Capabilities**
- CSV export (all metrics in spreadsheet format)
- PDF export (formatted professional reports)
- jsPDF with autoTable for clean tables

⚙️ **Dashboard Customization**
- Show/hide any of the 7 widgets
- Per-admin preferences via localStorage
- Settings persistence across sessions

---

## 🚀 ESTIMATED TIMELINE

- **Phase 5 (Charts)**: 4-5 hours
  - Create 6 chart components: 3-4 hours
  - Enhance RsvpTrendsWidget: 30 min
  - Optional analytics page: 30-60 min

- **Phase 6 (Export)**: 2-3 hours
  - DashboardSettings component: 1 hour
  - Export utilities: 1 hour
  - Integration & testing: 30-60 min

**Total: 6-8 hours**

---

## 💬 REPORTING FORMAT

After completion, please provide:

1. **Implementation Summary**
   - Which chart components were created
   - Where charts were integrated
   - Any deviations from spec

2. **Test Results**
   - Screenshots of charts (optional but helpful)
   - Confirmation of export functionality
   - Sample CSV/PDF files (optional)

3. **Integration Status**
   - All widgets conditionally rendering
   - Settings persisting correctly
   - Export buttons functional

4. **Issues & Resolutions**
   - Any challenges encountered
   - How they were resolved
   - Performance notes

5. **Final Verification**
   - No TypeScript errors
   - No console errors
   - Build successful
   - All tests passing

---

## 🎉 THIS COMPLETES THE ULTIMATE ANALYTICS DASHBOARD!

After this implementation:

✅ **Enterprise-Grade Analytics System**
- 6 tables, 32 policies, 40+ indexes
- Real-time data collection
- Automated processing

✅ **Comprehensive Dashboard**
- 35+ live metrics
- 7 specialized widgets
- Professional Recharts visualizations

✅ **Export & Customization**
- CSV/PDF reports
- Widget visibility settings
- Per-admin preferences

✅ **Zero Maintenance Required**
- Fully automated
- Self-sustaining
- Production-ready

**This is a world-class analytics solution! Let's build it! 🚀**

---

**Reference**: See `TempDocs/Dev-Prompts/Analytics-Phase5-6-Charts-Export.md` for detailed code examples and specifications.

**Ready to execute!** 💪

