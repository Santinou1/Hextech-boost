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

export default function MyOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('¿Estás seguro de cancelar esta orden?')) return;

    try {
      await orderService.cancel(orderId);
      alert('Orden cancelada exitosamente');
      loadOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.error || 'Error al cancelar la orden');
    }
  };

  if (!user || user.role !== 'client') {
    return null;
  }

  return (
    <PageTransition>
      <div className="bg-background-dark min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Mis <span className="text-primary">Órdenes</span>
            </h1>
            <p className="text-white/60">
              Gestiona y revisa el estado de tus boosts
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Cargando órdenes...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-hextech-surface border border-hextech-border rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold mb-2">No tienes órdenes aún</h3>
              <p className="text-white/60 mb-6">
                Busca un booster y contrata tu primer boost
              </p>
              <motion.button
                onClick={() => navigate('/calculator')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition"
              >
                Buscar Boosters
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-hextech-surface border border-hextech-border rounded-xl p-6 hover:border-primary/50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold">Orden #{order.order_number}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        {order.payment_status === 'pending' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold border bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                            Pago Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/60">
                        Creada: {new Date(order.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {order.payment_status === 'pending' && order.payment_method === 'transferencia' && (
                        <p className="text-xs text-yellow-500 mt-1">
                          ⚠️ Esperando confirmación de transferencia bancaria
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-primary">${order.total_price.toFixed(2)} ARS</p>
                      <p className="text-xs text-white/60">{order.boost_type === 'solo' ? 'Solo' : 'Duo'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-hextech-dark rounded-lg p-4">
                      <p className="text-xs text-white/60 mb-1">Booster</p>
                      <p className="font-bold">{order.booster_display_name || 'Sin asignar'}</p>
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
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Progreso</span>
                        <span className="font-bold">{order.progress_percentage}%</span>
                      </div>
                      <div className="h-2 bg-hextech-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent-gold transition-all duration-500"
                          style={{ width: `${order.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-hextech-dark rounded-lg p-4 mb-4">
                    <p className="text-xs text-white/60 mb-2">Información de Contacto</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Discord:</span>
                        <span className="ml-2 font-bold">{order.discord_username}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Invocador:</span>
                        <span className="ml-2 font-bold">{order.summoner_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2 bg-primary/20 border border-primary text-primary font-bold rounded hover:bg-primary/30 transition"
                    >
                      Ver Detalles
                    </motion.button>
                    {order.status === 'pending' && (
                      <motion.button
                        onClick={() => handleCancelOrder(order.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2 bg-red-500/20 border border-red-500 text-red-500 font-bold rounded hover:bg-red-500/30 transition"
                      >
                        Cancelar
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
