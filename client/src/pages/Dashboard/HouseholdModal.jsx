import { useState, useEffect } from 'react'
import { getHouseholdMembers, createHousehold, joinHousehold, leaveHousehold } from '../../api/household'
import { useAuth } from '../../context/AuthContext'

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

  useEffect(() => {
    if (isOpen) {
      loadData()
    } else {
      setErrorMsg('')
      setInviteCode('')
      setNewName('')
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
      alert('Kode undangan berhasil disalin!')
    }
  }

  if (!isOpen) return null

  const inputClass = `w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${t.modalInput}`
  
  // Determine if it is a default solo household or active shared household
  // If members count is 1 AND owner_id === user.id AND household name === `Dapur ${user.name}`, we can assume it's default
  // Wait, user might just have an empty shared household. We will just always show "Gabung / Buat" if they are the only member and it's their own.
  const isDefaultSolo = data.members.length === 1 && data.household?.owner_id === user.id

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl relative border ${t.modal}`}>
        <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <button onClick={onClose} className={`absolute top-4 right-4 text-lg leading-none ${t.modalClose}`}>✕</button>
        
        <h3 className={`text-lg font-black mb-1 ${t.modalTitle}`}>👨‍👩‍👧 Dapur Keluarga</h3>
        
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="mt-4">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                {errorMsg}
              </div>
            )}

            {isDefaultSolo ? (
              // Tampilan jika masih di dapur mandiri
              <div className="flex flex-col gap-5">
                <p className={`text-xs ${t.modalSub}`}>Anda saat ini berada di dapur mandiri. Anda dapat mengundang orang lain, bergabung ke dapur lain, atau membuat dapur keluarga baru.</p>
                
                {/* Info Dapur Sendiri */}
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs font-bold mb-1 ${t.modalLabel}`}>Dapur Anda Saat Ini:</p>
                  <div className="flex justify-between items-center">
                    <span className={`font-black ${t.modalTitle}`}>{data.household?.name}</span>
                    <button onClick={handleCopy} className={`text-[10px] px-2 py-1 rounded-lg border font-bold ${isDark ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-gray-300'}`}>
                      Copy Kode: {data.household?.invite_code}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className={`flex rounded-xl p-1 gap-1 border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-200'}`}>
                    <button onClick={() => { setActiveTab('join'); setErrorMsg('') }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'join' ? (isDark ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white shadow-sm') : (isDark ? 'text-stone-400' : 'text-gray-500')}`}>
                      Gabung Dapur
                    </button>
                    <button onClick={() => { setActiveTab('create'); setErrorMsg('') }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'create' ? (isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white shadow-sm') : (isDark ? 'text-stone-400' : 'text-gray-500')}`}>
                      Buat Dapur
                    </button>
                  </div>

                  {activeTab === 'join' ? (
                    <form onSubmit={handleJoin} className={`p-4 rounded-2xl border mt-2 ${isDark ? 'border-zinc-700 bg-zinc-800/30' : 'border-gray-200 bg-white'}`}>
                      <label className={`block font-bold text-xs mb-2 ${t.modalLabel}`}>Gabung Dapur Lain</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Masukkan Invite Code" value={inviteCode}
                          onChange={e => setInviteCode(e.target.value)} className={inputClass} required />
                        <button type="submit" disabled={actionLoading}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl whitespace-nowrap disabled:opacity-50 transition-all">
                          Gabung
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleCreate} className={`p-4 rounded-2xl border mt-2 ${isDark ? 'border-zinc-700 bg-zinc-800/30' : 'border-gray-200 bg-white'}`}>
                      <label className={`block font-bold text-xs mb-2 ${t.modalLabel}`}>Buat Dapur Keluarga Baru</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Nama Dapur Baru" value={newName}
                          onChange={e => setNewName(e.target.value)} className={inputClass} required />
                        <button type="submit" disabled={actionLoading}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl whitespace-nowrap disabled:opacity-50 transition-all">
                          Buat Baru
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              // Tampilan jika sudah ada di dapur keluarga (anggota > 1 atau bukan owner)
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${isDark ? 'bg-orange-950/20 border-orange-900/50' : 'bg-orange-50 border-orange-200'}`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Dapur Aktif</p>
                    <h4 className={`text-base font-black ${t.modalTitle}`}>{data.household?.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold mb-1 ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>Invite Code</p>
                    <button onClick={handleCopy} className={`text-xs px-2.5 py-1 rounded-lg border font-black transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-zinc-800 border-zinc-600 text-stone-200' : 'bg-white border-gray-300 text-gray-700'}`}>
                      {data.household?.invite_code} 📋
                    </button>
                  </div>
                </div>

                <div>
                  <h5 className={`text-xs font-bold mb-2 ${t.modalLabel}`}>Anggota Dapur ({data.members.length})</h5>
                  <div className={`rounded-xl border divide-y overflow-hidden max-h-48 overflow-y-auto ${isDark ? 'border-zinc-700 divide-zinc-700' : 'border-gray-200 divide-gray-100'}`}>
                    {data.members.map(m => (
                      <div key={m.id} className={`flex justify-between items-center px-4 py-3 ${isDark ? 'bg-zinc-800/30' : 'bg-gray-50'}`}>
                        <div>
                          <p className={`text-sm font-bold ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>
                            {m.name} {m.id === user.id ? '(Anda)' : ''}
                          </p>
                          <p className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>{m.email}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${
                          m.role === 'owner' 
                            ? (isDark ? 'bg-orange-900/30 border-orange-700 text-orange-400' : 'bg-orange-100 border-orange-300 text-orange-700')
                            : (isDark ? 'bg-zinc-700 border-zinc-600 text-stone-300' : 'bg-white border-gray-300 text-gray-600')
                        }`}>
                          {m.role === 'owner' ? 'Owner' : 'Anggota'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-2 pt-4 border-t border-dashed border-gray-300 dark:border-zinc-700">
                  {data.household?.owner_id === user.id ? (
                    <p className={`text-xs text-center ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>
                      Anda adalah Owner dapur ini. (Fitur transfer owner belum tersedia).
                    </p>
                  ) : (
                    <button onClick={handleLeave} disabled={actionLoading} className={`w-full py-3 font-bold rounded-xl text-sm transition-all active:scale-95 border ${isDark ? 'bg-red-950/30 border-red-900/50 text-red-400 hover:bg-red-900/50' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'} disabled:opacity-50`}>
                      {actionLoading ? 'Memproses...' : 'Keluar dari Dapur'}
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
