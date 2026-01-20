import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bulkPricingService } from '../services/api';
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
  
  // Estado de calculadora
  const [fromLeague, setFromLeague] = useState('Iron');
  const [fromDivision, setFromDivision] = useState('IV');
  const [toLeague, setToLeague] = useState('Bronze');
  const [toDivision, setToDivision] = useState('IV');
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
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving config:', error);
      alert(error.response?.data?.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const response = await bulkPricingService.calculate({
        boosterId: user.id,
        fromLeague,
        fromDivision,
        toLeague,
        toDivision
      });
      setCalculatedPrice(response.data.data);
    } catch (error) {
      console.error('Error calculating price:', error);
      alert(error.response?.data?.message || 'Error al calcular precio');
      setCalculatedPrice(null);
    } finally {
      setCalculating(false);
    }
  };

  // Auto-calcular cuando cambian los selectores
  useEffect(() => {
    if (fromLeague && fromDivision && toLeague && toDivision) {
      handleCalculate();
    }
  }, [fromLeague, fromDivision, toLeague, toDivision]);

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
            <p className="text-white/60">
              Define precios base por liga y costos de transición
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Cargando...</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* Sección 1: Precios Base */}
              <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Precios Base por Liga</h2>
                <p className="text-white/60 text-sm mb-4">
                  Define el costo por cada paso dentro de cada liga
                </p>
                
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
                <h2 className="text-2xl font-bold mb-6">Costos de Transición</h2>
                <p className="text-white/60 text-sm mb-4">
                  Define el costo adicional al cambiar de una liga a otra
                </p>
                
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
              <div className="flex justify-end">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </motion.button>
              </div>


              {/* Sección 3: Calculadora */}
              <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Calculadora de Precio</h2>
                <p className="text-white/60 text-sm mb-6">
                  Selecciona origen y destino para ver el precio calculado
                </p>
                
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
                    <h3 className="font-bold text-lg mb-4">Desglose del Precio</h3>
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
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
