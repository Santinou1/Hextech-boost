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

export default function BoosterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    totalEarned: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'booster') {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getBoosterOrders();
      const ordersData = response.data.orders;
      setOrders(ordersData);

      const stats = {
        total: ordersData.length,
        pending: ordersData.filter(o => o.status === 'pending').length,
        active: ordersData.filter(o => o.status === 'in_progress').length,
        completed: ordersData.filter(o => o.status === 'completed').length,
        totalEarned: ordersData.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_price, 0)
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.error || 'Error al actualizar estado');
    }
  };

  if (!user || user.role !== 'booster') {
    return null;
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => o.status === 'in_progress');

  return (
    <PageTransition>
      <div className="bg-background-dark min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase border-l-2 border-primary pl-3">
                Panel de Booster
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-hextech-surface border border-hextech-border rounded-lg p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Total</p>
                    <p className="text-4xl font-black text-white">{stats.total}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-hextech-surface border border-yellow-500/30 rounded-lg p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-yellow-500/10 transition-colors"></div>
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Pendientes</p>
                    <p className="text-4xl font-black text-yellow-500">{stats.pending}</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
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
                  transition={{ delay: 0.3 }}
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
                  transition={{ delay: 0.4 }}
                  className="bg-hextech-surface border border-primary/30 rounded-lg p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                  <div className="relative">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Ganado (ARS)</p>
                    <p className="text-4xl font-black text-primary">${stats.totalEarned.toFixed(2)}</p>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <motion.button
                  onClick={() => navigate('/booster/orders')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary text-black p-6 rounded-lg font-bold uppercase tracking-wider hover:brightness-110 transition-all border-2 border-primary shadow-[0_0_20px_rgba(0,209,181,0.3)]"
                >
                  <div className="flex items-center justify-between">
                    <span>Todas las Órdenes</span>
                    <span className="material-symbols-outlined text-2xl">inventory_2</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/booster/profile')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-hextech-surface border-2 border-hextech-border p-6 rounded-lg font-bold uppercase tracking-wider hover:border-primary transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span>Mi Perfil</span>
                    <span className="material-symbols-outlined text-2xl text-primary">person</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => navigate('/booster/bulk-pricing')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-hextech-surface border-2 border-hextech-border p-6 rounded-lg font-bold uppercase tracking-wider hover:border-primary transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span>Configurar Precios</span>
                    <span className="material-symbols-outlined text-2xl text-primary">sell</span>
                  </div>
                </motion.button>
              </div>

              {pendingOrders.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Órdenes Pendientes</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                  </div>
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-hextech-surface border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">#{order.order_number}</h3>
                            <p className="text-sm text-white/60">
                              Cliente: <span className="text-white font-bold">{order.client_username}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-primary">${order.total_price.toFixed(2)} ARS</p>
                            <p className="text-xs text-white/40 uppercase tracking-wider">{order.boost_type}</p>
                          </div>
                        </div>

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
                            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">Servidor</p>
                            <p className="font-bold text-sm">{order.server}</p>
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

                        <div className="flex gap-3">
                          <motion.button
                            onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3 bg-blue-500 text-white font-bold uppercase tracking-wider rounded hover:brightness-110 transition"
                          >
                            Iniciar Boost
                          </motion.button>
                          <motion.button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-primary/20 border border-primary text-primary font-bold uppercase tracking-wider rounded hover:bg-primary/30 transition"
                          >
                            Detalles
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeOrders.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Órdenes en Progreso</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                  </div>
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-hextech-surface border border-blue-500/30 rounded-lg p-6 hover:border-blue-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold uppercase tracking-wider mb-2">#{order.order_number}</h3>
                            <p className="text-sm text-white/60">
                              Cliente: <span className="text-white font-bold">{order.client_username}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-primary">${order.total_price.toFixed(2)} ARS</p>
                          </div>
                        </div>

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
                            <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-1">Servidor</p>
                            <p className="font-bold text-sm">{order.server}</p>
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

                        <div className="flex gap-3">
                          <motion.button
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-3 bg-green-500 text-white font-bold uppercase tracking-wider rounded hover:brightness-110 transition"
                          >
                            Marcar Completado
                          </motion.button>
                          <motion.button
                            onClick={() => navigate(`/orders/${order.id}`)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-primary/20 border border-primary text-primary font-bold uppercase tracking-wider rounded hover:bg-primary/30 transition"
                          >
                            Detalles
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {orders.length === 0 && (
                <div className="bg-hextech-surface border border-hextech-border rounded-lg p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-2">Sin Órdenes</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    Las órdenes aparecerán aquí cuando los clientes te contraten
                  </p>
                  <motion.button
                    onClick={() => navigate('/booster/profile')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-primary text-black font-bold uppercase tracking-wider rounded hover:brightness-110 transition"
                  >
                    Configurar Perfil
                  </motion.button>
                </div>
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
