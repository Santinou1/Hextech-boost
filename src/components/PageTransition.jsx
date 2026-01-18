import { motion } from 'framer-motion'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.99
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      className="bg-background-dark text-white min-h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  )
}
