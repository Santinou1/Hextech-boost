import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { HIGH_TIER_RANKS, TECH_SPECS } from '../utils/constants'

export default function RankIconsPage() {
  return (
    <PageTransition>
    <div className="bg-background-light dark:bg-background-dark font-display text-white selection:bg-primary selection:text-background-dark overflow-x-hidden">
      <div className="relative flex min-h-screen flex-col cyber-grid">
        <Header />
        
        <main className="flex-1 flex flex-col items-center py-12 px-6 lg:px-20">
          <div className="max-w-[1200px] w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">Premium Assets</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter uppercase italic">
                  High-Tier <br/><span className="text-primary">Custom Icons</span>
                </h1>
                <p className="text-white/50 text-lg font-normal max-w-lg leading-relaxed">
                  Hand-crafted, ultra-fidelity iconography for Emerald through Challenger tiers. Designed for high-contrast dark themes with technical precision.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-3 bg-panel-dark border border-[#204b45] hover:border-primary/50 text-white px-8 py-4 rounded text-sm font-bold tracking-widest uppercase transition-all">
                  <span className="material-symbols-outlined text-primary">download</span>
                  Download Full Set V.1
                </button>
                <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.3em]">Version 1.2.0 • 512px High Res</p>
              </div>
            </div>

            <div className="mb-10 flex border-b border-[#204b45] gap-12">
              <button className="relative flex flex-col items-center justify-center border-b-[3px] border-primary pb-4">
                <span className="text-white text-sm font-bold tracking-widest uppercase">Variant 1: Cyber-Metallic</span>
                <div className="absolute -bottom-[2px] w-12 h-[3px] bg-primary blur-sm"></div>
              </button>
              <button className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-white/40 pb-4 hover:text-white transition-colors">
                <span className="text-sm font-bold tracking-widest uppercase">Variant 2: Crystal Shard</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
              {HIGH_TIER_RANKS.map((rank) => (
                <div key={rank.name} className={`glass-panel group relative flex flex-col items-center p-6 hover:border-${rank.color}/50 transition-all duration-500 overflow-hidden`}>
                  <div className={`absolute inset-0 bg-${rank.color}/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="mb-8 relative">
                    <div className={`absolute inset-0 bg-${rank.color}/20 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700`}></div>
                    <img 
                      className={`relative z-10 ${rank.size === 'large' ? 'w-40 h-40 -mt-4' : 'w-32 h-32'} object-contain drop-shadow-[0_0_15px_rgba(0,209,181,0.3)] group-hover:scale-110 transition-transform duration-500`}
                      src={rank.img}
                      alt={`${rank.name} rank icon`}
                    />
                  </div>
                  <div className="w-full space-y-2 relative z-10 text-center">
                    <h3 className={`text-${rank.color} text-xl font-black italic uppercase tracking-tighter`}>{rank.name}</h3>
                    <div className="flex justify-between items-center text-[10px] text-white/30 font-bold tracking-widest uppercase">
                      <span>PNG / {rank.size === 'large' ? '1024px' : '512px'}</span>
                      <span className={`text-${rank.color}/60`}>{rank.hex}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8 border-l-4 border-primary pl-6">
              <h2 className="text-2xl font-black uppercase tracking-widest italic mb-2">Technical Specifications</h2>
              <p className="text-white/40 text-sm font-medium">All assets are provided with pre-baked lighting and transparency.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
              {TECH_SPECS.map((spec) => (
                <div key={spec.title} className="bg-panel-dark/40 border border-[#204b45] p-5 rounded">
                  <span className="material-symbols-outlined text-primary mb-3">{spec.icon}</span>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">{spec.title}</h4>
                  <p className="text-white font-bold">{spec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
    </PageTransition>
  )
}
