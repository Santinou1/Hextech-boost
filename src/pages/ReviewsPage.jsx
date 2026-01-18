import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { TRANSFORMATIONS, REVIEWS } from '../utils/constants'

export default function ReviewsPage() {
  return (
    <PageTransition>
    <div className="bg-background-light dark:bg-background-dark font-display text-white selection:bg-primary/30">
      <Header />
      
      <main className="relative">
        <section className="pt-16 pb-12 px-4">
          <div className="max-w-[960px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full mb-6">
              <span className="material-symbols-outlined text-primary text-sm">verified</span>
              <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">Verified Performance</span>
            </div>
            <h1 className="text-white tracking-tight text-5xl md:text-6xl font-bold leading-tight pb-4">
              PROVEN RESULTS: FROM LOW ELO TO LEGENDARY
            </h1>
            <p className="text-[#8dcec5] text-lg font-normal max-w-2xl mx-auto">
              Elite tier performance documentation. We don't just promise ranks; we engineer victories for 10,000+ satisfied players.
            </p>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="max-w-[960px] mx-auto bg-card-dark border border-border-cyan p-6 flex flex-wrap items-center justify-between gap-8 rounded-lg">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <p className="text-white text-4xl font-black leading-none tracking-tighter">4.9</p>
                <div className="flex gap-0.5 my-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-primary fill-1">star</span>
                  ))}
                </div>
                <p className="text-primary/70 text-xs font-bold uppercase tracking-widest">Excellent</p>
              </div>
              <div className="h-12 w-px bg-border-cyan hidden sm:block"></div>
              <div>
                <p className="text-white text-sm font-medium mb-2">Based on 10,000+ verified customer reviews</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8dcec5] text-sm">check_circle</span>
                  <span className="text-[#8dcec5] text-xs">Trustpilot Verified Profile</span>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-[300px] space-y-2">
              {[
                { stars: 5, percent: 94 },
                { stars: 4, percent: 4 }
              ].map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-4">{item.stars}</span>
                  <div className="flex-1 h-1.5 bg-border-cyan rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${item.percent}%` }}></div>
                  </div>
                  <span className="text-xs text-primary w-8 text-right">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 bg-background-dark/50 border-y border-border-cyan/30">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-center justify-between mb-10 px-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-8 h-px bg-primary"></span>
                Recent Rank Transformations
              </h2>
              <span className="text-primary/50 text-xs font-mono uppercase tracking-widest">Live Updates Available</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRANSFORMATIONS.map((trans) => (
                <div key={trans.order} className="hextech-border hextech-glow bg-card-dark/40 p-1 group">
                  <div className="bg-card-dark p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-2 py-1 bg-border-cyan/30 rounded text-[10px] font-bold text-primary uppercase">
                        Completed: {trans.time}
                      </div>
                      <span className="material-symbols-outlined text-hextech-gold">workspace_premium</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-8 py-8 relative">
                      <div className="text-center">
                        <div 
                          className="size-20 bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 transition-all"
                          style={{ backgroundImage: `url(${trans.from.img})` }}
                        />
                        <p className="text-xs mt-2 text-white/40 font-bold uppercase tracking-tighter">{trans.from.rank}</p>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-primary animate-pulse">keyboard_double_arrow_right</span>
                        <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                      </div>
                      
                      <div className="text-center">
                        <div 
                          className="size-24 bg-cover bg-center drop-shadow-[0_0_15px_rgba(0,209,181,0.3)]"
                          style={{ backgroundImage: `url(${trans.to.img})` }}
                        />
                        <p className="text-xs mt-2 text-primary font-bold uppercase tracking-widest">{trans.to.rank}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-border-cyan/20 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/20"></div>
                        <span className="text-xs text-white/60">Booster: <span className="text-white">{trans.booster}</span></span>
                      </div>
                      <span className="text-[10px] font-mono text-white/30">Order {trans.order}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 max-w-[1200px] mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 uppercase tracking-[0.2em]">
            Transmission Logs: <span className="text-primary">Client Feedback</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {REVIEWS.map((review, idx) => (
              <div key={idx} className="bg-card-dark border border-border-cyan/30 p-8 relative scanline">
                <div className="absolute top-0 right-0 p-4">
                  <span className="material-symbols-outlined text-primary/20 text-4xl">format_quote</span>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(review.stars)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-hextech-gold text-sm fill-1">star</span>
                  ))}
                </div>
                <p className="text-white/80 italic leading-relaxed mb-6">{review.text}</p>
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded bg-primary/20 flex items-center justify-center border border-primary/40">
                    <span className="material-symbols-outlined text-primary">person</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{review.author}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
                      Verified Purchaser • {review.type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button className="px-10 py-4 border-2 border-primary text-primary font-bold uppercase tracking-widest hover:bg-primary hover:text-background-dark transition-all rounded">
              Load More Reviews
            </button>
          </div>
        </section>

        <section className="py-24 px-4 bg-gradient-to-t from-primary/10 to-transparent">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">READY TO CLIMB?</h2>
            <p className="text-xl text-[#8dcec5] mb-10">
              Stop wasting time in elo hell. Join the elite ranks today with the most secure boosting system in the industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-background-dark px-12 py-4 text-lg font-bold rounded uppercase tracking-wider hover:scale-105 transition-transform">
                Start Your Boost Now
              </button>
              <button className="bg-transparent border border-white/20 px-12 py-4 text-lg font-bold rounded uppercase tracking-wider hover:bg-white/5 transition-colors">
                View Price List
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
    </PageTransition>
  )
}
