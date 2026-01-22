import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import RankIcon from '../components/RankIcon'
import PageTransition from '../components/PageTransition'
import BoosterSelector from '../components/BoosterSelector'
import { RANKS, EXTRA_SERVICES } from '../utils/constants'

export default function CalculatorPage() {
  const [currentRank, setCurrentRank] = useState(0) // Iron
  const [currentDivision, setCurrentDivision] = useState(0) // IV
  const [desiredRank, setDesiredRank] = useState(0) // Iron
  const [desiredDivision, setDesiredDivision] = useState(3) // I
  const [wins, setWins] = useState(5) // Para Master+
  const [extras, setExtras] = useState({ lane: false, offline: false, stream: false })
  const [isDuoBoost, setIsDuoBoost] = useState(false)
  const [champions, setChampions] = useState([])
  const [selectedChampion, setSelectedChampion] = useState(null)
  const [championSearch, setChampionSearch] = useState('')
  const [showChampionSelector, setShowChampionSelector] = useState(false)
  const [showBoosterSelector, setShowBoosterSelector] = useState(false)
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false)

  // Cargar campeones desde la API de Data Dragon
  useEffect(() => {
    fetch('https://ddragon.leagueoflegends.com/cdn/14.24.1/data/en_US/champion.json')
      .then(res => res.json())
      .then(data => {
        const champList = Object.values(data.data).map(champ => ({
          id: champ.id,
          name: champ.name,
          image: `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champ.id}.png`
        }))
        
        // Agregar campeones nuevos que no están en la API
        const newChampions = [
          {
            id: 'Mel',
            name: 'Mel',
            image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/Mel_0.jpg'
          },
          {
            id: 'Yunara',
            name: 'Yunara',
            image: 'https://opgg-static.akamaized.net/meta/images/lol/16.1.1/champion/Yunara.png?image=c_crop,h_103,w_103,x_9,y_9/q_auto:good,f_webp,w_160,h_160&v=1601'
          },
          {
            id: 'Zaahen',
            name: 'Zaahen',
            image: 'https://opgg-static.akamaized.net/meta/images/lol/16.1.1/champion/Zaahen.png?image=c_crop,h_103,w_103,x_9,y_9/q_auto:good,f_webp,w_160,h_160&v=1601'
          }
        ]
        
        setChampions([...champList, ...newChampions].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch(err => console.error('Error loading champions:', err))
  }, [])

  // Obtener divisiones disponibles para el rango actual
  const currentDivisions = RANKS[currentRank]?.divisions || ['I']
  const desiredDivisions = RANKS[desiredRank]?.divisions || ['I']
  
  // Verificar si es un rango de alto nivel (Master+)
  const isHighElo = (rankIndex) => rankIndex >= 7 // Master, Grandmaster, Challenger

  // Calcular precio basado en la diferencia de rangos
  const calculatePrice = () => {
    let basePrice = 20
    
    // Si el objetivo es Master, Grandmaster o Challenger
    if (isHighElo(desiredRank)) {
      // Precio por wins
      basePrice = wins * 15 // $15 por win
    } else {
      const rankDiff = desiredRank - currentRank
      
      if (rankDiff === 0) {
        // Mismo rango, calcular por divisiones
        const divisionDiff = desiredDivision - currentDivision
        basePrice += divisionDiff * 8
      } else {
        // Diferentes rangos
        basePrice += rankDiff * 30
        const divisionDiff = desiredDivision - currentDivision
        basePrice += divisionDiff * 5
      }
    }
    
    // Si es Duo Boost, aumentar precio en 20%
    if (isDuoBoost) {
      basePrice *= 1.2
    }
    
    // Si seleccionó campeón específico, agregar $5
    if (selectedChampion) {
      basePrice += 5
    }
    
    // Aplicar extras
    if (extras.lane) basePrice += 10
    if (extras.offline) basePrice += 15
    if (extras.stream) basePrice *= 1.15
    
    return Math.max(basePrice, 20).toFixed(2)
  }

  // Calcular desglose detallado del precio
  const getPriceBreakdown = () => {
    const breakdown = []
    let basePrice = 20
    
    // Precio base por rango/división
    if (isHighElo(desiredRank)) {
      breakdown.push({
        label: `${wins} Victorias en ${RANKS[desiredRank].name}`,
        value: wins * 15,
        type: 'base'
      })
      basePrice = wins * 15
    } else {
      const rankDiff = desiredRank - currentRank
      
      if (rankDiff === 0) {
        const divisionDiff = desiredDivision - currentDivision
        breakdown.push({
          label: `${divisionDiff} División${divisionDiff > 1 ? 'es' : ''} en ${RANKS[currentRank].name}`,
          value: 20 + (divisionDiff * 8),
          type: 'base'
        })
        basePrice = 20 + (divisionDiff * 8)
      } else {
        breakdown.push({
          label: `${rankDiff} Liga${rankDiff > 1 ? 's' : ''} (${RANKS[currentRank].name} → ${RANKS[desiredRank].name})`,
          value: 20 + (rankDiff * 30),
          type: 'base'
        })
        basePrice = 20 + (rankDiff * 30)
        
        const divisionDiff = desiredDivision - currentDivision
        if (divisionDiff !== 0) {
          breakdown.push({
            label: `Ajuste de divisiones`,
            value: divisionDiff * 5,
            type: 'adjustment'
          })
          basePrice += divisionDiff * 5
        }
      }
    }
    
    let currentTotal = basePrice
    
    // Duo Boost
    if (isDuoBoost) {
      const duoCost = basePrice * 0.2
      breakdown.push({
        label: 'Duo Boost (+20%)',
        value: duoCost,
        type: 'extra'
      })
      currentTotal += duoCost
    }
    
    // Campeón específico
    if (selectedChampion) {
      breakdown.push({
        label: `Campeón: ${selectedChampion.name}`,
        value: 5,
        type: 'extra'
      })
      currentTotal += 5
    }
    
    // Extras
    if (extras.lane) {
      breakdown.push({
        label: 'Carril Específico',
        value: 10,
        type: 'extra'
      })
      currentTotal += 10
    }
    
    if (extras.offline) {
      breakdown.push({
        label: 'Modo Offline',
        value: 15,
        type: 'extra'
      })
      currentTotal += 15
    }
    
    if (extras.stream) {
      const streamCost = currentTotal * 0.15
      breakdown.push({
        label: 'Stream Privado (+15%)',
        value: streamCost,
        type: 'extra'
      })
      currentTotal += streamCost
    }
    
    return {
      breakdown,
      total: Math.max(currentTotal, 20)
    }
  }

  // Filtrar campeones por búsqueda
  const filteredChampions = champions.filter(champ => 
    champ.name.toLowerCase().includes(championSearch.toLowerCase())
  )

  return (
    <PageTransition>
      <div className="bg-background-light dark:bg-background-dark font-display text-white selection:bg-primary/30">
        <div className="relative min-h-screen flex flex-col hex-grid-bg">
          <Header />
        
        <main className="flex-1 flex flex-col items-center justify-start py-12 px-6">
          <div className="max-w-4xl w-full text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">
              Configura tu <span className="text-primary">Ascenso</span>
            </h2>
            <p className="text-primary/70 text-lg max-w-2xl mx-auto font-light">
              Interfaz de calibración Hextech. Selecciona tu posición actual y el objetivo deseado para procesar tu presupuesto en tiempo real.
            </p>
          </div>

          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-px bg-hextech-border/30 border border-hextech-border rounded-lg overflow-hidden backdrop-blur-sm">
              <div className="bg-hextech-surface p-8 flex flex-col gap-6 relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Rango Actual</h3>
                  <span className="material-symbols-outlined text-primary/40">sensors</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {RANKS.map((rank, idx) => (
                    <RankIcon
                      key={rank.name}
                      src={rank.img}
                      alt={`${rank.name} rank`}
                      isActive={currentRank === idx}
                      onClick={() => setCurrentRank(idx)}
                    />
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="text-[10px] uppercase tracking-widest text-primary/50 mb-2 block">
                    División Actual {currentDivisions.length === 1 && '(Solo tiene una división)'}
                  </label>
                  <div className={`grid gap-2 ${currentDivisions.length === 4 ? 'grid-cols-4' : 'grid-cols-1'}`}>
                    {currentDivisions.map((div, idx) => (
                      <button
                        key={div}
                        onClick={() => {
                          setCurrentDivision(idx)
                          // Si el rango objetivo es el mismo y la nueva división es mayor o igual, ajustar
                          if (desiredRank === currentRank && desiredDivision <= idx) {
                            const nextDivision = Math.min(idx + 1, currentDivisions.length - 1)
                            setDesiredDivision(nextDivision)
                          }
                        }}
                        className={`py-2 border text-xs font-bold transition-colors ${
                          currentDivision === idx
                            ? 'bg-primary text-black border-primary'
                            : 'bg-hextech-dark border-hextech-border hover:border-primary'
                        }`}
                      >
                        {div}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-hextech-surface p-8 flex flex-col gap-6 relative border-t md:border-t-0 md:border-l border-hextech-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-accent-gold text-xs font-bold tracking-[0.2em] uppercase">Objetivo Deseado</h3>
                  <span className="material-symbols-outlined text-accent-gold/40">military_tech</span>
                </div>
                
                {/* Mensaje informativo para Master+ */}
                {!isHighElo(currentRank) && (
                  <div className="bg-primary/10 border border-primary/30 rounded p-3 flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
                    <p className="text-[10px] text-primary/90 leading-relaxed">
                      <span className="font-bold">NOTA:</span> Para acceder a Master, Grandmaster o Challenger, primero debes alcanzar Diamond I. 
                      No se pueden saltar rangos intermedios.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-2">
                  {RANKS.map((rank, idx) => {
                    // Para rangos normales
                    const isMaxDivision = currentDivision === currentDivisions.length - 1
                    
                    // Si el objetivo es Master+ pero el usuario no está en Diamond I, deshabilitar
                    const canAccessHighElo = currentRank === 6 && currentDivision === 3 // Diamond I
                    const isDisabled = idx < currentRank || 
                                      (idx === currentRank && isMaxDivision && !isHighElo(idx)) ||
                                      (isHighElo(idx) && !canAccessHighElo)
                    
                    return (
                      <RankIcon
                        key={rank.name}
                        src={rank.img}
                        alt={`${rank.name} rank`}
                        isActive={desiredRank === idx}
                        isDisabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            if (isHighElo(idx)) {
                              // Master, Grandmaster, Challenger - sistema de wins
                              setDesiredRank(idx)
                              setWins(5) // Reset a 5 wins por defecto
                            } else if (idx > currentRank) {
                              // Rango superior normal
                              setDesiredRank(idx)
                              setDesiredDivision(0)
                            } else if (idx === currentRank && !isMaxDivision) {
                              // Mismo rango, división superior
                              setDesiredRank(idx)
                              setDesiredDivision(currentDivision + 1)
                            }
                          }
                        }}
                      />
                    )
                  })}
                </div>
                
                <div className="mt-4">
                  <label className="text-[10px] uppercase tracking-widest text-accent-gold/50 mb-2 block">
                    {isHighElo(desiredRank) ? 'Cantidad de Wins' : `División Objetivo ${desiredDivisions.length === 1 ? '(Solo tiene una división)' : ''}`}
                  </label>
                  
                  {isHighElo(desiredRank) ? (
                    // Selector de wins para Master+
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setWins(Math.max(1, wins - 1))}
                          className="size-10 bg-hextech-dark border border-hextech-border hover:border-accent-gold text-accent-gold font-bold text-xl rounded transition-colors"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center">
                          <div className="text-4xl font-black text-accent-gold">{wins}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">Victorias</div>
                        </div>
                        <button
                          onClick={() => setWins(wins + 1)}
                          className="size-10 bg-hextech-dark border border-hextech-border hover:border-accent-gold text-accent-gold font-bold text-xl rounded transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[5, 10, 20].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setWins(amount)}
                            className={`py-2 border text-xs font-bold transition-colors ${
                              wins === amount
                                ? 'bg-accent-gold text-black border-accent-gold'
                                : 'bg-hextech-dark border-hextech-border hover:border-accent-gold'
                            }`}
                          >
                            {amount} Wins
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Selector de divisiones normal
                    <div className={`grid gap-2 ${desiredDivisions.length === 4 ? 'grid-cols-4' : 'grid-cols-1'}`}>
                      {desiredDivisions.map((div, idx) => {
                        const isDisabled = desiredRank === currentRank && idx <= currentDivision
                        
                        return (
                          <button
                            key={div}
                            onClick={() => {
                              if (!isDisabled) {
                                setDesiredDivision(idx)
                              }
                            }}
                            disabled={isDisabled}
                            className={`py-2 border text-xs font-bold transition-colors ${
                              desiredDivision === idx
                                ? 'bg-accent-gold text-black border-accent-gold'
                                : isDisabled
                                ? 'bg-hextech-dark/30 border-hextech-border/30 text-white/30 cursor-not-allowed'
                                : 'bg-hextech-dark border-hextech-border hover:border-accent-gold'
                            }`}
                          >
                            {div}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Duo Boost Toggle */}
              <div className="bg-hextech-surface border border-hextech-border p-6 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Duo Boost</h4>
                    <p className="text-[9px] text-white/50 mt-1">Juega con el booster (+20%)</p>
                  </div>
                  <button
                    onClick={() => setIsDuoBoost(!isDuoBoost)}
                    className={`w-12 h-6 rounded-full relative p-0.5 flex items-center transition-colors ${
                      isDuoBoost ? 'bg-primary' : 'bg-hextech-border'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full transition-all ${
                      isDuoBoost ? 'bg-black ml-auto' : 'bg-white/20'
                    }`}></div>
                  </button>
                </div>
                {isDuoBoost && (
                  <div className="bg-primary/10 border border-primary/30 rounded p-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xs">group</span>
                    <p className="text-[9px] text-primary/90">Jugarás junto al booster en tiempo real</p>
                  </div>
                )}
              </div>

              {/* Champion Selector */}
              <div className="bg-hextech-surface border border-hextech-border p-6 rounded-lg backdrop-blur-sm">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
                  Elige tu Champion <span className="text-white/40">(+$5)</span>
                </h4>
                
                {selectedChampion ? (
                  <div className="flex items-center gap-3 p-3 bg-hextech-dark border border-primary rounded">
                    <img 
                      src={selectedChampion.image} 
                      alt={selectedChampion.name}
                      className="w-12 h-12 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{selectedChampion.name}</p>
                      <p className="text-[9px] text-white/50">Champion seleccionado</p>
                    </div>
                    <button
                      onClick={() => setSelectedChampion(null)}
                      className="text-white/50 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowChampionSelector(!showChampionSelector)}
                    className="w-full py-3 bg-hextech-dark border border-hextech-border hover:border-primary text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">search</span>
                    Seleccionar Champion
                  </button>
                )}

                {/* Champion Selector Modal */}
                {showChampionSelector && !selectedChampion && (
                  <div className="mt-4 border border-hextech-border rounded-lg overflow-hidden">
                    <div className="p-3 bg-hextech-dark">
                      <input
                        type="text"
                        placeholder="Buscar champion..."
                        value={championSearch}
                        onChange={(e) => setChampionSearch(e.target.value)}
                        className="w-full bg-black/30 border border-hextech-border rounded px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto grid grid-cols-4 gap-2 p-3 bg-hextech-dark/50">
                      {filteredChampions.slice(0, 40).map(champ => (
                        <button
                          key={champ.id}
                          onClick={() => {
                            setSelectedChampion(champ)
                            setShowChampionSelector(false)
                            setChampionSearch('')
                          }}
                          className="flex flex-col items-center gap-1 p-2 hover:bg-primary/20 rounded transition-colors group"
                          title={champ.name}
                        >
                          <img 
                            src={champ.image} 
                            alt={champ.name}
                            className="w-full aspect-square rounded border border-hextech-border group-hover:border-primary transition-colors"
                          />
                          <span className="text-[8px] text-white/70 group-hover:text-primary truncate w-full text-center">
                            {champ.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-hextech-surface border border-hextech-border p-6 rounded-lg backdrop-blur-sm">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-6 border-b border-hextech-border pb-4">
                  Servicios Extra
                </h4>
                <div className="space-y-4">
                  {EXTRA_SERVICES.map(({ key, icon, label, extra }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-hextech-dark/50 border border-white/5 rounded">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                        <span className="text-xs font-semibold uppercase tracking-tight">
                          {label} {extra && <span className="text-primary/70 ml-1">{extra}</span>}
                        </span>
                      </div>
                      <button
                        onClick={() => setExtras({ ...extras, [key]: !extras[key] })}
                        className={`w-10 h-5 rounded-full relative p-0.5 flex items-center transition-colors ${
                          extras[key] ? 'bg-primary' : 'bg-hextech-border'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-all ${
                          extras[key] ? 'bg-black ml-auto' : 'bg-white/20'
                        }`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-hextech-surface border-2 border-accent-gold p-8 rounded-lg flex flex-col items-center gap-4 glow-gold relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <span className="material-symbols-outlined text-6xl">account_balance_wallet</span>
                </div>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent-gold/60">Total Estimado</span>
                
                {/* Precio con tooltip */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowPriceBreakdown(true)}
                    onMouseLeave={() => setShowPriceBreakdown(false)}
                    onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                    className="flex items-baseline gap-1 cursor-help hover:opacity-80 transition-opacity"
                  >
                    <span className="text-4xl font-black italic">$</span>
                    <span className="text-6xl font-black italic tracking-tighter">{calculatePrice()}</span>
                    <span className="material-symbols-outlined text-accent-gold/60 text-2xl ml-2">info</span>
                  </button>

                  {/* Tooltip de desglose */}
                  {showPriceBreakdown && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 bg-hextech-dark border-2 border-accent-gold rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3)] z-50 p-4">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-hextech-border">
                        <h3 className="text-sm font-bold text-accent-gold uppercase tracking-wider">Desglose del Precio</h3>
                        <span className="material-symbols-outlined text-accent-gold text-sm">receipt</span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {getPriceBreakdown().breakdown.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-xs">
                            <span className={`${
                              item.type === 'base' ? 'text-white font-bold' :
                              item.type === 'extra' ? 'text-primary' :
                              'text-white/60'
                            }`}>
                              {item.label}
                            </span>
                            <span className={`font-bold ${
                              item.type === 'base' ? 'text-white' :
                              item.type === 'extra' ? 'text-primary' :
                              'text-white/60'
                            }`}>
                              +${item.value.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-accent-gold/30 pt-3 flex justify-between items-center">
                        <span className="text-sm font-black uppercase text-accent-gold">Total</span>
                        <span className="text-2xl font-black text-accent-gold">
                          ${getPriceBreakdown().total.toFixed(2)}
                        </span>
                      </div>

                      {/* Flecha del tooltip */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-2">
                        <div className="w-4 h-4 bg-hextech-dark border-r-2 border-b-2 border-accent-gold rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-white/40 uppercase tracking-widest text-center">
                  {isHighElo(desiredRank) 
                    ? `${wins} Victorias en ${RANKS[desiredRank].name}`
                    : `De ${RANKS[currentRank].name} ${currentDivisions[currentDivision]} a ${RANKS[desiredRank].name} ${desiredDivisions[desiredDivision]}`
                  }
                  {isDuoBoost && ' • Duo Boost'}
                  {selectedChampion && ` • ${selectedChampion.name}`}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest text-center">
                  Entrega estimada: 48-72 Horas
                </p>
                <button 
                  onClick={() => setShowBoosterSelector(true)}
                  className="w-full mt-2 py-4 bg-accent-gold hover:bg-accent-gold/90 text-black font-black uppercase tracking-[0.15em] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span>Buscar Booster</span>
                  <span className="material-symbols-outlined">person_search</span>
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Booster Selector Modal */}
      <BoosterSelector 
        isOpen={showBoosterSelector}
        onClose={() => setShowBoosterSelector(false)}
        orderDetails={{
          boost_type: isDuoBoost ? 'duo' : 'solo',
          current_rank: RANKS[currentRank].name,
          current_division: currentDivisions[currentDivision],
          desired_rank: RANKS[desiredRank].name,
          desired_division: isHighElo(desiredRank) ? null : desiredDivisions[desiredDivision],
          wins_requested: isHighElo(desiredRank) ? wins : null,
          selected_champion: selectedChampion?.name || null,
          extras: JSON.stringify(extras),
          total_price: parseFloat(calculatePrice())
        }}
      />
    </div>
    </PageTransition>
  )
}
