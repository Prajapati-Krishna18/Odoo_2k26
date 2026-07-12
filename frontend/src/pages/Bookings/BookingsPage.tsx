import { useState } from 'react'
import {
  CalendarClock,
  Monitor,
  Car,
  Wrench as WrenchIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Clock,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type ResourceType = 'Room' | 'Vehicle' | 'Equipment'
type BookingStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'

interface Resource {
  id: string
  name: string
  type: ResourceType
  location: string
}

interface Booking {
  id: string
  resourceId: string
  date: string
  start: string
  end: string
  bookedBy: string
  status: BookingStatus
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const RESOURCES: Resource[] = [
  { id: 'r1', name: 'Conference Room A', type: 'Room', location: 'HQ Floor 3' },
  { id: 'r2', name: 'Boardroom Suite', type: 'Room', location: 'HQ Floor 5' },
  { id: 'r3', name: 'Toyota Innova #1', type: 'Vehicle', location: 'Parking B' },
  { id: 'r4', name: 'Ford Transit Van', type: 'Vehicle', location: 'Parking B' },
  { id: 'r5', name: 'Rally Plus Camera Kit', type: 'Equipment', location: 'AV Store' },
  { id: 'r6', name: 'Portable Projector', type: 'Equipment', location: 'AV Store' },
]

const TODAY = new Date('2026-07-12')
const fmtDate = (d: Date) => d.toISOString().substring(0, 10)
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', resourceId: 'r1', date: fmtDate(TODAY), start: '09:00', end: '11:00', bookedBy: 'Sarah Chen', status: 'Ongoing' },
  { id: 'b2', resourceId: 'r1', date: fmtDate(TODAY), start: '14:00', end: '16:00', bookedBy: 'Vikram Singh', status: 'Upcoming' },
  { id: 'b3', resourceId: 'r2', date: fmtDate(TODAY), start: '10:00', end: '12:00', bookedBy: 'Neha Gupta', status: 'Upcoming' },
  { id: 'b4', resourceId: 'r3', date: fmtDate(addDays(TODAY, 1)), start: '08:00', end: '18:00', bookedBy: 'Rajiv Kumar', status: 'Upcoming' },
  { id: 'b5', resourceId: 'r5', date: fmtDate(addDays(TODAY, -1)), start: '13:00', end: '15:00', bookedBy: 'Aarav Mehta', status: 'Completed' },
  { id: 'b6', resourceId: 'r6', date: fmtDate(addDays(TODAY, 2)), start: '09:00', end: '10:30', bookedBy: 'Priya Sharma', status: 'Upcoming' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ICON_MAP: Record<ResourceType, typeof Monitor> = {
  Room: Monitor,
  Vehicle: Car,
  Equipment: WrenchIcon,
}

const STATUS_COLOR: Record<BookingStatus, string> = {
  Upcoming: 'var(--status-reserved)',
  Ongoing: 'var(--accent-cyan)',
  Completed: 'var(--status-available)',
  Cancelled: 'var(--status-retired)',
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

function getWeekStart(d: Date): Date {
  const s = new Date(d)
  s.setDate(d.getDate() - d.getDay())
  return s
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function overlaps(start1: string, end1: string, start2: string, end2: string) {
  return timeToMinutes(start1) < timeToMinutes(end2) && timeToMinutes(end1) > timeToMinutes(start2)
}

// ─── Status Pill ───────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: BookingStatus }) {
  const c = STATUS_COLOR[status]
  return (
    <span style={{ padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', background: `${c}18`, color: c, border: `1.5px solid ${c}30` }}>
      {status}
    </span>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ message, cta }: { message: string; cta?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 8, color: 'var(--text-muted)' }}>
      <CalendarClock size={28} style={{ opacity: 0.35 }} />
      <p style={{ fontSize: '0.82rem', textAlign: 'center' }}>{message}</p>
      {cta && <p style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{cta}</p>}
    </div>
  )
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS)
  const [selResourceId, setSelResourceId] = useState('r1')
  const [weekStart, setWeekStart] = useState(() => getWeekStart(TODAY))

  // Book panel state
  const [showPanel, setShowPanel] = useState(false)
  const [bkDate, setBkDate] = useState(fmtDate(TODAY))
  const [bkStart, setBkStart] = useState('09:00')
  const [bkEnd, setBkEnd] = useState('10:00')

  const selResource = RESOURCES.find(r => r.id === selResourceId)!

  // Week days array
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Bookings for selected resource this week
  const weekBookings = bookings.filter(b =>
    b.resourceId === selResourceId &&
    b.date >= fmtDate(weekDays[0]) &&
    b.date <= fmtDate(weekDays[6])
  )

  // Conflict detection for new booking
  const conflictBooking = bookings.find(b =>
    b.resourceId === selResourceId &&
    b.date === bkDate &&
    overlaps(bkStart, bkEnd, b.start, b.end)
  )
  const isValidTime = timeToMinutes(bkEnd) > timeToMinutes(bkStart)

  const handleBook = () => {
    if (conflictBooking || !isValidTime) return
    setBookings([...bookings, {
      id: `b${bookings.length + 1}`, resourceId: selResourceId, date: bkDate,
      start: bkStart, end: bkEnd, bookedBy: 'Priya Sharma', status: 'Upcoming',
    }])
    setShowPanel(false)
  }

  const handleCancel = (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' as BookingStatus } : b))
  }

  // Grid cell fill: does this resource have a booking at this day/hour?
  function getCellBooking(dayDate: Date, hour: string) {
    const d = fmtDate(dayDate)
    const hMin = timeToMinutes(hour)
    return weekBookings.find(b =>
      b.date === d &&
      timeToMinutes(b.start) <= hMin &&
      timeToMinutes(b.end) > hMin
    )
  }

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Resource Booking</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Book rooms, vehicles, and equipment for fixed time slots.</p>
        </div>
        <button onClick={() => setShowPanel(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
          <CalendarClock size={15} /> Book Resource
        </button>
      </div>

      {/* ── Resource Selector ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {RESOURCES.map(r => {
          const Icon = ICON_MAP[r.type]
          const isSelected = r.id === selResourceId
          return (
            <button key={r.id} onClick={() => setSelResourceId(r.id)}
              style={{ background: isSelected ? 'var(--bg-surface-raised)' : 'var(--bg-surface)', border: `1.5px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-soft)'}`, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}>
              <Icon size={16} style={{ color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)', marginBottom: 6 }} />
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{r.type} · {r.location}</p>
            </button>
          )
        })}
      </div>

      {/* ── Week/Day Grid ─────────────────────────────────────── */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {selResource.name}
            </h3>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {fmtDate(weekDays[0])} — {fmtDate(weekDays[6])}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setWeekStart(addDays(weekStart, -7))} aria-label="Previous week"
              style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setWeekStart(getWeekStart(TODAY))}
              style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Today
            </button>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))} aria-label="Next week"
              style={{ background: 'var(--bg-void)', border: '1px solid var(--border-soft)', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(7, 1fr)`, minWidth: 700 }}>
            {/* Header row */}
            <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border-soft)', borderRight: '1px solid var(--border-soft)' }} />
            {weekDays.map(d => {
              const isToday = fmtDate(d) === fmtDate(TODAY)
              return (
                <div key={fmtDate(d)} style={{ padding: '8px 4px', borderBottom: '1px solid var(--border-soft)', borderRight: '1px solid var(--border-soft)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{WEEK_DAYS[d.getDay()]}</p>
                  <p style={{ fontSize: '0.78rem', fontFamily: 'var(--font-data)', fontWeight: 600, color: isToday ? 'var(--accent-cyan)' : 'var(--text-primary)', background: isToday ? 'rgba(12,202,200,0.12)' : 'transparent', borderRadius: 2, padding: '0 4px' }}>
                    {d.getDate()}
                  </p>
                </div>
              )
            })}

            {/* Hour rows */}
            {HOURS.map(hour => (
              <>
                <div key={`h-${hour}`} style={{ padding: '0 8px', borderBottom: '1px solid var(--border-soft)', borderRight: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', minHeight: 36 }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>{hour}</span>
                </div>
                {weekDays.map(d => {
                  const bk = getCellBooking(d, hour)
                  return (
                    <div key={`${fmtDate(d)}-${hour}`}
                      style={{ borderBottom: '1px solid var(--border-soft)', borderRight: '1px solid var(--border-soft)', minHeight: 36, position: 'relative', background: bk ? `rgba(12,202,200,${bk.status === 'Completed' ? 0.05 : 0.15})` : 'transparent', transition: 'background 0.1s' }}>
                      {bk && (
                        <div style={{ position: 'absolute', inset: 1, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                          <span style={{ fontSize: '0.55rem', color: 'var(--accent-cyan)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bk.bookedBy}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bookings Table ────────────────────────────────────── */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>All Bookings</h3>
        </div>
        {bookings.length === 0
          ? <EmptyState message="No bookings yet. Book a resource above to get started." />
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 620 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 16px' }}>Resource</th>
                    <th style={{ padding: '10px 16px' }}>Date</th>
                    <th style={{ padding: '10px 16px' }}>Time Range</th>
                    <th style={{ padding: '10px 16px' }}>Booked By</th>
                    <th style={{ padding: '10px 16px' }}>Status</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.78rem' }}>
                  {bookings.map(b => {
                    const res = RESOURCES.find(r => r.id === b.resourceId)
                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{res?.name}</td>
                        <td style={{ padding: '10px 16px', fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>{b.date}</td>
                        <td style={{ padding: '10px 16px', fontFamily: 'var(--font-data)', color: 'var(--text-primary)' }}>{b.start} – {b.end}</td>
                        <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{b.bookedBy}</td>
                        <td style={{ padding: '10px 16px' }}><StatusPill status={b.status} /></td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {b.status === 'Upcoming' && (
                            <button onClick={() => handleCancel(b.id)}
                              style={{ background: 'none', border: '1px solid var(--border-soft)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.68rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <X size={10} /> Cancel
                            </button>
                          )}
                          {b.status !== 'Upcoming' && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {/* ── Book Resource Panel (Modal) ───────────────────────── */}
      {showPanel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120 }}>
          <div className="panel" style={{ width: 'min(420px, 92vw)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarClock size={16} style={{ color: 'var(--accent-cyan)' }} /> Book Resource
              </h3>
              <button onClick={() => setShowPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Resource</label>
              <select value={selResourceId} onChange={e => setSelResourceId(e.target.value)} className="af-select">
                {RESOURCES.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</label>
              <input type="date" value={bkDate} onChange={e => setBkDate(e.target.value)} className="af-input" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Start Time</label>
                <input type="time" value={bkStart} onChange={e => setBkStart(e.target.value)} className="af-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>End Time</label>
                <input type="time" value={bkEnd} onChange={e => setBkEnd(e.target.value)} className="af-input" />
              </div>
            </div>

            {!isValidTime && (
              <p style={{ fontSize: '0.72rem', color: 'var(--status-lost)' }}>End time must be after start time.</p>
            )}

            {conflictBooking && isValidTime && (
              <div style={{ padding: '10px 14px', background: 'rgba(227,168,87,0.08)', border: `1.5px solid var(--status-reserved)`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={14} style={{ color: 'var(--status-reserved)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                    Conflicts with <strong>{conflictBooking.bookedBy}</strong>'s booking
                  </p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{conflictBooking.start} – {conflictBooking.end}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowPanel(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cancel</button>
              <button onClick={handleBook} disabled={!!conflictBooking || !isValidTime}
                style={{ padding: '7px 18px', background: 'var(--bg-surface-raised)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: conflictBooking || !isValidTime ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600, opacity: conflictBooking || !isValidTime ? 0.5 : 1 }}>
                <Clock size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
