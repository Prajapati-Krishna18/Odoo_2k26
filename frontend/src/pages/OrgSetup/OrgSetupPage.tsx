import { useState, useEffect } from 'react'
import {
  Building2,
  FolderTree,
  Users,
  ShieldPlus,
  Plus,
  Trash2,
  Lock,
  ShieldAlert,
  Info,
} from 'lucide-react'
import { useAuth, type UserRole } from '@/context/AuthContext'
import { orgApi } from '@/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Department {
  id: string
  name: string
  head: string
  parentDept: string
  employeeCount: number
  status: 'Active' | 'Inactive'
}

interface AssetCategory {
  id: string
  name: string
  customFields: { key: string; value: string }[]
}

interface Employee {
  id: string
  name: string
  email: string
  department: string
  role: UserRole
  status: 'Active' | 'Inactive'
}

// Mock data has been removed to enforce database flow.

export default function OrgSetupPage() {
  const { user } = useAuth()

  // Gating access checks
  if (user.role !== 'Admin') {
    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              border: '1px solid var(--border-soft)',
              padding: '3px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.08em',
            }}
          >
            <Lock size={12} />
            RESTRICTED
          </div>
        </div>

        <div className="panel" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48, borderStyle: 'dashed' }}>
          <div style={{ width: 52, height: 52, border: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-lost)' }}>
            <Lock size={22} />
          </div>
          <div style={{ textAlign: 'center', maxWidth: 380 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              Access Denied
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Organization Setup is restricted to users with the <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Admin</span> role. 
              Use the dev switcher in the sidebar footer to change your role for previewing.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <AdminOrgSetup />
}

// ─── Admin View Component ─────────────────────────────────────────────────────

function AdminOrgSetup() {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments')

  // Tab A state
  const [depts, setDepts] = useState<Department[]>([])
  const [showAddDept, setShowAddDept] = useState(false)
  const [newDept, setNewDept] = useState({ name: '', head: '', parentDept: '', status: 'Active' as 'Active' | 'Inactive' })

  // Tab B state
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatFields, setNewCatFields] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }])

  // Tab C state
  const [employees, setEmployees] = useState<Employee[]>([])
  const [rolePromoteEmp, setRolePromoteEmp] = useState<Employee | null>(null)
  const [promoteTargetRole, setPromoteTargetRole] = useState<UserRole>('Employee')

  const fetchAllData = () => {
    Promise.all([orgApi.getDepartments(), orgApi.getCategories(), orgApi.getEmployees()])
      .then(([deptData, catData, empData]) => {
        const mappedDepts = deptData.map((d) => ({
          id: d.id,
          name: d.name,
          head: d.headName || 'No Head Assigned',
          parentDept: d.parentDept || '',
          employeeCount: d._count?.users || 0,
          status: d.status === 'INACTIVE' ? 'Inactive' : ('Active' as any),
        }))
        setDepts(mappedDepts)

        const mappedCats = catData.map((c) => ({
          id: c.id,
          name: c.name,
          customFields: (c.customFields || []) as any,
        }))
        setCategories(mappedCats)

        const mappedEmps = empData.map((e) => ({
          id: e.id,
          name: e.fullName,
          email: e.email,
          department: e.department?.name || 'Operations',
          role: (e.role === 'ADMIN' ? 'Admin' : e.role === 'ASSET_MANAGER' ? 'Asset Manager' : e.role === 'DEPARTMENT_HEAD' ? 'Department Head' : 'Employee') as any,
          status: e.status === 'INACTIVE' ? 'Inactive' : ('Active' as any),
        }))
        setEmployees(mappedEmps)
      })
      .catch((err) => {
        console.error('Failed to load setup page details:', err)
      })
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // ── Handlers ──
  
  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDept.name) return
    try {
      const headId = employees.find((emp) => emp.name === newDept.head)?.id
      const parentId = depts.find((d) => d.name === newDept.parentDept)?.id
      const code = newDept.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900)

      await orgApi.createDepartment({
        name: newDept.name,
        code,
        departmentHeadId: headId || undefined,
        parentDepartmentId: parentId || undefined,
      })
      fetchAllData()
      setNewDept({ name: '', head: '', parentDept: '', status: 'Active' })
      setShowAddDept(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddCatField = () => {
    setNewCatFields([...newCatFields, { key: '', value: '' }])
  }

  const handleRemoveCatField = (index: number) => {
    const fields = [...newCatFields]
    fields.splice(index, 1)
    setNewCatFields(fields)
  }

  const handleCatFieldChange = (index: number, kOrV: 'key' | 'value', text: string) => {
    const fields = [...newCatFields]
    fields[index][kOrV] = text
    setNewCatFields(fields)
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName) return
    try {
      const filteredFields = newCatFields.filter((f) => f.key.trim() !== '')
      await orgApi.createCategory({
        name: newCatName,
        customFields: filteredFields,
      })
      fetchAllData()
      setNewCatName('')
      setNewCatFields([{ key: '', value: '' }])
      setShowAddCat(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleConfirmPromotion = async () => {
    if (!rolePromoteEmp) return
    try {
      const dbRole = promoteTargetRole === 'Admin' ? 'ADMIN' : promoteTargetRole === 'Asset Manager' ? 'ASSET_MANAGER' : promoteTargetRole === 'Department Head' ? 'DEPARTMENT_HEAD' : 'EMPLOYEE'
      await orgApi.promoteEmployee(rolePromoteEmp.id, dbRole)
      fetchAllData()
      setRolePromoteEmp(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
      
      {/* ── Heading ── */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Organization Setup
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Manage administrative directories, departments, categorization structures, and roles mapping.
        </p>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', gap: 20 }}>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'departments' ? 'border-status-available text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Building2 size={13} />
          Departments
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'categories' ? 'border-status-available text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <FolderTree size={13} />
          Asset Categories
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'employees' ? 'border-status-available text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Users size={13} />
          Employee Directory
        </button>
      </div>

      {/* ── Tab Layout Content ── */}
      <div>

        {/* ─── TAB A: DEPARTMENTS ─── */}
        {activeTab === 'departments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Manage organizational divisions and division leads.</span>
              <button
                onClick={() => setShowAddDept(true)}
                className="panel flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-xs font-semibold text-text-primary bg-bg-surface-raised hover:border-status-available/50 transition-all"
              >
                <Plus size={13} style={{ color: 'var(--accent-cyan)' }} />
                Add Department
              </button>
            </div>

            {/* List Table */}
            <div className="panel overflow-hidden">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 20px' }}>Dept Name</th>
                    <th style={{ padding: '12px 20px' }}>Department Head</th>
                    <th style={{ padding: '12px 20px' }}>Parent Department</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>Employee Count</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.78rem' }}>
                  {depts.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</td>
                      <td style={{ padding: '12px 20px' }}>{d.head}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{d.parentDept || '—'}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontFamily: 'var(--font-data)' }}>{d.employeeCount}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: d.status === 'Active' ? 'rgba(47,166,107,0.12)' : 'rgba(107,114,128,0.12)',
                            color: d.status === 'Active' ? 'var(--status-available)' : 'var(--text-muted)',
                            border: `1.5px solid ${d.status === 'Active' ? 'rgba(47,166,107,0.2)' : 'rgba(107,114,128,0.2)'}`,
                          }}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal: Add Department */}
            {showAddDept && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
                <form onSubmit={handleAddDept} className="panel" style={{ width: 'min(420px, 90vw)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: 0 }}>Add New Department</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Department Name</label>
                    <input
                      type="text"
                      required
                      value={newDept.name}
                      onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                      style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Department Head</label>
                    <select
                      value={newDept.head}
                      onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                      required
                      style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="">-- Select Employee Head --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>{emp.name} ({emp.department})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Parent Department</label>
                    <select
                      value={newDept.parentDept}
                      onChange={(e) => setNewDept({ ...newDept, parentDept: e.target.value })}
                      style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="">-- Select Parent Department (Optional) --</option>
                      <option value="Technology Group">Technology Group</option>
                      <option value="Corporate Operations">Corporate Operations</option>
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      {depts.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</label>
                    <select
                      value={newDept.status}
                      onChange={(e) => setNewDept({ ...newDept, status: e.target.value as 'Active' | 'Inactive' })}
                      style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 5, fontSize: '0.78rem', color: 'var(--text-primary)' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setShowAddDept(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel</button>
                    <button type="submit" className="panel" style={{ padding: '6px 16px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.78rem' }}>Save</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB B: ASSET CATEGORIES ─── */}
        {activeTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Specify category schemas and dynamic field variables.</span>
              <button
                onClick={() => setShowAddCat(true)}
                className="panel flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-xs font-semibold text-text-primary bg-bg-surface-raised hover:border-status-available/50 transition-all"
              >
                <Plus size={13} style={{ color: 'var(--accent-cyan)' }} />
                Add Category
              </button>
            </div>

            {/* List with inline custom fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categories.map((cat) => {
                return (
                  <div key={cat.id} className="panel" style={{ overflow: 'hidden' }}>
                    <div
                      style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-raised)' }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{cat.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{cat.customFields.length} attributes configured</span>
                    </div>
                    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                        {cat.customFields.map((f, idx) => (
                          <div key={idx} style={{ padding: '8px 12px', border: '1px solid var(--border-soft)', background: 'var(--bg-void)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{f.key}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal: Add Category */}
            {showAddCat && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', zIndex: 120, justifyContent: 'center' }}>
                <form onSubmit={handleAddCategory} className="panel" style={{ width: 'min(460px, 95vw)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: 0 }}>Create Asset Category</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smart Devices"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Custom Fields / Attributes (Optional)</label>
                      <button
                        type="button"
                        onClick={handleAddCatField}
                        style={{ border: 'none', background: 'none', color: 'var(--accent-cyan)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                      >
                        <Plus size={11} /> Add Field
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto', paddingRight: 4 }}>
                      {newCatFields.map((field, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Field Key (e.g. Warranty Period)"
                            value={field.key}
                            onChange={(e) => handleCatFieldChange(idx, 'key', e.target.value)}
                            style={{ flex: 1, background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 6, fontSize: '0.76rem', color: 'var(--text-primary)' }}
                          />
                          <input
                            type="text"
                            placeholder="Default Value (e.g. 2 Years)"
                            value={field.value}
                            onChange={(e) => handleCatFieldChange(idx, 'value', e.target.value)}
                            style={{ flex: 1, background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 6, fontSize: '0.76rem', color: 'var(--text-primary)' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCatField(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-lost)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setShowAddCat(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel</button>
                    <button type="submit" className="panel" style={{ padding: '6px 16px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.78rem' }}>Save</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB C: EMPLOYEE DIRECTORY ─── */}
        {activeTab === 'employees' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Helper alert card */}
            <div className="panel" style={{ padding: '14px 18px', background: 'rgba(12,202,200,0.06)', border: '1.5px solid var(--accent-cyan)', display: 'flex', gap: 12 }}>
              <Info size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Role Assignment Policy</span>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  This directory is the <strong>ONLY</strong> place roles are ever assigned. Signup never lets a user pick a role; new users default to the Employee status.
                </p>
              </div>
            </div>

            {/* List Table */}
            <div className="panel overflow-hidden">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 20px' }}>Name</th>
                    <th style={{ padding: '12px 20px' }}>Email</th>
                    <th style={{ padding: '12px 20px' }}>Department</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center' }}>Role Access Tag</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 20px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.78rem' }}>
                  {employees.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</td>
                      <td style={{ padding: '12px 20px', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>{emp.email}</td>
                      <td style={{ padding: '12px 20px' }}>{emp.department}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background:
                              emp.role === 'Admin' ? 'rgba(12,202,200,0.12)' :
                              emp.role === 'Asset Manager' ? 'rgba(72,105,166,0.12)' :
                              emp.role === 'Department Head' ? 'rgba(227,168,87,0.12)' :
                              'rgba(143,163,150,0.12)',
                            color:
                              emp.role === 'Admin' ? 'var(--accent-cyan)' :
                              emp.role === 'Asset Manager' ? 'var(--status-allocated)' :
                              emp.role === 'Department Head' ? 'var(--status-reserved)' :
                              'var(--text-muted)',
                            border: `1.5px solid ${
                              emp.role === 'Admin' ? 'rgba(12,202,200,0.2)' :
                              emp.role === 'Asset Manager' ? 'rgba(72,105,166,0.2)' :
                              emp.role === 'Department Head' ? 'rgba(227,168,87,0.2)' :
                              'rgba(143,163,150,0.2)'
                            }`,
                          }}
                        >
                          {emp.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: emp.status === 'Active' ? 'rgba(47,166,107,0.12)' : 'rgba(107,114,128,0.12)',
                            color: emp.status === 'Active' ? 'var(--status-available)' : 'var(--text-muted)',
                            border: `1.5px solid ${emp.status === 'Active' ? 'rgba(47,166,107,0.2)' : 'rgba(107,114,128,0.2)'}`,
                          }}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => { setRolePromoteEmp(emp); setPromoteTargetRole(emp.role) }}
                          className="panel hover:bg-bg-surface-raised cursor-pointer"
                          style={{ padding: '4px 8px', background: 'none', border: '1px solid var(--border-soft)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--text-primary)' }}
                        >
                          <ShieldPlus size={11} style={{ color: 'var(--accent-cyan)' }} />
                          Promote
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal: Change Role Access */}
            {rolePromoteEmp && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', zIndex: 120, alignItems: 'center', justifyContent: 'center' }}>
                <div className="panel" style={{ width: 'min(420px, 90vw)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-cyan)' }}>
                    <ShieldAlert size={18} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: 0 }}>Promote / Assign Role</h3>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Assign a privileged role for <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{rolePromoteEmp.name}</span>.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Assign Access Role</label>
                    <select
                      value={promoteTargetRole}
                      onChange={(e) => setPromoteTargetRole(e.target.value as UserRole)}
                      style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: 8, fontSize: '0.8rem', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Department Head">Department Head</option>
                      <option value="Asset Manager">Asset Manager</option>
                      <option value="Admin">Admin (Full Privilege)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                    <button type="button" onClick={() => setRolePromoteEmp(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel</button>
                    <button type="button" onClick={handleConfirmPromotion} className="panel" style={{ padding: '6px 16px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.78rem' }}>Confirm Assignment</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  )
}
