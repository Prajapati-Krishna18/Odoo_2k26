import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Layout, Table, Sliders, Info } from 'lucide-react'
import { StateRail, type LifecycleState, StateKeys } from '@/components/StateRail'
import { colors } from '@/lib/tokens'

// ─── Test scenarios for each of the 7 states ────────────────────────────────────
const DEMO_STATES: LifecycleState[] = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
]

// Mock asset list for testing the compact rail inside a table view
const MOCK_ASSETS = [
  { id: 'AST-7821', name: 'MacBook Pro 16" M3 Max', type: 'Hardware', state: 'Allocated' as LifecycleState, user: 'Sarah Chen' },
  { id: 'AST-4412', name: 'Dell UltraSharp 34" Monitor', type: 'Hardware', state: 'Available' as LifecycleState, user: '—' },
  { id: 'AST-9031', name: 'Figma Enterprise License', type: 'Software', state: 'Reserved' as LifecycleState, user: 'Design Team' },
  { id: 'AST-1104', name: 'ThinkPad X1 Carbon Gen 11', type: 'Hardware', state: 'Under Maintenance' as LifecycleState, user: 'IT Dept (Diagnostics)' },
  { id: 'AST-5523', name: 'iPad Pro 12.9" M2', type: 'Hardware', state: 'Lost' as LifecycleState, user: '—' },
  { id: 'AST-3180', name: 'Server Rack Node Alpha (2018)', type: 'Infrastructure', state: 'Retired' as LifecycleState, user: '—' },
]

export default function StateRailTestPage() {
  const [activeTab, setActiveTab] = useState<'interactive' | 'all-states' | 'table'>('interactive')
  const [sandboxState, setSandboxState] = useState<LifecycleState>('Under Maintenance')
  const [sandboxSize, setSandboxSize] = useState<'full' | 'compact'>('full')
  const [sandboxLabels, setSandboxLabels] = useState<boolean>(true)
  const [animKey, setAnimKey] = useState<number>(0)

  const handleReplay = () => setAnimKey((prev) => prev + 1)

  return (
    <div className="min-h-screen bg-bg-void text-text-primary px-6 py-12 md:px-12 md:py-16 flex flex-col gap-10">
      
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="max-w-4xl flex flex-col gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[rgba(47,166,107,0.1)] border border-[rgba(47,166,107,0.25)] text-status-available text-xs font-semibold tracking-wider uppercase w-fit">
          <Info size={13} className="text-status-available" />
          Component Review
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          StateRail Component Showcase
        </h1>
        <p className="text-text-muted text-base md:text-lg max-w-2xl">
          The signature visual asset lifecycle track. It represents the lifecycle phases from{' '}
          <span className="text-text-primary font-semibold">Available</span> to{' '}
          <span className="text-text-primary font-semibold">Disposed</span>, highlighting the current state with an organic scan pulse on mount.
        </p>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-border-soft gap-6">
        <button
          onClick={() => setActiveTab('interactive')}
          className={`pb-3 text-sm font-medium tracking-wide flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'interactive'
              ? 'border-status-available text-text-primary font-semibold'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Sliders size={15} />
          Interactive Sandbox
        </button>
        <button
          onClick={() => setActiveTab('all-states')}
          className={`pb-3 text-sm font-medium tracking-wide flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'all-states'
              ? 'border-status-available text-text-primary font-semibold'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Layout size={15} />
          All 7 States (Full)
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`pb-3 text-sm font-medium tracking-wide flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'table'
              ? 'border-status-available text-text-primary font-semibold'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Table size={15} />
          Compact Table View
        </button>
      </div>

      {/* ── Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-5xl">
        
        {/* ── Interactive Tab ── */}
        {activeTab === 'interactive' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Control Panel */}
            <div className="lg:col-span-1 panel p-6 flex flex-col gap-6">
              <h3 className="font-display text-lg font-bold text-text-primary border-b border-border-soft pb-2">
                Configure Rail
              </h3>

              {/* State Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                  Lifecycle State
                </label>
                <div className="flex flex-col gap-1.5">
                  {DEMO_STATES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSandboxState(s)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                        sandboxState === s
                          ? 'bg-bg-surface-raised border-border-soft text-text-primary'
                          : 'bg-transparent border-transparent text-text-muted hover:bg-bg-surface-raised/50 hover:text-text-primary'
                      }`}
                    >
                      {s}
                      {sandboxState === s && (
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              s === 'Available' ? colors.status.available :
                              s === 'Allocated' ? colors.status.allocated :
                              s === 'Reserved' ? colors.status.reserved :
                              s === 'Under Maintenance' ? colors.status.maintenance :
                              s === 'Lost' ? colors.status.lost :
                              s === 'Retired' ? colors.status.retired :
                              colors.status.disposed
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                  Size Prop
                </label>
                <div className="grid grid-cols-2 gap-2 bg-bg-void p-1 rounded-lg border border-border-soft">
                  {(['full', 'compact'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setSandboxSize(sz)
                        if (sz === 'compact') setSandboxLabels(false)
                        else setSandboxLabels(true)
                      }}
                      className={`py-1.5 text-xs font-medium rounded-md capitalize cursor-pointer transition-all ${
                        sandboxSize === sz
                          ? 'bg-bg-surface-raised text-text-primary shadow-sm'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Labels Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border-soft">
                <label className="text-xs text-text-muted font-semibold uppercase tracking-wider cursor-pointer" htmlFor="show-labels-chk">
                  Show Labels
                </label>
                <input
                  id="show-labels-chk"
                  type="checkbox"
                  checked={sandboxLabels}
                  disabled={sandboxSize === 'compact'}
                  onChange={(e) => setSandboxLabels(e.target.checked)}
                  className="w-4 h-4 accent-status-available cursor-pointer disabled:opacity-30"
                />
              </div>

              {/* Replay Button */}
              <button
                onClick={handleReplay}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-bg-surface-raised border border-border-soft text-text-primary text-xs font-semibold cursor-pointer hover:bg-[rgba(47,166,107,0.1)] hover:border-status-available/50 transition-all"
              >
                <RefreshCw size={13} className="text-status-available" />
                Replay Scan Animation
              </button>
            </div>

            {/* Live Component Preview */}
            <div className="lg:col-span-2 panel p-8 flex flex-col items-center justify-center gap-6 min-h-[300px] relative overflow-hidden bg-radial from-bg-surface-raised/20 to-bg-surface">
              <div className="absolute top-4 left-4 text-xs font-semibold text-text-muted tracking-wide font-mono">
                PREVIEW AREA ({sandboxSize.toUpperCase()} SIZE)
              </div>

              <div className="w-full flex items-center justify-center py-6 px-4">
                <StateRail
                  key={`${sandboxState}-${sandboxSize}-${sandboxLabels}-${animKey}`}
                  currentState={sandboxState}
                  size={sandboxSize}
                  showLabels={sandboxLabels}
                />
              </div>

              {/* Debug description */}
              <div className="text-center max-w-sm mt-4 p-3 bg-bg-void/40 border border-border-soft/60 rounded-xl text-xs text-text-muted">
                State: <span className="text-text-primary font-bold font-mono">{sandboxState}</span> · 
                Size: <span className="text-text-primary font-bold font-mono">{sandboxSize}</span> · 
                Labels: <span className="text-text-primary font-bold font-mono">{sandboxLabels ? 'Visible' : 'Hidden'}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── All States Tab ── */}
        {activeTab === 'all-states' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {DEMO_STATES.map((state, i) => (
              <div key={state} className="panel p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border-soft pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.status[StateKeys[i]] }} />
                    <span className="font-display font-bold text-text-primary">{state}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">INDEX {i}</span>
                </div>
                <div className="py-2 px-1">
                  <StateRail currentState={state} size="full" />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Table View Tab ── */}
        {activeTab === 'table' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel overflow-hidden border border-border-soft"
          >
            <div className="p-5 border-b border-border-soft flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary">
                  Mock Inventory View
                </h3>
                <p className="text-text-muted text-xs">
                  Demonstrating inline compact rails inside a structured data table grid.
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-surface-raised border-b border-border-soft text-text-muted text-[10px] font-semibold tracking-wider uppercase">
                    <th className="p-4 pl-6">Asset ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Assigned To</th>
                    <th className="p-4 pr-6 w-[340px]">Lifecycle State Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft/60">
                  {MOCK_ASSETS.map((asset) => (
                    <tr key={asset.id} className="hover:bg-bg-surface-raised/35 transition-all text-xs">
                      <td className="p-4 pl-6 font-mono font-bold text-text-primary">{asset.id}</td>
                      <td className="p-4 font-medium text-text-primary">{asset.name}</td>
                      <td className="p-4 text-text-muted">{asset.type}</td>
                      <td className="p-4 text-text-muted">{asset.user}</td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center gap-3">
                          {/* Inline compact state rail */}
                          <div className="w-[200px] flex-shrink-0">
                            <StateRail currentState={asset.state} size="compact" />
                          </div>
                          {/* Simple state pill */}
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ml-auto"
                            style={{
                              backgroundColor: `rgba(${
                                asset.state === 'Available' ? '47,166,107' :
                                asset.state === 'Allocated' ? '72,105,166' :
                                asset.state === 'Reserved' ? '227,168,87' :
                                asset.state === 'Under Maintenance' ? '144,97,249' :
                                asset.state === 'Lost' ? '224,98,88' :
                                asset.state === 'Retired' ? '107,114,128' :
                                '55,65,81'
                              }, 0.12)`,
                              color:
                                asset.state === 'Available' ? colors.status.available :
                                asset.state === 'Allocated' ? colors.status.allocated :
                                asset.state === 'Reserved' ? colors.status.reserved :
                                asset.state === 'Under Maintenance' ? colors.status.maintenance :
                                asset.state === 'Lost' ? colors.status.lost :
                                asset.state === 'Retired' ? colors.status.retired :
                                colors.status.disposed
                            }}
                          >
                            {asset.state === 'Under Maintenance' ? 'Maintenance' : asset.state}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="w-full max-w-5xl border-t border-border-soft pt-6 flex items-center justify-between text-xs text-text-muted">
        <div>
          StateRail Component · Standalone & Reusable
        </div>
        <div className="font-mono text-[10px]">
          Framer Motion · SVG drawing · Tailwind CSS
        </div>
      </footer>
    </div>
  )
}
