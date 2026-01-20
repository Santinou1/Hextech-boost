import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [boosters, setBoosters] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'statistics') {
        const response = await adminService.getStatistics();
        setStatistics(response.data);
      } else if (activeTab === 'users') {
        const response = await adminService.getAllUsers();
        setUsers(response.data.users);
      } else if (activeTab === 'boosters') {
        const response = await adminService.getAllBoosters();
        setBoosters(response.data.boosters);
      } else if (activeTab === 'orders') {
        const response = await adminService.getAllOrders();
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await adminService.deleteUser(userId);
      alert('Usuario eliminado exitosamente');
      loadData();
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

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
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
              Panel de <span className="text-primary">Administración</span>
            </h1>
            <p className="text-white/60">Gestiona usuarios, boosters y órdenes</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-hextech-border">
            {[
              { id: 'statistics', label: 'Estadísticas', icon: '📊' },
              { id: 'users', label: 'Usuarios', icon: '👥' },
              { id: 'boosters', label: 'Boosters', icon: '⭐' },
              { id: 'orders', label: 'Órdenes', icon: '📦' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 mt-4">Cargando...</p>
            </div>
          ) : (
            <>
              {/* Statistics Tab */}
              {activeTab === 'statistics' && statistics && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/60 uppercase text-sm font-bold">Usuarios</h3>
                        <span className="text-3xl">👥</span>
                      </div>
                      <p className="text-4xl font-black text-primary">{statistics.statistics.users.total}</p>
                      <p className="text-sm text-white/40 mt-2">
                        {statistics.statistics.users.boosters} boosters
                      </p>
                    </div>

                    <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/60 uppercase text-sm font-bold">Órdenes</h3>
                        <span className="text-3xl">📦</span>
                      </div>
                      <p className="text-4xl font-black text-primary">{statistics.statistics.orders.total}</p>
                      <p className="text-sm text-white/40 mt-2">
                        {statistics.statistics.orders.completed} completadas
                      </p>
                    </div>

                    <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/60 uppercase text-sm font-bold">Ingresos</h3>
                        <span className="text-3xl">💰</span>
                      </div>
                      <p className="text-4xl font-black text-green-500">${statistics.statistics.revenue.total}</p>
                      <p className="text-sm text-white/40 mt-2">
                        Promedio: ${statistics.statistics.revenue.average}
                      </p>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">Órdenes Recientes</h3>
                    <div className="space-y-3">
                      {statistics.recentOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-hextech-dark rounded-lg">
                          <div>
                            <p className="font-bold">#{order.order_number}</p>
                            <p className="text-sm text-white/60">{order.client_username}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">${order.total_price}</p>
                            <p className="text-xs text-white/40">{order.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="bg-hextech-surface border border-hextech-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-hextech-dark">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">ID</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Usuario</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Rol</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Creado</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hextech-border">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-hextech-dark/50 transition">
                            <td className="px-6 py-4 text-sm">{user.id}</td>
                            <td className="px-6 py-4 font-bold">{user.username}</td>
                            <td className="px-6 py-4 text-sm text-white/60">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                                user.role === 'booster' ? 'bg-primary/20 text-primary' :
                                'bg-blue-500/20 text-blue-500'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-white/60">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition text-sm font-bold"
                                disabled={user.role === 'admin'}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Boosters Tab */}
              {activeTab === 'boosters' && (
                <div className="grid grid-cols-1 gap-6">
                  {boosters.map(booster => (
                    <div key={booster.user_id} className="bg-hextech-surface border border-hextech-border rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="size-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {booster.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{booster.username}</h3>
                            <p className="text-sm text-white/60">{booster.email}</p>
                            <p className="text-xs text-primary font-bold mt-1">{booster.peak_rank || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white/40">Win Rate</p>
                          <p className="text-2xl font-bold text-green-500">{booster.win_rate?.toFixed(1) || 0}%</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-hextech-border">
                        <div>
                          <p className="text-xs text-white/40 uppercase">Órdenes Totales</p>
                          <p className="text-lg font-bold">{booster.total_orders || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase">Completadas</p>
                          <p className="text-lg font-bold text-green-500">{booster.completed_orders || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase">Rating</p>
                          <p className="text-lg font-bold text-accent-gold">⭐ {booster.rating?.toFixed(1) || 5.0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase">Estado</p>
                          <p className={`text-lg font-bold ${booster.available ? 'text-green-500' : 'text-red-500'}`}>
                            {booster.available ? 'Disponible' : 'No disponible'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-hextech-surface border border-hextech-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-hextech-dark">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Orden</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Cliente</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Booster</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Tipo</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Estado</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Precio</th>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase text-white/60">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hextech-border">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-hextech-dark/50 transition">
                            <td className="px-6 py-4 font-bold">#{order.order_number}</td>
                            <td className="px-6 py-4 text-sm">{order.client_username}</td>
                            <td className="px-6 py-4 text-sm text-primary">{order.booster_username || 'Sin asignar'}</td>
                            <td className="px-6 py-4 text-sm uppercase">{order.boost_type}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                order.status === 'in_progress' ? 'bg-primary/20 text-primary' :
                                order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-green-500">${order.total_price}</td>
                            <td className="px-6 py-4 text-sm text-white/60">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
