import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full border-t border-hextech-border bg-hextech-dark/40">
      {/* SEO Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-4">Elo Boost LOL</h3>
          <p className="text-white/50 text-xs leading-relaxed">
            Servicio profesional de elo boost para League of Legends en Argentina. Boosters Challenger verificados, 
            duo boost disponible, 100% seguro con VPN. Sube de rango rápido desde Hierro hasta Challenger.
          </p>
        </div>
        
        <div>
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-4">Servicios</h3>
          <ul className="space-y-2 text-xs text-white/50">
            <li>• Boost de División (Hierro a Oro)</li>
            <li>• Boost de Rango Completo</li>
            <li>• Duo Boost League of Legends</li>
            <li>• Boost a Master/Grandmaster</li>
            <li>• Wins Boost Profesional</li>
            <li>• Placement Matches</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-4">Enlaces</h3>
          <ul className="space-y-2 text-xs">
            <Link to="/calculator" className="block text-white/50 hover:text-primary transition-colors">
              Calculadora de Boost
            </Link>
            <Link to="/pricing" className="block text-white/50 hover:text-primary transition-colors">
              Precios y Servicios
            </Link>
            <Link to="/user-progress" className="block text-white/50 hover:text-primary transition-colors">
              Demo Panel de Usuario
            </Link>
            <Link to="/faq" className="block text-white/50 hover:text-primary transition-colors">
              Preguntas Frecuentes
            </Link>
            <Link to="/reviews" className="block text-white/50 hover:text-primary transition-colors">
              Reseñas de Clientes
            </Link>
          </ul>
        </div>
      </div>
      
      {/* Keywords Section for SEO */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <p className="text-[9px] text-white/20 leading-relaxed">
          Términos relacionados: elo boost lol, boost league of legends, eloboost argentina, subir elo lol, 
          duo boost lol, boost seguro lol, booster profesional, comprar elo lol, boost de hierro a oro, 
          boost barato lol, subir rango lol, boost lol las, eloboost challenger, boost rápido lol
        </p>
      </div>
      
      <div className="border-t border-hextech-border py-6 px-6 text-center">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em]">
          Hextech Boost © 2025 - Elo Boost Profesional Argentina
        </p>
      </div>
    </footer>
  )
}

