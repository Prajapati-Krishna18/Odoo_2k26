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
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.35em', color: 'var(--text-muted)' }}>Reports & analytics</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Operational Insights
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Asset utilization and maintenance overview.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {['PDF', 'Excel', 'CSV'].map((format) => (
            <button
              key={format}
              type="button"
              className="panel"
              style={{ padding: '6px 14px', fontSize: '0.75rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              <Download size={14} /> Export {format}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, alignItems: 'start' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <div>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.35em', color: 'var(--text-muted)' }}>Asset utilization</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginTop: 4 }}>Most-used vs idle</h3>
              </div>
              <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div style={{ marginTop: 20, height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={utilizationData} margin={{ top: 10, right: 0, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="utilGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0CCAC8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0CCAC8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} style={{ fontSize: '0.75rem' }} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} style={{ fontSize: '0.75rem' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#131F19',
                      border: '1px solid rgba(12,202,200,0.2)',
                      color: '#EDF3EA',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0CCAC8" strokeWidth={2} fill="url(#utilGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <div>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.35em', color: 'var(--text-muted)' }}>Maintenance frequency</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginTop: 4 }}>By asset category</h3>
              </div>
              <ListChecks size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div style={{ marginTop: 20, height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="category" stroke="var(--text-muted)" tickLine={false} axisLine={false} style={{ fontSize: '0.75rem' }} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} style={{ fontSize: '0.75rem' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#131F19',
                      border: '1px solid rgba(12,202,200,0.2)',
                      color: '#EDF3EA',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Bar dataKey="frequency" fill="#0CCAC8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <div>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.35em', color: 'var(--text-muted)' }}>Due soon</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginTop: 4 }}>Maintenance & retirement</h3>
              </div>
              <Clock3 size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dueSoon.map((item) => (
                <div key={item.id} style={{ padding: '12px 14px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', borderRadius: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</p>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.note}</p>
                    </div>
                    <span style={{ padding: '2px 8px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-soft)', fontSize: '0.68rem', color: 'var(--text-muted)', borderRadius: 2 }}>{item.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 20 }}>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.35em', color: 'var(--text-muted)' }}>Department allocations</p>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {allocationSummary.map((item) => (
                <div key={item.department} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                    <span>{item.department}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{item.allocated}% allocated</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-soft)', position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
                    <div style={{ height: '100%', background: 'var(--accent-cyan)', width: `${item.allocated}%`, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, alignItems: 'start' }}>
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <div>
              <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.35em', color: 'var(--text-muted)' }}>Booking heatmap</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginTop: 4 }}>Resource booking density</h3>
            </div>
            <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ marginTop: 20, overflowX: 'auto' }}>
            <div style={{ display: 'inline-grid', minWidth: 420, gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(6, 1fr)', alignItems: 'center', gap: 8, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--text-muted)' }}>
                <span />
                {heatmapHours.map((hour) => (
                  <span key={hour} style={{ textAlign: 'center' }}>{hour}</span>
                ))}
              </div>
              {heatmapDays.map((day, index) => (
                <div key={day} style={{ display: 'grid', gridTemplateColumns: '2fr repeat(6, 1fr)', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                  <span>{day}</span>
                  {heatmapData[index].map((value, cellIndex) => (
                    <div
                      key={cellIndex}
                      style={{
                        height: 40,
                        width: '100%',
                        borderRadius: 2,
                        background: `rgba(12,202,200,${0.08 + value * 0.12})`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.35em', color: 'var(--text-muted)' }}>Summary</p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginTop: 4 }}>Export-ready insights</h3>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div style={{ padding: '16px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', borderRadius: 2 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>76% utilization</p>
              <p style={{ marginTop: 4 }}>Most assets are in active use and ready for assignment.</p>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', borderRadius: 2 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>4 assets due soon</p>
              <p style={{ marginTop: 4 }}>Maintenance and retirement reviews should be scheduled within the week.</p>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', borderRadius: 2 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Engineering has highest allocation</p>
              <p style={{ marginTop: 4 }}>Allocation is concentrated in Engineering, while Support has room to absorb overflow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
