import { FlameIcon, ShoppingBagIcon } from './icons'
import { Flame, Trophy, Award, ShoppingBag, Sparkles, BookOpen } from 'lucide-react'

// =============================================
// RIGHT PANEL — Api Dapur, Toko, Misi
// =============================================
export default function RightPanel({ t, isDark, user, isFireLit, flameLevel, quests, onBuyFirewood, onIgniteWood, onClaimQuest }) {
  return (
    <aside className="flex flex-col gap-5">

      {/* FIRE WIDGET */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 text-center items-center border relative overflow-hidden transition-all duration-300 shadow-md ${isFireLit ? t.fireWidget.on : t.fireWidget.off}`}>
        {isFireLit && (
          <div className="absolute inset-0 bg-gradient-to-b from-success/5 to-transparent pointer-events-none animate-pulse" />
        )}
        
        {/* Subtle decorative leaf in background */}
        <div className="absolute -top-3 -right-3 text-primary/10 select-none pointer-events-none text-4xl">🍃</div>

        <div className="flex flex-col items-center w-full">
          <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${t.fireLabel}`}>
            <Sparkles className="w-3.5 h-3.5" /> Energi Api Kompor
          </span>
          <div className={`relative p-6 rounded-full border-4 transition-all duration-500 flex items-center justify-center ${isFireLit ? t.fireRing.on : t.fireRing.off}`}>
            <FlameIcon className={`w-16 h-16 ${isFireLit ? 'scale-110' : 'opacity-30'}`} level={flameLevel} isLit={isFireLit} />
            
            {isFireLit && (
              <>
                <span className="absolute text-sm animate-ping top-1 right-1 opacity-70">🌱</span>
                <span className="absolute text-xs animate-bounce top-8 left-1" style={{ animationDelay: '0.2s' }}>✨</span>
                <span className="absolute text-xs animate-bounce bottom-2 right-4" style={{ animationDelay: '0.4s' }}>🌼</span>
              </>
            )}
          </div>
        </div>

        <div className="w-full z-10">
          <h3 className={`text-2xl font-black tracking-tight ${t.streakNum}`}>
            {user.currentStreak || 0} Hari Streak
          </h3>
          <div className="text-xs mt-2 min-h-[45px] flex flex-col justify-center items-center gap-2">
            {isFireLit ? (
              <span className={`font-bold flex items-center gap-1 ${t.fireOnMsg}`}>
                ✨ Api kompor menyala hangat & segar!
              </span>
            ) : (
              <div className="flex flex-col items-center gap-1.5 w-full">
                <span className={`font-semibold ${t.fireOffMsg}`}>Api meredup hangatnya...</span>
                {user.firewood > 0 && (
                  <button onClick={onIgniteWood} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${t.igniteBtn}`} aria-label="Nyalakan Kompor">
                    🪵 Masukkan Kayu Bakar (-1)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tingkatan Energi */}
        <div className={`w-full rounded-2xl p-4 text-left border z-10 ${t.levelBox}`}>
          <h4 className={`text-[10px] font-bold uppercase mb-2.5 tracking-wider flex items-center gap-1 ${t.levelLabel}`}>
            <Flame className="w-3.5 h-3.5" /> Tingkatan Energi
          </h4>
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            {[['Spark','1-6 Hari'],['Blaze','7-29 Hari'],['Mythic Flame','30+ Hari']].map(([lvl, range]) => (
              <div key={lvl} className={`p-2 rounded-xl border transition-all duration-200 font-bold flex flex-col justify-center ${flameLevel === lvl && isFireLit ? t.levelOn : t.levelOff}`}>
                <span className="block">{lvl === 'Mythic Flame' ? 'Mythic' : lvl}</span>
                <span className="opacity-75 text-[9px] font-medium mt-0.5">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SHOP */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border shadow-sm ${t.shopCard}`}>
        <h3 className={`text-sm font-black flex items-center gap-2 ${t.shopTitle}`}>
          <ShoppingBag className="w-4 h-4 text-primary" /> Kedai Kayu Dapur
        </h3>
        <div className={`rounded-2xl p-4 flex justify-between items-center gap-4 border ${t.shopInner}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border shadow-inner shrink-0 ${t.shopIcon}`}>
              🪵
            </div>
            <div>
              <h4 className={`text-xs font-bold ${t.shopTitle}`}>Kayu Bakar Cadangan</h4>
              <p className={`text-[10px] mt-0.5 leading-tight ${t.shopSub}`}>Jaga api kompor tetap menyala hangat.</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`block text-xs font-black mb-1.5 ${t.shopXp}`}>50 XP</span>
            <button onClick={onBuyFirewood} disabled={user.xp < 50}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary ${user.xp >= 50 ? t.shopBtnOn : t.shopBtnOff}`} aria-label="Tukar Kayu Bakar">
              Tukar
            </button>
          </div>
        </div>
      </div>

      {/* QUESTS */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border shadow-sm ${t.questCard}`}>
        <h3 className={`text-sm font-black flex items-center gap-2 ${t.questTitle}`}>
          <BookOpen className="w-4 h-4 text-primary" /> Misi Dapur Hari Ini
        </h3>
        <div className="flex flex-col gap-3">
          {quests.length === 0 ? (
            <p className={`text-xs text-center py-6 font-semibold opacity-60 ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Belum ada misi hari ini.</p>
          ) : quests.map(q => {
            const completed = q.isCompleted || q.is_completed
            const canClaim  = q.canClaim === true
            return (
              <div key={q.id} className={`border rounded-2xl p-4 transition-all duration-200 ${completed ? t.questItem.done : t.questItem.todo}`}>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className={`text-xs font-bold leading-relaxed ${t.questDesc}`}>{q.description}</p>
                    {/* Thin progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-success' : 'bg-primary'}`} style={{ width: completed ? '100%' : '0%' }} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-extrabold flex items-center gap-1 ${t.questXp}`}>
                      <Trophy className="w-3 h-3" /> +{q.xpReward || q.xp_reward} XP
                    </span>
                    {completed ? (
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border ${t.questDone}`}>Selesai</span>
                    ) : canClaim ? (
                      <button onClick={() => onClaimQuest(q.type, q.id)} className={`px-3 py-1 rounded-full text-[9px] font-extrabold transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary ${t.questClaim}`} aria-label="Klaim Hadiah Misi">🎁 Klaim</button>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border flex items-center gap-1 ${t.questLock}`}>🔒 Berjalan</span>
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