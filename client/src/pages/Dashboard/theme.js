// =============================================
// THEME TOKENS — Pokémon Café Mix Edition
// =============================================
//
// Light = "Café Latte" — cozy warm milk tea palette
//   Base: vanilla cream + caramel browns
//   Accent: strawberry rose, mint sorbet, custard yellow
//   Vibe: warm, playful, inviting — like walking into a Pokémon café
//
// Dark = "Midnight Cocoa" — rich dark chocolate café palette
//   Base: deep cocoa + espresso darks
//   Accent: caramel gold, peach blossom, mint cream
//   Vibe: cozy night café, moody but cute

export const themes = {
  light: {
    // ── Base ──────────────────────────────────
    page:        'bg-[#FFF8F0] text-[#3D2314]',
    header:      'bg-[#FFF8F0]/95 border-[#F5D9C0] shadow-[0_4px_20px_rgba(245,200,160,0.25)]',
    logo:        'text-[#C2714F] font-black tracking-tight',
    logoSub:     'text-[#D4956A] font-bold',
    headerIcon:  'bg-[#FFF0E3] border-2 border-[#F5D9C0] rounded-2xl',
    headerIconLit:'bg-[#C2714F] text-white shadow-md shadow-[#C2714F]/30 scale-105 rounded-2xl',
    pill:        'bg-[#FFF0E3] border-2 border-[#F5D9C0] text-[#3D2314] font-bold',
    streakOff:   'bg-[#FFF0E3] border-2 border-[#F5D9C0] text-[#A07856] font-bold',
    streakOn:    'bg-[#FFE4CE]/60 border-2 border-[#E8956A] text-[#C2714F] font-black',
    logoutBtn:   'bg-[#FFF0E3] hover:bg-[#FFE4CE] text-[#A07856] hover:text-[#C2714F] border-2 border-[#F5D9C0] hover:border-[#E8956A] btn-squish transition-all duration-200',
    toggleBtn:   'bg-[#FFF0E3] hover:bg-[#FFE4CE] text-[#3D2314] border-2 border-[#F5D9C0] btn-squish transition-all duration-200',

    // ── Cards & Sections ──────────────────────
    card:        'bg-white border-2 border-[#F5D9C0] hover:border-[#E8956A] shadow-[0_8px_30px_rgba(245,200,160,0.2)] hover:shadow-[0_12px_40px_rgba(245,200,160,0.4)] rounded-[2rem] transition-all duration-300',
    sectionCard: 'bg-white border-2 border-[#F5D9C0] shadow-[0_8px_30px_rgba(245,200,160,0.2)] rounded-[2rem]',
    sectionTitle:'text-[#3D2314] font-black tracking-tight',
    sectionSub:  'text-[#A07856] font-medium',

    // ── Buttons ───────────────────────────────
    addBtn:      'bg-gradient-to-r from-[#C2714F] to-[#E8956A] hover:from-[#E8956A] hover:to-[#F5B88A] text-white shadow-md btn-squish rounded-2xl transition-all duration-200',
    filterActive:'bg-[#C2714F] text-white shadow-md btn-squish rounded-full',
    filterIdle:  'bg-white text-[#A07856] border-2 border-[#F5D9C0] hover:border-[#E8956A] hover:text-[#C2714F] btn-squish rounded-full',

    // ── Stat Cards ────────────────────────────
    statSegar:   { on: 'bg-[#E8F8F0] border-2 border-[#6DCBA0] text-[#2D8C65] shadow-md shadow-[#6DCBA0]/10 scale-[1.02]',   off: 'bg-white border-2 border-[#F5D9C0] hover:border-[#E8956A] text-[#A07856] transition-all duration-200' },
    statWaspada: { on: 'bg-[#FFF7E0] border-2 border-[#F5C842] text-[#B8940A] shadow-md shadow-[#F5C842]/10 scale-[1.02]',   off: 'bg-white border-2 border-[#F5D9C0] hover:border-[#E8956A] text-[#A07856] transition-all duration-200' },
    statKritis:  { on: 'bg-[#FFE8E8] border-2 border-[#FF8B8B] text-[#CC4444] shadow-md shadow-[#FF8B8B]/10 scale-[1.02]',   off: 'bg-white border-2 border-[#F5D9C0] hover:border-[#E8956A] text-[#A07856] transition-all duration-200' },
    statBusuk:   { on: 'bg-[#F2EBE3] border-2 border-[#C4A882] text-[#7A5C3A] shadow-md scale-[1.02]',                       off: 'bg-white border-2 border-[#F5D9C0] hover:border-[#E8956A] text-[#A07856] transition-all duration-200' },

    // ── Ingredient Cards ─────────────────────
    ingCard:     'bg-white border-2 border-[#F5D9C0] hover:border-[#E8956A] shadow-[0_8px_30px_rgba(245,200,160,0.2)] hover:-translate-y-1 hover:shadow-lg rounded-3xl transition-all duration-300',
    cookedBadge: 'bg-[#E8F8F0] text-[#2D8C65] border-2 border-[#6DCBA0]/40 rounded-xl',
    qtyBox:      'bg-[#C2714F] border-2 border-[#C2714F] rounded-full shadow-sm',
    qtyText:     'text-white font-mono font-bold',
    qtyMinus:    'text-white/80 hover:text-white font-bold',
    qtyPlus:     'text-white/80 hover:text-white font-bold',
    healthBg:    'bg-[#F5D9C0] h-2.5 rounded-full',
    healthText:  'text-[#A07856] font-bold',
    editBtn:     'text-[#A07856] hover:text-[#C2714F] font-bold transition-all duration-200',
    cookBtn:     'bg-gradient-to-r from-[#F4A261] to-[#E07B39] hover:from-[#E07B39] hover:to-[#C8632A] text-white shadow-md btn-squish rounded-xl transition-all duration-200',
    wasteBtn:    'bg-[#FFF0E3] hover:bg-[#FFE4CE] text-[#A07856] hover:text-[#CC4444] border border-[#F5D9C0] hover:border-[#FF8B8B]/40 rounded-xl btn-squish transition-all duration-200',
    deleteBtn:   'bg-[#FFF0E3] text-[#A07856] hover:text-[#CC4444] hover:bg-[#FFE8E8] border border-[#F5D9C0] hover:border-[#FF8B8B]/40 rounded-xl btn-squish transition-all duration-200',
    divider:     'border-[#F5D9C0]',
    emptyBox:    'bg-white border-2 border-[#F5D9C0] text-[#A07856] rounded-3xl p-8',

    // ── Fire Widget ───────────────────────────
    fireWidget:  { on: 'bg-white border-2 border-[#E8956A] shadow-md rounded-[2.5rem]', off: 'bg-white border-2 border-[#F5D9C0] rounded-[2.5rem]' },
    fireRing:    { on: 'border-[#E8956A] bg-[#FFE4CE]/60 shadow-lg shadow-[#E8956A]/20 scale-105 rounded-full p-6', off: 'border-[#F5D9C0] bg-[#FFF0E3] rounded-full p-6' },
    fireLabel:   'text-[#C2714F] font-black tracking-wider',
    streakNum:   'text-[#3D2314] font-black',
    fireOnMsg:   'text-[#2D8C65] font-bold',
    fireOffMsg:  'text-[#B8940A] font-bold',
    igniteBtn:   'bg-gradient-to-r from-[#C2714F] to-[#E8956A] hover:from-[#E8956A] hover:to-[#F5B88A] text-white rounded-xl shadow-md btn-squish transition-all duration-200',

    // ── Level & Shop ──────────────────────────
    levelBox:    'bg-[#FFF0E3] border-2 border-[#F5D9C0] rounded-2xl',
    levelLabel:  'text-[#C2714F] font-black',
    levelOn:     'bg-[#FFE4CE]/60 border-2 border-[#E8956A] text-[#C2714F] scale-105 rounded-xl font-black shadow-sm',
    levelOff:    'bg-white border-2 border-[#F5D9C0] text-[#A07856] rounded-xl font-bold',
    shopCard:    'bg-white border-2 border-[#F5D9C0] shadow-[0_8px_30px_rgba(245,200,160,0.2)] rounded-[2rem]',
    shopInner:   'bg-[#FFF0E3] border-2 border-[#F5D9C0] rounded-2xl',
    shopIcon:    'bg-white border-2 border-[#E8956A]/50 shadow-sm rounded-2xl',
    shopTitle:   'text-[#3D2314] font-extrabold',
    shopSub:     'text-[#A07856] font-medium',
    shopXp:      'text-[#C2714F] font-black',
    shopBtnOn:   'bg-gradient-to-r from-[#C2714F] to-[#E8956A] text-white hover:from-[#E8956A] hover:to-[#F5B88A] shadow-md btn-squish rounded-xl transition-all duration-200',
    shopBtnOff:  'bg-white border border-[#F5D9C0] text-[#A07856] cursor-not-allowed rounded-xl',

    // ── Quests ────────────────────────────────
    questCard:   'bg-white border-2 border-[#F5D9C0] shadow-[0_8px_30px_rgba(245,200,160,0.2)] rounded-[2rem]',
    questTitle:  'text-[#3D2314] font-black',
    questItem:   { done: 'bg-[#FFF0E3] border-2 border-[#F5D9C0] opacity-60 rounded-2xl', todo: 'bg-[#FFF0E3] border-2 border-[#F5D9C0] hover:border-[#E8956A] rounded-2xl transition-all duration-200' },
    questDesc:   'text-[#3D2314] font-bold',
    questXp:     'text-[#C2714F] font-extrabold',
    questDone:   'bg-[#E8F8F0] text-[#2D8C65] border-2 border-[#6DCBA0]/40 rounded-xl font-bold',
    questClaim:  'bg-gradient-to-r from-[#C2714F] to-[#E8956A] hover:from-[#E8956A] hover:to-[#F5B88A] text-white shadow-md btn-squish rounded-xl font-bold transition-all duration-200',
    questLock:   'bg-white text-[#A07856] border border-[#F5D9C0] cursor-not-allowed rounded-xl font-bold',

    // ── Sim / Modal / Toast ───────────────────
    simCard:     'bg-white border-2 border-[#F5D9C0] shadow-sm rounded-[2rem]',
    simLabel:    'text-[#C2714F] font-black',
    simBtn:      'bg-[#FFF0E3] hover:bg-[#FFE4CE] text-[#C2714F] border-2 border-[#E8956A]/50 hover:border-[#C2714F] btn-squish rounded-xl font-bold transition-all duration-200',
    modal:       'bg-white border-2 border-[#F5D9C0] rounded-[2.5rem] shadow-2xl',
    modalTitle:  'text-[#3D2314] font-black tracking-tight',
    modalSub:    'text-[#A07856] font-medium',
    modalClose:  'text-[#A07856] hover:text-[#3D2314] transition-colors',
    modalInput:  'bg-[#FFF8F0] border-2 border-[#F5D9C0] text-[#3D2314] placeholder:text-[#C4A882] focus:border-[#C2714F] focus:ring-4 focus:ring-[#C2714F]/10 rounded-2xl transition-all duration-200',
    modalLabel:  'text-[#3D2314] font-bold',
    modalCancel: 'bg-[#FFF0E3] hover:bg-[#FFE4CE] text-[#3D2314] border-2 border-[#F5D9C0] rounded-xl btn-squish transition-all duration-200',
    modalSubmit: 'bg-gradient-to-r from-[#C2714F] to-[#E8956A] hover:from-[#E8956A] hover:to-[#F5B88A] text-white shadow-md btn-squish rounded-xl transition-all duration-200',
    modalOverlay:'bg-[#3D2314]/10 backdrop-blur-sm',
    toast:       'bg-white border-2 border-[#E8956A]/60 text-[#C2714F] rounded-2xl shadow-lg',
    footer:      'border-t-2 border-[#F5D9C0] bg-white text-[#A07856] font-semibold',

    // ── Health Badges ─────────────────────────
    healthSegar:  { color: 'text-[#2D8C65] bg-[#E8F8F0] border-2 border-[#6DCBA0]/30 font-bold', bar: 'bg-[#6DCBA0]' },
    healthWaspada:{ color: 'text-[#B8940A] bg-[#FFF7E0] border-2 border-[#F5C842]/30 font-bold', bar: 'bg-[#F5C842]' },
    healthKritis: { color: 'text-[#CC4444] bg-[#FFE8E8] border-2 border-[#FF8B8B]/30 font-bold', bar: 'bg-[#FF8B8B] animate-pulse' },
    healthBusuk:  { color: 'text-[#7A5C3A] bg-[#F2EBE3] border-2 border-[#C4A882]/30 font-bold', bar: 'bg-[#C4A882]' },
  },

  dark: {
    // ── Base ──────────────────────────────────
    page:        'bg-[#1C1008] text-[#F5E6D3]',
    header:      'bg-[#261608]/95 border-[#4A2E18] shadow-[0_4px_20px_rgba(74,46,24,0.4)]',
    logo:        'text-[#F5A96A] font-black tracking-tight',
    logoSub:     'text-[#D4956A] font-bold',
    headerIcon:  'bg-[#2E1C0E] border-2 border-[#4A2E18] rounded-2xl',
    headerIconLit:'bg-[#F5A96A] text-[#1C1008] shadow-md shadow-[#F5A96A]/30 scale-105 rounded-2xl',
    pill:        'bg-[#2E1C0E] border-2 border-[#4A2E18] text-[#F5E6D3] font-bold',
    streakOff:   'bg-[#2E1C0E] border-2 border-[#4A2E18] text-[#C4956A] font-bold',
    streakOn:    'bg-[#F5A96A]/15 border-2 border-[#F5A96A]/60 text-[#F5A96A] font-black',
    logoutBtn:   'bg-[#2E1C0E] hover:bg-[#3A2214] text-[#C4956A] hover:text-[#F5E6D3] border-2 border-[#4A2E18] btn-squish transition-all duration-200',
    toggleBtn:   'bg-[#2E1C0E] hover:bg-[#3A2214] text-[#F5E6D3] border-2 border-[#4A2E18] btn-squish transition-all duration-200',

    // ── Cards & Sections ──────────────────────
    card:        'bg-[#261608] border-2 border-[#4A2E18] hover:border-[#F5A96A]/50 shadow-sm rounded-[2rem] transition-all duration-300',
    sectionCard: 'bg-[#261608] border-2 border-[#4A2E18] shadow-sm rounded-[2rem]',
    sectionTitle:'text-[#F5E6D3] font-black tracking-tight',
    sectionSub:  'text-[#C4956A] font-medium',

    // ── Buttons ───────────────────────────────
    addBtn:      'bg-gradient-to-r from-[#F5A96A] to-[#D4956A] hover:from-[#D4956A] hover:to-[#F5C896] text-[#1C1008] shadow-sm btn-squish rounded-xl transition-all duration-200',
    filterActive:'bg-[#F5A96A] text-[#1C1008] shadow-md btn-squish rounded-full',
    filterIdle:  'bg-[#261608] text-[#C4956A] border-2 border-[#4A2E18] hover:border-[#F5A96A]/50 hover:text-[#F5A96A] btn-squish rounded-full',

    // ── Stat Cards ────────────────────────────
    statSegar:   { on: 'bg-[#6DCBA0]/15 border-2 border-[#6DCBA0] text-[#6DCBA0] shadow-sm scale-[1.02]', off: 'bg-[#261608] border-2 border-[#4A2E18] hover:border-[#6DCBA0]/40 text-[#C4956A] transition-all duration-200' },
    statWaspada: { on: 'bg-[#F5C842]/15 border-2 border-[#F5C842] text-[#F5C842] shadow-sm scale-[1.02]', off: 'bg-[#261608] border-2 border-[#4A2E18] hover:border-[#F5C842]/40 text-[#C4956A] transition-all duration-200' },
    statKritis:  { on: 'bg-[#FF8B8B]/15 border-2 border-[#FF8B8B] text-[#FF8B8B] shadow-sm scale-[1.02]', off: 'bg-[#261608] border-2 border-[#4A2E18] hover:border-[#FF8B8B]/40 text-[#C4956A] transition-all duration-200' },
    statBusuk:   { on: 'bg-[#C4A882]/15 border-2 border-[#C4A882] text-[#C4A882] shadow-sm scale-[1.02]', off: 'bg-[#261608] border-2 border-[#4A2E18] hover:border-[#C4A882]/40 text-[#C4956A] transition-all duration-200' },

    // ── Ingredient Cards ─────────────────────
    ingCard:     'bg-[#261608] border-2 border-[#4A2E18] hover:border-[#F5A96A]/50 shadow-sm hover:-translate-y-1 hover:shadow-lg rounded-3xl transition-all duration-300',
    cookedBadge: 'bg-[#6DCBA0]/15 text-[#6DCBA0] border-2 border-[#6DCBA0]/30 rounded-xl',
    qtyBox:      'bg-[#F5A96A] border-2 border-[#F5A96A] rounded-full shadow-sm',
    qtyText:     'text-[#1C1008] font-mono font-bold',
    qtyMinus:    'text-[#1C1008]/70 hover:text-[#1C1008] font-bold',
    qtyPlus:     'text-[#1C1008]/70 hover:text-[#1C1008] font-bold',
    healthBg:    'bg-[#4A2E18] h-2.5 rounded-full',
    healthText:  'text-[#C4956A] font-bold',
    editBtn:     'text-[#C4956A] hover:text-[#F5A96A] font-bold transition-all duration-200',
    cookBtn:     'bg-gradient-to-r from-[#F7C948] to-[#F4A261] hover:from-[#F4A261] hover:to-[#E07B39] text-[#3D1F08] shadow-md btn-squish rounded-xl transition-all duration-200',
    wasteBtn:    'bg-[#2E1C0E] hover:bg-[#FF8B8B]/15 text-[#C4956A] hover:text-[#FF8B8B] border border-[#4A2E18] rounded-xl btn-squish transition-all duration-200',
    deleteBtn:   'bg-[#2E1C0E] text-[#C4956A] hover:text-[#FF8B8B] hover:bg-[#FF8B8B]/15 border border-[#4A2E18] rounded-xl btn-squish transition-all duration-200',
    divider:     'border-[#4A2E18]',
    emptyBox:    'bg-[#261608] border-2 border-[#4A2E18] text-[#C4956A] rounded-3xl p-8',

    // ── Fire Widget ───────────────────────────
    fireWidget:  { on: 'bg-[#261608] border-2 border-[#F5A96A]/50 shadow-md rounded-[2.5rem]', off: 'bg-[#261608] border-2 border-[#4A2E18] rounded-[2.5rem]' },
    fireRing:    { on: 'border-[#F5A96A] bg-[#F5A96A]/10 shadow-lg shadow-[#F5A96A]/15 scale-105 rounded-full p-6', off: 'border-[#4A2E18] bg-[#2E1C0E] rounded-full p-6' },
    fireLabel:   'text-[#F5A96A] font-black',
    streakNum:   'text-[#F5E6D3] font-black',
    fireOnMsg:   'text-[#6DCBA0] font-bold',
    fireOffMsg:  'text-[#F5C842] font-bold',
    igniteBtn:   'bg-gradient-to-r from-[#F5A96A] to-[#D4956A] hover:from-[#D4956A] hover:to-[#F5C896] text-[#1C1008] rounded-xl shadow-md btn-squish transition-all duration-200',

    // ── Level & Shop ──────────────────────────
    levelBox:    'bg-[#261608] border-2 border-[#4A2E18] rounded-2xl',
    levelLabel:  'text-[#F5A96A] font-black',
    levelOn:     'bg-[#F5A96A]/15 border-2 border-[#F5A96A] text-[#F5A96A] scale-105 rounded-xl font-black shadow-sm',
    levelOff:    'bg-[#2E1C0E] border-2 border-[#4A2E18] text-[#C4956A] rounded-xl font-bold',
    shopCard:    'bg-[#261608] border-2 border-[#4A2E18] shadow-sm rounded-[2rem]',
    shopInner:   'bg-[#2E1C0E] border-2 border-[#4A2E18] rounded-2xl',
    shopIcon:    'bg-[#261608] border-2 border-[#F5A96A]/40 shadow-sm rounded-2xl',
    shopTitle:   'text-[#F5E6D3] font-extrabold',
    shopSub:     'text-[#C4956A] font-medium',
    shopXp:      'text-[#F5A96A] font-black',
    shopBtnOn:   'bg-gradient-to-r from-[#F5A96A] to-[#D4956A] text-[#1C1008] hover:from-[#D4956A] hover:to-[#F5C896] shadow-md btn-squish rounded-xl transition-all duration-200',
    shopBtnOff:  'bg-[#2E1C0E] border border-[#4A2E18] text-[#C4956A] cursor-not-allowed rounded-xl',

    // ── Quests ────────────────────────────────
    questCard:   'bg-[#261608] border-2 border-[#4A2E18] shadow-sm rounded-[2rem]',
    questTitle:  'text-[#F5E6D3] font-black',
    questItem:   { done: 'bg-[#2E1C0E] border-2 border-[#4A2E18] opacity-60 rounded-2xl', todo: 'bg-[#2E1C0E] border-2 border-[#4A2E18] hover:border-[#F5A96A]/40 rounded-2xl transition-all duration-200' },
    questDesc:   'text-[#F5E6D3] font-bold',
    questXp:     'text-[#F5A96A] font-extrabold',
    questDone:   'bg-[#6DCBA0]/15 text-[#6DCBA0] border border-[#6DCBA0]/30 rounded-xl font-bold',
    questClaim:  'bg-gradient-to-r from-[#F5A96A] to-[#D4956A] hover:from-[#D4956A] hover:to-[#F5C896] text-[#1C1008] shadow-md btn-squish rounded-xl font-bold transition-all duration-200',
    questLock:   'bg-[#2E1C0E] text-[#C4956A] border border-[#4A2E18] cursor-not-allowed rounded-xl font-bold',

    // ── Sim / Modal / Toast ───────────────────
    simCard:     'bg-[#261608] border-2 border-[#4A2E18] shadow-sm rounded-[2rem]',
    simLabel:    'text-[#F5A96A] font-black',
    simBtn:      'bg-[#2E1C0E] hover:bg-[#3A2214] text-[#F5A96A] border-2 border-[#4A2E18] hover:border-[#F5A96A] btn-squish rounded-xl font-bold transition-all duration-200',
    modal:       'bg-[#261608] border-2 border-[#4A2E18] rounded-[2.5rem] shadow-2xl',
    modalTitle:  'text-[#F5E6D3] font-black tracking-tight',
    modalSub:    'text-[#C4956A] font-medium',
    modalClose:  'text-[#C4956A] hover:text-[#F5E6D3] transition-colors',
    modalInput:  'bg-[#2E1C0E] border-2 border-[#4A2E18] text-[#F5E6D3] placeholder:text-[#C4956A] focus:border-[#F5A96A] focus:ring-4 focus:ring-[#F5A96A]/10 rounded-2xl transition-all duration-200',
    modalLabel:  'text-[#F5E6D3] font-bold',
    modalCancel: 'bg-[#2E1C0E] hover:bg-[#3A2214] text-[#F5E6D3] rounded-xl border-2 border-[#4A2E18] btn-squish transition-all duration-200',
    modalSubmit: 'bg-gradient-to-r from-[#F5A96A] to-[#D4956A] hover:from-[#D4956A] hover:to-[#F5C896] text-[#1C1008] shadow-md btn-squish rounded-xl transition-all duration-200',
    modalOverlay:'bg-black/60 backdrop-blur-sm',
    toast:       'bg-[#261608] border-2 border-[#F5A96A]/40 text-[#F5A96A] rounded-2xl shadow-lg',
    footer:      'border-t-2 border-[#4A2E18] bg-[#261608] text-[#C4956A] font-semibold',

    // ── Health Badges ─────────────────────────
    healthSegar:  { color: 'text-[#6DCBA0] bg-[#6DCBA0]/15 border-2 border-[#6DCBA0]/20 font-bold', bar: 'bg-[#6DCBA0]' },
    healthWaspada:{ color: 'text-[#F5C842] bg-[#F5C842]/15 border-2 border-[#F5C842]/20 font-bold', bar: 'bg-[#F5C842]' },
    healthKritis: { color: 'text-[#FF8B8B] bg-[#FF8B8B]/15 border-2 border-[#FF8B8B]/20 font-bold', bar: 'bg-[#FF8B8B] animate-pulse' },
    healthBusuk:  { color: 'text-[#C4956A] bg-[#C4A882]/15 border-2 border-[#C4A882]/20 font-bold', bar: 'bg-[#C4A882]' },
  },
}