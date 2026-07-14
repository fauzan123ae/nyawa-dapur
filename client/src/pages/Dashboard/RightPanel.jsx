import { FlameIcon, ShoppingBagIcon } from './icons'

// =============================================
// RIGHT PANEL — Api Dapur, Toko, Misi
// =============================================
export default function RightPanel({ t, isDark, user, isFireLit, flameLevel, quests, onBuyFirewood, onIgniteWood, onClaimQuest }) {
  return (
    <aside className="flex flex-col gap-5">

      {/* FIRE WIDGET */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 text-center items-center border relative overflow-hidden ${isFireLit ? t.fireWidget.on : t.fireWidget.off}`}>
        {isFireLit && isDark && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />}
        <div className="flex flex-col items-center">
          <span className={`text-xs font-black uppercase tracking-widest mb-3 ${t.fireLabel}`}>Energi Api Kompor</span>
          <div className={`relative p-5 rounded-full border-4 transition-all duration-500 ${isFireLit ? t.fireRing.on : t.fireRing.off}`}>
            
            {/* Wrapper Emoji Api Hijau */}
            <div 
              className={`text-6xl sm:text-7xl flex items-center justify-center transition-all duration-500 ${isFireLit ? 'animate-pulse scale-110' : 'opacity-40 grayscale'}`}
              style={{ 
                filter: isFireLit ? 'hue-rotate(110deg) saturate(1.4) brightness(1.1)' : 'grayscale(100%)' 
              }}
            >
              🔥
            </div>

            {isFireLit && (
              <>
                <span className="absolute text-sm animate-ping top-2 right-2 opacity-75">🌿</span>
                <span className="absolute text-xs animate-bounce top-10 left-2" style={{ animationDelay: '0.2s' }}>✨</span>
                <span className="absolute text-xs animate-bounce bottom-3 right-5" style={{ animationDelay: '0.5s' }}>🔥</span>
              </>
            )}
          </div>
        </div>
        <div className="w-full z-10">
          <h3 className={`text-2xl sm:text-3xl font-black ${t.streakNum}`}>{user.currentStreak || 0} Hari Streak</h3>
          <div className="text-xs mt-2 min-h-[40px] flex flex-col justify-center items-center gap-2">
            {isFireLit ? (
              <span className={`font-bold flex items-center gap-1.5 ${t.fireOnMsg}`}>✨ Api dapur menyala! Ekosistem terjaga.</span>
            ) : (
              <>
                <span className={`font-bold ${t.fireOffMsg}`}>Api meredup. Masak atau gunakan kayu bakar!</span>
                {user.firewood > 0 && (
                  <button onClick={onIgniteWood} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all active:scale-95 ${t.igniteBtn}`}>
                    🪵 Lempar Kayu Bakar (-1 Kayu)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className={`w-full rounded-2xl p-3 sm:p-4 text-left border z-10 ${t.levelBox}`}>
          <h4 className={`text-xs font-bold uppercase mb-2 tracking-wide ${t.levelLabel}`}>Tingkatan Energi</h4>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            {[['Spark','1-6 Hari'],['Blaze','7-29 Hari'],['Mythic Flame','30+ Hari']].map(([lvl, range]) => (
              <div key={lvl} className={`p-2 rounded-xl border transition-all font-semibold ${flameLevel === lvl && isFireLit ? t.levelOn : t.levelOff}`}>
                <span className="block font-bold">{lvl === 'Mythic Flame' ? 'Mythic' : lvl}</span>
                <span className="opacity-70">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SHOP */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border ${t.shopCard}`}>
        <h3 className={`text-base font-black flex items-center gap-2 ${t.shopTitle}`}>
          <ShoppingBagIcon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} /> Toko Ekosistem Dapur
        </h3>
        <div className={`rounded-2xl p-4 flex justify-between items-center gap-4 border ${t.shopInner}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl border shrink-0 ${t.shopIcon}`}>🪵</div>
            <div>
              <h4 className={`text-xs font-black ${t.shopTitle}`}>Kayu Bakar Cadangan</h4>
              <p className={`text-[10px] mt-0.5 ${t.shopSub}`}>Jaga api saat tidak sempat memasak.</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`block text-xs font-black mb-1 ${t.shopXp}`}>50 XP</span>
            <button onClick={onBuyFirewood} disabled={user.xp < 50}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all active:scale-95 ${user.xp >= 50 ? t.shopBtnOn : t.shopBtnOff}`}>
              Tukar
            </button>
          </div>
        </div>
      </div>

      {/* QUESTS */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border ${t.questCard}`}>
        <h3 className={`text-base font-black ${t.questTitle}`}>📜 Misi Ekologi Harian</h3>
        <div className="flex flex-col gap-2">
          {quests.length === 0 ? (
            <p className={`text-xs text-center py-4 ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Belum ada misi hari ini.</p>
          ) : quests.map(q => {
            const completed = q.isCompleted || q.is_completed
            const canClaim  = q.canClaim === true
            return (
              <div key={q.id} className={`border rounded-2xl p-3 sm:p-4 transition-all ${completed ? t.questItem.done : t.questItem.todo}`}>
                <div className="flex flex-col gap-2">
                  <p className={`text-xs font-semibold ${t.questDesc}`}>{q.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold ${t.questXp}`}>+{q.xpReward || q.xp_reward} XP</span>
                    {completed ? (
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${t.questDone}`}>✅ Diklaim</span>
                    ) : canClaim ? (
                      <button onClick={() => onClaimQuest(q.type, q.id)} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all active:scale-95 ${t.questClaim}`}>🎁 Klaim</button>
                    ) : (
                      <button disabled className={`px-3 py-1 rounded-lg text-[10px] font-black ${t.questLock}`}>🔒 Belum</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </aside>
  )
}