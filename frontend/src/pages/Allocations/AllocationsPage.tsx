import { useState, useEffect } from 'react'
import {
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Star,
} from 'lucide-react'
import { StateRail, type LifecycleState } from '@/components/StateRail'
import { useAuth } from '@/context/AuthContext'
import { colors } from '@/lib/tokens'
import { resourcesApi, orgApi } from '@/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StateKey = 'available' | 'allocated' | 'reserved' | 'maintenance' | 'lost' | 'retired' | 'disposed'

function mapStateToLabel(st: StateKey): LifecycleState {
  const m: Record<StateKey, LifecycleState> = {
    available: 'Available', allocated: 'Allocated', reserved: 'Reserved',
    maintenance: 'Under Maintenance', lost: 'Lost', retired: 'Retired', disposed: 'Disposed',
  }
  return m[st] ?? 'Available'
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface AssetStub { tag: string; name: string; state: StateKey; holder?: string; holderDept?: string }
interface TransferReq { id: string; tag: string; from: string; to: string; date: string; status: 'Requested' | 'Approved' | 'Re-allocated' }
interface ActiveAlloc { id: string; tag: string; name: string; holder: string; dept: string; allocDate: string; expectedReturn: string; state: StateKey }

const INITIAL_TRANSFERS: TransferReq[] = [
  { id: 't1', tag: 'AF-0114', from: 'Sarah Chen', to: 'Aarav Mehta', date: '2026-07-10', status: 'Requested' },
]

const INITIAL_ALLOCATIONS: ActiveAlloc[] = [
  { id: 'ac1', tag: 'AF-0114', name: 'MacBook Pro 16"', holder: 'Sarah Chen', dept: 'Engineering', allocDate: '2024-01-20', expectedReturn: '2026-07-01', state: 'allocated' },
]

// ─── Status pill helper ───────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    'Requested': colors.status.reserved,
    'Approved': colors.status.available,
    'Re-allocated': 'var(--accent-cyan)',
    'Rejected': colors.status.lost,
  }
  const c = colorMap[status] ?? 'var(--text-muted)'
  return (
    <span style={{
      padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
      background: `${c}18`, color: c, border: `1.5px solid ${c}30`,
    }}>
      {status}
    </span>
  )
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AllocationsPage() {
  const { user } = useAuth()
  const canApprove = user.role === 'Admin' || user.role === 'Asset Manager' || user.role === 'Department Head'

  // Dynamic lists
  const [assets, setAssets] = useState<AssetStub[]>([])
  const [employees, setEmployees] = useState<{ name: string; dept: string }[]>([])

  // Allocate form
  const [selAssetTag, setSelAssetTag] = useState('')
  const [selEmployee, setSelEmployee] = useState('')
  const [expectedReturn, setExpectedReturn] = useState('')

  // Custom dropdown states
  const [isOpenAsset, setIsOpenAsset] = useState(false)
  const [isOpenEmployee, setIsOpenEmployee] = useState(false)
  const [searchAsset, setSearchAsset] = useState('')
  const [searchEmployee, setSearchEmployee] = useState('')
  const [hoveredIdx, setHoveredIdx] = useState<string | null>(null)

  // Transfer & allocation lists
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS)
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS)

  // Return panel
  const [returnPanel, setReturnPanel] = useState<ActiveAlloc | null>(null)
  const [returnNotes, setReturnNotes] = useState('')
  const [returnRating, setReturnRating] = useState(5)

  useEffect(() => {
    Promise.all([resourcesApi.getAll(), orgApi.getEmployees()])
      .then(([resData, empData]) => {
        const mappedAssets: AssetStub[] = resData.map((r) => ({
          tag: 'RES-' + r.id.substring(0, 4).toUpperCase(),
          name: r.name,
          state: r.status === 'AVAILABLE' ? 'available' : r.status === 'MAINTENANCE' ? 'maintenance' : 'allocated',
          holder: 'Shared Infrastructure',
          holderDept: 'Operations',
        }))
        setAssets(mappedAssets)

        const mappedEmps = empData.map((e) => ({
          name: e.fullName,
          dept: e.department?.name || 'Operations',
        }))
        setEmployees(mappedEmps)
      })
      .catch((err) => {
        console.error('Failed to load allocations resources/employees:', err)
      })
  }, [])

  const selAsset = assets.find(a => a.tag === selAssetTag)
  const isConflict = selAsset && (selAsset.state === 'allocated' || selAsset.state === 'reserved')

  const filteredAssets = assets.filter(
    (a) =>
      a.tag.toLowerCase().includes(searchAsset.toLowerCase()) ||
      a.name.toLowerCase().includes(searchAsset.toLowerCase())
  )

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      e.dept.toLowerCase().includes(searchEmployee.toLowerCase())
  )

  const handleAllocate = () => {
    if (!selAsset || !selEmployee || isConflict) return
    const emp = employees.find(e => e.name === selEmployee)
    setAllocations([...allocations, {
      id: `ac${allocations.length + 1}`, tag: selAsset.tag, name: selAsset.name,
      holder: selEmployee, dept: emp?.dept ?? '', allocDate: new Date().toISOString().substring(0, 10),
      expectedReturn: expectedReturn || '—', state: 'allocated',
    }])
    setSelAssetTag(''); setSelEmployee(''); setExpectedReturn('')
  }

  const handleTransferRequest = () => {
    if (!selAsset || !selEmployee) return
    setTransfers([...transfers, {
      id: `t${transfers.length + 1}`, tag: selAsset.tag,
      from: selAsset.holder ?? '—', to: selEmployee,
      date: new Date().toISOString().substring(0, 10), status: 'Requested',
    }])
    setSelAssetTag(''); setSelEmployee('')
  }

  const handleApprove = (id: string) => {
    setTransfers(transfers.map(t => t.id === id ? { ...t, status: 'Approved' as const } : t))
  }
  const handleReject = (id: string) => {
    setTransfers(transfers.filter(t => t.id !== id))
  }

  const handleReturn = () => {
    if (!returnPanel) return
    setAllocations(allocations.filter(a => a.id !== returnPanel.id))
    setReturnPanel(null); setReturnNotes(''); setReturnRating(5)
  }

  const today = new Date()

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Allocation & Transfer
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Assign assets to employees, manage custody transfers, and track active holdings.
        </p>
      </div>

      {/* ── 1. Allocate Asset Form ──────────────────────────────────── */}
      <div className="panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeftRight size={16} style={{ color: 'var(--accent-cyan)' }} />
          Allocate Asset
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Custom Searchable Asset Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Select Asset</label>
            <div
              onClick={() => {
                setIsOpenAsset(!isOpenAsset)
                setIsOpenEmployee(false)
              }}
              style={{
                background: 'var(--bg-void)',
                border: '1px solid var(--border-soft)',
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: selAsset ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: 35
              }}
            >
              <span>{selAsset ? `${selAsset.tag} — ${selAsset.name}` : '-- Choose Asset --'}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', transform: isOpenAsset ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
            </div>
            
            {isOpenAsset && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-soft)',
                zIndex: 110,
                marginTop: 4,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                maxHeight: 250,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <input
                  type="text"
                  placeholder="Search asset..."
                  value={searchAsset}
                  onClick={(e) => e.stopPropagation()}
                  onChange={e => setSearchAsset(e.target.value)}
                  style={{
                    background: 'var(--bg-void)',
                    border: 'none',
                    borderBottom: '1px solid var(--border-soft)',
                    padding: 8,
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {filteredAssets.length === 0 ? (
                    <div style={{ padding: 10, fontSize: '0.72rem', color: 'var(--text-muted)' }}>No assets found</div>
                  ) : (
                    filteredAssets.map(a => {
                      const statusDotColor = a.state === 'available' ? 'var(--status-available)' : a.state === 'maintenance' ? 'var(--status-maintenance)' : 'var(--status-allocated)'
                      const isHovered = hoveredIdx === a.tag
                      return (
                        <div
                          key={a.tag}
                          onClick={() => {
                            setSelAssetTag(a.tag)
                            setIsOpenAsset(false)
                            setSearchAsset('')
                          }}
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: isHovered ? 'var(--bg-void)' : 'transparent',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={() => setHoveredIdx(a.tag)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusDotColor, display: 'inline-block' }} />
                          <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{a.tag}</span>
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Searchable Employee Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Assign To</label>
            <div
              onClick={() => {
                setIsOpenEmployee(!isOpenEmployee)
                setIsOpenAsset(false)
              }}
              style={{
                background: 'var(--bg-void)',
                border: '1px solid var(--border-soft)',
                padding: '8px 12px',
                fontSize: '0.78rem',
                color: selEmployee ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: 35
              }}
            >
              <span>{selEmployee ? selEmployee : '-- Choose Employee --'}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', transform: isOpenEmployee ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>▼</span>
            </div>
            
            {isOpenEmployee && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-soft)',
                zIndex: 110,
                marginTop: 4,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                maxHeight: 250,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchEmployee}
                  onClick={(e) => e.stopPropagation()}
                  onChange={e => setSearchEmployee(e.target.value)}
                  style={{
                    background: 'var(--bg-void)',
                    border: 'none',
                    borderBottom: '1px solid var(--border-soft)',
                    padding: 8,
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    width: '100%'
                  }}
                />
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {filteredEmployees.length === 0 ? (
                    <div style={{ padding: 10, fontSize: '0.72rem', color: 'var(--text-muted)' }}>No employees found</div>
                  ) : (
                    filteredEmployees.map(emp => {
                      const isHovered = hoveredIdx === emp.name
                      return (
                        <div
                          key={emp.name}
                          onClick={() => {
                            setSelEmployee(emp.name)
                            setIsOpenEmployee(false)
                            setSearchEmployee('')
                          }}
                          style={{
                            padding: '8px 12px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            background: isHovered ? 'var(--bg-void)' : 'transparent',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={() => setHoveredIdx(emp.name)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          <span style={{ fontWeight: 600 }}>{emp.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', background: 'rgba(12,202,200,0.06)', padding: '2px 6px', border: '1px solid rgba(12,202,200,0.2)' }}>{emp.dept}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Expected Return Date</label>
            <input type="date" value={expectedReturn} onChange={e => setExpectedReturn(e.target.value)}
              style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none', minHeight: 35 }} />
          </div>
        </div>

        {/* Inline compact StateRail preview */}
        {selAsset && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{selAsset.tag}</span>
            <div style={{ flex: 1, maxWidth: 300 }}>
              <StateRail currentState={mapStateToLabel(selAsset.state)} size="compact" showLabels={false} />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selAsset.name}</span>
          </div>
        )}

        {/* Conflict warning */}
        {isConflict && selAsset && (
          <div style={{ padding: '12px 16px', background: 'rgba(227,168,87,0.08)', border: `1.5px solid ${colors.status.reserved}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={16} style={{ color: colors.status.reserved, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                Currently held by <strong>{selAsset.holder}</strong>, {selAsset.holderDept}
              </span>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                This asset cannot be directly allocated. Submit a transfer request instead.
              </p>
            </div>
            <button onClick={handleTransferRequest} disabled={!selEmployee}
              style={{ padding: '6px 14px', fontSize: '0.72rem', fontWeight: 600, background: 'var(--bg-surface-raised)', border: `1px solid ${colors.status.reserved}`, color: colors.status.reserved, cursor: selEmployee ? 'pointer' : 'not-allowed', opacity: selEmployee ? 1 : 0.5 }}>
              Request Transfer
            </button>
          </div>
        )}

        {!isConflict && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleAllocate} disabled={!selAssetTag || !selEmployee}
              style={{ padding: '8px 20px', fontSize: '0.78rem', fontWeight: 600, background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: selAssetTag && selEmployee ? 'pointer' : 'not-allowed', opacity: selAssetTag && selEmployee ? 1 : 0.5 }}>
              Allocate Asset
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Transfer Requests Table ──────────────────────────────── */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Transfer Requests</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 20px' }}>Status</th>
              <th style={{ padding: '12px 20px' }}>Asset Tag</th>
              <th style={{ padding: '12px 20px' }}>From</th>
              <th style={{ padding: '12px 20px' }}>To</th>
              <th style={{ padding: '12px 20px' }}>Date</th>
              {canApprove && <th style={{ padding: '12px 20px', textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.78rem' }}>
            {transfers.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <td style={{ padding: '12px 20px' }}><StatusPill status={t.status} /></td>
                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{t.tag}</td>
                <td style={{ padding: '12px 20px' }}>{t.from}</td>
                <td style={{ padding: '12px 20px' }}>{t.to}</td>
                <td style={{ padding: '12px 20px', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>{t.date}</td>
                {canApprove && (
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    {t.status === 'Requested' && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button onClick={() => handleApprove(t.id)} style={{ background: 'none', border: '1px solid var(--border-soft)', padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: colors.status.available }}>
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => handleReject(t.id)} style={{ background: 'none', border: '1px solid var(--border-soft)', padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: colors.status.lost }}>
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                    {t.status !== 'Requested' && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>—</span>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 4. Active Allocations Table ─────────────────────────────── */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Active Allocations</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 20px' }}>Asset Tag</th>
              <th style={{ padding: '12px 20px' }}>Holder</th>
              <th style={{ padding: '12px 20px' }}>Department</th>
              <th style={{ padding: '12px 20px' }}>Allocated</th>
              <th style={{ padding: '12px 20px' }}>Expected Return</th>
              <th style={{ padding: '12px 20px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.78rem' }}>
            {allocations.map(a => {
              const retDate = new Date(a.expectedReturn)
              const isOverdue = a.expectedReturn !== '—' && retDate < today
              const isSoon = a.expectedReturn !== '—' && !isOverdue && (retDate.getTime() - today.getTime()) < 7 * 86400000
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{a.tag}</td>
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>{a.holder}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{a.dept}</td>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>{a.allocDate}</td>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--font-data)', fontWeight: 600, color: isOverdue ? colors.status.lost : isSoon ? colors.status.reserved : 'var(--text-primary)' }}>
                    {a.expectedReturn}
                    {isOverdue && <span style={{ marginLeft: 6, fontSize: '0.6rem', color: colors.status.lost }}>OVERDUE</span>}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    <button onClick={() => setReturnPanel(a)}
                      style={{ background: 'none', border: '1px solid var(--border-soft)', padding: '3px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--text-primary)' }}>
                      <RotateCcw size={11} style={{ color: 'var(--accent-cyan)' }} /> Mark Returned
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Return Panel Modal ──────────────────────────────────────── */}
      {returnPanel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="panel" style={{ width: 'min(420px, 90vw)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RotateCcw size={16} style={{ color: 'var(--accent-cyan)' }} />
              Mark Asset Returned
            </h3>
            <div style={{ padding: '10px 14px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{returnPanel.tag}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Held by {returnPanel.holder}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Condition Notes</label>
              <textarea value={returnNotes} onChange={e => setReturnNotes(e.target.value)} rows={3} placeholder="Describe the condition of the returned asset..."
                style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Condition Rating</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setReturnRating(n)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <Star size={16} fill={n <= returnRating ? 'var(--accent-cyan)' : 'none'} color={n <= returnRating ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button onClick={() => setReturnPanel(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel</button>
              <button onClick={handleReturn} style={{ padding: '6px 16px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.78rem' }}>Confirm Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
