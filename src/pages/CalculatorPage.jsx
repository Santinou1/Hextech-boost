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
  const [currentLP, setCurrentLP] = useState(0) // LP actual para Master+
  const [desiredLP, setDesiredLP] = useState(100) // LP deseado para Master+
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
                      onClick={() => {
                        setCurrentRank(idx)
                        // Si cambia a Master+, resetear LP
                        if (isHighElo(idx)) {
                          setCurrentLP(0)
                          setDesiredLP(100)
                          // Si el objetivo no es Master+, cambiar a Master
                          if (!isHighElo(desiredRank)) {
                            setDesiredRank(7) // Master
                          }
                        } else {
                          // Si cambia a rango normal desde Master+, resetear objetivo si es necesario
                          if (isHighElo(desiredRank) && desiredRank > 7) {
                            setDesiredRank(idx < 7 ? 7 : idx) // Master o el rango actual
                          }
                        }
                      }}
                    />
                  ))}
                </div>
                
                <div className="mt-4">
                  {isHighElo(currentRank) ? (
                    // Selector de LP para Master+ como rango actual
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-primary/50 mb-2 block">
                        LP Actual en {RANKS[currentRank].name}
                      </label>
                      <div className="bg-hextech-dark/50 border border-hextech-border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={currentLP}
                            onChange={(e) => {
                              const newLP = parseInt(e.target.value)
                              setCurrentLP(newLP)
                              // Si el objetivo es el mismo rango y el LP deseado es menor, ajustar
                              if (desiredRank === currentRank && desiredLP <= newLP) {
                                setDesiredLP(newLP + 50)
                              }
                            }}
                            className="flex-1 h-2 bg-hextech-border rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            step="10"
                            value={currentLP}
                            onChange={(e) => {
                              const newLP = Math.max(0, Math.min(1000, parseInt(e.target.value) || 0))
                              setCurrentLP(newLP)
                              if (desiredRank === currentRank && desiredLP <= newLP) {
                                setDesiredLP(newLP + 50)
                              }
                            }}
                            className="w-20 px-3 py-2 bg-hextech-dark border border-hextech-border rounded text-sm font-bold text-center focus:outline-none focus:border-primary"
                          />
                          <span className="text-xs text-white/60 font-bold">LP</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Selector de división para rangos normales
                    <div>
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
                  )}
                </div>
              </div>

              <div className="bg-hextech-surface p-8 flex flex-col gap-6 relative border-t md:border-t-0 md:border-l border-hextech-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-accent-gold text-xs font-bold tracking-[0.2em] uppercase">Objetivo Deseado</h3>
                  <span className="material-symbols-outlined text-accent-gold/40">military_tech</span>
                </div>
                
                {/* Mensaje informativo para GM/Challenger */}
                {!isHighElo(currentRank) && (
                  <div className="bg-primary/10 border border-primary/30 rounded p-3 flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
                    <p className="text-[10px] text-primary/90 leading-relaxed">
                      <span className="font-bold">NOTA:</span> Grandmaster y Challenger solo son accesibles desde Master. 
                      Master está disponible desde cualquier rango.
                    </p>
                  </div>
                )}
                
                {/* Mensaje para Master+ */}
                {isHighElo(currentRank) && (
                  <div className="bg-accent-gold/10 border border-accent-gold/30 rounded p-3 flex items-start gap-2">
                    <span className="material-symbols-outlined text-accent-gold text-sm mt-0.5">info</span>
                    <p className="text-[10px] text-accent-gold/90 leading-relaxed">
                      <span className="font-bold">MASTER+:</span> Puedes comprar LP en tu rango actual o avanzar a rangos superiores.
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-4 gap-2">
                  {RANKS.map((rank, idx) => {
                    const isMaxDivision = currentDivision === currentDivisions.length - 1
                    
                    let isDisabled = false
                    
                    // Lógica de validación según el rango actual
                    if (isHighElo(currentRank)) {
                      // Si estás en Master+, puedes:
                      // - Quedarte en el mismo rango (comprar LP)
                      // - Ir a rangos Master+ superiores
                      // - NO puedes ir a rangos inferiores
                      if (idx < 7) {
                        // No puede ir a rangos normales desde Master+
                        isDisabled = true
                      } else if (idx < currentRank) {
                        // No puede ir a un rango Master+ inferior
                        isDisabled = true
                      }
                      // idx >= currentRank && idx >= 7 está permitido (mismo rango o superior Master+)
                    } else {
                      // Si estás en rango normal:
                      if (idx < currentRank) {
                        // No puede ir a un rango inferior
                        isDisabled = true
                      } else if (idx === currentRank && isMaxDivision) {
                        // Mismo rango, ya está en la división máxima
                        isDisabled = true
                      } else if (idx === 8 || idx === 9) {
                        // GM (8) y Challenger (9) solo desde Master (7)
                        isDisabled = true
                      }
                      // Master (7) está disponible desde cualquier rango
                    }
                    
                    return (
                      <RankIcon
                        key={rank.name}
                        src={rank.img}
                        alt={`${rank.name} rank`}
                        isActive={desiredRank === idx}
                        isDisabled={isDisabled}
                        onClick={() => {
                          if (!isDisabled) {
                            setDesiredRank(idx)
                            if (isHighElo(idx)) {
                              // Master, Grandmaster, Challenger - sistema de LP
                              if (isHighElo(currentRank)) {
                                // Ya está en Master+
                                if (idx === currentRank) {
                                  // Mismo rango Master+, mantener LP actual y ajustar deseado
                                  setDesiredLP(Math.max(currentLP + 100, 100))
                                } else {
                                  // Cambio a rango Master+ superior, resetear LP
                                  setDesiredLP(100)
                                }
                              } else {
                                // Viene de rango normal a Master+
                                setCurrentLP(0)
                                setDesiredLP(100)
                              }
                            } else if (idx > currentRank) {
                              // Rango superior normal
                              setDesiredDivision(0)
                            } else if (idx === currentRank && !isMaxDivision) {
                              // Mismo rango, división superior
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
                    {isHighElo(desiredRank) ? 'League Points (LP)' : `División Objetivo ${desiredDivisions.length === 1 ? '(Solo tiene una división)' : ''}`}
                  </label>
                  
                  {isHighElo(desiredRank) ? (
                    // Selector de LP para Master+
                    <div className="space-y-4">
                      {/* LP Actual */}
                      {isHighElo(currentRank) && currentRank === desiredRank && (
                        <div className="bg-hextech-dark/50 border border-hextech-border rounded-lg p-4">
                          <label className="text-[9px] uppercase tracking-widest text-white/40 mb-2 block">LP Actual</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="1000"
                              step="10"
                              value={currentLP}
                              onChange={(e) => {
                                const newLP = parseInt(e.target.value)
                                setCurrentLP(newLP)
                                if (desiredLP <= newLP) {
                                  setDesiredLP(newLP + 50)
                                }
                              }}
                              className="flex-1 h-2 bg-hextech-border rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <input
                              type="number"
                              min="0"
                              max="1000"
                              step="10"
                              value={currentLP}
                              onChange={(e) => {
                                const newLP = Math.max(0, Math.min(1000, parseInt(e.target.value) || 0))
                                setCurrentLP(newLP)
                                if (desiredLP <= newLP) {
                                  setDesiredLP(newLP + 50)
                                }
                              }}
                              className="w-20 px-3 py-2 bg-hextech-dark border border-hextech-border rounded text-sm font-bold text-center focus:outline-none focus:border-primary"
                            />
                            <span className="text-xs text-white/60 font-bold">LP</span>
                          </div>
                        </div>
                      )}
                      
                      {/* LP Deseado */}
                      <div className="bg-hextech-dark/50 border border-accent-gold/30 rounded-lg p-4">
                        <label className="text-[9px] uppercase tracking-widest text-accent-gold/60 mb-2 block">
                          LP Objetivo en {RANKS[desiredRank].name}
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={isHighElo(currentRank) && currentRank === desiredRank ? currentLP + 50 : 0}
                            max="1000"
                            step="10"
                            value={desiredLP}
                            onChange={(e) => setDesiredLP(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-hextech-border rounded-lg appearance-none cursor-pointer accent-accent-gold"
                          />
                          <input
                            type="number"
                            min={isHighElo(currentRank) && currentRank === desiredRank ? currentLP + 50 : 0}
                            max="1000"
                            step="10"
                            value={desiredLP}
                            onChange={(e) => {
                              const minLP = isHighElo(currentRank) && currentRank === desiredRank ? currentLP + 50 : 0
                              const newLP = Math.max(minLP, Math.min(1000, parseInt(e.target.value) || 0))
                              setDesiredLP(newLP)
                            }}
                            className="w-20 px-3 py-2 bg-hextech-dark border border-accent-gold/30 rounded text-sm font-bold text-center text-accent-gold focus:outline-none focus:border-accent-gold"
                          />
                          <span className="text-xs text-accent-gold/60 font-bold">LP</span>
                        </div>
                        <p className="text-[9px] text-white/40 mt-2">
                          Cada 50 LP = 1 tarifa. Total: {Math.ceil((desiredLP - (isHighElo(currentRank) && currentRank === desiredRank ? currentLP : 0)) / 50)} tarifas
                        </p>
                      </div>
                      
                      {/* Presets rápidos */}
                      <div className="grid grid-cols-4 gap-2">
                        {[100, 200, 400, 600].map((lp) => (
                          <button
                            key={lp}
                            onClick={() => setDesiredLP(lp)}
                            className={`py-2 border text-xs font-bold transition-colors ${
                              desiredLP === lp
                                ? 'bg-accent-gold text-black border-accent-gold'
                                : 'bg-hextech-dark border-hextech-border hover:border-accent-gold'
                            }`}
                          >
                            {lp} LP
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

              <div className="bg-hextech-surface border-2 border-primary p-8 rounded-lg flex flex-col items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <span className="material-symbols-outlined text-8xl">groups</span>
                </div>
                
                {/* Ícono principal */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary">
                  <span className="material-symbols-outlined text-5xl text-primary">person_search</span>
                </div>

                {/* Título */}
                <div className="text-center">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-primary mb-2">
                    Encuentra tu Booster
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed max-w-sm">
                    Hextech Boost es una plataforma donde boosters profesionales crean sus perfiles y establecen sus propias tarifas. 
                    Cada booster configura sus precios según su experiencia y disponibilidad.
                  </p>
                </div>

                {/* Resumen de la configuración */}
                <div className="w-full bg-hextech-dark/50 border border-hextech-border rounded-lg p-4">
                  <p className="text-xs text-white/80 text-center font-semibold mb-2">
                    Tu configuración:
                  </p>
                  <p className="text-sm text-primary text-center font-bold">
                    {isHighElo(desiredRank) 
                      ? isHighElo(currentRank) && currentRank === desiredRank
                        ? `${RANKS[currentRank].name} ${currentLP} LP → ${desiredLP} LP`
                        : isHighElo(currentRank)
                        ? `${RANKS[currentRank].name} ${currentLP} LP → ${RANKS[desiredRank].name} ${desiredLP} LP`
                        : `${RANKS[currentRank].name} ${currentDivisions[currentDivision]} → ${RANKS[desiredRank].name} ${desiredLP} LP`
                      : `${RANKS[currentRank].name} ${currentDivisions[currentDivision]} → ${RANKS[desiredRank].name} ${desiredDivisions[desiredDivision]}`
                    }
                  </p>
                  {(isDuoBoost || selectedChampion) && (
                    <p className="text-xs text-white/50 text-center mt-1">
                      {isDuoBoost && 'Duo Boost'}
                      {isDuoBoost && selectedChampion && ' • '}
                      {selectedChampion && selectedChampion.name}
                    </p>
                  )}
                </div>

                {/* Características */}
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span>Compara precios de múltiples boosters</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span>Cada booster establece sus tarifas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    <span>Elige según precio, rating y experiencia</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowBoosterSelector(true)}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-[0.15em] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,209,181,0.3)]"
                >
                  <span>Ver Boosters Disponibles</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
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
          current_division: isHighElo(currentRank) ? null : currentDivisions[currentDivision],
          current_lp: isHighElo(currentRank) ? currentLP : null,
          desired_rank: RANKS[desiredRank].name,
          desired_division: isHighElo(desiredRank) ? null : desiredDivisions[desiredDivision],
          desired_lp: isHighElo(desiredRank) ? desiredLP : null,
          selected_champion: selectedChampion?.name || null,
          extras: JSON.stringify(extras),
          total_price: 0 // Ya no usamos precio calculado aquí
        }}
      />
    </div>
    </PageTransition>
  )
}
