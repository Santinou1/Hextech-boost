import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { boosterService } from '../services/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'
import { motion } from 'framer-motion'

const RANKS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger']
const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
const LANGUAGES = ['Español', 'English', 'Português', 'Français']
const SERVERS = ['LAS', 'LAN', 'NA', 'EUW', 'EUNE', 'BR', 'KR', 'OCE']

export default function BoosterProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [champions, setChampions] = useState([])
  const [selectedChampions, setSelectedChampions] = useState([])
  const [championSearch, setChampionSearch] = useState('')
  const [showChampionSelector, setShowChampionSelector] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    current_rank: 'Master',
    peak_rank: 'Grandmaster',
    main_roles: [],
    languages: [],
    server: 'LAS',
    duo_extra_cost: 20,
    bio: '',
    avatar_url: ''
  })

  // Cargar campeones desde la API de Data Dragon
  useEffect(() => {
    fetch('https://ddragon.leagueoflegends.com/cdn/14.24.1/data/en_US/champion.json')
      .then(res => res.json())
      .then(data => {
        const champList = Object.values(data.data).map(champ => ({
          id: champ.id,
          name: champ.name,
          image: `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champ.id}.png`
        }))
        
        // Agregar campeones nuevos que no están en la API
        const newChampions = [
          {
            id: 'Mel',
            name: 'Mel',
            image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/Mel_0.jpg'
          },
          {
            id: 'Yunara',
            name: 'Yunara',
            image: 'https://opgg-static.akamaized.net/meta/images/lol/16.1.1/champion/Yunara.png?image=c_crop,h_103,w_103,x_9,y_9/q_auto:good,f_webp,w_160,h_160&v=1601'
          },
          {
            id: 'Zaahen',
            name: 'Zaahen',
            image: 'https://opgg-static.akamaized.net/meta/images/lol/16.1.1/champion/Zaahen.png?image=c_crop,h_103,w_103,x_9,y_9/q_auto:good,f_webp,w_160,h_160&v=1601'
          }
        ]
        
        setChampions([...champList, ...newChampions].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch(err => {
        // Error loading champions
      })
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'booster') {
      navigate('/')
      return
    }
    loadProfile()
  }, [user, navigate])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await boosterService.getMyProfile()
      
      if (response.data.profile) {
        const profile = response.data.profile
        
        // Parsear campeones principales
        const champNames = profile.main_champions ? profile.main_champions.split(', ') : []
        
        setFormData({
          display_name: profile.display_name || '',
          current_rank: profile.current_rank || 'Master',
          peak_rank: profile.peak_rank || 'Grandmaster',
          main_roles: profile.main_roles ? profile.main_roles.split(', ') : [],
          languages: profile.languages ? profile.languages.split(', ') : [],
          server: profile.server || 'LAS',
          duo_extra_cost: profile.duo_extra_cost || 20,
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || ''
        })
        
        // Convertir nombres de campeones a objetos (cuando se carguen los campeones)
        if (champNames.length > 0 && champions.length > 0) {
          const selectedChamps = champions.filter(c => champNames.includes(c.name))
          setSelectedChampions(selectedChamps)
        }
        
        setHasProfile(true)
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setHasProfile(false)
      }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar campeones seleccionados cuando se carguen los campeones
  useEffect(() => {
    if (champions.length > 0 && formData.display_name) {
      loadProfile()
    }
  }, [champions])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.display_name || !formData.current_rank || !formData.peak_rank || 
        formData.main_roles.length === 0 || formData.languages.length === 0) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setSaving(true)
      
      const payload = {
        display_name: formData.display_name,
        current_rank: formData.current_rank,
        peak_rank: formData.peak_rank,
        main_roles: formData.main_roles.join(', '),
        main_champions: selectedChampions.map(c => c.name).join(', '),
        languages: formData.languages.join(', '),
        server: formData.server,
        duo_extra_cost: parseFloat(formData.duo_extra_cost),
        bio: formData.bio,
        avatar_url: formData.avatar_url
      }

      await boosterService.upsertProfile(payload)
      alert(hasProfile ? 'Perfil actualizado exitosamente!' : 'Perfil creado exitosamente!')
      setHasProfile(true)
      
    } catch (error) {
      alert('Error al guardar el perfil: ' + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  const toggleChampion = (champion) => {
    setSelectedChampions(prev => {
      const exists = prev.find(c => c.id === champion.id)
      if (exists) {
        return prev.filter(c => c.id !== champion.id)
      } else {
        return [...prev, champion]
      }
    })
  }

  const removeChampion = (championId) => {
    setSelectedChampions(prev => prev.filter(c => c.id !== championId))
  }

  const filteredChampions = champions.filter(champ => 
    champ.name.toLowerCase().includes(championSearch.toLowerCase())
  )

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      main_roles: prev.main_roles.includes(role)
        ? prev.main_roles.filter(r => r !== role)
        : [...prev.main_roles, role]
    }))
  }

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }))
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="bg-background-dark min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/60 mt-4">Cargando perfil...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="bg-background-dark font-display text-white min-h-screen flex flex-col hex-grid-bg">
        <Header />
        
        <main className="flex-1 py-12 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">
                {hasProfile ? 'Editar' : 'Crear'} <span className="text-primary">Perfil</span>
              </h1>
              <p className="text-primary/70 text-lg">
                {hasProfile 
                  ? 'Actualiza tu información de booster profesional'
                  : 'Completa tu perfil para empezar a recibir órdenes'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-hextech-surface border border-hextech-border rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Información Básica
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">
                      Nombre de Visualización <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                      placeholder="Ej: ProBooster"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">
                      Servidor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.server}
                      onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                      required
                    >
                      {SERVERS.map(server => (
                        <option key={server} value={server}>{server}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">
                      Rango Actual <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.current_rank}
                      onChange={(e) => setFormData({ ...formData, current_rank: e.target.value })}
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                      required
                    >
                      {RANKS.map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">
                      Rango Máximo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.peak_rank}
                      onChange={(e) => setFormData({ ...formData, peak_rank: e.target.value })}
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                      required
                    >
                      {RANKS.map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">
                      Costo Adicional Duo (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.duo_extra_cost}
                      onChange={(e) => setFormData({ ...formData, duo_extra_cost: e.target.value })}
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                      required
                    />
                    <p className="text-xs text-white/40 mt-1">Porcentaje adicional para Duo Boost</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/80 mb-2">
                      URL de Avatar (opcional)
                    </label>
                    <input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </motion.div>

              {/* Roles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-hextech-surface border border-hextech-border rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">sports_esports</span>
                  Roles Principales <span className="text-red-500">*</span>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`py-3 px-4 rounded font-bold text-sm uppercase tracking-wider transition-all ${
                        formData.main_roles.includes(role)
                          ? 'bg-primary text-black border-2 border-primary'
                          : 'bg-hextech-dark border-2 border-hextech-border text-white/60 hover:border-primary/50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Campeones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-hextech-surface border border-hextech-border rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shield</span>
                  Campeones Principales
                </h2>

                {selectedChampions.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedChampions.map(champ => (
                      <div
                        key={champ.id}
                        className="flex items-center gap-2 px-3 py-2 bg-hextech-dark border border-primary rounded"
                      >
                        <img 
                          src={champ.image} 
                          alt={champ.name}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-sm font-bold">{champ.name}</span>
                        <button
                          type="button"
                          onClick={() => removeChampion(champ.id)}
                          className="text-white/50 hover:text-white"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowChampionSelector(!showChampionSelector)}
                  className="w-full py-3 bg-hextech-dark border border-hextech-border hover:border-primary text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                  {selectedChampions.length > 0 ? 'Agregar Más Campeones' : 'Seleccionar Campeones'}
                </button>

                {/* Champion Selector Modal */}
                {showChampionSelector && (
                  <div className="mt-4 border border-hextech-border rounded-lg overflow-hidden">
                    <div className="p-3 bg-hextech-dark">
                      <input
                        type="text"
                        placeholder="Buscar champion..."
                        value={championSearch}
                        onChange={(e) => setChampionSearch(e.target.value)}
                        className="w-full bg-black/30 border border-hextech-border rounded px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto grid grid-cols-4 md:grid-cols-6 gap-2 p-3 bg-hextech-dark/50">
                      {filteredChampions.slice(0, 60).map(champ => {
                        const isSelected = selectedChampions.find(c => c.id === champ.id)
                        return (
                          <button
                            key={champ.id}
                            type="button"
                            onClick={() => toggleChampion(champ)}
                            className={`flex flex-col items-center gap-1 p-2 rounded transition-colors group ${
                              isSelected 
                                ? 'bg-primary/20 border-2 border-primary' 
                                : 'hover:bg-primary/10 border-2 border-transparent'
                            }`}
                            title={champ.name}
                          >
                            <img 
                              src={champ.image} 
                              alt={champ.name}
                              className={`w-full aspect-square rounded transition-all ${
                                isSelected 
                                  ? 'border-2 border-primary' 
                                  : 'border border-hextech-border group-hover:border-primary'
                              }`}
                            />
                            <span className={`text-[8px] truncate w-full text-center ${
                              isSelected ? 'text-primary font-bold' : 'text-white/70 group-hover:text-primary'
                            }`}>
                              {champ.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Idiomas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-hextech-surface border border-hextech-border rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">language</span>
                  Idiomas <span className="text-red-500">*</span>
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`py-3 px-4 rounded font-bold text-sm uppercase tracking-wider transition-all ${
                        formData.languages.includes(lang)
                          ? 'bg-primary text-black border-2 border-primary'
                          : 'bg-hextech-dark border-2 border-hextech-border text-white/60 hover:border-primary/50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Biografía */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-hextech-surface border border-hextech-border rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  Biografía
                </h2>

                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-hextech-dark border border-hextech-border rounded px-4 py-3 text-white focus:border-primary transition resize-none"
                  rows="4"
                  placeholder="Cuéntanos sobre tu experiencia como booster..."
                />
              </motion.div>

              {/* Botones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-end gap-4"
              >
                <button
                  type="button"
                  onClick={() => navigate('/booster/pricing')}
                  className="px-8 py-4 bg-hextech-surface border border-hextech-border rounded text-sm font-bold uppercase tracking-wider hover:border-white/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-4 rounded text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    saving
                      ? 'bg-hextech-surface border border-hextech-border text-white/30 cursor-not-allowed'
                      : 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,209,181,0.3)]'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="size-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">save</span>
                      {hasProfile ? 'Actualizar Perfil' : 'Crear Perfil'}
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
