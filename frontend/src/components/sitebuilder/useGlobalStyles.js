// Utility to get Tailwind-like classes from theme.globalStyles

const BUTTON_RADIUS = { none: 'rounded-none', sm: 'rounded-md', md: 'rounded-xl', lg: 'rounded-2xl', full: 'rounded-full' };
const BUTTON_SIZE = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
const CARD_RADIUS = { none: 'rounded-none', sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl', xl: 'rounded-3xl' };
const CARD_SHADOW = { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' };
const SECTION_SPACING = { sm: 'py-8', md: 'py-14', lg: 'py-20', xl: 'py-28' };
const SECTION_WIDTH = { narrow: 'max-w-3xl', default: 'max-w-6xl', wide: 'max-w-7xl', full: 'max-w-none' };

export function getButtonClass(theme) {
  const gs = theme?.globalStyles?.buttons || {};
  const radius = BUTTON_RADIUS[gs.borderRadius] || BUTTON_RADIUS.md;
  const size = BUTTON_SIZE[gs.size] || BUTTON_SIZE.md;
  return `${radius} ${size} font-semibold border-none cursor-pointer transition-all`;
}

export function getButtonStyle(theme, variant = 'primary') {
  const gs = theme?.globalStyles?.buttons || {};
  const primary = theme?.colors?.primary || '#0114dc';
  const style = {};

  if (gs.style === 'outline') {
    style.backgroundColor = 'transparent';
    style.border = `2px solid ${primary}`;
    style.color = primary;
  } else if (gs.style === 'ghost') {
    style.backgroundColor = `${primary}10`;
    style.color = primary;
  } else {
    style.backgroundColor = primary;
    style.color = 'white';
  }

  return style;
}

export function getButtonHoverClass(theme) {
  const gs = theme?.globalStyles?.buttons || {};
  const effect = gs.hoverEffect || 'darken';
  if (effect === 'scale') return 'hover:scale-105';
  if (effect === 'shadow') return 'hover:shadow-lg';
  if (effect === 'lighten') return 'hover:opacity-80';
  return 'hover:opacity-90'; // darken default
}

export function getCardClass(theme) {
  const gs = theme?.globalStyles?.cards || {};
  const radius = CARD_RADIUS[gs.borderRadius] || CARD_RADIUS.lg;
  const shadow = CARD_SHADOW[gs.shadow] || CARD_SHADOW.sm;
  const border = gs.border !== false ? 'border border-gray-200' : '';
  return `${radius} ${shadow} ${border} bg-white overflow-hidden`.trim();
}

export function getSectionClass(theme) {
  const gs = theme?.globalStyles?.sections || {};
  const spacing = SECTION_SPACING[gs.defaultSpacing] || SECTION_SPACING.md;
  const width = SECTION_WIDTH[gs.maxWidth] || SECTION_WIDTH.default;
  return `${spacing} px-8 ${width} mx-auto`;
}

export function getGlobalStyles(theme) {
  return {
    buttonClass: getButtonClass(theme),
    buttonStyle: getButtonStyle(theme),
    buttonHoverClass: getButtonHoverClass(theme),
    cardClass: getCardClass(theme),
    sectionClass: getSectionClass(theme),
  };
}
