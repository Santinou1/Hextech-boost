import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { boosterService, orderService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function BoosterSelector({ isOpen, onClose, orderDetails }) {
  const [selectedBooster, setSelectedBooster] = useState(null)
  const [sortBy, setSortBy] = useState('recommended')
  const [boosters, setBoosters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
      setBoosters(response.data.boosters || [])
    } catch (err) {
      console.error('Error loading boosters:', err)
      setError('Error al cargar los boosters')
    } finally {
      setLoading(false)
    }
  }

  const sortedBoosters = [...boosters].sort((a, b) => {
    if (sortBy === 'recommended') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'fastest') return (a.avg_completion_time || 0) - (b.avg_completion_time || 0)
    if (sortBy === 'winrate') return (b.win_rate || 0) - (a.win_rate || 0)
    if (sortBy === 'price') return 0 // Todos tienen el mismo precio base
    return 0
  })

  const handleSelectBooster = (booster) => {
    if (booster.is_available) {
      setSelectedBooster(booster)
    }
  }

  const handleConfirm = async () => {
    if (!selectedBooster) return

    if (!token) {
      alert('Debes iniciar sesión para crear una orden')
      onClose()
      return
    }

    try {
      const orderData = {
        booster_id: selectedBooster.user_id,
        ...orderDetails
      }

      const response = await orderService.create(orderData)
      alert('¡Orden creada exitosamente!')
      console.log('Order created:', response.data)
      onClose()
    } catch (err) {
      console.error('Error creating order:', err)
      alert(err.response?.data?.error || 'Error al crear la orden')
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
                const mainChampions = booster.main_champions ? JSON.parse(booster.main_champions) : []
                const languages = booster.languages ? JSON.parse(booster.languages) : []
                const specialties = booster.specialties ? JSON.parse(booster.specialties) : []
                
                return (
                  <motion.div
                    key={booster.user_id}
                    whileHover={{ scale: booster.is_available ? 1.01 : 1 }}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      booster.is_available ? 'cursor-pointer' : 'cursor-not-allowed'
                    } ${
                      selectedBooster?.user_id === booster.user_id
                        ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,209,181,0.2)]'
                        : booster.is_available
                        ? 'border-hextech-border bg-hextech-dark hover:border-primary/50'
                        : 'border-hextech-border bg-hextech-dark/50 opacity-60'
                    }`}
                    onClick={() => handleSelectBooster(booster)}
                  >
                    {/* Unavailable Badge */}
                    {!booster.is_available && (
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
                          {booster.is_available && (
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
                        <div>
                          <p className="text-xs text-white/40 uppercase tracking-widest">Sin cargo extra</p>
                          <p className="text-2xl font-black text-primary">Incluido</p>
                        </div>
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
    </AnimatePresence>
  )
}
