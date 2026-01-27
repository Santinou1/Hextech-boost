import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import CalculatorPage from './pages/CalculatorPage'
import RankIconsPage from './pages/RankIconsPage'
import PricingPage from './pages/PricingPage'
import ReviewsPage from './pages/ReviewsPage'
import FAQPage from './pages/FAQPage'
import UserProgressPage from './pages/UserProgressPage'
import MatchHistoryPage from './pages/MatchHistoryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import BoosterPricingPage from './pages/BoosterPricingPage'
import BulkPricingPage from './pages/BulkPricingPage'
import BoosterProfilePage from './pages/BoosterProfilePage'
import MyOrdersPage from './pages/MyOrdersPage'
import BoosterOrdersPage from './pages/BoosterOrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import AdminPaymentsPage from './pages/AdminPaymentsPage'
import ClientDashboard from './pages/ClientDashboard'
import BoosterDashboard from './pages/BoosterDashboard'

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/rank-icons" element={<RankIconsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/user-progress" element={<UserProgressPage />} />
        <Route path="/match-history" element={<MatchHistoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/booster/profile" element={<BoosterProfilePage />} />
        <Route path="/booster/pricing" element={<BoosterPricingPage />} />
        <Route path="/booster/bulk-pricing" element={<BulkPricingPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/booster/orders" element={<BoosterOrdersPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/booster/dashboard" element={<BoosterDashboard />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
