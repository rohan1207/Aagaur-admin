// Animation variants for staggered container animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

// Animation variant for sliding in from the left
export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 1.1,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};

// Animation variant for sliding in from the right
export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 1.0,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
};