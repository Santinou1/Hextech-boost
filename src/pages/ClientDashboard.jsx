import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalSpent: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'client') {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      const ordersData = response.data.orders;
      setOrders(ordersData);

      const stats = {
        total: ordersData.length,
        active: ordersData.filter(o => o.status === 'in_progress' || o.status === 'pending').length,
        completed: ordersData.filter(o => o.status === 'completed').length,
        totalSpent: ordersData.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_price : 0), 0)
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'client') {
    return null;
  }

  const activeOrders = orders.filter(o => o.status === 'in_progress' || o.status === 'pending');
  const recentOrders = orders.slice(0, 5);

  return (
    <PageTransition>
      <div className="bg-background-dark min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase border-l-2 border-primary pl-3">
                Panel de Control
              </span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter">
              Bienvenido, <span className="text-primary">{user.username}</span>
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Cargando datos...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-hextech-surface border border-hextech-border rounded-lg p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Total Órdenes</p>
                    <p className="text-4xl font-black text-white">{stats.total}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-hextech-surface border border-blue-500/30 rounded-lg p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors"></div>
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Activas</p>
                    <p className="text-4xl font-black text-blue-500">{stats.active}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-hextech-surface border border-green-500/30 rounded-lg p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors"></div>
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Completadas</p>
                    <p className="text-4xl font-black text-green-500">{stats.completed}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-hextech-surface border border-primary/30 rounded-lg p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Total Invertido (ARS)</p>
                    <p className="text-4xl font-black text-primary">${stats.totalSpent.toFixed(2)}</p>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.button
                  onClick={() => navigate('/calculator')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary text-black p-6 rounded-lg font-bold uppercase tracking-wider hover:brightness-110 transition-all border-2 border-primary shadow-[0_0_20px_rgba(0,209,181,0.3)]"
                >
                  <div className="flex items-center justify-between">
                    <span>Nuevo Boost</span>
                    <span className="material-symbols-outlined text-2xl">add_circle</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/orders')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-hextech-surface border-2 border-hextech-border p-6 rounded-lg font-bold uppercase tracking-wider hover:border-primary transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span>Mis Órdenes</span>
                    <span className="material-symbols-outlined text-2xl text-primary">inventory_2</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/calculator')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-hextech-surface border-2 border-hextech-border p-6 rounded-lg font-bold uppercase tracking-wider hover:border-primary transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span>Buscar Boosters</span>
                    <span className="material-symbols-outlined text-2xl text-primary">search</span>
                  </div>
                </motion.button>
              </div>

              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Órdenes Activas</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
                  </div>
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-hextech-surface border border-hextech-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold uppercase tracking-wider">#{order.order_number}</h3>
                              <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${STATUS_COLORS[order.status]}`}>
                                {STATUS_LABELS[order.status]}
                              </span>
                            </div>
                            <p className="text-sm text-white/60">
                              Booster: <span className="text-primary font-bold">{order.booster_display_name || 'Asignando...'}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-primary">${order.total_price.toFixed(2)} ARS</p>
                            <p className="text-xs text-white/40 uppercase tracking-wider">{order.boost_type}</p>
                          </div>
                        </div>

                        {order.status === 'in_progress' && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-white/60 uppercase tracking-wider text-xs font-bold">Progreso</span>
                              <span className="font-bold">{order.progress_percentage}%</span>
                            </div>
                            <div className="h-2 bg-hextech-dark rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-hextech-gold transition-all duration-500"
                                style={{ width: `${order.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-hextech-dark rounded p-3 border border-hextech-border">
                            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">Desde</p>
                            <p className="font-bold text-sm">
                              {order.current_rank} {order.current_division || `${order.current_lp} LP`}
                            </p>
                          </div>
                          <div className="bg-hextech-dark rounded p-3 border border-hextech-border">
                            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">Hasta</p>
                            <p className="font-bold text-sm">
                              {order.desired_rank} {order.desired_division || `${order.desired_lp} LP`}
                            </p>
                          </div>
                          <div className="bg-hextech-dark rounded p-3 border border-hextech-border">
                            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">Tipo</p>
                            <p className="font-bold text-sm uppercase">{order.boost_type}</p>
                          </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4 mb-4">
                          <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-3">Información de Contacto</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/40 uppercase tracking-wider text-xs">Discord</span>
                              <p className="font-bold text-primary">{order.discord_username}</p>
                            </div>
                            <div>
                              <span className="text-white/40 uppercase tracking-wider text-xs">Invocador</span>
                              <p className="font-bold">{order.summoner_name}</p>
                            </div>
                          </div>
                        </div>

                        <motion.button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3 bg-primary/20 border border-primary text-primary font-bold uppercase tracking-wider rounded hover:bg-primary/30 transition"
                        >
                          Ver Detalles Completos
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Historial Reciente</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent w-32"></div>
                  </div>
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-primary hover:underline text-sm font-bold uppercase tracking-wider"
                  >
                    Ver Todas
                  </button>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="bg-hextech-surface border border-hextech-border rounded-lg p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-4">
                      <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-wider mb-2">Sin Órdenes</h3>
                    <p className="text-white/60 mb-6 max-w-md mx-auto">
                      Comienza tu viaje hacia el ranking que deseas
                    </p>
                    <motion.button
                      onClick={() => navigate('/calculator')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-primary text-black font-bold uppercase tracking-wider rounded hover:brightness-110 transition"
                    >
                      Crear Primera Orden
                    </motion.button>
                  </div>
                ) : (
                  <div className="bg-hextech-surface border border-hextech-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-hextech-dark border-b border-hextech-border">
                        <tr>
                          <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-white/40">Orden</th>
                          <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-white/40">Booster</th>
                          <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-white/40">Boost</th>
                          <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-white/40">Estado</th>
                          <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-white/40">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr
                            key={order.id}
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="border-t border-hextech-border hover:bg-hextech-dark/50 cursor-pointer transition"
                          >
                            <td className="p-4">
                              <p className="font-bold uppercase tracking-wider">#{order.order_number}</p>
                              <p className="text-xs text-white/40">
                                {new Date(order.created_at).toLocaleDateString('es-ES')}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold">{order.booster_display_name || 'Sin asignar'}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold">
                                {order.current_rank} → {order.desired_rank}
                              </p>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${STATUS_COLORS[order.status]}`}>
                                {STATUS_LABELS[order.status]}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <p className="text-lg font-black text-primary">${order.total_price.toFixed(2)} ARS</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
