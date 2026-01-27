import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../services/api';

export default function CheckoutModal({ isOpen, onClose, booster, orderData }) {
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(''); // 'transferencia' o 'mercadopago'
  const [formData, setFormData] = useState({
    discord_username: '',
    summoner_name: '',
    server: 'LAS'
  });
  const [createdOrder, setCreatedOrder] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateOrder = async () => {
    if (!formData.discord_username || !formData.summoner_name) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const response = await orderService.create({
        booster_id: booster.user_id,
        boost_type: orderData.boost_type,
        current_rank: orderData.current_rank,
        current_division: orderData.current_division,
        current_lp: orderData.current_lp,
        desired_rank: orderData.desired_rank,
        desired_division: orderData.desired_division,
        desired_lp: orderData.desired_lp,
        wins_requested: orderData.wins_requested,
        selected_champion: orderData.selected_champion,
        extras: orderData.extras,
        total_price: orderData.total_price,
        discord_username: formData.discord_username,
        summoner_name: formData.summoner_name,
        server: formData.server
      });

      setCreatedOrder(response.data.order);
      setStep(2);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.error || 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    try {
      setLoading(true);
      await orderService.processPayment(createdOrder.id, { payment_method: paymentMethod });
      setStep(3);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(error.response?.data?.error || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPaymentMethod('');
    setFormData({ discord_username: '', summoner_name: '', server: 'LAS' });
    setCreatedOrder(null);
    onClose();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-hextech-surface border-2 border-primary rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-accent-gold/20 border-b border-primary/30 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase">
                {step === 1 && 'Información de Contacto'}
                {step === 2 && 'Procesar Pago'}
                {step === 3 && '¡Orden Creada!'}
              </h2>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Step 1: Contact Info */}
            {step === 1 && (
              <>
                <div className="bg-hextech-dark border border-hextech-border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Resumen del Boost</h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex justify-between">
                      <span>Booster:</span>
                      <span className="text-primary font-bold">{booster.display_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-bold">{orderData.boost_type === 'solo' ? 'Solo' : 'Duo'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desde:</span>
                      <span className="font-bold">
                        {orderData.current_rank} {orderData.current_division || `${orderData.current_lp} LP`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hasta:</span>
                      <span className="font-bold">
                        {orderData.desired_rank} {orderData.desired_division || `${orderData.desired_lp} LP`}
                      </span>
                    </div>
                    <div className="border-t border-hextech-border pt-2 mt-2 flex justify-between">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-2xl font-black text-primary">${orderData.total_price.toFixed(2)} ARS</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Discord Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="discord_username"
                      value={formData.discord_username}
                      onChange={handleInputChange}
                      placeholder="usuario#1234"
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                    />
                    <p className="text-xs text-white/60 mt-1">
                      El booster te contactará por Discord para coordinar el boost
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Nombre de Invocador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="summoner_name"
                      value={formData.summoner_name}
                      onChange={handleInputChange}
                      placeholder="Tu nombre en League of Legends"
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Servidor</label>
                    <select
                      name="server"
                      value={formData.server}
                      onChange={handleInputChange}
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                    >
                      <option value="LAS">LAS (Latinoamérica Sur)</option>
                      <option value="LAN">LAN (Latinoamérica Norte)</option>
                      <option value="NA">NA (North America)</option>
                      <option value="EUW">EUW (Europe West)</option>
                      <option value="EUNE">EUNE (Europe Nordic & East)</option>
                      <option value="BR">BR (Brazil)</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  onClick={handleCreateOrder}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-black font-black text-lg rounded-lg hover:brightness-110 transition disabled:opacity-50"
                >
                  {loading ? 'Creando orden...' : 'Continuar al Pago'}
                </motion.button>
              </>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <>
                <div className="bg-hextech-dark border border-hextech-border rounded-lg p-6 text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Total a Pagar</h3>
                  <p className="text-4xl font-black text-primary mb-2">
                    ${orderData.total_price.toFixed(2)} ARS
                  </p>
                  <p className="text-sm text-white/60">
                    Orden #{createdOrder?.order_number}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider">Selecciona Método de Pago</h3>
                  
                  {/* Transferencia Bancaria */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                      paymentMethod === 'transferencia'
                        ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,209,181,0.2)]'
                        : 'border-hextech-border bg-hextech-dark hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">🏦</div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold">Transferencia Bancaria</h4>
                        <p className="text-sm text-white/60">Transferencia directa a cuenta bancaria</p>
                      </div>
                      {paymentMethod === 'transferencia' && (
                        <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-black text-sm">check</span>
                        </div>
                      )}
                    </div>

                    {paymentMethod === 'transferencia' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-hextech-surface border border-primary/30 rounded-lg p-4 space-y-3"
                      >
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-3">
                          Datos para Transferencia
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-hextech-dark rounded">
                            <div>
                              <p className="text-xs text-white/60">CBU</p>
                              <p className="font-mono font-bold">0000003100010123456789</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard('0000003100010123456789');
                              }}
                              className="px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold rounded hover:bg-primary/30 transition"
                            >
                              Copiar
                            </button>
                          </div>

                          <div className="flex justify-between items-center p-2 bg-hextech-dark rounded">
                            <div>
                              <p className="text-xs text-white/60">Alias</p>
                              <p className="font-bold">HEXTECH.BOOST</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard('HEXTECH.BOOST');
                              }}
                              className="px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold rounded hover:bg-primary/30 transition"
                            >
                              Copiar
                            </button>
                          </div>

                          <div className="p-2 bg-hextech-dark rounded">
                            <p className="text-xs text-white/60">Titular</p>
                            <p className="font-bold">Hextech Boost S.A.</p>
                          </div>

                          <div className="p-2 bg-hextech-dark rounded">
                            <p className="text-xs text-white/60">CUIT</p>
                            <p className="font-mono font-bold">30-12345678-9</p>
                          </div>

                          <div className="p-2 bg-hextech-dark rounded">
                            <p className="text-xs text-white/60">Banco</p>
                            <p className="font-bold">Banco Galicia</p>
                          </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-4">
                          <p className="text-xs text-white/80">
                            <strong>Importante:</strong> Una vez realizada la transferencia, envía el comprobante por Discord al booster para confirmar el pago.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Mercado Pago */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setPaymentMethod('mercadopago')}
                    className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                      paymentMethod === 'mercadopago'
                        ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,209,181,0.2)]'
                        : 'border-hextech-border bg-hextech-dark hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">💳</div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold">Mercado Pago</h4>
                        <p className="text-sm text-white/60">Pago rápido y seguro con Mercado Pago</p>
                      </div>
                      {paymentMethod === 'mercadopago' && (
                        <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-black text-sm">check</span>
                        </div>
                      )}
                    </div>

                    {paymentMethod === 'mercadopago' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-hextech-surface border border-primary/30 rounded-lg p-4"
                      >
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-3">
                          Link de Pago Mercado Pago
                        </p>
                        
                        <div className="flex items-center gap-2 p-3 bg-hextech-dark rounded mb-3">
                          <span className="material-symbols-outlined text-primary">link</span>
                          <a
                            href="https://mpago.la/hextech-boost"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-primary hover:underline font-mono text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            https://mpago.la/hextech-boost
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard('https://mpago.la/hextech-boost');
                            }}
                            className="px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold rounded hover:bg-primary/30 transition"
                          >
                            Copiar
                          </button>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3">
                          <p className="text-xs text-white/80">
                            <strong>Nota:</strong> Serás redirigido a Mercado Pago para completar el pago de forma segura. Una vez confirmado, tu orden será procesada automáticamente.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                <motion.button
                  onClick={handlePayment}
                  disabled={loading || !paymentMethod}
                  whileHover={{ scale: paymentMethod ? 1.02 : 1 }}
                  whileTap={{ scale: paymentMethod ? 0.98 : 1 }}
                  className={`w-full py-4 font-black text-lg rounded-lg transition ${
                    paymentMethod
                      ? 'bg-green-500 text-white hover:brightness-110'
                      : 'bg-hextech-surface border border-hextech-border text-white/30 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Procesando...' : 'Confirmar Pago'}
                </motion.button>
              </>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <>
                <div className="text-center py-8">
                  <div className="text-8xl mb-4">{paymentMethod === 'transferencia' ? '⏳' : '✅'}</div>
                  <h3 className="text-3xl font-black text-primary mb-4">
                    {paymentMethod === 'transferencia' ? '¡Orden Creada!' : '¡Pago Exitoso!'}
                  </h3>
                  <p className="text-white/80 mb-6">
                    {paymentMethod === 'transferencia' 
                      ? 'Tu orden ha sido creada y está pendiente de confirmación de pago'
                      : 'Tu orden ha sido creada y el booster será notificado'
                    }
                  </p>
                  <div className="bg-hextech-dark border border-primary/30 rounded-lg p-4 inline-block">
                    <p className="text-sm text-white/60 mb-1">Número de Orden</p>
                    <p className="text-2xl font-black text-primary">{createdOrder?.order_number}</p>
                  </div>
                </div>

                {paymentMethod === 'transferencia' ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-bold mb-2 text-yellow-500">⚠️ Pago Pendiente de Confirmación</h4>
                    <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                      <li>Realiza la transferencia a los datos bancarios proporcionados</li>
                      <li>Un administrador verificará tu pago en las próximas 24-48 horas</li>
                      <li>Una vez confirmado, el booster te contactará por Discord: <strong>{formData.discord_username}</strong></li>
                      <li>Puedes ver el estado en "Mis Órdenes"</li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Próximos Pasos:</h4>
                    <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                      <li>El booster te contactará por Discord: <strong>{formData.discord_username}</strong></li>
                      <li>Coordinarán los detalles del boost</li>
                      <li>Puedes ver el progreso en "Mis Órdenes"</li>
                    </ul>
                  </div>
                )}

                <motion.button
                  onClick={() => window.location.href = '/orders'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-black font-black text-lg rounded-lg hover:brightness-110 transition"
                >
                  Ver Mis Órdenes
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
