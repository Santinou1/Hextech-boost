import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'
import CalculatorPage from './pages/CalculatorPage'
import RankIconsPage from './pages/RankIconsPage'
import PricingPage from './pages/PricingPage'
import ReviewsPage from './pages/ReviewsPage'
import FAQPage from './pages/FAQPage'
import UserProgressPage from './pages/UserProgressPage'
import MatchHistoryPage from './pages/MatchHistoryPage'

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
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  )
}

export default App
