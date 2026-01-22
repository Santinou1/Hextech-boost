import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bulkPricingService, pricingService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const LEAGUES = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond'];

const TRANSITIONS = [
  { key: 'Iron->Bronze', label: 'Hierro → Bronce' },
  { key: 'Bronze->Silver', label: 'Bronce → Plata' },
  { key: 'Silver->Gold', label: 'Plata → Oro' },
  { key: 'Gold->Platinum', label: 'Oro → Platino' },
  { key: 'Platinum->Emerald', label: 'Platino → Esmeralda' },
  { key: 'Emerald->Diamond', label: 'Esmeralda → Diamante' }
];

export default function BulkPricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estado de configuración
  const [leagueBasePrices, setLeagueBasePrices] = useState({});
  const [transitionCosts, setTransitionCosts] = useState({});
  
  // Estado para aplicación masiva
  const [bulkLeaguePrice, setBulkLeaguePrice] = useState('');
  const [bulkTransitionPrice, setBulkTransitionPrice] = useState('');
  
  // Estado de calculadora
  const [fromLeague, setFromLeague] = useState('Iron');
  const [fromDivision, setFromDivision] = useState('IV');
  const [toLeague, setToLeague] = useState('Iron');
  const [toDivision, setToDivision] = useState('I');
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  
  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'booster') {
      navigate('/');
      return;
    }
    loadConfig();
  }, [user, navigate]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await bulkPricingService.getMyConfig();
      
      if (response.data.data) {
        setLeagueBasePrices(response.data.data.leagueBasePrices || {});
        setTransitionCosts(response.data.data.transitionCosts || {});
      } else {
        // Valores por defecto
        setLeagueBasePrices({
          Iron: 5.00,
          Bronze: 6.00,
          Silver: 8.00,
          Gold: 10.00,
          Platinum: 15.00,
          Emerald: 20.00,
          Diamond: 30.00
        });
        setTransitionCosts({
          'Iron->Bronze': 10.00,
          'Bronze->Silver': 12.00,
          'Silver->Gold': 15.00,
          'Gold->Platinum': 20.00,
          'Platinum->Emerald': 25.00,
          'Emerald->Diamond': 35.00
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
      alert('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await bulkPricingService.upsertMyConfig({
        leagueBasePrices,
        transitionCosts,
        divisionOverrides: {}
      });
      alert('✅ Configuración guardada exitosamente!\n\nAhora puedes usar la calculadora para ver los precios.');
      
      // Intentar calcular automáticamente después de guardar
      if (fromLeague && fromDivision && toLeague && toDivision) {
        const fromPos = getRankPosition(fromLeague, fromDivision);
        const toPos = getRankPosition(toLeague, toDivision);
        if (toPos > fromPos) {
          setTimeout(() => handleCalculate(), 500);
        }
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('❌ ' + (error.response?.data?.message || 'Error al guardar configuración'));
    } finally {
      setSaving(false);
    }
  };

  const handleApplyBulkLeaguePrice = () => {
    const price = parseFloat(bulkLeaguePrice);
    if (isNaN(price) || price < 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }
    
    const newPrices = {};
    LEAGUES.forEach(league => {
      newPrices[league] = price;
    });
    setLeagueBasePrices(newPrices);
    setBulkLeaguePrice('');
    alert(`Precio de $${price} aplicado a todas las ligas`);
  };

  const handleApplyBulkTransitionPrice = () => {
    const price = parseFloat(bulkTransitionPrice);
    if (isNaN(price) || price < 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }
    
    const newCosts = {};
    TRANSITIONS.forEach(transition => {
      newCosts[transition.key] = price;
    });
    setTransitionCosts(newCosts);
    setBulkTransitionPrice('');
    alert(`Costo de $${price} aplicado a todas las transiciones`);
  };

  const handleCalculate = async () => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }
    
    // Verificar que haya configuración guardada
    const hasConfig = Object.keys(leagueBasePrices).length > 0 && Object.keys(transitionCosts).length > 0;
    if (!hasConfig) {
      console.log('No configuration saved yet');
      setCalculatedPrice(null);
      return;
    }
    
    try {
      setCalculating(true);
      
      // Usar el endpoint UNIFICADO que considera precios individuales primero
      const response = await pricingService.calculatePrice(user.id, {
        from_rank: fromLeague,
        from_division: fromDivision,
        to_rank: toLeague,
        to_division: toDivision,
        boost_type: 'solo'
      });
      
      console.log('Price calculated:', response.data);
      
      // Adaptar la respuesta al formato esperado
      if (response.data.price_source === 'individual') {
        // Si es precio individual, mostrar de forma simple
        setCalculatedPrice({
          total: response.data.base_price,
          breakdown: [{
            type: 'individual',
            description: 'Precio individual configurado',
            cost: response.data.base_price
          }],
          source: 'individual'
        });
      } else {
        // Si es bulk, necesitamos recalcular para obtener el desglose
        const bulkResponse = await bulkPricingService.calculate({
          boosterId: user.id,
          fromLeague,
          fromDivision,
          toLeague,
          toDivision
        });
        setCalculatedPrice({
          ...bulkResponse.data.data,
          source: 'bulk'
        });
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      console.error('Error response:', error.response?.data);
      
      // Si el error es 404, significa que no hay configuración guardada
      if (error.response?.status === 404) {
        console.log('No configuration saved on server');
      }
      
      setCalculatedPrice(null);
    } finally {
      setCalculating(false);
    }
  };

  // Helper function to calculate rank position (lower is better)
  const getRankPosition = (leagueName, divisionName) => {
    const leagueIndex = LEAGUES.indexOf(leagueName);
    const divisionIndex = ['IV', 'III', 'II', 'I'].indexOf(divisionName);
    
    if (leagueIndex === -1 || divisionIndex === -1) {
      return -1;
    }
    
    // Each league has 4 divisions
    // Iron IV = 0, Iron III = 1, Iron II = 2, Iron I = 3, Bronze IV = 4, etc.
    return leagueIndex * 4 + divisionIndex;
  };

  // Auto-calcular cuando cambian los selectores
  useEffect(() => {
    if (fromLeague && fromDivision && toLeague && toDivision && user?.id) {
      // Validar que el destino sea mayor que el origen antes de calcular
      const fromPos = getRankPosition(fromLeague, fromDivision);
      const toPos = getRankPosition(toLeague, toDivision);
      
      if (toPos > fromPos) {
        handleCalculate();
      } else {
        setCalculatedPrice(null);
      }
    }
  }, [fromLeague, fromDivision, toLeague, toDivision, user]);

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
              Configuración de <span className="text-primary">Precios Bulk</span>
            </h1>
            <p className="text-white/60 mb-4">
              Configura precios de forma masiva en lugar de uno por uno
            </p>
            
            {/* Info Box */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
              <h3 className="font-bold text-primary flex items-center gap-2">
                ¿Cómo funciona?
              </h3>
              <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                <li><strong>Precio por Liga:</strong> Define cuánto vale cada división dentro de una liga (ej: cada división de Hierro = $5)</li>
                <li><strong>Costo de Transición:</strong> Costo adicional al pasar de una liga a otra (ej: Hierro→Bronce = +$10)</li>
                <li><strong>Ejemplo:</strong> Hierro IV → Bronce I = (3 pasos × $5) + $10 transición + (3 pasos × $6) = $43</li>
              </ul>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Cargando...</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* Resumen Visual */}
              <div className="bg-gradient-to-r from-hextech-surface to-hextech-dark border border-primary/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">
                  Resumen de tu Configuración
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">
                      ${Math.min(...Object.values(leagueBasePrices).filter(v => v > 0)) || 0}
                    </div>
                    <div className="text-xs text-white/60 mt-1">Precio más bajo por división</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">
                      ${Math.max(...Object.values(leagueBasePrices)) || 0}
                    </div>
                    <div className="text-xs text-white/60 mt-1">Precio más alto por división</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">
                      ${Math.min(...Object.values(transitionCosts).filter(v => v > 0)) || 0}
                    </div>
                    <div className="text-xs text-white/60 mt-1">Transición más barata</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-primary">
                      ${Math.max(...Object.values(transitionCosts)) || 0}
                    </div>
                    <div className="text-xs text-white/60 mt-1">Transición más cara</div>
                  </div>
                </div>
              </div>

              {/* Sección 1: Precios Base */}
              <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Precios Base por Liga</h2>
                <p className="text-white/60 text-sm mb-2">
                  Define cuánto vale <strong>cada división</strong> dentro de cada liga
                </p>
                <p className="text-white/40 text-xs mb-4">
                  Ejemplo: Si Hierro = $5, entonces Hierro IV → Hierro III = $5, Hierro III → Hierro II = $5, etc.
                </p>
                
                {/* Aplicación masiva */}
                <div className="bg-hextech-dark/50 border border-primary/20 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-bold text-primary mb-3">Aplicación Rápida</h3>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">$</span>
                      <input
                        type="number"
                        value={bulkLeaguePrice}
                        onChange={(e) => setBulkLeaguePrice(e.target.value)}
                        placeholder="Precio para todas las ligas"
                        step="0.01"
                        min="0"
                        className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-2 pl-8 text-white focus:border-primary transition"
                      />
                    </div>
                    <motion.button
                      onClick={handleApplyBulkLeaguePrice}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 bg-primary/20 border border-primary text-primary font-bold rounded hover:bg-primary/30 transition"
                    >
                      Aplicar a Todas
                    </motion.button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {LEAGUES.map((league) => (
                    <div key={league} className="space-y-2">
                      <label className="block text-sm font-bold text-white/80">
                        {league}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          value={leagueBasePrices[league] || ''}
                          onChange={(e) => setLeagueBasePrices({
                            ...leagueBasePrices,
                            [league]: parseFloat(e.target.value) || 0
                          })}
                          step="0.01"
                          min="0"
                          className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 pl-8 text-white focus:border-primary transition"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 2: Costos de Transición */}
              <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Costos de Transición entre Ligas</h2>
                <p className="text-white/60 text-sm mb-2">
                  Define el costo <strong>adicional</strong> al cambiar de una liga a otra
                </p>
                <p className="text-white/40 text-xs mb-4">
                  Ejemplo: Si Hierro→Bronce = $10, al pasar de Hierro I a Bronce IV se suma $10 extra al precio base
                </p>
                
                {/* Aplicación masiva */}
                <div className="bg-hextech-dark/50 border border-primary/20 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-bold text-primary mb-3">Aplicación Rápida</h3>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">$</span>
                      <input
                        type="number"
                        value={bulkTransitionPrice}
                        onChange={(e) => setBulkTransitionPrice(e.target.value)}
                        placeholder="Costo para todas las transiciones"
                        step="0.01"
                        min="0"
                        className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-2 pl-8 text-white focus:border-primary transition"
                      />
                    </div>
                    <motion.button
                      onClick={handleApplyBulkTransitionPrice}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2 bg-primary/20 border border-primary text-primary font-bold rounded hover:bg-primary/30 transition"
                    >
                      Aplicar a Todas
                    </motion.button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TRANSITIONS.map((transition) => (
                    <div key={transition.key} className="space-y-2">
                      <label className="block text-sm font-bold text-white/80">
                        {transition.label}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          value={transitionCosts[transition.key] || ''}
                          onChange={(e) => setTransitionCosts({
                            ...transitionCosts,
                            [transition.key]: parseFloat(e.target.value) || 0
                          })}
                          step="0.01"
                          min="0"
                          className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 pl-8 text-white focus:border-primary transition"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="bg-primary/10 border-2 border-primary rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">Importante</h3>
                    <p className="text-white/80 text-sm">
                      Debes <strong>guardar la configuración</strong> antes de poder calcular precios en la calculadora
                    </p>
                  </div>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                  </motion.button>
                </div>
              </div>

              {/* Sección de Ejemplos */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>📚</span> Ejemplos de Cálculo
                </h2>
                <p className="text-white/60 text-sm mb-6">
                  Así es como se calculan los precios con tu configuración actual:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ejemplo 1: Dentro de la misma liga */}
                  <div className="bg-hextech-dark/50 rounded-lg p-4 border border-hextech-border">
                    <h3 className="font-bold text-primary mb-3">Dentro de la misma liga</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/80">Hierro IV → Hierro I</span>
                      </div>
                      <div className="text-white/60 text-xs space-y-1">
                        <div>• 3 pasos en Hierro</div>
                        <div>• 3 × ${leagueBasePrices.Iron || 0} = ${((leagueBasePrices.Iron || 0) * 3).toFixed(2)}</div>
                      </div>
                      <div className="border-t border-hextech-border pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-primary">${((leagueBasePrices.Iron || 0) * 3).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ejemplo 2: Con transición */}
                  <div className="bg-hextech-dark/50 rounded-lg p-4 border border-hextech-border">
                    <h3 className="font-bold text-primary mb-3">Con transición de liga</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/80">Hierro IV → Bronce I</span>
                      </div>
                      <div className="text-white/60 text-xs space-y-1">
                        <div>• 3 pasos en Hierro × ${leagueBasePrices.Iron || 0} = ${((leagueBasePrices.Iron || 0) * 3).toFixed(2)}</div>
                        <div>• Transición Hierro→Bronce = ${transitionCosts['Iron->Bronze'] || 0}</div>
                        <div>• 3 pasos en Bronce × ${leagueBasePrices.Bronze || 0} = ${((leagueBasePrices.Bronze || 0) * 3).toFixed(2)}</div>
                      </div>
                      <div className="border-t border-hextech-border pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-primary">
                            ${(
                              (leagueBasePrices.Iron || 0) * 3 + 
                              (transitionCosts['Iron->Bronze'] || 0) + 
                              (leagueBasePrices.Bronze || 0) * 3
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ejemplo 3: Múltiples transiciones */}
                  <div className="bg-hextech-dark/50 rounded-lg p-4 border border-hextech-border">
                    <h3 className="font-bold text-primary mb-3">Múltiples transiciones</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/80">Hierro IV → Plata IV</span>
                      </div>
                      <div className="text-white/60 text-xs space-y-1">
                        <div>• 3 pasos en Hierro × ${leagueBasePrices.Iron || 0} = ${((leagueBasePrices.Iron || 0) * 3).toFixed(2)}</div>
                        <div>• Transición Hierro→Bronce = ${transitionCosts['Iron->Bronze'] || 0}</div>
                        <div>• 4 pasos en Bronce × ${leagueBasePrices.Bronze || 0} = ${((leagueBasePrices.Bronze || 0) * 4).toFixed(2)}</div>
                        <div>• Transición Bronce→Plata = ${transitionCosts['Bronze->Silver'] || 0}</div>
                      </div>
                      <div className="border-t border-hextech-border pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-primary">
                            ${(
                              (leagueBasePrices.Iron || 0) * 3 + 
                              (transitionCosts['Iron->Bronze'] || 0) + 
                              (leagueBasePrices.Bronze || 0) * 4 + 
                              (transitionCosts['Bronze->Silver'] || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ejemplo 4: Salto grande */}
                  <div className="bg-hextech-dark/50 rounded-lg p-4 border border-hextech-border">
                    <h3 className="font-bold text-primary mb-3">Salto grande</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/80">Hierro I → Oro IV</span>
                      </div>
                      <div className="text-white/60 text-xs space-y-1">
                        <div>• Trans. Hierro→Bronce + 4 pasos Bronce</div>
                        <div>• Trans. Bronce→Plata + 4 pasos Plata</div>
                        <div>• Trans. Plata→Oro</div>
                      </div>
                      <div className="border-t border-hextech-border pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-primary">
                            ${(
                              (transitionCosts['Iron->Bronze'] || 0) + 
                              (leagueBasePrices.Bronze || 0) * 4 + 
                              (transitionCosts['Bronze->Silver'] || 0) + 
                              (leagueBasePrices.Silver || 0) * 4 + 
                              (transitionCosts['Silver->Gold'] || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Calculadora */}
              <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Calculadora de Precio</h2>
                <p className="text-white/60 text-sm mb-2">
                  Prueba tu configuración: selecciona origen y destino para ver el precio calculado automáticamente
                </p>
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-6">
                  <p className="text-white/80 text-xs flex items-start gap-2">
                    <span className="text-primary text-lg font-bold">i</span>
                    <span>
                      <strong>Nota:</strong> Si tienes un precio individual configurado para esta combinación específica en 
                      <a href="/booster/pricing" className="text-primary hover:underline mx-1">Precios Individuales</a>, 
                      ese precio tendrá prioridad sobre el cálculo bulk.
                    </span>
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Desde */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-white/80">Desde</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Liga</label>
                        <select
                          value={fromLeague}
                          onChange={(e) => setFromLeague(e.target.value)}
                          className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                        >
                          {LEAGUES.map((league) => (
                            <option key={league} value={league}>{league}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">División</label>
                        <select
                          value={fromDivision}
                          onChange={(e) => setFromDivision(e.target.value)}
                          className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                        >
                          {['IV', 'III', 'II', 'I'].map((div) => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Hasta */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-white/80">Hasta</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Liga</label>
                        <select
                          value={toLeague}
                          onChange={(e) => setToLeague(e.target.value)}
                          className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                        >
                          {LEAGUES.map((league) => (
                            <option key={league} value={league}>{league}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">División</label>
                        <select
                          value={toDivision}
                          onChange={(e) => setToDivision(e.target.value)}
                          className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                        >
                          {['IV', 'III', 'II', 'I'].map((div) => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resultado */}
                {calculating ? (
                  <div className="text-center py-8">
                    <div className="inline-block size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : calculatedPrice ? (
                  <div className="bg-hextech-dark border border-primary/30 rounded-lg p-6">
                    {calculatedPrice.source === 'individual' ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl text-primary font-bold">★</span>
                          <h3 className="font-bold text-lg">Precio Individual Configurado</h3>
                        </div>
                        <p className="text-white/60 text-sm mb-4">
                          Este boost tiene un precio específico configurado en la sección de Precios Individuales
                        </p>
                        <div className="border-t border-hextech-border pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">PRECIO</span>
                            <span className="text-3xl font-black text-primary">
                              ${calculatedPrice.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold text-lg mb-4">Desglose del Precio (Bulk)</h3>
                        <div className="space-y-2 mb-4">
                          {calculatedPrice.breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              {item.type === 'league_steps' ? (
                                <>
                                  <span className="text-white/80">
                                    {item.steps} pasos en {item.league} × ${item.pricePerStep}
                                  </span>
                                  <span className="text-white font-bold">${item.cost.toFixed(2)}</span>
                                </>
                              ) : item.type === 'individual_step' ? (
                                <>
                                  <span className="text-white/80 flex items-center gap-1">
                                    <span className="text-primary font-bold">★</span>
                                    {item.from} → {item.to} (individual)
                                  </span>
                                  <span className="text-primary font-bold">${item.cost.toFixed(2)}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-white/80">
                                    Transición {item.from} → {item.to}
                                  </span>
                                  <span className="text-primary font-bold">${item.cost.toFixed(2)}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-hextech-border pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">TOTAL</span>
                            <span className="text-3xl font-black text-primary">
                              ${calculatedPrice.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : Object.keys(leagueBasePrices).length === 0 || Object.keys(transitionCosts).length === 0 ? (
                  <div className="bg-hextech-dark/50 border border-blue-500/30 rounded-lg p-6 text-center">
                    <div className="text-blue-500 text-4xl mb-2 font-bold">!</div>
                    <p className="text-white/80 text-sm font-bold mb-2">
                      Configura tus precios primero
                    </p>
                    <p className="text-white/60 text-xs">
                      Completa los precios base y costos de transición arriba, luego guarda la configuración para poder calcular precios
                    </p>
                  </div>
                ) : getRankPosition(toLeague, toDivision) <= getRankPosition(fromLeague, fromDivision) ? (
                  <div className="bg-hextech-dark/50 border border-yellow-500/30 rounded-lg p-6 text-center">
                    <div className="text-yellow-500 text-4xl mb-2 font-bold">!</div>
                    <p className="text-white/80 text-sm">
                      El rango de destino debe ser superior al rango de origen
                    </p>
                    <p className="text-white/60 text-xs mt-2">
                      Selecciona un rango de destino más alto para ver el precio
                    </p>
                  </div>
                ) : (
                  <div className="bg-hextech-dark/50 border border-green-500/30 rounded-lg p-6 text-center">
                    <div className="text-green-500 text-4xl mb-2 font-bold">✓</div>
                    <p className="text-white/80 text-sm font-bold mb-2">
                      Listo para calcular
                    </p>
                    <p className="text-white/60 text-xs">
                      El precio se calculará automáticamente
                    </p>
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
