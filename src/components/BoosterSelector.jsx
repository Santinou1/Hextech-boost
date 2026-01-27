import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { boosterService, orderService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import CheckoutModal from './CheckoutModal'

export default function BoosterSelector({ isOpen, onClose, orderDetails }) {
  const [selectedBooster, setSelectedBooster] = useState(null)
  const [sortBy, setSortBy] = useState('recommended')
  const [boosters, setBoosters] = useState([])
  const [boosterPrices, setBoosterPrices] = useState({}) // Nuevo: almacenar precios por booster
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)
  const [selectedBreakdown, setSelectedBreakdown] = useState(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    if (isOpen) {
      loadBoosters()
    }
  }, [isOpen])

  const loadBoosters = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await boosterService.getAll()
      const boostersData = response.data.boosters || []
      setBoosters(boostersData)
      
      // Calcular precio para cada booster
      await calculatePricesForBoosters(boostersData)
    } catch (err) {
      setError('Error al cargar los boosters')
    } finally {
      setLoading(false)
    }
  }

  const calculatePricesForBoosters = async (boostersData) => {
    const prices = {}
    
    for (const booster of boostersData) {
      try {
        // Validar que los datos sean válidos antes de enviar
        if (!orderDetails.current_rank || !orderDetails.desired_rank) {
          prices[booster.user_id] = {
            base_price: orderDetails.total_price || 0,
            final_price: orderDetails.total_price || 0,
            price_source: 'default',
            error: 'Datos de orden inválidos'
          }
          continue
        }
        
        // Construir parámetros según si usa LP o divisiones
        const params = {
          from_rank: orderDetails.current_rank,
          to_rank: orderDetails.desired_rank,
          boost_type: orderDetails.boost_type
        }
        
        // Agregar LP si están presentes (Master+)
        if (orderDetails.current_lp !== null && orderDetails.current_lp !== undefined) {
          params.from_lp = orderDetails.current_lp
        }
        if (orderDetails.desired_lp !== null && orderDetails.desired_lp !== undefined) {
          params.to_lp = orderDetails.desired_lp
        }
        
        // Agregar divisiones si están presentes (rangos normales)
        if (orderDetails.current_division) {
          params.from_division = orderDetails.current_division
        }
        if (orderDetails.desired_division) {
          params.to_division = orderDetails.desired_division
        }
        
        // Usar el endpoint unificado que considera bulk + individual
        const response = await boosterService.calculatePrice(booster.user_id, params)
        
        prices[booster.user_id] = {
          base_price: response.data.base_price,
          final_price: response.data.final_price,
          price_source: response.data.price_source,
          breakdown: response.data.breakdown || null
        }
      } catch (err) {
        // Determinar el tipo de error
        let errorMessage = 'Sin configuración de precios'
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error
        } else if (err.response?.status === 404) {
          errorMessage = 'Booster sin precios configurados'
        } else if (err.message) {
          errorMessage = err.message
        }
        
        // Si no tiene precio configurado, usar el precio del orderDetails como referencia
        prices[booster.user_id] = {
          base_price: orderDetails.total_price || 0,
          final_price: orderDetails.total_price || 0,
          price_source: 'default',
          error: errorMessage
        }
      }
    }
    
    setBoosterPrices(prices)
  }

  const sortedBoosters = [...boosters].sort((a, b) => {
    if (sortBy === 'recommended') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'fastest') return (a.avg_completion_time || 0) - (b.avg_completion_time || 0)
    if (sortBy === 'winrate') return (b.win_rate || 0) - (a.win_rate || 0)
    if (sortBy === 'price') {
      const priceA = boosterPrices[a.user_id]?.final_price || 999999
      const priceB = boosterPrices[b.user_id]?.final_price || 999999
      return priceA - priceB
    }
    return 0
  })

  const handleSelectBooster = (booster) => {
    console.log('=== Selecting Booster ===');
    console.log('booster:', booster);
    console.log('available:', booster.available);
    
    if (booster.available) {
      setSelectedBooster(booster);
      console.log('✅ Booster selected');
    } else {
      console.log('❌ Booster not available');
    }
  }

  const handleConfirm = async () => {
    console.log('=== handleConfirm Debug ===');
    console.log('selectedBooster:', selectedBooster);
    console.log('token:', token);
    console.log('user:', user);
    console.log('showCheckoutModal:', showCheckoutModal);
    
    if (!selectedBooster) {
      console.log('❌ No booster selected');
      alert('Por favor selecciona un booster primero');
      return;
    }

    if (!user || !token) {
      console.log('❌ User not logged in');
      alert('Debes iniciar sesión para crear una orden');
      return;
    }

    // Verificar que el booster tenga precio configurado
    const boosterPrice = boosterPrices[selectedBooster.user_id];
    console.log('boosterPrice:', boosterPrice);
    
    if (!boosterPrice || boosterPrice.error) {
      console.log('❌ No price configured');
      alert('Este booster no tiene precios configurados para este boost');
      return;
    }

    // Abrir el modal de checkout
    console.log('✅ Opening checkout modal');
    setShowCheckoutModal(true);
  }

  if (!isOpen) return null

  return (
    <>
    <AnimatePresence>
      {!showCheckoutModal && (
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
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/60 mt-4">Cargando boosters...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={loadBoosters}
                  className="mt-4 px-6 py-2 bg-primary text-black font-bold rounded hover:brightness-110 transition"
                >
                  Reintentar
                </button>
              </div>
            ) : boosters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No hay boosters disponibles en este momento</p>
              </div>
            ) : (
              sortedBoosters.map(booster => {
                // Handle both string and JSON formats for backward compatibility
                const mainChampions = booster.main_champions 
                  ? (typeof booster.main_champions === 'string' && !booster.main_champions.startsWith('[')
                      ? booster.main_champions.split(',').map(s => s.trim())
                      : JSON.parse(booster.main_champions))
                  : []
                
                const languages = booster.languages 
                  ? (typeof booster.languages === 'string' && !booster.languages.startsWith('[')
                      ? booster.languages.split(',').map(s => s.trim())
                      : JSON.parse(booster.languages))
                  : []
                
                const specialties = booster.specialties 
                  ? (typeof booster.specialties === 'string' && !booster.specialties.startsWith('[')
                      ? booster.specialties.split(',').map(s => s.trim())
                      : JSON.parse(booster.specialties))
                  : []
                
                return (
                  <motion.div
                    key={booster.user_id}
                    whileHover={{ scale: booster.available ? 1.01 : 1 }}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      booster.available ? 'cursor-pointer' : 'cursor-not-allowed'
                    } ${
                      selectedBooster?.user_id === booster.user_id
                        ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,209,181,0.2)]'
                        : booster.available
                        ? 'border-hextech-border bg-hextech-dark hover:border-primary/50'
                        : 'border-hextech-border bg-hextech-dark/50 opacity-60'
                    }`}
                    onClick={() => handleSelectBooster(booster)}
                  >
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
                          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {booster.username?.charAt(0).toUpperCase() || 'B'}
                            </span>
                          </div>
                          {booster.available && (
                            <div className="absolute -bottom-1 -right-1 size-5 bg-green-500 rounded-full border-2 border-hextech-dark flex items-center justify-center">
                              <span className="material-symbols-outlined text-[10px] text-white">check</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{booster.username || 'Booster'}</h3>
                          <p className="text-xs text-primary font-bold uppercase tracking-wider">
                            {booster.peak_rank || 'Master+'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-accent-gold text-sm">★</span>
                            <span className="text-xs font-bold">{booster.rating?.toFixed(1) || '5.0'}</span>
                            <span className="text-white/40 text-xs">({booster.total_reviews || 0})</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="col-span-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">Win Rate</span>
                          <span className="text-sm font-bold text-green-500">
                            {booster.win_rate ? `${booster.win_rate.toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">Órdenes</span>
                          <span className="text-sm font-bold">{booster.total_orders || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">Tiempo Est.</span>
                          <span className="text-sm font-bold text-primary">
                            {booster.avg_completion_time ? `${booster.avg_completion_time}h` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Main Champions */}
                      <div className="col-span-3">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Información</p>
                        {mainChampions.length > 0 ? (
                          <div className="flex gap-2 mb-2">
                            {mainChampions.slice(0, 3).map((champ, idx) => (
                              <div key={idx} className="px-2 py-1 bg-hextech-surface border border-hextech-border text-[10px] rounded">
                                {champ}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 mb-2">Todos los campeones</p>
                        )}
                        {languages.length > 0 && (
                          <div className="flex gap-1">
                            {languages.map(lang => (
                              <span key={lang} className="px-2 py-0.5 bg-hextech-surface border border-hextech-border text-[9px] font-bold rounded">
                                {lang}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-right">
                        {boosterPrices[booster.user_id] ? (
                          <div>
                            {boosterPrices[booster.user_id].error ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    alert(boosterPrices[booster.user_id].error)
                                  }}
                                  className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg hover:bg-yellow-500/30 transition-colors"
                                >
                                  <span className="text-sm font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">warning</span>
                                    Sin Precios
                                  </span>
                                </button>
                                <p className="text-[8px] text-white/40 mt-1">
                                  {boosterPrices[booster.user_id].error}
                                </p>
                              </>
                            ) : (
                              <>
                                {orderDetails.boost_type === 'duo' && boosterPrices[booster.user_id].base_price !== boosterPrices[booster.user_id].final_price && (
                                  <p className="text-xs text-white/40 line-through mb-1">
                                    ${boosterPrices[booster.user_id].base_price.toFixed(2)} ARS
                                  </p>
                                )}
                                <p className="text-2xl font-black text-primary mb-2">
                                  ${boosterPrices[booster.user_id].final_price.toFixed(2)} ARS
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (boosterPrices[booster.user_id].breakdown) {
                                      setSelectedBreakdown({
                                        boosterName: booster.username,
                                        ...boosterPrices[booster.user_id]
                                      })
                                      setShowBreakdownModal(true)
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg hover:bg-primary/20 hover:border-primary/50 transition-colors"
                                >
                                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    Ver Precios
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="inline-block size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-white/40 mt-1">Calculando...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specialties */}
                    {specialties.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-hextech-border flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">military_tech</span>
                        <div className="flex gap-2">
                          {specialties.map((spec, idx) => (
                            <span key={idx} className="text-xs text-white/60">
                              {spec}{idx < specialties.length - 1 && ' •'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
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
      )}

      {/* Modal de Desglose de Precio */}
      <AnimatePresence>
        {showBreakdownModal && selectedBreakdown && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBreakdownModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-hextech-surface border-2 border-primary rounded-xl shadow-[0_0_50px_rgba(0,209,181,0.3)] p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-hextech-border">
                <div>
                  <h3 className="text-xl font-bold text-primary uppercase tracking-wider">Desglose del Precio</h3>
                  <p className="text-xs text-white/60 mt-1">Booster: {selectedBreakdown.boosterName}</p>
                </div>
                <button
                  onClick={() => setShowBreakdownModal(false)}
                  className="size-8 flex items-center justify-center rounded-lg bg-hextech-dark border border-hextech-border hover:border-red-500 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Breakdown Items */}
              <div className="space-y-3 mb-6">
                {selectedBreakdown.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-hextech-dark rounded-lg">
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${
                        item.type === 'league_steps' ? 'text-white' :
                        item.type === 'transition' ? 'text-primary' :
                        item.type === 'individual_step' ? 'text-accent-gold' :
                        item.type === 'individual' ? 'text-accent-gold' :
                        item.type === 'duo_extra' ? 'text-primary' :
                        'text-white/60'
                      }`}>
                        {item.type === 'league_steps' && (
                          <span>{item.steps} paso{item.steps > 1 ? 's' : ''} en {item.league}</span>
                        )}
                        {item.type === 'transition' && (
                          <span>Transición {item.from} → {item.to}</span>
                        )}
                        {item.type === 'individual_step' && (
                          <span className="flex items-center gap-1">
                            <span className="text-accent-gold">★</span>
                            {item.from} → {item.to}
                          </span>
                        )}
                        {item.type === 'individual' && (
                          <span className="flex items-center gap-1">
                            <span className="text-accent-gold">★</span>
                            Precio Individual
                          </span>
                        )}
                        {item.type === 'duo_extra' && (
                          <span>{item.description}</span>
                        )}
                      </p>
                      {item.type === 'league_steps' && (
                        <p className="text-xs text-white/40 mt-1">${item.pricePerStep} por paso</p>
                      )}
                    </div>
                    <span className={`text-lg font-black ml-4 ${
                      item.type === 'league_steps' ? 'text-white' :
                      item.type === 'transition' ? 'text-primary' :
                      item.type === 'individual_step' ? 'text-accent-gold' :
                      item.type === 'individual' ? 'text-accent-gold' :
                      item.type === 'duo_extra' ? 'text-primary' :
                      'text-white/60'
                    }`}>
                      ${item.cost.toFixed(2)} ARS
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t-2 border-primary/30 pt-4">
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                  <span className="text-lg font-black uppercase text-primary">Total (ARS)</span>
                  <span className="text-3xl font-black text-primary">
                    ${selectedBreakdown.final_price.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>

    {/* Checkout Modal - Fuera del AnimatePresence principal */}
    {selectedBooster && showCheckoutModal && (
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => {
          setShowCheckoutModal(false);
          setSelectedBooster(null);
          onClose(); // Cerrar también el selector de boosters
        }}
        booster={selectedBooster}
        orderData={{
          ...orderDetails,
          total_price: boosterPrices[selectedBooster.user_id]?.final_price || orderDetails.total_price
        }}
      />
    )}
    </>
  )
}
