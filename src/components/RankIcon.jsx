export default function RankIcon({ src, alt, isActive, isDisabled, onClick }) {
  const baseClasses = "aspect-square bg-hextech-dark/50 border flex items-center justify-center p-2 rounded transition-all cursor-pointer"
  
  const activeClasses = isActive 
    ? "border-primary rank-card-active" 
    : "border-white/5 hover:border-primary/50 group"
  
  const disabledClasses = isDisabled 
    ? "opacity-30 cursor-not-allowed grayscale" 
    : ""
  
  const imageClasses = isActive 
    ? "w-full h-full object-contain" 
    : "w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100"
  
  return (
    <div 
      className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
      onClick={!isDisabled ? onClick : undefined}
    >
      <img 
        className={imageClasses} 
        src={src} 
        alt={alt}
      />
    </div>
  )
}
