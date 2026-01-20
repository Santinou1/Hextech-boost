import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pricingService } from '../services/api';
import { RANKS } from '../utils/constants';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function BoosterPricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for new pricing
  const [fromRank, setFromRank] = useState(null);
  const [fromDivision, setFromDivision] = useState(null);
  const [toRank, setToRank] = useState(null);
  const [toDivision, setToDivision] = useState(null);
  const [price, setPrice] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [step, setStep] = useState(1); // 1: from rank, 2: from division, 3: to rank, 4: to division, 5: price

  useEffect(() => {
    if (!user || user.role !== 'booster') {
      navigate('/');
      return;
    }
    loadPricing();
  }, [user, navigate]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const response = await pricingService.getMyPricing();
      setPricing(response.data.pricing || []);
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate rank position (lower is better)
  const getRankPosition = (rankIndex, divisionIndex) => {
    // Each rank has 4 divisions (except Master+)
    // Iron IV = 0, Iron III = 1, Iron II = 2, Iron I = 3, Bronze IV = 4, etc.
    let position = 0;
    
    // Add all divisions from previous ranks
    for (let i = 0; i < rankIndex; i++) {
      position += RANKS[i].divisions.length;
    }
    
    // Add current division (IV=0, III=1, II=2, I=3)
    position += divisionIndex;
    
    return position;
  };

  const isValidRankProgression = (fromRankIdx, fromDivIdx, toRankIdx, toDivIdx) => {
    const fromPos = getRankPosition(fromRankIdx, fromDivIdx);
    const toPos = getRankPosition(toRankIdx, toDivIdx);
    
    // Target must be higher than source
    return toPos > fromPos;
  };

  const handleAddPricing = () => {
    if (fromRank === null || fromDivision === null || toRank === null || toDivision === null) {
      alert('Por favor completa todos los rangos');
      return;
    }

    // Validate rank progression
    if (!isValidRankProgression(fromRank, fromDivision, toRank, toDivision)) {
      alert('El rango objetivo debe ser superior al rango inicial. No puedes hacer boost hacia atrás o al mismo rango.');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }

    const newPricing = {
      from_rank: RANKS[fromRank].name,
      from_division: RANKS[fromRank].divisions[fromDivision],
      to_rank: RANKS[toRank].name,
      to_division: RANKS[toRank].divisions[toDivision],
      price: parseFloat(price),
      estimated_hours: estimatedHours ? parseInt(estimatedHours) : null
    };

    // Check if already exists
    const exists = pricing.some(p => 
      p.from_rank === newPricing.from_rank &&
      p.from_division === newPricing.from_division &&
      p.to_rank === newPricing.to_rank &&
      p.to_division === newPricing.to_division
    );

    if (exists) {
      alert('Ya existe una cotización para este rango');
      return;
    }

    setPricing([...pricing, newPricing]);
    resetForm();
  };

  const handleRankSelect = (rankIndex) => {
    if (step === 1) {
      setFromRank(rankIndex);
      setFromDivision(null);
      setStep(2);
    } else if (step === 3) {
      setToRank(rankIndex);
      setToDivision(null);
      setStep(4);
    }
  };

  const handleDivisionSelect = (divIndex) => {
    if (step === 2) {
      setFromDivision(divIndex);
      setStep(3);
    } else if (step === 4) {
      setToDivision(divIndex);
      setStep(5);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFromRank(null);
    setFromDivision(null);
    setToRank(null);
    setToDivision(null);
    setPrice('');
    setEstimatedHours('');
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (step === 2) setFromRank(null);
      if (step === 3) setFromDivision(null);
      if (step === 4) setToRank(null);
      if (step === 5) setToDivision(null);
    }
  };

  const handleRemovePricing = async (index) => {
    const item = pricing[index];
    
    // If item has an id, it means it's saved in the backend
    if (item.id) {
      if (!confirm('¿Estás seguro de eliminar esta cotización?')) {
        return;
      }
      
      try {
        await pricingService.deletePricing(item.id);
        setPricing(pricing.filter((_, i) => i !== index));
        alert('Cotización eliminada exitosamente');
      } catch (error) {
        console.error('Error deleting pricing:', error);
        alert('Error al eliminar cotización');
      }
    } else {
      // Not saved yet, just remove from local state
      setPricing(pricing.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (pricing.length === 0) {
      alert('Debes agregar al menos una cotización');
      return;
    }

    try {
      setSaving(true);
      await pricingService.upsertMyPricing({ pricing });
      alert('Cotizaciones guardadas exitosamente');
      loadPricing();
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('Error al guardar cotizaciones');
    } finally {
      setSaving(false);
    }
  };

  const getRankData = (rankName) => {
    return RANKS.find(r => r.name === rankName) || RANKS[0];
  };

  if (!user || user.role !== 'booster') {
    return null;
  }

  return (
    <PageTransition>
      <div className="bg-background-dark min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Configurar <span className="text-primary">Cotizaciones</span>
            </h1>
            <p className="text-white/60">Define tus precios por rango y división</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Cargando...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form to add new pricing - CIRCULAR DESIGN */}
              <div className="bg-hextech-surface border border-hextech-border rounded-xl p-8">
                {/* Header with progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                      Nueva Cotización
                    </h2>
                    {step > 1 && (
                      <motion.button
                        onClick={goBack}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-hextech-dark border border-hextech-border rounded text-sm hover:border-primary transition"
                      >
                        Atrás
                      </motion.button>
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          s <= step ? 'bg-primary' : 'bg-hextech-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/40 mt-2 uppercase tracking-wider">
                    {step === 1 && 'Paso 1: Selecciona rango inicial'}
                    {step === 2 && 'Paso 2: Selecciona división inicial'}
                    {step === 3 && 'Paso 3: Selecciona rango objetivo'}
                    {step === 4 && 'Paso 4: Selecciona división objetivo'}
                    {step === 5 && 'Paso 5: Configura precio'}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {/* Step 1: Select FROM RANK */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-2">¿Desde qué rango?</h3>
                        <p className="text-white/60 text-sm">Selecciona el rango inicial del boost</p>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-4">
                        {RANKS.map((rank, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleRankSelect(idx)}
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-hextech-dark border-2 border-hextech-border hover:border-primary transition group"
                          >
                            <div className="relative">
                              <img
                                src={rank.img}
                                alt={rank.name}
                                className="w-16 h-16 object-contain group-hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] transition"
                              />
                            </div>
                            <span className="text-xs font-bold text-center" style={{ color: rank.color }}>
                              {rank.name}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Select FROM DIVISION */}
                  {step === 2 && fromRank !== null && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                          <img
                            src={RANKS[fromRank].img}
                            alt={RANKS[fromRank].name}
                            className="w-24 h-24 object-contain"
                          />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: RANKS[fromRank].color }}>
                          {RANKS[fromRank].name}
                        </h3>
                        <p className="text-white/60 text-sm">¿Qué división?</p>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                        {RANKS[fromRank].divisions.map((div, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => handleDivisionSelect(idx)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="aspect-square flex items-center justify-center text-2xl font-black bg-hextech-dark border-2 border-hextech-border hover:border-primary rounded-xl transition"
                            style={{ color: RANKS[fromRank].color }}
                          >
                            {div}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Select TO RANK */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Show selected FROM */}
                      <div className="flex items-center justify-center gap-4 p-4 bg-hextech-dark/50 rounded-xl border border-hextech-border">
                        <img
                          src={RANKS[fromRank].img}
                          alt={RANKS[fromRank].name}
                          className="w-12 h-12 object-contain"
                        />
                        <div>
                          <p className="text-xs text-white/40 uppercase">Desde</p>
                          <p className="font-bold" style={{ color: RANKS[fromRank].color }}>
                            {RANKS[fromRank].name} {RANKS[fromRank].divisions[fromDivision]}
                          </p>
                        </div>
                        <div className="text-2xl text-primary">→</div>
                        <div className="text-white/40">
                          <p className="text-xs uppercase">Hasta</p>
                          <p className="font-bold">?</p>
                        </div>
                      </div>

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-2">¿Hasta qué rango?</h3>
                        <p className="text-white/60 text-sm">Selecciona el rango objetivo del boost</p>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-4">
                        {RANKS.map((rank, idx) => {
                          // Check if this rank is valid (must be higher than fromRank or same rank with higher division)
                          const isValidRank = idx > fromRank || (idx === fromRank && RANKS[idx].divisions.length > fromDivision + 1);
                          
                          return (
                            <motion.button
                              key={idx}
                              onClick={() => isValidRank && handleRankSelect(idx)}
                              whileHover={isValidRank ? { scale: 1.1, y: -5 } : {}}
                              whileTap={isValidRank ? { scale: 0.95 } : {}}
                              disabled={!isValidRank}
                              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition group ${
                                isValidRank 
                                  ? 'bg-hextech-dark border-hextech-border hover:border-primary cursor-pointer' 
                                  : 'bg-hextech-dark/30 border-hextech-border/30 cursor-not-allowed opacity-40'
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={rank.img}
                                  alt={rank.name}
                                  className={`w-16 h-16 object-contain transition ${
                                    isValidRank ? 'group-hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]' : 'grayscale opacity-30'
                                  }`}
                                />
                              </div>
                              <span className="text-xs font-bold text-center" style={{ color: isValidRank ? rank.color : '#666' }}>
                                {rank.name}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Select TO DIVISION */}
                  {step === 4 && toRank !== null && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Show selected FROM and TO rank */}
                      <div className="flex items-center justify-center gap-4 p-4 bg-hextech-dark/50 rounded-xl border border-hextech-border">
                        <img
                          src={RANKS[fromRank].img}
                          alt={RANKS[fromRank].name}
                          className="w-12 h-12 object-contain"
                        />
                        <div>
                          <p className="text-xs text-white/40 uppercase">Desde</p>
                          <p className="font-bold" style={{ color: RANKS[fromRank].color }}>
                            {RANKS[fromRank].name} {RANKS[fromRank].divisions[fromDivision]}
                          </p>
                        </div>
                        <div className="text-2xl text-primary">→</div>
                        <img
                          src={RANKS[toRank].img}
                          alt={RANKS[toRank].name}
                          className="w-12 h-12 object-contain"
                        />
                        <div>
                          <p className="text-xs text-white/40 uppercase">Hasta</p>
                          <p className="font-bold" style={{ color: RANKS[toRank].color }}>
                            {RANKS[toRank].name} ?
                          </p>
                        </div>
                      </div>

                      <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                          <img
                            src={RANKS[toRank].img}
                            alt={RANKS[toRank].name}
                            className="w-24 h-24 object-contain"
                          />
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: RANKS[toRank].color }}>
                          {RANKS[toRank].name}
                        </h3>
                        <p className="text-white/60 text-sm">¿Qué división?</p>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                        {RANKS[toRank].divisions.map((div, idx) => {
                          // If same rank, division must be higher than fromDivision
                          const isValidDivision = toRank > fromRank || (toRank === fromRank && idx > fromDivision);
                          
                          return (
                            <motion.button
                              key={idx}
                              onClick={() => isValidDivision && handleDivisionSelect(idx)}
                              whileHover={isValidDivision ? { scale: 1.1 } : {}}
                              whileTap={isValidDivision ? { scale: 0.95 } : {}}
                              disabled={!isValidDivision}
                              className={`aspect-square flex items-center justify-center text-2xl font-black border-2 rounded-xl transition relative ${
                                isValidDivision
                                  ? 'bg-hextech-dark border-hextech-border hover:border-primary cursor-pointer'
                                  : 'bg-hextech-dark/30 border-hextech-border/30 cursor-not-allowed opacity-40'
                              }`}
                              style={{ color: isValidDivision ? RANKS[toRank].color : '#666' }}
                            >
                              {div}
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      {toRank === fromRank && (
                        <div className="text-center text-sm text-yellow-500/80 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                          Mismo rango: solo puedes seleccionar divisiones superiores
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 5: Enter PRICE */}
                  {step === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Show complete selection */}
                      <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-hextech-dark/50 to-hextech-dark rounded-xl border border-primary/30">
                        <img
                          src={RANKS[fromRank].img}
                          alt={RANKS[fromRank].name}
                          className="w-16 h-16 object-contain"
                        />
                        <div>
                          <p className="text-xs text-white/40 uppercase">Desde</p>
                          <p className="font-bold text-lg" style={{ color: RANKS[fromRank].color }}>
                            {RANKS[fromRank].name} {RANKS[fromRank].divisions[fromDivision]}
                          </p>
                        </div>
                        <div className="text-3xl text-primary">→</div>
                        <img
                          src={RANKS[toRank].img}
                          alt={RANKS[toRank].name}
                          className="w-16 h-16 object-contain"
                        />
                        <div>
                          <p className="text-xs text-white/40 uppercase">Hasta</p>
                          <p className="font-bold text-lg" style={{ color: RANKS[toRank].color }}>
                            {RANKS[toRank].name} {RANKS[toRank].divisions[toDivision]}
                          </p>
                        </div>
                      </div>

                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold mb-2">Configura el precio</h3>
                        <p className="text-white/60 text-sm">Define cuánto cobrarás por este boost</p>
                      </div>

                      <div className="space-y-4">
                        {/* Price */}
                        <div>
                          <label className="block text-sm font-bold text-white/60 uppercase mb-2">Precio (USD)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold text-2xl">$</span>
                            <input
                              type="number"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              placeholder="25.00"
                              step="0.01"
                              min="0"
                              autoFocus
                              className="w-full bg-hextech-dark border-2 border-hextech-border rounded-xl px-4 py-4 pl-12 text-white text-xl font-bold focus:border-primary transition"
                            />
                          </div>
                        </div>

                        {/* Estimated Hours */}
                        <div>
                          <label className="block text-sm font-bold text-white/60 uppercase mb-2">Horas Estimadas (opcional)</label>
                          <input
                            type="number"
                            value={estimatedHours}
                            onChange={(e) => setEstimatedHours(e.target.value)}
                            placeholder="24"
                            min="1"
                            className="w-full bg-hextech-dark border-2 border-hextech-border rounded-xl px-4 py-4 text-white text-lg focus:border-primary transition"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <motion.button
                            onClick={resetForm}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-hextech-dark border-2 border-hextech-border text-white font-bold py-4 rounded-xl hover:border-red-500 transition uppercase"
                          >
                            Cancelar
                          </motion.button>
                          <motion.button
                            onClick={handleAddPricing}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-primary text-black font-bold py-4 rounded-xl hover:brightness-110 transition uppercase"
                          >
                            Agregar
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* List of pricing */}
              <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Cotizaciones ({pricing.length})
                  </h2>
                  {pricing.length > 0 && (
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-green-500 text-white font-bold rounded hover:brightness-110 transition disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Todo'}
                    </motion.button>
                  )}
                </div>

                {pricing.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <p className="text-lg">No hay cotizaciones configuradas</p>
                    <p className="text-sm mt-2">Agrega tu primera cotización usando el formulario</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {pricing.map((item, index) => {
                      const fromRankData = getRankData(item.from_rank);
                      const toRankData = getRankData(item.to_rank);
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="bg-hextech-dark border border-hextech-border rounded-lg p-4 hover:border-primary/50 transition"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* From Rank */}
                            <div className="flex items-center gap-3 flex-1">
                              <img 
                                src={fromRankData.img} 
                                alt={item.from_rank}
                                className="w-12 h-12 object-contain"
                              />
                              <div>
                                <p className="text-xs text-white/40 uppercase">Desde</p>
                                <p className="font-bold" style={{ color: fromRankData.color }}>
                                  {item.from_rank} {item.from_division}
                                </p>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="text-2xl text-primary">→</div>

                            {/* To Rank */}
                            <div className="flex items-center gap-3 flex-1">
                              <img 
                                src={toRankData.img} 
                                alt={item.to_rank}
                                className="w-12 h-12 object-contain"
                              />
                              <div>
                                <p className="text-xs text-white/40 uppercase">Hasta</p>
                                <p className="font-bold" style={{ color: toRankData.color }}>
                                  {item.to_rank} {item.to_division}
                                </p>
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs text-white/40 uppercase">Precio</p>
                                <p className="text-xl font-black text-green-500">${item.price}</p>
                                {item.estimated_hours && (
                                  <p className="text-xs text-white/60">~{item.estimated_hours}h</p>
                                )}
                              </div>
                              <motion.button
                                onClick={() => handleRemovePricing(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="px-3 py-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition text-sm font-bold"
                              >
                                Eliminar
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
