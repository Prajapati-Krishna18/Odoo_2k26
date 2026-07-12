import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Search,
  AlertTriangle,
  Plus,
  Lock,
  FileText,
} from 'lucide-react'

const auditors = ['Priya Sharma', 'Mina Chen', 'Raj Patel', 'Sophia Lee']

const initialCycles = [
  {
    id: 'audit-001',
    name: 'Warehouse Inventory Audit',
    scope: 'Warehouse 12',
    dateRange: 'Apr 1 — Apr 7',
    auditors: ['Priya Sharma', 'Mina Chen'],
    status: 'In progress',
    verified: 42,
    total: 60,
    closed: false,
    assets: [
      { id: 'A-1001', assetName: 'Server Rack 7', category: 'Hardware', location: 'Zone 2', status: 'Verified' },
      { id: 'A-1018', assetName: 'Backup Battery', category: 'Electrical', location: 'Zone 3', status: 'Missing' },
      { id: 'A-1120', assetName: 'Network Switch', category: 'Hardware', location: 'Zone 1', status: 'Damaged' },
      { id: 'A-1205', assetName: 'Drone Charger', category: 'Accessories', location: 'Zone 4', status: 'Verified' },
      { id: 'A-1244', assetName: 'Calibration Kit', category: 'Tools', location: 'Zone 3', status: 'Verified' },
    ],
  },
  {
    id: 'audit-002',
    name: 'Spare Parts Verification',
    scope: 'Service Depot',
    dateRange: 'May 5 — May 10',
    auditors: ['Raj Patel', 'Sophia Lee'],
    status: 'Pending',
    verified: 18,
    total: 52,
    closed: false,
    assets: [
      { id: 'S-2004', assetName: 'Relay Unit', category: 'Electrical', location: 'Shelf B', status: 'Verified' },
      { id: 'S-2032', assetName: 'Hydraulic Hose', category: 'Parts', location: 'Shelf D', status: 'Missing' },
      { id: 'S-2040', assetName: 'Control Knob', category: 'Accessories', location: 'Shelf A', status: 'Verified' },
    ],
  },
]

const statusColor = {
  Verified: 'var(--status-available)',
  Missing: 'var(--status-lost)',
  Damaged: 'var(--status-reserved)',
  Pending: 'var(--text-muted)',
  'In progress': 'var(--accent-cyan)',
  Closed: 'var(--status-retired)',
}

const statusLabelColor = {
  Verified: 'rgba(47,166,107,0.16)',
  Missing: 'rgba(224,98,88,0.16)',
  Damaged: 'rgba(233,165,51,0.16)',
  Pending: 'rgba(143,163,150,0.12)',
  'In progress': 'rgba(12,202,200,0.14)',
  Closed: 'rgba(107,114,128,0.12)',
}

export default function AuditsPage() {
  const [cycles, setCycles] = useState(initialCycles)
  const [selectedCycleId, setSelectedCycleId] = useState(initialCycles[0].id)
  const [scope, setScope] = useState('Warehouse 12')
  const [fromDate, setFromDate] = useState('2026-07-01')
  const [toDate, setToDate] = useState('2026-07-07')
  const [auditorSelections, setAuditorSelections] = useState<string[]>(['Priya Sharma'])

  const selectedCycle = useMemo(
    () => cycles.find((cycle) => cycle.id === selectedCycleId) ?? cycles[0],
    [cycles, selectedCycleId],
  )

  const discrepancyItems = useMemo(
    () => selectedCycle.assets.filter((item) => item.status !== 'Verified'),
    [selectedCycle],
  )

  const totalProgress = `${selectedCycle.verified}/${selectedCycle.total} verified`

  const handleToggleAuditor = (auditor: string) => {
    setAuditorSelections((current) =>
      current.includes(auditor)
        ? current.filter((item) => item !== auditor)
        : [...current, auditor],
    )
  }

  const handleAddCycle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextCycle = {
      id: `audit-${(cycles.length + 1).toString().padStart(3, '0')}`,
      name: `${scope} Audit Cycle`,
      scope,
      dateRange: `${fromDate} — ${toDate}`,
      auditors: auditorSelections.length ? auditorSelections : ['Priya Sharma'],
      status: 'Pending',
      verified: 0,
      total: 0,
      closed: false,
      assets: [
        { id: 'A-3001', assetName: 'Backup Server B', category: 'Hardware', location: 'Zone 1', status: 'Pending' },
        { id: 'A-3012', assetName: 'Switch Router 2', category: 'Hardware', location: 'Zone 2', status: 'Pending' },
      ] as any[],
    }
    setCycles((current) => [nextCycle, ...current])
    setSelectedCycleId(nextCycle.id)
  }

  const updateAssetStatus = (assetId: string, status: 'Verified' | 'Missing' | 'Damaged') => {
    setCycles((current) =>
      current.map((cycle) =>
        cycle.id === selectedCycle.id
          ? {
              ...cycle,
              assets: cycle.assets.map((asset) =>
                asset.id === assetId ? { ...asset, status } : asset,
              ),
            }
          : cycle,
      ),
    )
  }

  const closeCycle = () => {
    setCycles((current) =>
      current.map((cycle) =>
        cycle.id === selectedCycle.id ? { ...cycle, closed: true, status: 'Closed' } : cycle,
      ),
    )
  }

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Audits</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Inventory Audit Cycles
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Conduct physical asset audits, track discrepancies, and close verification records.
          </p>
        </div>
        <div style={{ padding: '6px 14px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-soft)', fontSize: '0.78rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center' }}>
          Active cycles: {cycles.filter((cycle) => !cycle.closed).length}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Create Audit & List */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Create audit cycle
              </h3>
              <Plus size={16} style={{ color: 'var(--accent-cyan)' }} />
            </div>

            <form onSubmit={handleAddCycle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Scope</label>
                <select value={scope} onChange={(event) => setScope(event.target.value)} className="af-select">
                  <option>Warehouse 12</option>
                  <option>Service Depot</option>
                  <option>HQ Inventory</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Start Date</label>
                <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="af-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>End Date</label>
                <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="af-input" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>Auditors</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {auditors.map((auditor) => {
                    const isSelected = auditorSelections.includes(auditor)
                    return (
                      <button
                        key={auditor}
                        type="button"
                        onClick={() => handleToggleAuditor(auditor)}
                        style={{
                          background: isSelected ? 'rgba(12,202,200,0.12)' : 'var(--bg-void)',
                          border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-soft)'}`,
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                          padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer',
                        }}
                      >
                        {auditor}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button type="submit"
                style={{ width: '100%', padding: '8px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
                Start audit cycle
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Audit cycles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cycles.map((cycle) => {
                const isSelected = cycle.id === selectedCycleId
                return (
                  <button
                    key={cycle.id}
                    type="button"
                    onClick={() => setSelectedCycleId(cycle.id)}
                    className="panel"
                    style={{
                      width: '100%', padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                      border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-soft)',
                      background: isSelected ? 'var(--bg-surface-raised)' : 'var(--bg-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cycle.name}</p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{cycle.scope} · {cycle.dateRange}</p>
                      </div>
                      <span
                        style={{
                          color: statusColor[cycle.status as keyof typeof statusColor],
                          background: statusLabelColor[cycle.status as keyof typeof statusLabelColor],
                          padding: '1px 6px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', border: `1px solid ${statusColor[cycle.status as keyof typeof statusColor]}24`,
                        }}
                      >
                        {cycle.status}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border-soft)', position: 'relative', margin: '8px 0' }}>
                      <div
                        style={{ height: '100%', background: 'var(--accent-cyan)', width: `${Math.min(100, Math.floor((cycle.verified / Math.max(1, cycle.total)) * 100))}%` }}
                      />
                    </div>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{cycle.verified}/{cycle.total} verified</p>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Right Column: Cycle Details, Assets Checklist */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cycle detail</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{selectedCycle.name}</h3>
              </div>
              <span
                style={{
                  color: statusColor[selectedCycle.status as keyof typeof statusColor],
                  background: statusLabelColor[selectedCycle.status as keyof typeof statusLabelColor],
                  padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', border: `1px solid ${statusColor[selectedCycle.status as keyof typeof statusColor]}24`,
                }}
              >
                {selectedCycle.status}
              </span>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date range</p>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedCycle.dateRange}</p>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned auditors</p>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedCycle.auditors.join(', ')}</p>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Progress</p>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{totalProgress}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Checklist</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>In-scope assets</h3>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Click an action to verify status</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 680 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Asset</th>
                    <th style={{ padding: '8px 12px' }}>Category</th>
                    <th style={{ padding: '8px 12px' }}>Location</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.78rem' }}>
                  {selectedCycle.assets.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No assets in-scope yet. Add elements to this cycle.</td></tr>
                  ) : selectedCycle.assets.map((asset) => (
                    <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset.assetName}</p>
                        <p style={{ fontSize: '0.68rem', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>{asset.id}</p>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{asset.category}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{asset.location}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <button
                            type="button"
                            onClick={() => updateAssetStatus(asset.id, 'Verified')}
                            style={{
                              background: asset.status === 'Verified' ? 'rgba(47,166,107,0.15)' : 'none',
                              border: `1px solid ${asset.status === 'Verified' ? 'var(--status-available)' : 'var(--border-soft)'}`,
                              color: asset.status === 'Verified' ? 'var(--status-available)' : 'var(--text-muted)',
                              padding: '3px 8px', fontSize: '0.68rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <CheckCircle2 size={11} /> Verified
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAssetStatus(asset.id, 'Missing')}
                            style={{
                              background: asset.status === 'Missing' ? 'rgba(224,98,88,0.15)' : 'none',
                              border: `1px solid ${asset.status === 'Missing' ? 'var(--status-lost)' : 'var(--border-soft)'}`,
                              color: asset.status === 'Missing' ? 'var(--status-lost)' : 'var(--text-muted)',
                              padding: '3px 8px', fontSize: '0.68rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <Search size={11} /> Missing
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAssetStatus(asset.id, 'Damaged')}
                            style={{
                              background: asset.status === 'Damaged' ? 'rgba(233,165,51,0.15)' : 'none',
                              border: `1px solid ${asset.status === 'Damaged' ? 'var(--status-reserved)' : 'var(--border-soft)'}`,
                              color: asset.status === 'Damaged' ? 'var(--status-reserved)' : 'var(--text-muted)',
                              padding: '3px 8px', fontSize: '0.68rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}
                          >
                            <AlertTriangle size={11} /> Damaged
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discrepancy Report */}
          <div className="panel" style={{ padding: 20, border: '1px solid rgba(224,98,88,0.2)', background: 'rgba(224,98,88,0.03)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--status-lost)', fontWeight: 600 }}>Discrepancy report</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>Missing & damaged assets</h3>
              </div>
              <FileText size={18} style={{ color: 'var(--status-lost)' }} />
            </div>

            {discrepancyItems.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {discrepancyItems.map((item) => (
                  <div key={item.id} style={{ padding: '10px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.assetName}</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.id} · {item.category}</p>
                    </div>
                    <span
                      style={{
                        color: statusColor[item.status as keyof typeof statusColor],
                        background: statusLabelColor[item.status as keyof typeof statusLabelColor],
                        padding: '1px 6px', fontSize: '0.62rem', fontWeight: 700, border: `1px solid ${statusColor[item.status as keyof typeof statusColor]}24`,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-soft)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                No discrepancies detected yet. All audited assets verified as healthy.
              </div>
            )}
          </div>

          {/* Close Audit Cycle */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Close audit cycle</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>Confirm status changes</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Closing the cycle locks all checklist entries and generates the final discrepancy report.
                </p>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)' }}>
                {selectedCycle.closed ? 'Closed' : 'Open'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
              <div style={{ padding: '8px 12px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--status-available)', marginTop: 2 }}>{selectedCycle.assets.filter((asset) => asset.status === 'Verified').length}</p>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Missing</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--status-lost)', marginTop: 2 }}>{selectedCycle.assets.filter((asset) => asset.status === 'Missing').length}</p>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-void)', border: '1px solid var(--border-soft)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Damaged</p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--status-reserved)', marginTop: 2 }}>{selectedCycle.assets.filter((asset) => asset.status === 'Damaged').length}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCycle}
              disabled={selectedCycle.closed}
              style={{
                marginTop: 14, width: '100%', padding: '9px', background: 'var(--bg-surface-raised)',
                border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)',
                fontSize: '0.82rem', fontWeight: 600, cursor: selectedCycle.closed ? 'not-allowed' : 'pointer', opacity: selectedCycle.closed ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Lock size={13} /> Close audit cycle
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
