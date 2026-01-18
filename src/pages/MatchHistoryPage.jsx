import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

export default function MatchHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState('30days')

  const stats = {
    totalWins: 142,
    winRate: 92.4,
    avgKDA: { kills: 4.2, deaths: 1.0, assists: 8.5 },
    improvement: 12.4
  }

  const matches = [
    {
      champion: 'Lee Sin',
      championImg: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/LeeSin.png',
      result: 'Victory',
      kda: { kills: 12, deaths: 2, assists: 8 },
      kdaRatio: 10.0,
      gold: '14.2k',
      cs: 220,
      csPerMin: 9.1,
      duration: '24:15',
      timeAgo: '2 hours ago',
      level: 18
    },
    {
      champion: 'Ahri',
      championImg: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Ahri.png',
      result: 'Defeat',
      kda: { kills: 3, deaths: 5, assists: 2 },
      kdaRatio: 1.0,
      gold: '11.8k',
      cs: 180,
      csPerMin: 5.5,
      duration: '32:40',
      timeAgo: '5 hours ago',
      level: 17
    },
    {
      champion: 'Jinx',
      championImg: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Jinx.png',
      result: 'Victory',
      kda: { kills: 18, deaths: 4, assists: 6 },
      kdaRatio: 6.0,
      gold: '19.5k',
      cs: 295,
      csPerMin: 10.2,
      duration: '28:50',
      timeAgo: 'Yesterday',
      level: 16
    },
    {
      champion: 'Yasuo',
      championImg: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Yasuo.png',
      result: 'Victory',
      kda: { kills: 15, deaths: 3, assists: 11 },
      kdaRatio: 8.7,
      gold: '16.8k',
      cs: 245,
      csPerMin: 8.9,
      duration: '27:30',
      timeAgo: 'Yesterday',
      level: 18
    },
    {
      champion: 'Thresh',
      championImg: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Thresh.png',
      result: 'Victory',
      kda: { kills: 1, deaths: 1, assists: 22 },
      kdaRatio: 23.0,
      gold: '9.2k',
      cs: 45,
      csPerMin: 1.8,
      duration: '25:10',
      timeAgo: '2 days ago',
      level: 15
    }
  ]

  const filteredMatches = matches.filter(match => 
    match.champion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageTransition>
      <div className="bg-background-dark font-display text-white min-h-screen">
        <Header />

        {/* Demo Banner */}
        <div className="bg-primary/10 border-b border-primary/30 sticky top-20 z-40">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">visibility</span>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Vista Previa del Historial de Partidas - Ejemplo de estadísticas detalladas del booster
            </p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
            <div className="flex flex-col gap-1">
              <p className="text-primary text-sm font-bold tracking-widest uppercase">Análisis de Rendimiento</p>
              <h1 className="text-5xl font-black leading-tight tracking-tighter uppercase">Estadísticas del Booster</h1>
            </div>
            <div className="flex items-center gap-2 bg-hextech-surface p-1 rounded-lg border border-hextech-border">
              <button 
                onClick={() => setTimeFilter('30days')}
                className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
                  timeFilter === '30days' 
                    ? 'bg-hextech-dark text-primary shadow-sm' 
                    : 'text-white/50 hover:text-primary'
                }`}
              >
                Últimos 30 Días
              </button>
              <button 
                onClick={() => setTimeFilter('alltime')}
                className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
                  timeFilter === 'alltime' 
                    ? 'bg-hextech-dark text-primary shadow-sm' 
                    : 'text-white/50 hover:text-primary'
                }`}
              >
                Todo el Tiempo
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-hextech-surface border border-hextech-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-6xl">emoji_events</span>
              </div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Total Victorias</p>
              <p className="text-4xl font-black italic">{stats.totalWins}</p>
              <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+{stats.improvement}% vs mes pasado</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-6 bg-hextech-surface border border-hextech-border border-b-primary/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-6xl">analytics</span>
              </div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Win Rate</p>
              <p className="text-primary text-4xl font-black italic">{stats.winRate}%</p>
              <div className="w-full bg-hextech-dark h-1.5 mt-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full shadow-[0_0_10px_rgba(0,209,181,0.5)]" style={{ width: `${stats.winRate}%` }}></div>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-xl p-6 bg-hextech-surface border border-hextech-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-6xl">swords</span>
              </div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">KDA Promedio</p>
              <p className="text-3xl font-black italic tracking-tighter">
                {stats.avgKDA.kills} <span className="text-white/40 font-medium">/</span> {stats.avgKDA.deaths} <span className="text-white/40 font-medium">/</span> {stats.avgKDA.assists}
              </p>
              <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
                <span className="material-symbols-outlined text-sm">add</span>
                <span>0.5 mejor KDA</span>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight">Historial de Partidas Recientes</h2>
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/40 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-hextech-surface border border-hextech-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm placeholder-white/30 outline-none"
                  placeholder="Filtrar por Campeón o Modo de Juego..."
                />
              </div>
            </div>
          </div>

          {/* Match List */}
          <div className="flex flex-col gap-3">
            {filteredMatches.map((match, idx) => (
              <div 
                key={idx}
                className={`rounded-lg border p-4 flex flex-col md:flex-row items-center gap-6 transition-all hover:translate-x-1 ${
                  match.result === 'Victory'
                    ? 'border-l-4 border-l-green-500 bg-gradient-to-r from-green-500/5 to-hextech-surface border-hextech-border'
                    : 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-hextech-surface border-hextech-border'
                }`}
              >
                {/* Champion Info */}
                <div className="flex items-center gap-4 min-w-[180px]">
                  <div className="relative">
                    <img 
                      src={match.championImg} 
                      alt={match.champion}
                      className={`w-14 h-14 rounded bg-hextech-dark object-cover border ${
                        match.result === 'Victory' ? 'border-green-500/30' : 'border-red-500/30'
                      }`}
                    />
                    <div className={`absolute -bottom-1 -right-1 text-[10px] font-black px-1 border ${
                      match.result === 'Victory' 
                        ? 'bg-hextech-dark border-green-500 text-green-500' 
                        : 'bg-hextech-dark border-red-500 text-red-500'
                    }`}>
                      {match.level}
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase italic tracking-widest ${
                      match.result === 'Victory' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {match.result === 'Victory' ? 'Victoria' : 'Derrota'}
                    </p>
                    <p className="text-white font-bold">{match.champion}</p>
                    <p className="text-white/50 text-[11px] font-medium uppercase">Ranked Solo</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1 flex flex-wrap justify-between items-center gap-8 px-4 border-l border-r border-hextech-border/30">
                  <div className="flex flex-col">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">Rendimiento</p>
                    <p className="text-xl font-black italic tracking-tighter">
                      <span className="text-white">{match.kda.kills}</span> / <span className="text-red-500">{match.kda.deaths}</span> / <span className="text-white">{match.kda.assists}</span>
                    </p>
                    <p className="text-white/50 text-xs font-bold">{match.kdaRatio.toFixed(2)} KDA</p>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">Oro / CS</p>
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 font-bold">{match.gold}</span>
                      <span className="text-white/50">•</span>
                      <span className="text-white/80 font-bold">{match.cs} <span className="text-white/50 text-[10px]">CS</span></span>
                    </div>
                    <p className="text-white/50 text-xs font-bold">{match.csPerMin} CS/min</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">Tiempo</p>
                    <p className="text-white/80 font-bold">{match.duration}</p>
                    <p className="text-white/50 text-[10px] font-bold">{match.timeAgo}</p>
                  </div>
                </div>

                {/* Items & Details */}
                <div className="flex items-center gap-2 pr-4">
                  <div className="grid grid-cols-4 gap-1">
                    {[...Array(7)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-7 h-7 bg-hextech-dark rounded-sm border border-hextech-border"
                      ></div>
                    ))}
                  </div>
                  <button className={`h-14 px-3 flex flex-col items-center justify-center gap-1 rounded border transition-all ${
                    match.result === 'Victory'
                      ? 'border-hextech-border hover:border-green-500 hover:bg-green-500/10'
                      : 'border-hextech-border hover:border-red-500 hover:bg-red-500/10'
                  }`}>
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                    <span className="text-[9px] font-black uppercase">Detalle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center mt-6">
            <button className="flex items-center gap-2 px-8 py-3 bg-hextech-surface border border-hextech-border rounded-lg text-white/40 hover:text-primary hover:border-primary transition-all font-bold uppercase tracking-widest text-sm">
              Cargar Más Partidas
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
