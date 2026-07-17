import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyHouseholds, joinHousehold } from '../api/household'
import { Home, Users, ArrowLeft, ArrowRight, User, PlusCircle, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F8F7F2] dark:bg-[#1C1008] flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden">
      
      {/* Nature background details */}
      <div className="absolute top-10 left-10 text-primary/5 dark:text-[#F5A96A]/5 text-9xl pointer-events-none select-none">🍃</div>
      <div className="absolute bottom-10 right-10 text-primary/5 dark:text-[#F5A96A]/5 text-9xl pointer-events-none select-none">🌱</div>

      <div className="w-full max-w-lg z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-3xl bg-primary/10 dark:bg-[#F5A96A]/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Home className="w-7 h-7 text-primary dark:text-[#F5A96A]" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-[#F5E6D3] tracking-tight">Pilih Dapur Anda</h1>
          <p className="text-xs text-muted dark:text-[#C4956A] mt-1.5 max-w-sm mx-auto">Halo, {user.name}! Pilih dapur mana yang ingin Anda akses hari ini.</p>
        </div>

        {/* Kitchen List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {households.map((hh) => {
              const isActive = String(hh.id) === String(activeHouseholdId)
              const isPersonal = hh.is_personal === true || hh.is_personal === 't'
              return (
                <div
                  key={hh.id}
                  className={`bg-white dark:bg-[#261608] border rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isActive
                      ? 'border-primary dark:border-[#F5A96A] ring-2 ring-primary/10 dark:ring-[#F5A96A]/10 shadow-sm'
                      : 'border-[#E5E7EB] dark:border-[#4A2E18]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-base font-extrabold text-gray-800 dark:text-[#F5E6D3] truncate leading-none">{hh.name}</span>
                        {isPersonal ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:bg-[#F5A96A]/10 dark:border-[#F5A96A]/30 dark:text-[#F5A96A]">
                            Pribadi
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-secondary dark:bg-[#A3B18A]/10 dark:border-[#A3B18A]/30 dark:text-[#A3B18A]">
                            Keluarga
                          </span>
                        )}
                        {isActive && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-success text-white flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Sedang Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted dark:text-[#C4956A] font-semibold">
                        <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {hh.member_count} Anggota</span>
                        <span>·</span>
                        <span className="capitalize">{hh.role === 'owner' ? 'Owner' : 'Anggota'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelect(hh)}
                      disabled={isActive}
                      className={`shrink-0 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary ${
                        isActive
                          ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                          : 'bg-primary hover:bg-secondary text-white active:scale-95 shadow-sm'
                      }`}
                    >
                      Masuk <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}

            {households.length === 0 && !loading && (
              <div className="text-center py-10 border border-dashed border-border dark:border-[#4A2E18] rounded-2xl bg-white dark:bg-[#261608] p-6">
                <AlertCircle className="w-8 h-8 text-muted mx-auto mb-2.5 opacity-50" />
                <p className="text-xs font-bold text-muted dark:text-[#C4956A]">Belum ada dapur terdaftar. Buat atau gabung ke dapur keluarga.</p>
              </div>
            )}
          </div>
        )}

        {/* Join Section */}
        <div className="mt-6 bg-white dark:bg-[#261608] border border-[#E5E7EB] dark:border-[#4A2E18] rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-extrabold text-gray-800 dark:text-[#F5E6D3] mb-3 flex items-center gap-1">
            <PlusCircle className="w-4 h-4 text-primary" /> Gabung Dapur Baru
          </h3>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="flex-1 bg-[#F8F7F2] dark:bg-[#2E1C0E] border border-[#E5E7EB] dark:border-[#4A2E18] rounded-xl px-4 py-2.5 text-gray-800 dark:text-[#F5E6D3] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              required
            />
            <button
              type="submit"
              disabled={joining}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-accent disabled:opacity-50 text-white font-extrabold rounded-xl transition-all duration-200 active:scale-95 text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {joining && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Join</span>
            </button>
          </form>
          {joinError && (
            <div className="mt-3 text-danger text-xs bg-danger/10 border border-danger/20 p-3 rounded-xl font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{joinError}</span>
            </div>
          )}
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full text-center text-xs font-bold text-muted hover:text-primary transition-colors py-2 flex items-center justify-center gap-1 focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
        </button>
      </div>
    </div>
  )
}
