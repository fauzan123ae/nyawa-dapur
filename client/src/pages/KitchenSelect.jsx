import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyHouseholds, joinHousehold } from '../api/household'

export default function KitchenSelect() {
  const { user, activeHouseholdId, switchHousehold } = useAuth()
  const navigate = useNavigate()

  const [households, setHouseholds] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    loadHouseholds()
  }, [])

  const loadHouseholds = async () => {
    try {
      setLoading(true)
      const res = await getMyHouseholds()
      setHouseholds(res.data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (hh) => {
    switchHousehold(String(hh.id), hh.name)
    navigate('/dashboard')
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!inviteCode.trim()) return
    setJoining(true)
    setJoinError('')
    try {
      await joinHousehold(inviteCode.trim())
      setInviteCode('')
      await loadHouseholds()
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Gagal bergabung. Periksa kode undangan.')
    } finally {
      setJoining(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-emerald-400 mb-1">🏠 Pilih Dapur</h1>
          <p className="text-xs text-stone-400">Halo, {user.name}! Pilih dapur mana yang ingin kamu akses.</p>
        </div>

        {/* Kitchen List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {households.map((hh) => {
              const isActive = String(hh.id) === String(activeHouseholdId)
              const isPersonal = hh.is_personal === true || hh.is_personal === 't'
              return (
                <div
                  key={hh.id}
                  className={`bg-zinc-800 border rounded-2xl p-5 transition-all ${
                    isActive
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-zinc-700 hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-base font-black text-stone-100 truncate">{hh.name}</span>
                        {isPersonal ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-700/50 text-emerald-400">
                            Dapur Pribadi
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-900/40 border border-orange-700/50 text-orange-400">
                            Keluarga
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            Sedang Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                        <span>{hh.member_count} anggota</span>
                        <span>·</span>
                        <span className="capitalize">{hh.role === 'owner' ? 'Owner' : 'Anggota'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect(hh)}
                      disabled={isActive}
                      className={`shrink-0 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                        isActive
                          ? 'bg-zinc-700 text-stone-500 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                      }`}
                    >
                      {isActive ? 'Aktif' : 'Masuk'}
                    </button>
                  </div>
                </div>
              )
            })}

            {households.length === 0 && !loading && (
              <div className="text-center py-8 text-stone-500 text-sm">
                Belum ada dapur. Buat atau bergabung ke dapur keluarga.
              </div>
            )}
          </div>
        )}

        {/* Join Section */}
        <div className="mt-6 bg-zinc-800 border border-zinc-700 rounded-2xl p-5">
          <h3 className="text-sm font-black text-stone-200 mb-3">+ Gabung Dapur Baru</h3>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              required
            />
            <button
              type="submit"
              disabled={joining}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm flex items-center gap-2"
            >
              {joining && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {joining ? 'Joining...' : 'Join'}
            </button>
          </form>
          {joinError && (
            <div className="mt-3 text-red-400 text-xs bg-red-950/30 border border-red-900/40 p-3 rounded-xl">
              {joinError}
            </div>
          )}
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 w-full text-center text-xs text-stone-500 hover:text-stone-300 transition-colors py-2"
        >
          ← Kembali ke Dashboard
        </button>
      </div>
    </div>
  )
}
