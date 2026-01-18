import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { FAQ_ITEMS } from '../utils/constants'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <PageTransition>
      <div className="bg-background-light dark:bg-background-dark font-display text-white selection:bg-primary/30">
        <div className="relative min-h-screen flex flex-col hex-grid-bg">
          <Header />
          
          <main className="flex-1 flex flex-col items-center justify-start py-12 px-6">
            <div className="max-w-4xl w-full text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">
                Preguntas <span className="text-primary">Frecuentes</span>
              </h2>
              <p className="text-primary/70 text-lg max-w-2xl mx-auto font-light">
                Respuestas a las consultas más comunes sobre nuestros servicios de boosting.
              </p>
            </div>

            <div className="max-w-3xl w-full space-y-4">
              {FAQ_ITEMS.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-hextech-surface border border-hextech-border rounded-lg overflow-hidden backdrop-blur-sm transition-all hover:border-primary/50"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-6 flex items-center justify-between gap-4 text-left group"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <span className="material-symbols-outlined text-primary text-xl mt-0.5 group-hover:scale-110 transition-transform">
                        {faq.icon}
                      </span>
                      <h3 className="text-base font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                    <span 
                      className={`material-symbols-outlined text-primary transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 pb-6 pl-16 border-t border-hextech-border/30">
                      <p className="text-sm text-white/70 leading-relaxed pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-3xl w-full mt-12 bg-hextech-surface border-2 border-primary rounded-lg p-8 text-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">support_agent</span>
              <h3 className="text-2xl font-black uppercase mb-2">¿Necesitas más ayuda?</h3>
              <p className="text-white/60 text-sm mb-6">
                Nuestro equipo de soporte está disponible 24/7 para responder tus consultas
              </p>
              <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wider transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto">
                <span className="material-symbols-outlined">chat</span>
                Contactar Soporte
              </button>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </PageTransition>
  )
}
