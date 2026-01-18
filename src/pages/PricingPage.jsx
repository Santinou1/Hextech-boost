import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { FEATURES, PRICING_TIERS } from '../utils/constants'

export default function PricingPage() {
  return (
    <PageTransition>
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-300">
      <div className="relative min-h-screen flex flex-col overflow-x-hidden">
        <Header />
        
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-20 py-16">
          <section className="mb-24">
            <div className="mb-12 flex flex-col gap-2">
              <div className="flex items-center gap-3 text-primary text-sm font-bold tracking-[0.3em] uppercase">
                <div className="h-px w-8 bg-primary"></div>
                <span>Elite Performance</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Premium Infrastructure</h2>
              <p className="text-slate-400 max-w-xl text-lg mt-2 font-light">
                Engineered for absolute discretion and maximum efficiency. We don't just boost; we evolve your standing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="group bg-hex-surface border-l-2 border-primary/30 p-8 hover:bg-primary/5 hover:border-primary transition-all duration-500 cursor-default">
                  <div className="mb-6 flex">
                    <span className="material-symbols-outlined text-4xl text-primary transition-transform duration-500 group-hover:scale-110">
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold uppercase mb-3 tracking-wide">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="absolute -right-20 top-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="mb-12 flex items-end justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-hex-gold text-sm font-bold tracking-[0.3em] uppercase">
                  <div className="h-px w-8 bg-hex-gold"></div>
                  <span>Pricing Modules</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Duo Queue Tiers</h2>
              </div>
            </div>

            <div className="border border-hex-border/60 bg-hex-surface/30 backdrop-blur-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-hex-surface/80 border-b border-hex-border/60 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">
                <div className="col-span-12 lg:col-span-4">Protocol / Rank</div>
                <div className="hidden lg:block lg:col-span-4">Objective Details</div>
                <div className="hidden lg:block lg:col-span-2 text-center">Estimation</div>
                <div className="col-span-12 lg:col-span-2 text-right">Investment</div>
              </div>

              {PRICING_TIERS.map((tier, idx) => (
                <div key={tier.title} className={`grid grid-cols-12 items-center gap-4 px-8 py-10 hover:bg-primary/5 transition-colors group relative ${idx < PRICING_TIERS.length - 1 ? 'border-b border-hex-border/20' : ''}`}>
                  <div className="col-span-12 lg:col-span-4 flex items-center gap-6">
                    <div className="size-16 rank-gradient border border-hex-border flex items-center justify-center relative">
                      <span className="material-symbols-outlined text-3xl text-primary">{tier.icon}</span>
                      {tier.badge && (
                        <div className="absolute -bottom-1 -right-1 size-6 bg-hex-gold flex items-center justify-center">
                          <span className="text-[10px] font-black text-background-dark">{tier.badge}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold tracking-wide uppercase group-hover:text-primary transition-colors">
                        {tier.title}
                      </h4>
                      <span className="text-xs font-bold text-hex-gold uppercase tracking-[0.1em]">{tier.subtitle}</span>
                    </div>
                  </div>
                  <div className="hidden lg:block lg:col-span-4">
                    <p className="text-sm text-slate-400">{tier.desc}</p>
                  </div>
                  <div className="hidden lg:block lg:col-span-2 text-center">
                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">{tier.time}</span>
                  </div>
                  <div className="col-span-12 lg:col-span-2 flex flex-col items-end gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{tier.price}</span>
                      {tier.perHour && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">/ Hr</span>}
                    </div>
                    <button className={`w-full font-black uppercase text-xs py-3 tracking-[0.2em] transition-all ${
                      tier.perHour 
                        ? 'border-2 border-primary text-primary hover:bg-primary hover:text-background-dark'
                        : 'bg-primary text-background-dark hover:brightness-110 hex-glow'
                    }`}>
                      Deploy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-32 relative group">
            <div className="absolute inset-0 bg-primary/5 border border-primary/20 -skew-x-2 transition-transform group-hover:skew-x-0 duration-700"></div>
            <div className="relative py-20 px-10 text-center flex flex-col items-center gap-8">
              <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-none tracking-tighter">
                Ready to reach your<br/><span className="text-primary not-italic">Dream Rank?</span>
              </h2>
              <p className="text-slate-400 max-w-lg text-lg">
                Join over 10,000+ players who trust our Hextech elite boosters. Safe. Fast. Unstoppable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="min-w-[280px] bg-primary text-background-dark font-black uppercase py-4 px-10 rounded-sm hex-glow hover:scale-105 active:scale-95 transition-all text-lg tracking-widest">
                  Start Boosting Now
                </button>
                <button className="min-w-[280px] border border-hex-border bg-hex-surface/50 text-white font-black uppercase py-4 px-10 rounded-sm hover:bg-hex-surface transition-all text-lg tracking-widest">
                  Join Discord
                </button>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </div>
    </PageTransition>
  )
}
