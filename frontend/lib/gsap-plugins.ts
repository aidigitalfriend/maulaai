'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Import all GSAP plugins (gsap is aliased to gsap-trial with all premium plugins)
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { Observer } from 'gsap/Observer';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin';
import { CustomBounce } from 'gsap/CustomBounce';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { EasePack } from 'gsap/EasePack';

// Register all plugins
gsap.registerPlugin(
  ScrollTrigger,
  ScrollSmoother,
  Observer,
  Flip,
  Draggable,
  MotionPathPlugin,
  SplitText,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  MorphSVGPlugin,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  CustomBounce,
  CustomWiggle,
  InertiaPlugin,
  TextPlugin,
  EasePack
);

// Export all plugins for direct use
export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  Observer,
  Flip,
  Draggable,
  MotionPathPlugin,
  SplitText,
  ScrambleTextPlugin,
  DrawSVGPlugin,
  MorphSVGPlugin,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  CustomBounce,
  CustomWiggle,
  InertiaPlugin,
  TextPlugin,
  EasePack,
};

// ============================================
// 12+ REUSABLE ANIMATION EFFECTS
// ============================================

/**
 * 1. FADE IN UP - Elements fade in while moving up
 */
export const fadeInUp = (
  element: string | Element,
  options?: { delay?: number; duration?: number; stagger?: number }
) => {
  return gsap.from(element, {
    y: 60,
    opacity: 0,
    duration: options?.duration || 0.8,
    delay: options?.delay || 0,
    stagger: options?.stagger || 0.1,
    ease: 'power3.out',
  });
};

/**
 * 2. FADE IN DOWN - Elements fade in while moving down
 */
export const fadeInDown = (
  element: string | Element,
  options?: { delay?: number; duration?: number; stagger?: number }
) => {
  return gsap.from(element, {
    y: -60,
    opacity: 0,
    duration: options?.duration || 0.8,
    delay: options?.delay || 0,
    stagger: options?.stagger || 0.1,
    ease: 'power3.out',
  });
};

/**
 * 3. FADE IN LEFT - Elements slide in from left
 */
export const fadeInLeft = (
  element: string | Element,
  options?: { delay?: number; duration?: number; stagger?: number }
) => {
  return gsap.from(element, {
    x: -80,
    opacity: 0,
    duration: options?.duration || 0.8,
    delay: options?.delay || 0,
    stagger: options?.stagger || 0.1,
    ease: 'power3.out',
  });
};

/**
 * 4. FADE IN RIGHT - Elements slide in from right
 */
export const fadeInRight = (
  element: string | Element,
  options?: { delay?: number; duration?: number; stagger?: number }
) => {
  return gsap.from(element, {
    x: 80,
    opacity: 0,
    duration: options?.duration || 0.8,
    delay: options?.delay || 0,
    stagger: options?.stagger || 0.1,
    ease: 'power3.out',
  });
};

/**
 * 5. SCALE UP - Elements scale up from smaller size
 */
export const scaleUp = (
  element: string | Element,
  options?: { delay?: number; duration?: number; stagger?: number }
) => {
  return gsap.from(element, {
    scale: 0.5,
    opacity: 0,
    duration: options?.duration || 0.6,
    delay: options?.delay || 0,
    stagger: options?.stagger || 0.1,
    ease: 'back.out(1.7)',
  });
};

/**
 * 6. ROTATE IN - Elements rotate while fading in
 */
export const rotateIn = (
  element: string | Element,
  options?: { delay?: number; duration?: number; rotation?: number }
) => {
  return gsap.from(element, {
    rotation: options?.rotation || 15,
    opacity: 0,
    scale: 0.8,
    duration: options?.duration || 0.7,
    delay: options?.delay || 0,
    ease: 'power2.out',
  });
};

/**
 * 7. BOUNCE IN - Elements bounce in with physics
 */
export const bounceIn = (
  element: string | Element,
  options?: { delay?: number; duration?: number }
) => {
  return gsap.from(element, {
    y: -100,
    opacity: 0,
    duration: options?.duration || 1,
    delay: options?.delay || 0,
    ease: 'bounce.out',
  });
};

/**
 * 8. ELASTIC IN - Elements with elastic effect
 */
export const elasticIn = (
  element: string | Element,
  options?: { delay?: number; duration?: number }
) => {
  return gsap.from(element, {
    scale: 0,
    opacity: 0,
    duration: options?.duration || 1.2,
    delay: options?.delay || 0,
    ease: 'elastic.out(1, 0.5)',
  });
};

/**
 * 9. BLUR IN - Elements fade in with blur effect
 */
export const blurIn = (
  element: string | Element,
  options?: { delay?: number; duration?: number }
) => {
  return gsap.from(element, {
    filter: 'blur(20px)',
    opacity: 0,
    duration: options?.duration || 0.8,
    delay: options?.delay || 0,
    ease: 'power2.out',
  });
};

/**
 * 10. STAGGER GRID - Stagger elements in a grid pattern
 */
export const staggerGrid = (
  element: string | Element,
  options?: { columns?: number; duration?: number; delay?: number }
) => {
  return gsap.from(element, {
    opacity: 0,
    scale: 0.8,
    y: 30,
    duration: options?.duration || 0.5,
    delay: options?.delay || 0,
    stagger: {
      amount: 0.8,
      grid: 'auto',
      from: 'start',
    },
    ease: 'power2.out',
  });
};

/**
 * 11. TYPEWRITER - Text typing effect
 */
export const typewriter = (
  element: string | Element,
  text: string,
  options?: { duration?: number; delay?: number }
) => {
  return gsap.to(element, {
    text: { value: text, delimiter: '' },
    duration: options?.duration || 2,
    delay: options?.delay || 0,
    ease: 'none',
  });
};

/**
 * 12. SCRAMBLE TEXT - Text scramble reveal effect
 */
export const scrambleText = (
  element: string | Element,
  text: string,
  options?: { duration?: number; delay?: number; chars?: string }
) => {
  return gsap.to(element, {
    scrambleText: {
      text: text,
      chars: options?.chars || '!<>-_\\/[]{}—=+*^?#________',
      speed: 0.3,
    },
    duration: options?.duration || 1.5,
    delay: options?.delay || 0,
    ease: 'power1.inOut',
  });
};

/**
 * 13. FLOAT - Continuous floating animation
 */
export const float = (
  element: string | Element,
  options?: { distance?: number; duration?: number }
) => {
  return gsap.to(element, {
    y: options?.distance || -15,
    duration: options?.duration || 2,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
};

/**
 * 14. PULSE - Continuous pulse animation
 */
export const pulse = (
  element: string | Element,
  options?: { scale?: number; duration?: number }
) => {
  return gsap.to(element, {
    scale: options?.scale || 1.05,
    duration: options?.duration || 1,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
};

/**
 * 15. GLOW - Glowing effect
 */
export const glow = (
  element: string | Element,
  options?: { color?: string; duration?: number }
) => {
  return gsap.to(element, {
    boxShadow: `0 0 30px ${options?.color || 'rgba(168, 85, 247, 0.5)'}`,
    duration: options?.duration || 1.5,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
};

/**
 * 16. PARALLAX - Create parallax scrolling effect
 */
export const parallax = (
  element: string | Element,
  options?: { speed?: number; trigger?: string }
) => {
  return gsap.to(element, {
    y: (options?.speed || 100) * -1,
    ease: 'none',
    scrollTrigger: {
      trigger: options?.trigger || element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
};

/**
 * 17. REVEAL ON SCROLL - Reveal elements when scrolling
 */
export const revealOnScroll = (
  element: string | Element,
  options?: { duration?: number; y?: number }
) => {
  return gsap.from(element, {
    y: options?.y || 80,
    opacity: 0,
    duration: options?.duration || 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
};

/**
 * 18. SPLIT TEXT REVEAL - Animate text character by character
 */
export const splitTextReveal = (
  element: string | Element,
  options?: { duration?: number; stagger?: number; type?: 'chars' | 'words' | 'lines' }
) => {
  const split = new SplitText(element, { type: options?.type || 'chars' });
  return gsap.from(split.chars || split.words || split.lines, {
    y: 50,
    opacity: 0,
    rotationX: -90,
    duration: options?.duration || 0.5,
    stagger: options?.stagger || 0.02,
    ease: 'back.out(1.7)',
  });
};

/**
 * 19. DRAW SVG - Animate SVG stroke drawing
 */
export const drawSVG = (
  element: string | Element,
  options?: { duration?: number; delay?: number }
) => {
  return gsap.from(element, {
    drawSVG: '0%',
    duration: options?.duration || 2,
    delay: options?.delay || 0,
    ease: 'power2.inOut',
  });
};

/**
 * 20. MORPH SVG - Morph one SVG path to another
 */
export const morphSVG = (
  element: string | Element,
  targetPath: string,
  options?: { duration?: number; delay?: number }
) => {
  return gsap.to(element, {
    morphSVG: targetPath,
    duration: options?.duration || 1,
    delay: options?.delay || 0,
    ease: 'power2.inOut',
  });
};

/**
 * 21. FLIP STATE - Animate layout changes with FLIP
 */
export const flipAnimate = (
  state: Flip.FlipState,
  targets: string | Element | Element[],
  options?: { duration?: number; ease?: string; stagger?: number }
) => {
  return Flip.from(state, {
    targets,
    duration: options?.duration || 0.6,
    ease: options?.ease || 'power2.inOut',
    stagger: options?.stagger || 0.05,
    absolute: true,
    scale: true,
  });
};

/**
 * 22. MAGNETIC HOVER - Elements follow cursor on hover
 */
export const magneticHover = (element: HTMLElement, strength: number = 0.3) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * 23. COUNTER - Animate number counting
 */
export const counter = (
  element: string | Element,
  endValue: number,
  options?: { duration?: number; delay?: number; prefix?: string; suffix?: string }
) => {
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: endValue,
    duration: options?.duration || 2,
    delay: options?.delay || 0,
    ease: 'power1.out',
    onUpdate: () => {
      const el = typeof element === 'string' ? document.querySelector(element) : element;
      if (el) {
        el.textContent = `${options?.prefix || ''}${Math.round(obj.value).toLocaleString()}${options?.suffix || ''}`;
      }
    },
  });
};

/**
 * 24. SHAKE - Shake effect for attention
 */
export const shake = (
  element: string | Element,
  options?: { intensity?: number; duration?: number }
) => {
  return gsap.to(element, {
    x: options?.intensity || 10,
    duration: options?.duration || 0.1,
    repeat: 5,
    yoyo: true,
    ease: 'power1.inOut',
  });
};

// ============================================
// SCROLL TRIGGER UTILITIES
// ============================================

/**
 * Create scroll-triggered animation batch
 */
export const batchScrollTrigger = (
  elements: string,
  animation: gsap.TweenVars,
  options?: { start?: string; stagger?: number }
) => {
  ScrollTrigger.batch(elements, {
    onEnter: (batch) => {
      gsap.from(batch, {
        ...animation,
        stagger: options?.stagger || 0.1,
      });
    },
    start: options?.start || 'top 85%',
  });
};

/**
 * Create pin section with scroll
 */
export const pinSection = (
  trigger: string | Element,
  options?: { start?: string; end?: string; pinSpacing?: boolean }
) => {
  return ScrollTrigger.create({
    trigger,
    start: options?.start || 'top top',
    end: options?.end || '+=100%',
    pin: true,
    pinSpacing: options?.pinSpacing ?? true,
  });
};

// ============================================
// TIMELINE UTILITIES
// ============================================

/**
 * Create a staggered entrance timeline
 */
export const createEntranceTimeline = (
  container: string | Element,
  selectors: { [key: string]: gsap.TweenVars }
) => {
  const tl = gsap.timeline();
  
  Object.entries(selectors).forEach(([selector, vars]) => {
    tl.from(selector, vars, '-=0.3');
  });
  
  return tl;
};

/**
 * Hero section animation timeline
 */
export const heroTimeline = (scope?: Element | null) => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  
  tl.from('.hero-badge', { y: -30, opacity: 0, duration: 0.6 })
    .from('.hero-title', { y: 50, opacity: 0, duration: 0.8 }, '-=0.3')
    .from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-cta', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.3')
    .from('.hero-image', { scale: 0.9, opacity: 0, duration: 0.8 }, '-=0.5');
  
  return tl;
};

export default gsap;
