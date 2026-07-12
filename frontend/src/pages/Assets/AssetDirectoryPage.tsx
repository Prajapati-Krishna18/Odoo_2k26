import { useState } from 'react'
import {
  QrCode,
  Image as ImageIcon,
  Plus,
  Upload,
  X,
  MapPin,
  Wrench,
  UserCheck,
  Search,
} from 'lucide-react'
import { StateRail, type LifecycleState } from '@/components/StateRail'
import { colors, type StateKey } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllocationRecord {
  id: string
  holder: string
  assignedDate: string
  returnedDate: string
}

interface MaintenanceRecord {
  id: string
  type: string
  date: string
  cost: number
  notes: string
}

interface Asset {
  id: string
  tag: string
  name: string
  category: string
  currentState: StateKey
  location: string
  department: string
  serialNumber: string
  acquisitionDate: string
  acquisitionCost: number
  condition: 'New' | 'Good' | 'Fair' | 'Poor'
  sharedBookable: boolean
  allocations: AllocationRecord[]
  maintenance: MaintenanceRecord[]
}

// Helper to map StateKey to LifecycleState (lowercase to Capitalized/Formatted)
function mapStateToLabel(st: StateKey): LifecycleState {
  switch (st) {
    case 'available':   return 'Available'
    case 'allocated':   return 'Allocated'
    case 'reserved':    return 'Reserved'
    case 'maintenance': return 'Under Maintenance'
    case 'lost':        return 'Lost'
    case 'retired':     return 'Retired'
    case 'disposed':    return 'Disposed'
    default:            return 'Available'
  }
}

// ─── Mock Assets ──────────────────────────────────────────────────────────────

const INITIAL_ASSETS: Asset[] = [
  {
    id: 'a1',
    tag: 'AF-0114',
    name: 'MacBook Pro 16" M3 Max',
    category: 'Laptops & Workstations',
    currentState: 'allocated',
    location: 'HQ - Sector 62',
    department: 'Engineering',
    serialNumber: 'C02ZK3Y4MN',
    acquisitionDate: '2024-01-15',
    acquisitionCost: 249999,
    condition: 'New',
    sharedBookable: false,
    allocations: [
      { id: 'al1', holder: 'Sarah Chen', assignedDate: '2024-01-20', returnedDate: 'Active' },
      { id: 'al2', holder: 'Aarav Mehta', assignedDate: '2023-06-01', returnedDate: '2024-01-10' },
    ],
    maintenance: [
      { id: 'm1', type: 'Repaste & Cleaning', date: '2025-02-12', cost: 1500, notes: 'Thermal paste upgrade and internal dust clean' },
    ],
  },
  {
    id: 'a2',
    tag: 'AF-0824',
    name: 'Dell UltraSharp 32" 4K Monitor',
    category: 'Laptops & Workstations',
    currentState: 'available',
    location: 'HQ - Sector 62',
    department: 'Engineering',
    serialNumber: 'MX-99214-B',
    acquisitionDate: '2023-05-10',
    acquisitionCost: 89000,
    condition: 'Good',
    sharedBookable: true,
    allocations: [
      { id: 'al3', holder: 'Neha Gupta', assignedDate: '2023-05-12', returnedDate: '2024-04-18' },
    ],
    maintenance: [],
  },
  {
    id: 'a3',
    tag: 'AF-1092',
    name: 'iPad Pro 11" M2 Wifi',
    category: 'Mobile Devices',
    currentState: 'reserved',
    location: 'Mumbai Branch',
    department: 'Marketing',
    serialNumber: 'DLK2215MX1',
    acquisitionDate: '2023-11-22',
    acquisitionCost: 79900,
    condition: 'New',
    sharedBookable: true,
    allocations: [],
    maintenance: [],
  },
  {
    id: 'a4',
    tag: 'AF-5501',
    name: 'FortiGate 100F Firewall',
    category: 'Networking Hardware',
    currentState: 'maintenance',
    location: 'Bengaluru Lab',
    department: 'IT Support',
    serialNumber: 'FG100F-882190',
    acquisitionDate: '2022-08-01',
    acquisitionCost: 350000,
    condition: 'Fair',
    sharedBookable: false,
    allocations: [],
    maintenance: [
      { id: 'm2', type: 'Firmware Recovery', date: '2026-07-10', cost: 0, notes: 'Reflashed OS kernel to stable v7.4' },
    ],
  },
  {
    id: 'a5',
    tag: 'AF-9921',
    name: 'iPhone 15 Pro Max 256G',
    category: 'Mobile Devices',
    currentState: 'lost',
    location: 'Remote',
    department: 'Marketing',
    serialNumber: 'AP-9081267',
    acquisitionDate: '2023-09-25',
    acquisitionCost: 159900,
    condition: 'Good',
    sharedBookable: false,
    allocations: [
      { id: 'al4', holder: 'Rohan Roy', assignedDate: '2023-09-30', returnedDate: 'Active' },
    ],
    maintenance: [],
  },
]

const CATEGORIES = ['Laptops & Workstations', 'Mobile Devices', 'Networking Hardware']
const DEPARTMENTS = ['Engineering', 'Marketing', 'Logistics', 'IT Support', 'Legal & Compliance']
const LOCATIONS = ['HQ - Sector 62', 'Mumbai Branch', 'Bengaluru Lab', 'Remote']
const LIFECYCLE_STATES: StateKey[] = ['available', 'allocated', 'reserved', 'maintenance', 'lost', 'retired', 'disposed']

// ─── Main Directory Page ──────────────────────────────────────────────────────

export default function AssetDirectoryPage() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [searchVal, setSearchVal] = useState('')
  const [selCategory, setSelCategory] = useState('')
  const [selDept, setSelDept] = useState('')
  const [selLoc, setSelLoc] = useState('')
  const [selStatusChips, setSelStatusChips] = useState<StateKey[]>([])

  // Modal / Detail state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [detailTab, setDetailTab] = useState<'allocations' | 'maintenance'>('allocations')
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  // Form registration state
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: CATEGORIES[0],
    serialNumber: '',
    acquisitionDate: new Date().toISOString().substring(0, 10),
    acquisitionCost: 0,
    condition: 'New' as 'New' | 'Good' | 'Fair' | 'Poor',
    location: LOCATIONS[0],
    sharedBookable: false,
  })

  // Tag helper
  const nextTagNumber = 1000 + assets.length + 1
  const autoGeneratedTag = `AF-${nextTagNumber}`

  // Toggle status filter chip
  const handleToggleStatusChip = (st: StateKey) => {
    if (selStatusChips.includes(st)) {
      setSelStatusChips(selStatusChips.filter((x) => x !== st))
    } else {
      setSelStatusChips([...selStatusChips, st])
    }
  }

  // Filter pipeline
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchVal.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchVal.toLowerCase())

    const matchesCategory = !selCategory || asset.category === selCategory
    const matchesDept = !selDept || asset.department === selDept
    const matchesLoc = !selLoc || asset.location === selLoc
    
    const matchesStatus =
      selStatusChips.length === 0 ||
      selStatusChips.map((s) => s.toLowerCase()).includes(asset.currentState.toLowerCase())

    return matchesSearch && matchesCategory && matchesDept && matchesLoc && matchesStatus
  })

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAsset.name || !newAsset.serialNumber) return

    const assetToRegister: Asset = {
      id: `a${assets.length + 1}`,
      tag: autoGeneratedTag,
      name: newAsset.name,
      category: newAsset.category,
      currentState: 'available',
      location: newAsset.location,
      department: 'IT Support', // Default holding department
      serialNumber: newAsset.serialNumber,
      acquisitionDate: newAsset.acquisitionDate,
      acquisitionCost: Number(newAsset.acquisitionCost),
      condition: newAsset.condition,
      sharedBookable: newAsset.sharedBookable,
      allocations: [],
      maintenance: [],
    }

    setAssets([...assets, assetToRegister])
    setNewAsset({
      name: '',
      category: CATEGORIES[0],
      serialNumber: '',
      acquisitionDate: new Date().toISOString().substring(0, 10),
      acquisitionCost: 0,
      condition: 'New',
      location: LOCATIONS[0],
      sharedBookable: false,
    })
    setShowRegisterModal(false)
  }

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400, margin: '0 auto' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Asset Inventory Directory
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Search hardware tags, review live tracking status timelines, and configure lifecycle routes.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="panel flex items-center gap-1.5 px-4 py-2 cursor-pointer text-xs font-semibold text-text-primary bg-bg-surface-raised hover:border-accent-cyan/60 transition-all"
          style={{ border: '1.5px solid var(--accent-cyan)' }}
        >
          <Plus size={14} style={{ color: 'var(--accent-cyan)' }} />
          Register Asset
        </button>
      </div>

      {/* ── 1. Search & Filter Bar ── */}
      <div className="panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        
        {/* Core inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border-soft)', padding: '6px 12px', background: 'var(--bg-void)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Tag, Serial, QR..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.8rem', width: '100%' }}
            />
            <span title="Scan QR Code Asset Tag" style={{ display: 'flex', cursor: 'pointer' }}>
              <QrCode size={14} style={{ color: 'var(--accent-cyan)' }} />
            </span>
          </div>

          {/* Category Filter */}
          <select
            value={selCategory}
            onChange={(e) => setSelCategory(e.target.value)}
            style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="">-- All Categories --</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selDept}
            onChange={(e) => setSelDept(e.target.value)}
            style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="">-- All Departments --</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={selLoc}
            onChange={(e) => setSelLoc(e.target.value)}
            style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="">-- All Locations --</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* 7 Status Lifecycle Chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status Lifecycle Tag Filter</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LIFECYCLE_STATES.map((st) => {
              const isSelected = selStatusChips.includes(st)
              const mappedColor = colors.status[st.replace('under ', '') as keyof typeof colors.status] ?? 'var(--text-muted)'
              return (
                <button
                  key={st}
                  onClick={() => handleToggleStatusChip(st)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    background: isSelected ? mappedColor : 'transparent',
                    color: isSelected ? 'var(--bg-void)' : 'var(--text-primary)',
                    border: `1.5px solid ${mappedColor}`,
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st}
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── 2. Asset Directory Table ── */}
      <div className="panel overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 20px', width: 60 }}>Cover</th>
              <th style={{ padding: '12px 20px' }}>Asset ID</th>
              <th style={{ padding: '12px 20px' }}>Name</th>
              <th style={{ padding: '12px 20px' }}>Category</th>
              <th style={{ padding: '12px 20px' }}>Status Lifecycle</th>
              <th style={{ padding: '12px 20px' }}>Site Location</th>
              <th style={{ padding: '12px 20px' }}>Department</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.78rem' }}>
            {filteredAssets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                style={{ borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--bg-surface-raised)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent' }}
              >
                {/* Image thumb placeholder */}
                <td style={{ padding: '10px 20px' }}>
                  <div style={{ width: 34, height: 34, border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)', color: 'var(--text-muted)', opacity: 0.7 }}>
                    <ImageIcon size={14} />
                  </div>
                </td>
                
                <td style={{ padding: '10px 20px', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {asset.tag}
                </td>

                <td style={{ padding: '10px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {asset.name}
                </td>

                <td style={{ padding: '10px 20px', color: 'var(--text-muted)' }}>
                  {asset.category}
                </td>

                {/* Compact StateRail component */}
                <td style={{ padding: '10px 20px', minWidth: 150 }}>
                  <div style={{ transform: 'scale(0.85)', transformOrigin: 'left center', width: 220 }}>
                    <StateRail currentState={mapStateToLabel(asset.currentState)} size="compact" showLabels={false} />
                  </div>
                </td>

                <td style={{ padding: '10px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)' }}>
                    <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                    {asset.location}
                  </div>
                </td>

                <td style={{ padding: '10px 20px', color: 'var(--text-muted)' }}>
                  {asset.department}
                </td>

              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No assets match current filter mapping configurations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── 4. Asset Detail Drawer/Panel ── */}
      {selectedAsset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'flex-end', zIndex: 110 }}>
          <div
            className="panel"
            style={{
              width: 'min(640px, 100vw)',
              height: '100vh',
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-soft)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              overflowY: 'auto',
            }}
          >
            {/* Header control */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{selectedAsset.tag}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>S/N: {selectedAsset.serialNumber}</span>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Asset Headline Name */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {selectedAsset.name}
              </h3>
              <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Category: <strong style={{ color: 'var(--text-primary)' }}>{selectedAsset.category}</strong></span>
                <span>•</span>
                <span>Acquired: <strong style={{ color: 'var(--text-primary)' }}>{selectedAsset.acquisitionDate}</strong></span>
              </div>
            </div>

            {/* Full-size StateRail */}
            <div className="panel" style={{ padding: 16, background: 'var(--bg-void)' }}>
              <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                Current State Timeline
              </div>
              <StateRail currentState={mapStateToLabel(selectedAsset.currentState)} size="full" showLabels={true} />
            </div>

            {/* Secondary details stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ padding: 10, background: 'var(--bg-surface-raised)', border: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Site Location</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedAsset.location}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg-surface-raised)', border: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Condition</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{selectedAsset.condition}</div>
              </div>
              <div style={{ padding: 10, background: 'var(--bg-surface-raised)', border: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acquisition Cost</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-data)' }}>
                  ₹{selectedAsset.acquisitionCost.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Tabs selector */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', gap: 16 }}>
              <button
                onClick={() => setDetailTab('allocations')}
                style={{
                  background: 'none', border: 'none', paddingBottom: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  color: detailTab === 'allocations' ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: detailTab === 'allocations' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                }}
              >
                Allocation History
              </button>
              <button
                onClick={() => setDetailTab('maintenance')}
                style={{
                  background: 'none', border: 'none', paddingBottom: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  color: detailTab === 'maintenance' ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: detailTab === 'maintenance' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                }}
              >
                Maintenance logs
              </button>
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              
              {detailTab === 'allocations' && (
                <div>
                  {selectedAsset.allocations.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.76rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px 0' }}>Holder</th>
                          <th style={{ padding: '8px 0' }}>Assigned Date</th>
                          <th style={{ padding: '8px 0', textAlign: 'right' }}>Returned Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAsset.allocations.map((a) => (
                          <tr key={a.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                            <td style={{ padding: '8px 0', fontWeight: 600, color: 'var(--text-primary)' }}>{a.holder}</td>
                            <td style={{ padding: '8px 0', fontFamily: 'var(--font-data)' }}>{a.assignedDate}</td>
                            <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'var(--font-data)', color: a.returnedDate === 'Active' ? 'var(--status-available)' : 'var(--text-muted)' }}>
                              {a.returnedDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      <UserCheck size={20} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      No allocation records for this asset.
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'maintenance' && (
                <div>
                  {selectedAsset.maintenance.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedAsset.maintenance.map((m) => (
                        <div key={m.id} className="panel" style={{ padding: 12, background: 'var(--bg-void)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{m.type}</span>
                            <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>{m.date}</span>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 6px' }}>{m.notes}</p>
                          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-data)', color: 'var(--accent-cyan)' }}>
                            Cost: ₹{m.cost.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      <Wrench size={20} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                      No maintenance records registered for this hardware tag.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── 3. Register Asset Modal ── */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <form onSubmit={handleRegisterSubmit} className="panel" style={{ width: 'min(500px, 95vw)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Register Asset</h3>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell XPS 15"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</label>
                <select
                  value={newAsset.category}
                  onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Asset Tag (Auto-generated)</label>
                <input
                  type="text"
                  readOnly
                  value={autoGeneratedTag}
                  style={{ background: 'rgba(27,43,34,0.4)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-data)', outline: 'none', cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Serial Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S491MX221B"
                  value={newAsset.serialNumber}
                  onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                  style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acquisition Date</label>
                <input
                  type="date"
                  value={newAsset.acquisitionDate}
                  onChange={(e) => setNewAsset({ ...newAsset, acquisitionDate: e.target.value })}
                  style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acquisition Cost (₹)</label>
                <input
                  type="number"
                  value={newAsset.acquisitionCost}
                  onChange={(e) => setNewAsset({ ...newAsset, acquisitionCost: Number(e.target.value) })}
                  style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none' }}
                />
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Note: For reporting only, not linked to accounting.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Condition</label>
                <select
                  value={newAsset.condition}
                  onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value as 'New' | 'Good' | 'Fair' | 'Poor' })}
                  style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Site Location</label>
                <select
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none' }}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shared toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>Shared / Bookable checkout</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Allow temporary allocation checkouts via Resource scheduler</span>
              </div>
              <input
                type="checkbox"
                checked={newAsset.sharedBookable}
                onChange={(e) => setNewAsset({ ...newAsset, sharedBookable: e.target.checked })}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
              />
            </div>

            {/* File upload box */}
            <div style={{ border: '1px dashed var(--border-soft)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--bg-void)' }}>
              <Upload size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>Upload Invoice or QR Code</span>
              <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>PDF, PNG, JPG up to 10MB</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button type="button" onClick={() => setShowRegisterModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel</button>
              <button type="submit" className="panel" style={{ padding: '6px 16px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.78rem' }}>Register</button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
