import { useEffect, useRef } from 'react';

// ===== Spacing & Radius Maps =====

export const SPACING_MAP = {
  none: '0px',
  sm: '16px',
  md: '32px',
  lg: '48px',
  xl: '80px',
};

export const RADIUS_MAP = {
  none: '0px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  full: '9999px',
};

export const GRADIENT_PRESETS = [
  { label: 'Aucun', value: '' },
  { label: 'Coucher de soleil', value: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { label: 'Océan', value: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { label: 'Forêt', value: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
  { label: 'Lavande', value: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { label: 'Nuit', value: 'linear-gradient(135deg, #1e293b, #334155)' },
  { label: 'Aurore', value: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { label: 'Ciel', value: 'linear-gradient(135deg, #bfdbfe, #e0e7ff)' },
  { label: 'Neutre', value: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' },
];

export const ANIMATION_OPTIONS = [
  { label: 'Aucune', value: 'none' },
  { label: 'Fondu', value: 'fade-in' },
  { label: 'Glisser (haut)', value: 'slide-up' },
  { label: 'Glisser (gauche)', value: 'slide-left' },
  { label: 'Zoom', value: 'zoom-in' },
];

// ===== Build inline style from block.styles =====

export function buildBlockStyle(styles) {
  if (!styles || typeof styles !== 'object') return {};

  const css = {};

  // Background
  if (styles.backgroundGradient) {
    css.background = styles.backgroundGradient;
  } else if (styles.backgroundImage) {
    css.backgroundImage = `url(${styles.backgroundImage})`;
    css.backgroundSize = 'cover';
    css.backgroundPosition = 'center';
  }
  if (styles.backgroundColor && !styles.backgroundGradient) {
    css.backgroundColor = styles.backgroundColor;
  }

  // Spacing
  if (styles.paddingTop && styles.paddingTop !== 'none') {
    css.paddingTop = SPACING_MAP[styles.paddingTop] || styles.paddingTop;
  }
  if (styles.paddingBottom && styles.paddingBottom !== 'none') {
    css.paddingBottom = SPACING_MAP[styles.paddingBottom] || styles.paddingBottom;
  }
  if (styles.marginTop && styles.marginTop !== 'none') {
    css.marginTop = SPACING_MAP[styles.marginTop] || styles.marginTop;
  }
  if (styles.marginBottom && styles.marginBottom !== 'none') {
    css.marginBottom = SPACING_MAP[styles.marginBottom] || styles.marginBottom;
  }

  // Border radius
  if (styles.borderRadius && styles.borderRadius !== 'none') {
    css.borderRadius = RADIUS_MAP[styles.borderRadius] || styles.borderRadius;
  }

  // Overlay
  if (styles.backgroundOverlay) {
    css.position = 'relative';
  }

  return css;
}

// ===== Build className from block.styles =====

export function buildBlockClass(styles) {
  if (!styles || typeof styles !== 'object') return '';

  const classes = ['block-styled'];

  // Visibility
  if (styles.visibility === 'desktop-only') classes.push('hidden md:block');
  else if (styles.visibility === 'mobile-only') classes.push('block md:hidden');

  // Full width
  if (styles.fullWidth) classes.push('w-full max-w-none');

  // Custom class
  if (styles.customClass) classes.push(styles.customClass);

  return classes.join(' ');
}

// ===== Overlay component =====

export function BlockOverlay({ styles }) {
  if (!styles?.backgroundOverlay) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundColor: styles.backgroundOverlay,
        borderRadius: RADIUS_MAP[styles?.borderRadius] || '0px',
      }}
    />
  );
}

// ===== Animation CSS (injected once) =====

const ANIMATION_KEYFRAMES = `
@keyframes sb-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes sb-slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sb-slide-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
@keyframes sb-zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
`;

let styleInjected = false;
function injectAnimationStyles() {
  if (styleInjected) return;
  const style = document.createElement('style');
  style.textContent = ANIMATION_KEYFRAMES;
  document.head.appendChild(style);
  styleInjected = true;
}

const ANIMATION_MAP = {
  'fade-in': 'sb-fade-in 0.6s ease-out forwards',
  'slide-up': 'sb-slide-up 0.6s ease-out forwards',
  'slide-left': 'sb-slide-left 0.6s ease-out forwards',
  'zoom-in': 'sb-zoom-in 0.5s ease-out forwards',
};

// ===== Scroll animation hook (for public site) =====

export function useScrollAnimation(animation) {
  const ref = useRef(null);

  useEffect(() => {
    if (!animation || animation === 'none') return;
    injectAnimationStyles();

    const el = ref.current;
    if (!el) return;

    el.style.opacity = '0';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animation = ANIMATION_MAP[animation] || '';
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animation]);

  return ref;
}
