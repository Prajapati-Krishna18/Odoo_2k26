import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Download, FileText, ListChecks, Clock3 } from 'lucide-react'

const utilizationData = [
  { name: 'Most used', value: 72 },
  { name: 'Idle', value: 28 },
]

const maintenanceData = [
  { category: 'Hardware', frequency: 42 },
  { category: 'Electrical', frequency: 31 },
  { category: 'Accessories', frequency: 19 },
  { category: 'Tools', frequency: 27 },
]

const dueSoon = [
  { id: 'A-3051', name: 'Generator', due: '3 days', note: 'Maintenance due' },
  { id: 'A-4120', name: 'Field Drone', due: '5 days', note: 'Battery replacement' },
  { id: 'A-2209', name: 'Projector Kit', due: '8 days', note: 'Retirement review' },
]

const allocationSummary = [
  { department: 'Engineering', allocated: 78, available: 22 },
  { department: 'Operations', allocated: 54, available: 46 },
  { department: 'Research', allocated: 33, available: 67 },
  { department: 'Support', allocated: 21, available: 79 },
]

const heatmapHours = ['8am', '10am', '12pm', '2pm', '4pm', '6pm']
const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const heatmapData = [
  [1, 2, 4, 3, 1, 0],
  [2, 4, 3, 5, 4, 2],
  [3, 5, 6, 7, 5, 3],
  [2, 3, 5, 4, 3, 2],
  [1, 2, 4, 3, 1, 0],
]

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-bg-void text-text-primary px-6 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Reports & analytics</p>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-text-primary sm:text-4xl">
            Operational insights for asset utilization and maintenance.
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {['PDF', 'Excel', 'CSV'].map((format) => (
            <button
              key={format}
              type="button"
              className="inline-flex items-center gap-2 rounded-[0.75rem] border border-border-soft bg-bg-surface px-4 py-3 text-sm text-text-primary transition hover:border-accent-cyan"
            >
              <Download size={14} />
              Export {format}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 pt-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="rounded-[0.85rem] border border-border-soft bg-bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Asset utilization</p>
                <h2 className="mt-2 text-lg font-semibold text-text-primary">Most-used vs idle</h2>
              </div>
              <FileText size={18} className="text-accent-cyan" />
            </div>
            <div className="mt-5 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={utilizationData} margin={{ top: 10, right: 0, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="utilGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0CCAC8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0CCAC8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#131F19',
                      border: '1px solid rgba(12,202,200,0.2)',
                      color: '#EDF3EA',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0CCAC8" strokeWidth={2} fill="url(#utilGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[0.85rem] border border-border-soft bg-bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Maintenance frequency</p>
                <h2 className="mt-2 text-lg font-semibold text-text-primary">By asset category</h2>
              </div>
              <ListChecks size={18} className="text-accent-cyan" />
            </div>
            <div className="mt-5 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="category" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#131F19',
                      border: '1px solid rgba(12,202,200,0.2)',
                      color: '#EDF3EA',
                    }}
                  />
                  <Bar dataKey="frequency" fill="#0CCAC8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[0.85rem] border border-border-soft bg-bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Due soon</p>
                <h2 className="mt-2 text-lg font-semibold text-text-primary">Maintenance & retirement</h2>
              </div>
              <Clock3 size={18} className="text-accent-cyan" />
            </div>
            <div className="mt-5 space-y-4">
              {dueSoon.map((item) => (
                <div key={item.id} className="rounded-[0.75rem] border border-border-soft bg-bg-void/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.note}</p>
                    </div>
                    <span className="rounded-full bg-border-soft/70 px-3 py-1 text-xs text-text-muted">{item.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[0.85rem] border border-border-soft bg-bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Department allocations</p>
            <div className="mt-4 space-y-4">
              {allocationSummary.map((item) => (
                <div key={item.department} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-text-primary">
                    <span>{item.department}</span>
                    <span>{item.allocated}% allocated</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border-soft">
                    <div className="h-full rounded-full bg-accent-cyan" style={{ width: `${item.allocated}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.75fr_1fr]">
        <div className="rounded-[0.85rem] border border-border-soft bg-bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Booking heatmap</p>
              <h2 className="mt-2 text-lg font-semibold text-text-primary">Resource booking density</h2>
            </div>
            <FileText size={18} className="text-accent-cyan" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <div className="inline-grid min-w-[420px] gap-2">
              <div className="grid grid-cols-[2fr_repeat(6,_1fr)] items-center gap-2 text-xs uppercase tracking-[0.25em] text-text-muted">
                <span />
                {heatmapHours.map((hour) => (
                  <span key={hour} className="text-center">{hour}</span>
                ))}
              </div>
              {heatmapDays.map((day, index) => (
                <div key={day} className="grid grid-cols-[2fr_repeat(6,_1fr)] items-center gap-2 text-sm text-text-primary">
                  <span>{day}</span>
                  {heatmapData[index].map((value, cellIndex) => (
                    <div
                      key={cellIndex}
                      className="h-10 w-full rounded-[0.55rem]"
                      style={{
                        background: `rgba(12,202,200,${0.08 + value * 0.12})`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[0.85rem] border border-border-soft bg-bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-text-muted">Summary</p>
          <h2 className="mt-2 text-lg font-semibold text-text-primary">Export-ready insights</h2>
          <div className="mt-5 grid gap-3 text-sm text-text-muted">
            <div className="rounded-[0.75rem] border border-border-soft bg-bg-void/15 p-4">
              <p className="font-semibold text-text-primary">76% utilization</p>
              <p className="mt-1">Most assets are in active use and ready for assignment.</p>
            </div>
            <div className="rounded-[0.75rem] border border-border-soft bg-bg-void/15 p-4">
              <p className="font-semibold text-text-primary">4 assets due soon</p>
              <p className="mt-1">Maintenance and retirement reviews should be scheduled within the week.</p>
            </div>
            <div className="rounded-[0.75rem] border border-border-soft bg-bg-void/15 p-4">
              <p className="font-semibold text-text-primary">Engineering has highest allocation</p>
              <p className="mt-1">Allocation is concentrated in Engineering, while Support has room to absorb overflow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
