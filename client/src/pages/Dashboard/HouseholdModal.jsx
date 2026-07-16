import { useState, useEffect } from 'react'
import { getHouseholdMembers, createHousehold, joinHousehold, leaveHousehold } from '../../api/household'
import { useAuth } from '../../context/AuthContext'
import { X, Copy, Users, LogOut, ChevronRight, Check } from 'lucide-react'

export default function HouseholdModal({ isOpen, onClose, t, isDark, onRefreshDashboard }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [data, setData] = useState({ members: [], household: null })
  
  // Forms
  const [activeTab, setActiveTab] = useState('join') // 'join' or 'create'
  const [inviteCode, setInviteCode] = useState('')
  const [newName, setNewName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    } else {
      setErrorMsg('')
      setInviteCode('')
      setNewName('')
      setCopied(false)
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      const res = await getHouseholdMembers()
      setData(res.data)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memuat data dapur.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName) return
    try {
      setActionLoading(true)
      setErrorMsg('')
      await createHousehold(newName)
      await loadData()
      onRefreshDashboard()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal membuat dapur.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!inviteCode) return
    try {
      setActionLoading(true)
      setErrorMsg('')
      await joinHousehold(inviteCode)
      await loadData()
      onRefreshDashboard()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal gabung dapur.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!window.confirm('Keluar dari dapur keluarga ini? Data inventaris Anda akan dikembalikan ke dapur mandiri yang baru.')) return
    try {
      setActionLoading(true)
      setErrorMsg('')
      await leaveHousehold()
      await loadData()
      onRefreshDashboard()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal keluar dapur.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopy = () => {
    if (data.household?.invite_code) {
      navigator.clipboard.writeText(data.household.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  const inputClass = `w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${t.modalInput}`
  const isDefaultSolo = data.members.length === 1 && data.household?.owner_id === user.id
  const now = new Date()

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-150 ${t.modalOverlay}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl relative border animate-[scaleUp_0.15s_ease-out] ${t.modal}`}>
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700 mx-auto mb-4" />
        <button onClick={onClose} className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${t.modalClose}`} aria-label="Tutup Modal">
          <X className="w-4 h-4" />
        </button>
        
        <h3 className={`text-lg font-black mb-1 flex items-center gap-2 ${t.modalTitle}`}>
          <Users className="w-5 h-5 text-primary" /> Dapur Keluarga
        </h3>
        
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="mt-4">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-xs font-bold border border-danger/20">
                {errorMsg}
              </div>
            )}

            {isDefaultSolo ? (
              <div className="flex flex-col gap-5">
                <p className={`text-xs leading-relaxed ${t.modalSub}`}>Anda saat ini berada di dapur mandiri. Mengundang anggota keluarga untuk mengelola stok bersama atau buat dapur keluarga baru!</p>
                
                {/* Monospace Invite Code Box */}
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/60 border-zinc-700' : 'bg-cream border-border'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${t.modalLabel}`}>Dapur Saat Ini</p>
                  <div className="flex justify-between items-center gap-2">
                    <span className={`font-black truncate ${t.modalTitle}`}>{data.household?.name}</span>
                    <button onClick={handleCopy} className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${isDark ? 'bg-[#222B27] border-[#34413B] text-stone-200' : 'bg-white border-border text-gray-700 shadow-sm'}`} aria-label="Salin Kode Undangan">
                      <span className="font-mono">{data.household?.invite_code}</span>
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className={`flex rounded-xl p-1 gap-1 border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-cream border-border'}`}>
                    <button onClick={() => { setActiveTab('join'); setErrorMsg('') }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === 'join' ? (isDark ? 'bg-accent/20 text-[#D8C3A5]' : 'bg-primary text-white shadow-sm') : (isDark ? 'text-stone-400' : 'text-gray-500')}`}>
                      Gabung Dapur
                    </button>
                    <button onClick={() => { setActiveTab('create'); setErrorMsg('') }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${activeTab === 'create' ? (isDark ? 'bg-[#7BAE7F] text-[#121714]' : 'bg-primary text-white shadow-sm') : (isDark ? 'text-stone-400' : 'text-gray-500')}`}>
                      Buat Dapur
                    </button>
                  </div>
 
                  {activeTab === 'join' ? (
                    <form onSubmit={handleJoin} className={`p-4 rounded-2xl border mt-2 animate-[fadeIn_0.15s_ease-out] ${isDark ? 'border-zinc-700 bg-zinc-800/30' : 'border-border bg-white'}`}>
                      <label className={`block font-bold text-xs mb-2.5 ${t.modalLabel}`}>Gabung Dapur Lain</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Masukkan Invite Code" value={inviteCode}
                          onChange={e => setInviteCode(e.target.value)} className={inputClass} required />
                        <button type="submit" disabled={actionLoading}
                          className="px-4 py-2.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-xl whitespace-nowrap disabled:opacity-50 transition-all duration-200 active:scale-95 shadow-sm">
                          Gabung
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleCreate} className={`p-4 rounded-2xl border mt-2 animate-[fadeIn_0.15s_ease-out] ${isDark ? 'border-zinc-700 bg-zinc-800/30' : 'border-border bg-white'}`}>
                      <label className={`block font-bold text-xs mb-2.5 ${t.modalLabel}`}>Buat Dapur Keluarga Baru</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Nama Dapur Baru" value={newName}
                          onChange={e => setNewName(e.target.value)} className={inputClass} required />
                        <button type="submit" disabled={actionLoading}
                          className="px-4 py-2.5 bg-primary hover:bg-secondary text-white text-xs font-bold rounded-xl whitespace-nowrap disabled:opacity-50 transition-all duration-200 active:scale-95 shadow-sm">
                          Buat Baru
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${isDark ? 'bg-zinc-900/60 border-zinc-700' : 'bg-cream border-border'}`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-[#7BAE7F]' : 'text-primary'}`}>Dapur Aktif</p>
                    <h4 className={`text-base font-black ${t.modalTitle}`}>{data.household?.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold mb-1 ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>Invite Code</p>
                    <button onClick={handleCopy} className={`text-xs px-2.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${isDark ? 'bg-zinc-800 border-zinc-600 text-stone-200' : 'bg-white border-border text-gray-700 shadow-sm'}`}>
                      <span className="font-mono">{data.household?.invite_code}</span>
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h5 className={`text-xs font-bold mb-2.5 flex items-center gap-1 ${t.modalLabel}`}>
                    <Users className="w-3.5 h-3.5" /> Anggota Dapur ({data.members.length})
                  </h5>
                  <div className={`rounded-xl border divide-y overflow-hidden max-h-48 overflow-y-auto ${isDark ? 'border-zinc-700 divide-zinc-700 bg-zinc-950/20' : 'border-border divide-gray-100 bg-[#F8F7F2]'}`}>
                    {data.members.map(m => {
                      const lastActive = m.last_active_at ? new Date(m.last_active_at) : null
                      const isActive = lastActive && (now - lastActive) < 24 * 60 * 60 * 1000
                      return (
                        <div key={m.id} className="flex justify-between items-center px-4 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Dot indicator */}
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-success' : 'bg-gray-400'}`} title={isActive ? 'Aktif 24 jam terakhir' : 'Tidak aktif hari ini'} />
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>
                                {m.name} {m.id === user.id ? '(Anda)' : ''}
                              </p>
                              <p className={`text-[9px] font-semibold truncate ${isDark ? 'text-stone-500' : 'text-muted'}`}>{m.email}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            m.role === 'owner' 
                              ? (isDark ? 'bg-[#7BAE7F]/10 border-[#7BAE7F]/30 text-[#7BAE7F]' : 'bg-primary/10 border-primary/20 text-primary')
                              : (isDark ? 'bg-zinc-800 border-zinc-700 text-stone-400' : 'bg-white border-border text-gray-500')
                          }`}>
                            {m.role === 'owner' ? 'Owner' : 'Anggota'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-2 pt-4 border-t border-dashed border-border">
                  {data.household?.owner_id === user.id ? (
                    <p className={`text-[10px] font-semibold text-center leading-relaxed ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>
                      Anda adalah Owner dapur ini. Kelola stok bahan makanan keluarga Anda secara kolaboratif.
                    </p>
                  ) : (
                    <button onClick={handleLeave} disabled={actionLoading} className="w-full py-2.5 font-bold rounded-xl text-xs transition-all duration-200 active:scale-95 border flex items-center justify-center gap-1.5 bg-danger/10 border-danger/20 text-danger hover:bg-danger/20 disabled:opacity-50" aria-label="Keluar dari Dapur Keluarga">
                      <LogOut className="w-3.5 h-3.5" /> {actionLoading ? 'Memproses...' : 'Keluar dari Dapur'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
