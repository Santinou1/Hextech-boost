import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BoosterSelector({ isOpen, onClose, orderDetails }) {
  const [selectedBooster, setSelectedBooster] = useState(null)
  const [sortBy, setSortBy] = useState('recommended')

  const boosters = [
    {
      id: 1,
      name: 'ShadowJungle',
      rank: 'Grandmaster',
      rankImg: 'https://static.wikia.nocookie.net/leagueoflegends/images/f/fc/Season_2022_-_Grandmaster.png',
      winRate: 94.2,
      gamesPlayed: 1247,
      mainChampions: [
        { name: 'Lee Sin', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/LeeSin.png' },
        { name: "Kha'Zix", img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Khazix.png' },
        { name: 'Elise', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Elise.png' }
      ],
      avgTime: '18-24h',
      price: 0, // Sin cargo extra
      rating: 4.9,
      reviews: 342,
      languages: ['ES', 'EN'],
      specialties: ['Jungle', 'Aggressive Playstyle'],
      available: true
    },
    {
      id: 2,
      name: 'MidLaneKing',
      rank: 'Challenger',
      rankImg: 'https://static.wikia.nocookie.net/leagueoflegends/images/0/02/Season_2022_-_Challenger.png',
      winRate: 96.8,
      gamesPlayed: 892,
      mainChampions: [
        { name: 'Yasuo', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Yasuo.png' },
        { name: 'Zed', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Zed.png' },
        { name: 'Ahri', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Ahri.png' }
      ],
      avgTime: '12-18h',
      price: 15, // +$15
      rating: 5.0,
      reviews: 198,
      languages: ['ES', 'EN', 'PT'],
      specialties: ['Mid Lane', 'Carry Potential'],
      available: true,
      featured: true
    },
    {
      id: 3,
      name: 'ADCMaster',
      rank: 'Grandmaster',
      rankImg: 'https://static.wikia.nocookie.net/leagueoflegends/images/f/fc/Season_2022_-_Grandmaster.png',
      winRate: 93.5,
      gamesPlayed: 1456,
      mainChampions: [
        { name: 'Jinx', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Jinx.png' },
        { name: 'Kai\'Sa', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Kaisa.png' },
        { name: 'Vayne', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Vayne.png' }
      ],
      avgTime: '24-36h',
      price: 0,
      rating: 4.8,
      reviews: 521,
      languages: ['ES'],
      specialties: ['ADC', 'Late Game'],
      available: true
    },
    {
      id: 4,
      name: 'TopLaneGod',
      rank: 'Master',
      rankImg: 'https://static.wikia.nocookie.net/leagueoflegends/images/e/eb/Season_2022_-_Master.png',
      winRate: 91.3,
      gamesPlayed: 678,
      mainChampions: [
        { name: 'Darius', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Darius.png' },
        { name: 'Garen', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Garen.png' },
        { name: 'Sett', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Sett.png' }
      ],
      avgTime: '24-48h',
      price: -5, // Descuento $5
      rating: 4.7,
      reviews: 234,
      languages: ['ES', 'EN'],
      specialties: ['Top Lane', 'Tank/Bruiser'],
      available: false
    },
    {
      id: 5,
      name: 'SupportPro',
      rank: 'Grandmaster',
      rankImg: 'https://static.wikia.nocookie.net/leagueoflegends/images/f/fc/Season_2022_-_Grandmaster.png',
      winRate: 92.1,
      gamesPlayed: 934,
      mainChampions: [
        { name: 'Thresh', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Thresh.png' },
        { name: 'Nautilus', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Nautilus.png' },
        { name: 'Leona', img: 'https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/Leona.png' }
      ],
      avgTime: '20-30h',
      price: 0,
      rating: 4.9,
      reviews: 412,
      languages: ['ES', 'EN'],
      specialties: ['Support', 'Engage/Peel'],
      available: true
    }
  ]

  const sortedBoosters = [...boosters].sort((a, b) => {
    if (sortBy === 'recommended') return b.rating - a.rating
    if (sortBy === 'fastest') return parseInt(a.avgTime) - parseInt(b.avgTime)
    if (sortBy === 'winrate') return b.winRate - a.winRate
    if (sortBy === 'price') return a.price - b.price
    return 0
  })

  const handleSelectBooster = (booster) => {
    setSelectedBooster(booster)
  }

  const handleConfirm = () => {
    if (selectedBooster) {
      // Aquí iría la lógica para procesar el pedido
      console.log('Booster seleccionado:', selectedBooster)
      console.log('Detalles del pedido:', orderDetails)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-hextech-surface border-2 border-primary/30 rounded-xl shadow-[0_0_50px_rgba(0,209,181,0.3)]"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-hextech-dark border-b border-hextech-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Selecciona tu Booster</h2>
                <p className="text-white/50 text-sm mt-1">Elige al profesional que llevará tu cuenta al siguiente nivel</p>
              </div>
              <button
                onClick={onClose}
                className="size-10 flex items-center justify-center rounded-lg bg-hextech-surface border border-hextech-border hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Ordenar por:</span>
              <div className="flex gap-2">
                {[
                  { value: 'recommended', label: 'Recomendado' },
                  { value: 'fastest', label: 'Más Rápido' },
                  { value: 'winrate', label: 'Win Rate' },
                  { value: 'price', label: 'Precio' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                      sortBy === option.value
                        ? 'bg-primary text-black'
                        : 'bg-hextech-surface border border-hextech-border text-white/60 hover:text-primary hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Boosters List */}
          <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-6 space-y-4">
            {sortedBoosters.map(booster => (
              <motion.div
                key={booster.id}
                whileHover={{ scale: 1.01 }}
                className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedBooster?.id === booster.id
                    ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,209,181,0.2)]'
                    : booster.available
                    ? 'border-hextech-border bg-hextech-dark hover:border-primary/50'
                    : 'border-hextech-border bg-hextech-dark/50 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => booster.available && handleSelectBooster(booster)}
              >
                {/* Featured Badge */}
                {booster.featured && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-gold text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                    ⭐ Destacado
                  </div>
                )}

                {/* Unavailable Badge */}
                {!booster.available && (
                  <div className="absolute -top-3 right-6 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    No Disponible
                  </div>
                )}

                <div className="grid grid-cols-12 gap-6 items-center">
                  {/* Booster Info */}
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={booster.rankImg} 
                        alt={booster.rank}
                        className="w-16 h-16 object-contain"
                      />
                      <div className="absolute -bottom-1 -right-1 size-5 bg-green-500 rounded-full border-2 border-hextech-dark flex items-center justify-center">
                        <span className="material-symbols-outlined text-[10px] text-white">check</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{booster.name}</h3>
                      <p className="text-xs text-primary font-bold uppercase tracking-wider">{booster.rank}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-accent-gold text-sm">★</span>
                        <span className="text-xs font-bold">{booster.rating}</span>
                        <span className="text-white/40 text-xs">({booster.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">Win Rate</span>
                      <span className="text-sm font-bold text-green-500">{booster.winRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">Partidas</span>
                      <span className="text-sm font-bold">{booster.gamesPlayed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest">Tiempo Est.</span>
                      <span className="text-sm font-bold text-primary">{booster.avgTime}</span>
                    </div>
                  </div>

                  {/* Main Champions */}
                  <div className="col-span-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Campeones Principales</p>
                    <div className="flex gap-2">
                      {booster.mainChampions.map((champ, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={champ.img} 
                            alt={champ.name}
                            className="w-10 h-10 rounded border border-primary/30 group-hover:border-primary transition-colors"
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {champ.name}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {booster.languages.map(lang => (
                        <span key={lang} className="px-2 py-0.5 bg-hextech-surface border border-hextech-border text-[9px] font-bold rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-right">
                    {booster.price === 0 ? (
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Sin cargo extra</p>
                        <p className="text-2xl font-black text-primary">Incluido</p>
                      </div>
                    ) : booster.price > 0 ? (
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Cargo adicional</p>
                        <p className="text-2xl font-black text-accent-gold">+${booster.price}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Descuento</p>
                        <p className="text-2xl font-black text-green-500">${booster.price}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specialties */}
                <div className="mt-4 pt-4 border-t border-hextech-border flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">military_tech</span>
                  <div className="flex gap-2">
                    {booster.specialties.map((spec, idx) => (
                      <span key={idx} className="text-xs text-white/60">
                        {spec}{idx < booster.specialties.length - 1 && ' •'}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-hextech-dark border-t border-hextech-border p-6">
            <div className="flex items-center justify-between">
              <div>
                {selectedBooster ? (
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest">Booster Seleccionado</p>
                    <p className="text-lg font-bold">{selectedBooster.name} - {selectedBooster.rank}</p>
                  </div>
                ) : (
                  <p className="text-sm text-white/40">Selecciona un booster para continuar</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-hextech-surface border border-hextech-border rounded text-sm font-bold uppercase tracking-wider hover:border-white/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedBooster}
                  className={`px-8 py-3 rounded text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    selectedBooster
                      ? 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,209,181,0.3)]'
                      : 'bg-hextech-surface border border-hextech-border text-white/30 cursor-not-allowed'
                  }`}
                >
                  Confirmar y Pagar
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
