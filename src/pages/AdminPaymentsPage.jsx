import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  completed: 'bg-green-500/20 text-green-500 border-green-500/30',
  failed: 'bg-red-500/20 text-red-500 border-red-500/30'
};

const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  completed: 'Aprobado',
  failed: 'Rechazado'
};

const PAYMENT_METHOD_LABELS = {
  transferencia: 'Transferencia Bancaria',
  mercadopago: 'Mercado Pago'
};

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, all
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Obtener todas las órdenes (necesitaremos un endpoint para esto)
      const response = await fetch('http://localhost:3000/api/orders/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    if (!confirm('¿Confirmar que se recibió el pago?')) return;

    try {
      setProcessingId(orderId);
      await orderService.approvePayment(orderId);
      alert('✅ Pago aprobado exitosamente');
      loadOrders();
    } catch (error) {
      console.error('Error approving payment:', error);
      alert(error.response?.data?.error || 'Error al aprobar el pago');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt('Razón del rechazo (opcional):');
    if (reason === null) return;

    try {
      setProcessingId(orderId);
      await orderService.rejectPayment(orderId, reason);
      alert('❌ Pago rechazado');
      loadOrders();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert(error.response?.data?.error || 'Error al rechazar el pago');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') {
      return order.payment_status === 'pending' && order.payment_method === 'transferencia';
    }
    return true;
  });

  const pendingCount = orders.filter(o => o.payment_status === 'pending' && o.payment_method === 'transferencia').length;

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <PageTransition>
      <div className="bg-background-dark min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase border-l-2 border-primary pl-3">
                Panel de Administración
              </span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
              Gestión de <span className="text-primary">Pagos</span>
            </h1>
            <p className="text-white/60">
              Aprueba o rechaza pagos por transferencia bancaria
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-hextech-surface border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Pendientes</p>
                  <p className="text-4xl font-black text-yellow-500">{pendingCount}</p>
                </div>
                <span className="material-symbols-outlined text-yellow-500 text-5xl">pending</span>
              </div>
            </div>
            <div className="bg-hextech-surface border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Aprobados</p>
                  <p className="text-4xl font-black text-green-500">
                    {orders.filter(o => o.payment_status === 'completed').length}
                  </p>
                </div>
                <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
              </div>
            </div>
            <div className="bg-hextech-surface border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider font-bold mb-1">Rechazados</p>
                  <p className="text-4xl font-black text-red-500">
                    {orders.filter(o => o.payment_status === 'failed').length}
                  </p>
                </div>
                <span className="material-symbols-outlined text-red-500 text-5xl">cancel</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-hextech-surface border border-hextech-border text-white/60 hover:text-white'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition ${
                filter === 'all'
                  ? 'bg-primary text-black'
                  : 'bg-hextech-surface border border-hextech-border text-white/60 hover:text-white'
              }`}
            >
              Todas
            </button>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Cargando órdenes...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-hextech-surface border border-hextech-border rounded-xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wider mb-2">
                {filter === 'pending' ? 'No hay pagos pendientes' : 'No hay órdenes'}
              </h3>
              <p className="text-white/60">
                {filter === 'pending' ? 'Todos los pagos han sido procesados' : 'No se encontraron órdenes'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-hextech-surface border border-hextech-border rounded-xl p-6 hover:border-primary/50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold uppercase tracking-wider">#{order.order_number}</h3>
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                          {PAYMENT_STATUS_LABELS[order.payment_status]}
                        </span>
                        {order.payment_method && (
                          <span className="px-3 py-1 rounded text-xs font-bold bg-hextech-dark border border-hextech-border">
                            {PAYMENT_METHOD_LABELS[order.payment_method]}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">Cliente:</span>
                          <span className="ml-2 font-bold">{order.client_username || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Booster:</span>
                          <span className="ml-2 font-bold">{order.booster_display_name || 'Sin asignar'}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Discord:</span>
                          <span className="ml-2 font-bold text-primary">{order.discord_username}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Fecha:</span>
                          <span className="ml-2 font-bold">
                            {new Date(order.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-3xl font-black text-primary">${order.total_price.toFixed(2)} ARS</p>
                      <p className="text-xs text-white/60 uppercase tracking-wider">{order.boost_type}</p>
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

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 bg-primary/20 border border-primary text-primary font-bold uppercase tracking-wider rounded hover:bg-primary/30 transition"
                    >
                      Ver Detalles
                    </motion.button>
                    
                    {order.payment_status === 'pending' && order.payment_method === 'transferencia' && (
                      <>
                        <motion.button
                          onClick={() => handleApprove(order.id)}
                          disabled={processingId === order.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-green-500 text-white font-bold uppercase tracking-wider rounded hover:brightness-110 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {processingId === order.id ? (
                            <>
                              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-sm">check</span>
                              Aprobar
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => handleReject(order.id)}
                          disabled={processingId === order.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-red-500/20 border border-red-500 text-red-500 font-bold uppercase tracking-wider rounded hover:bg-red-500/30 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          Rechazar
                        </motion.button>
                      </>
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
