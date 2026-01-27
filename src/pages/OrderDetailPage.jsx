import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-500 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/30'
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado'
};

const PAYMENT_METHOD_LABELS = {
  transferencia: 'Transferencia Bancaria',
  mercadopago: 'Mercado Pago'
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadOrder();
  }, [id, user, navigate]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(id);
      setOrder(response.data.order);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Error al cargar la orden');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  if (!user) return null;

  return (
    <PageTransition>
      <div className="bg-background-dark min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Cargando orden...</p>
            </div>
          ) : !order ? (
            <div className="text-center py-20">
              <p className="text-white/60">Orden no encontrada</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <button
                  onClick={() => navigate(user.role === 'booster' ? '/booster/orders' : '/orders')}
                  className="text-primary hover:underline mb-4 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Volver a Órdenes
                </button>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
                      Orden <span className="text-primary">#{order.order_number}</span>
                    </h1>
                    <p className="text-white/60">
                      Creada: {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    {order.payment_status === 'pending' && (
                      <span className="px-4 py-2 rounded-full text-sm font-bold border bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                        Pago Pendiente
                      </span>
                    )}
                    {order.payment_status === 'completed' && (
                      <span className="px-4 py-2 rounded-full text-sm font-bold border bg-green-500/20 text-green-500 border-green-500/30">
                        Pago Confirmado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Alert for Pending Payments */}
              {user.role === 'admin' && order.payment_status === 'pending' && order.payment_method === 'transferencia' && (
                <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-yellow-500 text-3xl">warning</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-yellow-500 mb-2">Pago Pendiente de Aprobación</h3>
                      <p className="text-white/80 mb-4">
                        Esta orden tiene un pago por transferencia bancaria que requiere tu aprobación.
                      </p>
                      <div className="flex gap-3">
                        <motion.button
                          onClick={async () => {
                            if (confirm('¿Confirmar que se recibió el pago?')) {
                              try {
                                await orderService.approvePayment(order.id);
                                alert('Pago aprobado exitosamente');
                                loadOrder();
                              } catch (error) {
                                alert(error.response?.data?.error || 'Error al aprobar el pago');
                              }
                            }
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:brightness-110 transition"
                        >
                          ✓ Aprobar Pago
                        </motion.button>
                        <motion.button
                          onClick={async () => {
                            const reason = prompt('Razón del rechazo (opcional):');
                            if (reason !== null) {
                              try {
                                await orderService.rejectPayment(order.id, reason);
                                alert('Pago rechazado');
                                loadOrder();
                              } catch (error) {
                                alert(error.response?.data?.error || 'Error al rechazar el pago');
                              }
                            }
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-red-500/20 border border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-500/30 transition"
                        >
                          ✗ Rechazar Pago
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Boost Details */}
                  <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">Detalles del Boost</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-hextech-dark rounded-lg p-4">
                        <p className="text-xs text-white/60 mb-1">Tipo</p>
                        <p className="font-bold uppercase">{order.boost_type === 'solo' ? 'Solo' : 'Duo'}</p>
                      </div>
                      <div className="bg-hextech-dark rounded-lg p-4">
                        <p className="text-xs text-white/60 mb-1">Servidor</p>
                        <p className="font-bold">{order.server}</p>
                      </div>
                      <div className="bg-hextech-dark rounded-lg p-4">
                        <p className="text-xs text-white/60 mb-1">Desde</p>
                        <p className="font-bold">
                          {order.current_rank} {order.current_division || `${order.current_lp} LP`}
                        </p>
                      </div>
                      <div className="bg-hextech-dark rounded-lg p-4">
                        <p className="text-xs text-white/60 mb-1">Hasta</p>
                        <p className="font-bold">
                          {order.desired_rank} {order.desired_division || `${order.desired_lp} LP`}
                        </p>
                      </div>
                    </div>

                    {order.status === 'in_progress' && (
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/60 uppercase tracking-wider text-xs font-bold">Progreso</span>
                          <span className="font-bold">{order.progress_percentage}%</span>
                        </div>
                        <div className="h-3 bg-hextech-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-hextech-gold transition-all duration-500"
                            style={{ width: `${order.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">Información de Contacto</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Discord</p>
                        <p className="font-bold text-primary">{order.discord_username}</p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Invocador</p>
                        <p className="font-bold">{order.summoner_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  {order.payment_method && (
                    <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Información de Pago</h2>
                        <button
                          onClick={() => setShowPaymentInfo(!showPaymentInfo)}
                          className="text-primary hover:underline text-sm font-bold flex items-center gap-1"
                        >
                          {showPaymentInfo ? 'Ocultar' : 'Ver Detalles'}
                          <span className="material-symbols-outlined text-sm">
                            {showPaymentInfo ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                      </div>

                      <div className="bg-hextech-dark rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-white/60 mb-1">Método de Pago</p>
                            <p className="font-bold">{PAYMENT_METHOD_LABELS[order.payment_method]}</p>
                          </div>
                          <div className="text-4xl">
                            {order.payment_method === 'transferencia' ? '🏦' : '💳'}
                          </div>
                        </div>
                      </div>

                      {showPaymentInfo && order.payment_method === 'transferencia' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3"
                        >
                          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-3">
                            Datos de Transferencia Utilizados
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-hextech-dark rounded">
                              <div>
                                <p className="text-xs text-white/60">CBU</p>
                                <p className="font-mono font-bold text-sm">0000003100010123456789</p>
                              </div>
                              <button
                                onClick={() => copyToClipboard('0000003100010123456789')}
                                className="px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold rounded hover:bg-primary/30 transition"
                              >
                                Copiar
                              </button>
                            </div>

                            <div className="flex justify-between items-center p-2 bg-hextech-dark rounded">
                              <div>
                                <p className="text-xs text-white/60">Alias</p>
                                <p className="font-bold text-sm">HEXTECH.BOOST</p>
                              </div>
                              <button
                                onClick={() => copyToClipboard('HEXTECH.BOOST')}
                                className="px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold rounded hover:bg-primary/30 transition"
                              >
                                Copiar
                              </button>
                            </div>

                            <div className="p-2 bg-hextech-dark rounded">
                              <p className="text-xs text-white/60">Titular</p>
                              <p className="font-bold text-sm">Hextech Boost S.A.</p>
                            </div>

                            <div className="p-2 bg-hextech-dark rounded">
                              <p className="text-xs text-white/60">CUIT</p>
                              <p className="font-mono font-bold text-sm">30-12345678-9</p>
                            </div>

                            <div className="p-2 bg-hextech-dark rounded">
                              <p className="text-xs text-white/60">Banco</p>
                              <p className="font-bold text-sm">Banco Galicia</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {showPaymentInfo && order.payment_method === 'mercadopago' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-primary/10 border border-primary/30 rounded-lg p-4"
                        >
                          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-3">
                            Link de Pago Utilizado
                          </p>
                          
                          <div className="flex items-center gap-2 p-3 bg-hextech-dark rounded">
                            <span className="material-symbols-outlined text-primary">link</span>
                            <a
                              href="https://mpago.la/hextech-boost"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-primary hover:underline font-mono text-sm"
                            >
                              https://mpago.la/hextech-boost
                            </a>
                            <button
                              onClick={() => copyToClipboard('https://mpago.la/hextech-boost')}
                              className="px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold rounded hover:bg-primary/30 transition"
                            >
                              Copiar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Matches History */}
                  {matches.length > 0 && (
                    <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                      <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">Historial de Partidas</h2>
                      <div className="space-y-2">
                        {matches.map((match) => (
                          <div
                            key={match.id}
                            className={`p-4 rounded-lg border ${
                              match.result === 'victory'
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="text-2xl">{match.champion}</div>
                                <div>
                                  <p className="font-bold">{match.champion}</p>
                                  <p className="text-xs text-white/60">
                                    {match.kills}/{match.deaths}/{match.assists} - KDA {match.kda_ratio?.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold uppercase ${
                                  match.result === 'victory' ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {match.result === 'victory' ? 'Victoria' : 'Derrota'}
                                </p>
                                <p className="text-xs text-white/60">{match.duration}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Price Summary */}
                  <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                    <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Resumen</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/60">Subtotal</span>
                        <span className="font-bold">${order.total_price.toFixed(2)} ARS</span>
                      </div>
                      <div className="border-t border-hextech-border pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">Total</span>
                          <span className="text-2xl font-black text-primary">${order.total_price.toFixed(2)} ARS</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booster Info */}
                  {order.booster_display_name && (
                    <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                      <h3 className="text-lg font-bold uppercase tracking-wider mb-4">Booster Asignado</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">
                            {order.booster_display_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold">{order.booster_display_name}</p>
                          <p className="text-xs text-white/60">Booster Profesional</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {user.role === 'client' && order.status === 'pending' && (
                    <motion.button
                      onClick={() => {
                        if (confirm('¿Estás seguro de cancelar esta orden?')) {
                          orderService.cancel(order.id).then(() => {
                            alert('Orden cancelada');
                            navigate('/orders');
                          });
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-red-500/20 border border-red-500 text-red-500 font-bold rounded hover:bg-red-500/30 transition"
                    >
                      Cancelar Orden
                    </motion.button>
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
