import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { HERO_BG_IMAGE } from '../utils/constants'

export default function HomePage() {
  return (
    <PageTransition>
      <div className="bg-background-light dark:bg-background-dark font-display text-white transition-colors duration-300">
        <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden">
          <Header />
        
        <main className="relative flex-1 flex items-center justify-center pt-20">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-background-dark/60 z-10"></div>
            <div 
              className="absolute right-0 top-0 h-full w-full lg:w-2/3 bg-cover bg-center hero-mask opacity-80" 
              style={{backgroundImage: `url('${HERO_BG_IMAGE}')`}}
            />
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen bg-[radial-gradient(circle_at_70%_30%,#00d1b5_0%,transparent_50%),radial-gradient(circle_at_90%_70%,#00d1b5_0%,transparent_40%)]"></div>
          </div>
          
          {/* SEO Hidden Content */}
          <div className="sr-only">
            <h2>Servicio de Elo Boost para League of Legends en Argentina</h2>
            <p>
              Hextech Boost ofrece el mejor servicio de elo boost para League of Legends en Argentina y Latinoamérica. 
              Nuestros boosters profesionales de rango Challenger y Grandmaster te ayudarán a subir de elo rápidamente 
              y de forma segura. Ofrecemos boost lol desde Hierro hasta Challenger, duo boost con descuento del 20%, 
              y garantía de satisfacción. Todos nuestros servicios incluyen VPN, modo offline y chat directo con tu booster.
            </p>
            <h3>¿Por qué elegir nuestro servicio de boost lol?</h3>
            <ul>
              <li>Boosters verificados de Master, Grandmaster y Challenger</li>
              <li>Duo boost disponible para jugar junto al booster</li>
              <li>100% seguro con VPN y modo offline</li>
              <li>Precios competitivos desde $20</li>
              <li>Entrega rápida en 24-72 horas</li>
              <li>Soporte 24/7 en español</li>
              <li>Garantía de rango por 7 días</li>
            </ul>
          </div>
          
          <div className="layout-container relative z-20 w-full max-w-[1440px] px-6 lg:px-20 py-20 lg:py-32">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex flex-col gap-8 w-full lg:w-1/2">
                <div className="flex flex-col gap-4">
                  <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase border-l-2 border-primary pl-3">
                    Elo Boost Profesional Argentina
                  </span>
                  <h1 className="text-white text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter uppercase max-w-xl">
                    Elo Boost LOL <span className="text-primary italic">Seguro</span> y Rápido
                  </h1>
                  <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-lg mt-4 border-l border-white/10 pl-6">
                    Servicio de Elo Boost League of Legends profesional. Sube de rango con boosters Challenger verificados. Duo Boost disponible. 100% seguro con VPN.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <Link 
                    to="/calculator"
                    className="flex min-w-[200px] items-center justify-center rounded bg-hextech-gold text-background-dark h-14 px-8 font-black uppercase tracking-widest hextech-glow hover:scale-105 hover:brightness-110 transition-all duration-300"
                  >
                    <span className="truncate">Calcular mi Boost</span>
                  </Link>
                  <Link 
                    to="/pricing"
                    className="flex min-w-[180px] items-center justify-center rounded border border-primary/50 bg-primary/5 text-primary h-14 px-8 font-bold uppercase tracking-widest hover:bg-primary hover:text-background-dark transition-all duration-300 neon-glow"
                  >
                    <span className="truncate">Ver Precios</span>
                  </Link>
                </div>
                
                <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-2xl">speed</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/50">Velocidad</span>
                    </div>
                    <h3 className="text-lg font-bold">Rápido</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-2xl">shield</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/50">Protección</span>
                    </div>
                    <h3 className="text-lg font-bold">Seguro</h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-2xl">visibility_off</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-white/50">Privacidad</span>
                    </div>
                    <h3 className="text-lg font-bold">Anónimo</h3>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:flex flex-col items-center justify-center w-1/2 relative">
                <div className="relative w-80 h-80 rounded-full border border-primary/20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary/40 animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-4 rounded-full border-b-2 border-hextech-gold/30 animate-[spin_15s_linear_infinite_reverse]"></div>
                  
                  <div className="w-48 h-48 bg-surface-dark rounded-lg border border-primary/30 flex items-center justify-center flex-col gap-2 neon-glow rotate-3">
                    <span className="material-symbols-outlined text-primary text-6xl">military_tech</span>
                    <span className="text-primary font-bold tracking-widest">DIAMOND I</span>
                    <div className="w-1/2 h-1 bg-primary/20 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-primary"></div>
                    </div>
                  </div>
                  
                  <div className="absolute -top-4 -right-10 bg-surface-dark/80 backdrop-blur-md p-3 border border-white/10 rounded-lg -rotate-12">
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold tracking-widest uppercase">98% Win Rate</span>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-6 -left-12 bg-surface-dark/80 backdrop-blur-md p-4 border border-white/10 rounded-lg rotate-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Booster Online</span>
                      <span className="text-xs font-bold text-primary">D1 Level Smurf</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <Footer />
      </div>
    </div>
    </PageTransition>
  )
}
