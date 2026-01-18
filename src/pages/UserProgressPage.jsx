import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { RANKS } from '../utils/constants'

export default function UserProgressPage() {
  const [progress, setProgress] = useState(68)
  const [currentLP, setCurrentLP] = useState(75)
  const [isBoosterOnline, setIsBoosterOnline] = useState(true)
  const [gameTime, setGameTime] = useState('12:45')

  // Datos del pedido (simulados)
  const orderData = {
    orderId: '#48291',
    server: 'LAS',
    type: 'Solo Boost',
    startRank: { name: 'Silver', division: 'III', img: RANKS[2].img },
    currentRank: { name: 'Gold', division: 'II', img: RANKS[3].img },
    targetRank: { name: 'Platinum', division: 'IV', img: RANKS[4].img },
    winRate: 84,
    estimatedDays: 2,
    gamesPlayed: 23,
    wins: 19,
    losses: 4
  }

  const recentMatches = [
    {
      champion: 'Lee Sin',
      championImg: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/LeeSin.png',
      result: 'Victory',
      kda: '14/2/9',
      lp: '+18',
      time: '24 mins ago'
    },
    {
      champion: "Kha'Zix",
      championImg: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Khazix.png',
      result: 'Victory',
      kda: '21/4/6',
      lp: '+21',
      time: '1 hour ago'
    },
    {
      champion: 'Gragas',
      championImg: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Gragas.png',
      result: 'Defeat',
      kda: '2/5/12',
      lp: '-15',
      time: '3 hours ago'
    }
  ]

  return (
    <PageTransition>
      <div className="bg-background-dark font-display text-white min-h-screen">
        <Header />
        
        {/* Page Header */}
        <div className="border-b border-hextech-border bg-hextech-dark/50 backdrop-blur-sm sticky top-20 z-40">
          {/* Demo Banner */}
          <div className="bg-primary/10 border-b border-primary/30">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">visibility</span>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Vista Previa del Panel de Usuario - Ejemplo de cómo verás tu progreso en tiempo real
              </p>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase">Progreso en Vivo</h2>
              <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">
                Orden {orderData.orderId} • {orderData.server} • {orderData.type}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Estado del Booster</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-bold tracking-wide">
                    {isBoosterOnline ? `EN PARTIDA (${gameTime})` : 'OFFLINE'}
                  </span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-hextech-surface border border-hextech-border rounded hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span className="text-xs font-bold uppercase tracking-widest">Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Live Progress Tracker */}
          <section className="bg-hextech-surface/80 backdrop-blur-sm border border-hextech-border rounded-xl p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Starting Rank */}
              <div className="col-span-3 text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-primary/5 rounded-full border border-primary/20 flex items-center justify-center relative group">
                  <div className="absolute inset-0 rounded-full border border-primary/10 animate-[spin_10s_linear_infinite]"></div>
                  <img 
                    src={orderData.startRank.img} 
                    alt={`${orderData.startRank.name} rank`}
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <h3 className="text-xs font-bold text-primary/60 uppercase tracking-widest">Rango Inicial</h3>
                <p className="text-xl font-bold">{orderData.startRank.name} {orderData.startRank.division}</p>
              </div>

              {/* Progress Bar */}
              <div className="col-span-6 flex flex-col gap-6">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Progreso de la Operación</span>
                  <span className="text-4xl font-bold text-primary tracking-tighter">
                    {progress}<span className="text-xl">%</span>
                  </span>
                </div>
                
                <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary via-accent-gold to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] relative shadow-[0_0_15px_rgba(0,209,181,0.5)]"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-xs font-medium uppercase">Est. {orderData.estimatedDays} días restantes</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span className="text-xs font-medium uppercase">Win Rate: {orderData.winRate}%</span>
                  </div>
                </div>
              </div>

              {/* Target Rank */}
              <div className="col-span-3 text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-primary/10 rounded-full border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,209,181,0.3)] relative">
                  <img 
                    src={orderData.targetRank.img} 
                    alt={`${orderData.targetRank.name} rank`}
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Rango Objetivo</h3>
                <p className="text-xl font-bold">{orderData.targetRank.name} {orderData.targetRank.division}</p>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-hextech-surface border border-hextech-border p-8 rounded-xl relative overflow-hidden group hover:border-primary/40 transition-all">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-white/5 rotate-12">military_tech</span>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">División Actual</p>
              <h4 className="text-3xl font-bold mb-2 tracking-tight uppercase">{orderData.currentRank.name} {orderData.currentRank.division}</h4>
              <div className="flex items-center gap-2 text-green-500">
                <span className="material-symbols-outlined text-sm">keyboard_double_arrow_up</span>
                <span className="text-xs font-bold">+2 Divisiones ganadas</span>
              </div>
            </div>

            <div className="bg-hextech-surface border border-hextech-border p-8 rounded-xl relative overflow-hidden group hover:border-primary/40 transition-all">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-white/5 rotate-12">monitoring</span>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">LP Actual</p>
              <h4 className="text-3xl font-bold mb-2 tracking-tight uppercase">{currentLP} LP</h4>
              <div className="flex items-center gap-2 text-green-500">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span className="text-xs font-bold">+18 LP última partida</span>
              </div>
            </div>

            <div className="bg-hextech-surface border border-hextech-border p-8 rounded-xl relative overflow-hidden group hover:border-primary/40 transition-all">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-white/5 rotate-12">sports_esports</span>
              <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-1">Actividad del Booster</p>
              <h4 className="text-3xl font-bold mb-2 tracking-tight uppercase">En Partida</h4>
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span className="text-xs font-bold uppercase">Visualizando vía API</span>
              </div>
            </div>
          </div>

          {/* Recent Activity & Side Widget */}
          <div className="grid grid-cols-12 gap-8">
            {/* Recent Matches */}
            <div className="col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Partidas Recientes</h3>
                <Link to="/match-history" className="text-xs font-bold text-primary hover:text-white transition-colors uppercase tracking-widest">
                  Ver historial completo
                </Link>
              </div>

              <div className="space-y-3">
                {recentMatches.map((match, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-4 bg-hextech-surface border rounded-xl hover:bg-white/5 transition-all ${
                      match.result === 'Victory' 
                        ? 'border-l-4 border-l-green-500 border-hextech-border' 
                        : 'border-l-4 border-l-red-500 border-hextech-border'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded bg-hextech-dark border border-primary/20 overflow-hidden">
                        <img src={match.championImg} alt={match.champion} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold uppercase ${match.result === 'Victory' ? 'text-green-500' : 'text-red-500'}`}>
                          {match.result === 'Victory' ? 'Victoria' : 'Derrota'}
                        </p>
                        <p className="text-sm font-medium text-white/80 uppercase">{match.champion} • {match.kda}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${match.result === 'Victory' ? 'text-green-500' : 'text-red-500'}`}>
                        {match.lp}
                      </p>
                      <p className="text-[10px] text-white/40 uppercase">{match.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Widgets */}
            <div className="col-span-4 flex flex-col gap-6">
              {/* Chat Widget */}
              <div className="bg-primary p-8 rounded-xl text-black relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                <span className="material-symbols-outlined absolute -right-6 -top-6 text-[160px] text-white/20 -rotate-12 transition-transform group-hover:rotate-0 duration-500">
                  chat_bubble
                </span>
                <div className="relative z-10">
                  <h4 className="text-xl font-bold uppercase tracking-tighter leading-none mb-2">Chat Directo</h4>
                  <p className="text-sm font-medium mb-6 opacity-80">Tu booster está disponible para consultas.</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest">Abrir Chat</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-hextech-surface border border-hextech-border p-6 rounded-xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Seguridad Activa</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                    <p className="text-xs text-white/80 font-medium">VPN: Protegido (Buenos Aires, AR)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                    <p className="text-xs text-white/80 font-medium">Modo Offline: Activo</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                    <p className="text-xs text-white/80 font-medium">Matchmaking: Solo únicamente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
