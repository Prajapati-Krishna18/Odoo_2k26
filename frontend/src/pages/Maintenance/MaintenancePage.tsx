import { useState } from 'react'
import {
  Wrench,
  Camera,
  Plus,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Filter,
} from 'lucide-react'
import { StateRail, type LifecycleState } from '@/components/StateRail'
import { useAuth } from '@/context/AuthContext'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Priority = 'Low' | 'Medium' | 'High' | 'Urgent'
type WorkflowStatus = 'Pending' | 'Approved' | 'Rejected' | 'Technician Assigned' | 'In Progress' | 'Resolved'

interface MaintenanceRequest {
  id: string
  assetTag: string
  assetName: string
  assetState: LifecycleState
  issue: string
  priority: Priority
  requester: string
  dept: string
  raised: string
  status: WorkflowStatus
  technicianNote?: string
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const ASSETS_STUB = [
  { tag: 'AF-0114', name: 'MacBook Pro 16" M3', state: 'Allocated' as LifecycleState },
  { tag: 'AF-5501', name: 'FortiGate 100F Firewall', state: 'Under Maintenance' as LifecycleState },
  { tag: 'AF-0824', name: 'Dell UltraSharp 32" 4K', state: 'Available' as LifecycleState },
  { tag: 'AF-3302', name: 'ThinkPad X1 Carbon Gen11', state: 'Available' as LifecycleState },
  { tag: 'AF-9921', name: 'iPhone 15 Pro Max', state: 'Allocated' as LifecycleState },
]

const INITIAL_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'mr1', assetTag: 'AF-5501', assetName: 'FortiGate 100F Firewall',
    assetState: 'Under Maintenance', issue: 'Intermittent packet drops on WAN interface under load.',
    priority: 'High', requester: 'Rajiv Kumar', dept: 'IT Support',
    raised: '2026-07-08', status: 'In Progress', technicianNote: 'Technician Assigned: Anil Mehta',
  },
  {
    id: 'mr2', assetTag: 'AF-0114', assetName: 'MacBook Pro 16" M3',
    assetState: 'Allocated', issue: 'Battery draining unusually fast — 40% lost in 2 hours.',
    priority: 'Medium', requester: 'Sarah Chen', dept: 'Engineering',
    raised: '2026-07-10', status: 'Approved',
  },
  {
    id: 'mr3', assetTag: 'AF-0824', assetName: 'Dell UltraSharp 32"',
    assetState: 'Available', issue: 'Dead pixels in bottom-left quadrant, roughly 3×3 cluster.',
    priority: 'Low', requester: 'Neha Gupta', dept: 'Marketing',
    raised: '2026-07-11', status: 'Pending',
  },
  {
    id: 'mr4', assetTag: 'AF-9921', assetName: 'iPhone 15 Pro Max',
    assetState: 'Allocated', issue: 'SIM not recognized after iOS 18.4 update.',
    priority: 'Urgent', requester: 'Rohan Roy', dept: 'Marketing',
    raised: '2026-07-12', status: 'Pending',
  },
  {
    id: 'mr5', assetTag: 'AF-3302', assetName: 'ThinkPad X1 Carbon',
    assetState: 'Available', issue: 'Fan noise — high pitch squeal at boot for ~30 seconds.',
    priority: 'Medium', requester: 'Aarav Mehta', dept: 'Engineering',
    raised: '2026-07-06', status: 'Resolved',
  },
]

const PRIORITY_DOT: Record<Priority, string> = {
  Low: 'var(--status-available)',
  Medium: 'var(--status-reserved)',
  High: 'var(--status-lost)',
  Urgent: 'var(--status-maintenance)',
}

const STATUS_COLOR: Record<WorkflowStatus, string> = {
  'Pending': 'var(--status-reserved)',
  'Approved': 'var(--status-available)',
  'Rejected': 'var(--status-lost)',
  'Technician Assigned': 'var(--accent-cyan)',
  'In Progress': 'var(--status-maintenance)',
  'Resolved': 'var(--status-retired)',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function daysOpen(raised: string) {
  const ms = new Date().getTime() - new Date(raised).getTime()
  return Math.max(0, Math.floor(ms / 86400000))
}

function StatusPill({ status }: { status: WorkflowStatus }) {
  const c = STATUS_COLOR[status]
  return (
    <span style={{ padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', background: `${c}18`, color: c, border: `1.5px solid ${c}30` }}>
      {status}
    </span>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px 16px', color: 'var(--text-muted)' }}>
      {icon}
      <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>{message}</p>
    </div>
  )
}

// ─── Workflow Tabs ──────────────────────────────────────────────────────────────

const TAB_GROUPS: { label: string; statuses: WorkflowStatus[] }[] = [
  { label: 'Pending', statuses: ['Pending'] },
  { label: 'Approved / Rejected', statuses: ['Approved', 'Rejected'] },
  { label: 'Assigned', statuses: ['Technician Assigned'] },
  { label: 'In Progress', statuses: ['In Progress'] },
  { label: 'Resolved', statuses: ['Resolved'] },
]

// ─── Maintenance Card ──────────────────────────────────────────────────────────

function RequestCard({
  req,
  canApprove,
  onApprove,
  onReject,
  onResolve,
}: {
  req: MaintenanceRequest
  canApprove: boolean
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onResolve: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const days = daysOpen(req.raised)

  return (
    <div className="panel" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{req.assetTag}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: PRIORITY_DOT[req.priority] }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_DOT[req.priority], display: 'inline-block' }} />
              {req.priority}
            </span>
            <StatusPill status={req.status} />
          </div>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{req.assetName}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{req.issue}</p>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            Raised by <strong style={{ color: 'var(--text-primary)' }}>{req.requester}</strong> · {req.dept} · {days} day{days !== 1 ? 's' : ''} open
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ maxWidth: 200 }}>
            <StateRail currentState={req.assetState} size="compact" showLabels={false} />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {canApprove && req.status === 'Pending' && (
              <>
                <button onClick={() => onApprove(req.id)}
                  style={{ background: 'none', border: '1px solid var(--border-soft)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--status-available)' }}>
                  <CheckCircle size={12} /> Approve
                </button>
                <button onClick={() => onReject(req.id)}
                  style={{ background: 'none', border: '1px solid var(--border-soft)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--status-lost)' }}>
                  <XCircle size={12} /> Reject
                </button>
              </>
            )}
            {req.status === 'In Progress' && (
              <button onClick={() => onResolve(req.id)}
                style={{ background: 'none', border: '1px solid var(--accent-cyan)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>
                Mark Resolved
              </button>
            )}
            <button onClick={() => setExpanded(e => !e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--border-soft)', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-void)' }}>
          <p><strong style={{ color: 'var(--text-primary)' }}>Full issue:</strong> {req.issue}</p>
          {req.technicianNote && <p style={{ marginTop: 4 }}><strong style={{ color: 'var(--accent-cyan)' }}>Note:</strong> {req.technicianNote}</p>}
          <p style={{ marginTop: 4, fontSize: '0.65rem' }}>
            Raised: {req.raised} · Asset flips to "Under Maintenance" on approval, back to "Available" on resolution.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── History Table ─────────────────────────────────────────────────────────────

const HISTORY = [
  { date: '2026-07-06', tag: 'AF-3302', name: 'ThinkPad X1 Carbon', category: 'Laptops', issue: 'Fan noise at boot', tech: 'Anil Mehta', resolution: 'Fan bearing replaced' },
  { date: '2026-06-28', tag: 'AF-0824', name: 'Dell UltraSharp 27"', category: 'Monitors', issue: 'Backlight bleed', tech: 'Ramesh S.', resolution: 'Panel replaced under warranty' },
  { date: '2026-06-15', tag: 'AF-4410', name: 'Logitech Rally Kit', category: 'AV Equipment', issue: 'Mic array not detected', tech: 'Priti V.', resolution: 'Firmware updated' },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const { user } = useAuth()
  const canApprove = user.role === 'Admin' || user.role === 'Asset Manager'

  const [requests, setRequests] = useState<MaintenanceRequest[]>(INITIAL_REQUESTS)
  const [activeTab, setActiveTab] = useState(0)
  const [filterCat, setFilterCat] = useState('')

  // Raise request form state
  const [showForm, setShowForm] = useState(false)
  const [fAsset, setFAsset] = useState(ASSETS_STUB[0].tag)
  const [fIssue, setFIssue] = useState('')
  const [fPriority, setFPriority] = useState<Priority>('Medium')

  const tabRequests = requests.filter(r => TAB_GROUPS[activeTab].statuses.includes(r.status))

  const handleApprove = (id: string) => {
    setRequests(reqs => reqs.map(r =>
      r.id === id ? { ...r, status: 'Approved' as WorkflowStatus, assetState: 'Under Maintenance' } : r
    ))
  }
  const handleReject = (id: string) => {
    setRequests(reqs => reqs.map(r =>
      r.id === id ? { ...r, status: 'Rejected' as WorkflowStatus } : r
    ))
  }
  const handleResolve = (id: string) => {
    setRequests(reqs => reqs.map(r =>
      r.id === id ? { ...r, status: 'Resolved' as WorkflowStatus, assetState: 'Available' } : r
    ))
  }

  const handleRaise = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fIssue.trim()) return
    const asset = ASSETS_STUB.find(a => a.tag === fAsset)!
    const newReq: MaintenanceRequest = {
      id: `mr${requests.length + 1}`, assetTag: fAsset, assetName: asset.name,
      assetState: asset.state, issue: fIssue, priority: fPriority,
      requester: user.name, dept: 'Engineering',
      raised: new Date().toISOString().substring(0, 10), status: 'Pending',
    }
    setRequests([newReq, ...requests])
    setFIssue(''); setShowForm(false)
  }

  const filteredHistory = filterCat ? HISTORY.filter(h => h.category === filterCat) : HISTORY
  const histCategories = [...new Set(HISTORY.map(h => h.category))]

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Maintenance</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Track repair requests, approvals, technician assignments, and resolution history.</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Raise Request
        </button>
      </div>

      {/* ── Raise Request Form ────────────────────────────────── */}
      {showForm && (
        <div className="panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={15} style={{ color: 'var(--accent-cyan)' }} /> New Maintenance Request
          </h3>
          <form onSubmit={handleRaise} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Select Asset</label>
                <select value={fAsset} onChange={e => setFAsset(e.target.value)} className="af-select">
                  {ASSETS_STUB.map(a => <option key={a.tag} value={a.tag}>{a.tag} — {a.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Priority</label>
                <select value={fPriority} onChange={e => setFPriority(e.target.value as Priority)} className="af-select">
                  {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inline StateRail preview */}
            {fAsset && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)' }}>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{fAsset}</span>
                <div style={{ flex: 1, maxWidth: 280 }}>
                  <StateRail currentState={ASSETS_STUB.find(a => a.tag === fAsset)?.state ?? 'Available'} size="compact" showLabels={false} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Issue Description <Camera size={12} style={{ color: 'var(--text-muted)' }} />
              </label>
              <textarea value={fIssue} onChange={e => setFIssue(e.target.value)} required rows={3} placeholder="Describe the problem in detail..."
                style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel</button>
              <button type="submit" style={{ padding: '7px 18px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Submit Request</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Workflow Tabs ─────────────────────────────────────── */}
      <div>
        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-soft)', overflowX: 'auto' }}>
          {TAB_GROUPS.map((tab, i) => {
            const count = requests.filter(r => tab.statuses.includes(r.status)).length
            const isActive = activeTab === i
            return (
              <button key={tab.label} onClick={() => setActiveTab(i)}
                style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                {tab.label}
                {count > 0 && (
                  <span style={{ marginLeft: 6, padding: '1px 5px', background: isActive ? 'rgba(12,202,200,0.18)' : 'var(--bg-surface-raised)', borderRadius: 2, fontSize: '0.6rem' }}>{count}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16 }}>
          {tabRequests.length === 0
            ? <EmptyState icon={<ClipboardList size={28} style={{ opacity: 0.3 }} />} message={`No requests in "${TAB_GROUPS[activeTab].label}" stage.`} />
            : tabRequests.map(req => (
              <RequestCard key={req.id} req={req} canApprove={canApprove}
                onApprove={handleApprove} onReject={handleReject} onResolve={handleResolve} />
            ))
          }
        </div>
      </div>

      {/* ── Maintenance History Table ─────────────────────────── */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Maintenance History</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={13} style={{ color: 'var(--text-muted)' }} />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="af-select" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
              <option value="">All Categories</option>
              {histCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {filteredHistory.length === 0
          ? <EmptyState icon={<ClipboardList size={24} style={{ opacity: 0.3 }} />} message="No history matching your filter." />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 16px' }}>Date</th>
                    <th style={{ padding: '10px 16px' }}>Asset Tag</th>
                    <th style={{ padding: '10px 16px' }}>Name</th>
                    <th style={{ padding: '10px 16px' }}>Category</th>
                    <th style={{ padding: '10px 16px' }}>Issue</th>
                    <th style={{ padding: '10px 16px' }}>Resolution</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.78rem' }}>
                  {filteredHistory.map(h => (
                    <tr key={`${h.tag}-${h.date}`} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-data)', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{h.date}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{h.tag}</td>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{h.category}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)', maxWidth: 200 }}>{h.issue}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--status-available)', fontSize: '0.72rem' }}>{h.resolution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  )
}
