import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Header() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
  return (
    <header className="w-full border-b border-hextech-border bg-hextech-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            className="size-8 text-primary"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor" />
            </svg>
          </motion.div>
          <h1 className="text-xl font-bold tracking-tight uppercase">
            Hextech <span className="text-primary group-hover:text-primary/80 transition-colors">Boost</span>
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-10">
          <Link 
            to="/calculator" 
            className="relative text-sm font-medium uppercase tracking-widest transition-colors group"
          >
            <span className={isActive('/calculator') ? 'text-primary' : 'text-white hover:text-primary'}>
              Calculadora
            </span>
            {isActive('/calculator') && (
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(0,209,181,0.6)]"
                initial={false}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
          
          <Link 
            to="/pricing" 
            className="relative text-sm font-medium uppercase tracking-widest transition-colors group"
          >
            <span className={isActive('/pricing') ? 'text-primary' : 'text-white hover:text-primary'}>
              Servicios
            </span>
            {isActive('/pricing') && (
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(0,209,181,0.6)]"
                initial={false}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
          
          <Link 
            to="/user-progress" 
            className="relative text-sm font-medium uppercase tracking-widest transition-colors group"
          >
            <span className={isActive('/user-progress') ? 'text-primary' : 'text-white hover:text-primary'}>
              Demo Panel
            </span>
            {isActive('/user-progress') && (
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(0,209,181,0.6)]"
                initial={false}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
          
          <Link 
            to="/reviews" 
            className="relative text-sm font-medium uppercase tracking-widest transition-colors group"
          >
            <span className={isActive('/reviews') ? 'text-primary' : 'text-white hover:text-primary'}>
              Reseñas
            </span>
            {isActive('/reviews') && (
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(0,209,181,0.6)]"
                initial={false}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
          
          <Link 
            to="/faq" 
            className="relative text-sm font-medium uppercase tracking-widest transition-colors group"
          >
            <span className={isActive('/faq') ? 'text-primary' : 'text-white hover:text-primary'}>
              FAQ
            </span>
            {isActive('/faq') && (
              <motion.div
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(0,209,181,0.6)]"
                initial={false}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <motion.button 
            className="px-6 py-2 text-sm font-bold border border-primary text-primary hover:bg-primary hover:text-black transition-all rounded-sm uppercase tracking-tighter"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Acceso
          </motion.button>
        </div>
      </div>
    </header>
  )
}
