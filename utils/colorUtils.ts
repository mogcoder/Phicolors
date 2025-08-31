
import type { HSLColor, RGBColor, FullColor, ColorMap } from '../types';

// The golden angle is derived from the golden ratio φ (phi).
// angle = 360 / φ^2 ≈ 137.5 degrees.
// This angle creates aesthetically pleasing, organic distributions when points
// are placed sequentially, making it ideal for generating harmonious color palettes.
const GOLDEN_ANGLE = 137.5;
const PHI = 1.61803398875;

/**
 * Generates a series of harmonious hues based on the golden angle.
 * @param baseHue The starting hue (0-360).
 * @param count The number of complementary hues to generate.
 * @returns An array of hue values.
 */
export function generateGoldenRatioPaletteHues(baseHue: number, count: number): number[] {
  const hues: number[] = [];
  let currentHue = baseHue;
  for (let i = 0; i < count; i++) {
    // We subtract the golden angle to proceed counter-clockwise around the color wheel,
    // which is a common convention for this type of color harmony.
    // The modulo operator ensures the hue value stays within the 0-360 range.
    currentHue = (currentHue - GOLDEN_ANGLE + 360) % 360;
    hues.push(currentHue);
  }
  return hues;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1 / 3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1 / 3);
  }

  return { 
    r: Math.round(r * 255), 
    g: Math.round(g * 255), 
    b: Math.round(b * 255) 
  };
}

/**
 * Converts an RGB color value to HSL.
 */
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}


function componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

/**
 * Converts a hex color string to an RGB object.
 * Handles 3-digit and 6-digit hex codes, with or without '#'.
 */
export function hexToRgb(hex: string): RGBColor | null {
  if (!hex || typeof hex !== 'string') {
    return null;
  }
  
  let sanitizedHex = hex.startsWith('#') ? hex.slice(1) : hex;

  if (sanitizedHex.length === 3) {
    sanitizedHex = sanitizedHex.split('').map(char => char + char).join('');
  }

  if (sanitizedHex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(sanitizedHex)) {
    return null;
  }

  const bigint = parseInt(sanitizedHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

export function formatHslString(hsl: HSLColor): string {
  return `hsl(${Math.round(hsl.h)}, ${hsl.s}%, ${hsl.l}%)`;
}

export function formatRgbString(rgb: RGBColor): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Determines if a color is light or dark based on YIQ contrast formula.
 * @returns 'dark' for light backgrounds, 'light' for dark backgrounds.
 */
export function getContrastYIQ(r: number, g: number, b: number): 'dark' | 'light' {
	const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return (yiq >= 128) ? 'dark' : 'light';
}

/**
 * Calculates the relative luminance of an RGB color.
 * WCAG formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-procedure
 */
function calculateLuminance(rgb: RGBColor): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the contrast ratio between two RGB colors.
 */
export function calculateContrastRatio(rgb1: RGBColor, rgb2: RGBColor): number {
  const lum1 = calculateLuminance(rgb1);
  const lum2 = calculateLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}


/**
 * Finds the closest lightness value for a color to meet a target contrast ratio,
 * searching in one direction (lighter or darker).
 * @returns The new HSLColor that meets the criteria, or null if no solution is found.
 */
export function findOptimalLightnessForContrast(
  startHsl: HSLColor, 
  baseRgb: RGBColor, 
  direction: 'lighter' | 'darker',
  targetRatio: number = 4.5
): HSLColor | null {
  const { h, s } = startHsl;

  if (direction === 'lighter') {
    for (let l = Math.round(startHsl.l) + 1; l <= 100; l++) {
      const newRgb = hslToRgb(h, s, l);
      if (calculateContrastRatio(newRgb, baseRgb) >= targetRatio) {
        return { h, s, l }; // Return the first passing value
      }
    }
  } else { // 'darker'
    for (let l = Math.round(startHsl.l) - 1; l >= 0; l--) {
      const newRgb = hslToRgb(h, s, l);
      if (calculateContrastRatio(newRgb, baseRgb) >= targetRatio) {
        return { h, s, l }; // Return the first passing value
      }
    }
  }
  
  return null;
}

/**
 * Adjusts a color's lightness to meet a target contrast ratio against a base color.
 * It employs a strong heuristic based on perceptual luminance to decide whether to make 
 * the color lighter or darker, aiming for a more robust and aesthetically pleasing palette.
 *
 * @param hslToAdjust The HSL color to modify.
 * @param baseRgb The RGB color to contrast against.
 * @param targetRatio The desired minimum contrast ratio (e.g., 4.5 for WCAG AA).
 * @returns The adjusted HSLColor. Returns the original if no adjustment is needed or possible.
 */
export function adjustLightnessForContrast(
  hslToAdjust: HSLColor,
  baseRgb: RGBColor,
  targetRatio: number = 4.5
): HSLColor {
  const currentRgb = hslToRgb(hslToAdjust.h, hslToAdjust.s, hslToAdjust.l);
  if (calculateContrastRatio(currentRgb, baseRgb) >= targetRatio) {
    return hslToAdjust; // Already meets contrast requirements.
  }

  // Find potential solutions by making the color lighter or darker.
  const lighterSolution = findOptimalLightnessForContrast(hslToAdjust, baseRgb, 'lighter', targetRatio);
  const darkerSolution = findOptimalLightnessForContrast(hslToAdjust, baseRgb, 'darker', targetRatio);

  // If no solution can be found in either direction, return the original color.
  if (!lighterSolution && !darkerSolution) {
    return hslToAdjust;
  }

  // If only one solution is possible, use it.
  if (lighterSolution && !darkerSolution) {
    return lighterSolution;
  }
  if (!lighterSolution && darkerSolution) {
    return darkerSolution;
  }
  
  // If both lighter and darker solutions exist, apply an improved heuristic
  // based on perceptual luminance, not HSL lightness.
  if (lighterSolution && darkerSolution) {
    const baseLuminance = calculateLuminance(baseRgb);
    // This threshold is based on the luminance of a mid-grey color (~0.21).
    // Colors brighter than this are perceived as "light", and darker as "dark".
    const baseIsLight = baseLuminance > 0.22; 
    // If the base is light, we prefer a darker color for contrast, and vice-versa.
    return baseIsLight ? darkerSolution : lighterSolution;
  }

  // Fallback: should not be reached.
  return hslToAdjust;
}

/**
 * Mixes two RGB colors using the golden mean ratio.
 */
export function mixColorsGoldenMean(rgb1: RGBColor, rgb2: RGBColor): RGBColor {
    const ratio = 1 / PHI; // Approximately 0.618
    const r = Math.round(rgb1.r * ratio + rgb2.r * (1 - ratio));
    const g = Math.round(rgb1.g * ratio + rgb2.g * (1 - ratio));
    const b = Math.round(rgb1.b * ratio + rgb2.b * (1 - ratio));
    return { r, g, b };
}

export type Harmony = 'analogous' | 'monochromatic' | 'triadic' | 'complementary' | 'split-complementary';

/**
 * Generates various types of color harmony palettes based on a single base color.
 */
export function generateHarmonyPalette(baseHsl: HSLColor, harmony: Harmony): FullColor[] {
    let hues: number[] = [baseHsl.h];
    const s = baseHsl.s;
    const l = baseHsl.l;

    switch (harmony) {
        case 'analogous':
            hues.push((baseHsl.h + 30 + 360) % 360);
            hues.push((baseHsl.h - 30 + 360) % 360);
            hues.push((baseHsl.h + 60 + 360) % 360);
            hues.push((baseHsl.h - 60 + 360) % 360);
            break;
        case 'monochromatic':
             return [0, 20, 40, 60, 80].map(offset => {
                const newL = Math.max(0, Math.min(100, l - 40 + offset));
                const rgb = hslToRgb(baseHsl.h, s, newL);
                return { hsl: { h: baseHsl.h, s, l: newL }, rgb, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
            });
        case 'triadic':
            hues.push((baseHsl.h + 120 + 360) % 360);
            hues.push((baseHsl.h - 120 + 360) % 360);
            hues.push((baseHsl.h + 90 + 360) % 360);
            hues.push((baseHsl.h - 90 + 360) % 360);
            break;
        case 'complementary':
            hues.push((baseHsl.h + 180 + 360) % 360);
             hues.push((baseHsl.h + 30 + 360) % 360);
            hues.push((baseHsl.h - 30 + 360) % 360);
            hues.push((baseHsl.h + 150 + 360) % 360);
            break;
        case 'split-complementary':
            hues.push((baseHsl.h + 150 + 360) % 360);
            hues.push((baseHsl.h - 150 + 360) % 360);
             hues.push((baseHsl.h + 120 + 360) % 360);
            hues.push((baseHsl.h - 120 + 360) % 360);
            break;
    }

    return hues.slice(0, 5).map(h => {
        const rgb = hslToRgb(h, s, l);
        return { hsl: { h, s, l }, rgb, hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
    });
}

/**
 * Intelligently assigns colors from a palette to UI roles to create a default ColorMap.
 * This provides a sensible starting point for the user's manual adjustments.
 */
export function createDefaultColorMap(palette: FullColor[]): ColorMap {
  if (palette.length === 0) {
    // Return a sensible fallback if the palette is empty
    return {
        background: '#f1f5f9', surface: '#ffffff', primary: '#4f46e5', secondary: '#0ea5e9',
        textOnBackground: '#0f172a', textOnSurface: '#0f172a', textOnPrimary: '#ffffff', heading: '#0f172a'
    };
  }

  const sortedByLightness = [...palette].sort((a, b) => a.hsl.l - b.hsl.l);
  const sortedBySaturation = [...palette].sort((a, b) => b.hsl.s - a.hsl.s);
  
  const background = sortedByLightness[0]; // Darkest for background
  const surface = sortedByLightness[1] || background; // Second darkest
  const primary = sortedBySaturation[0]; // Most saturated
  let secondary = sortedByLightness[sortedByLightness.length - 1]; // Lightest
  if (secondary.hex === primary.hex || secondary.hex === background.hex) {
    secondary = sortedBySaturation[1] || primary;
  }
  const heading = secondary;

  const textOnBackgroundRgb = hexToRgb(getContrastYIQ(background.rgb.r, background.rgb.g, background.rgb.b) === 'dark' ? '#0f172a' : '#f8fafc')!;
  const textOnBackground = findOptimalLightnessForContrast(rgbToHsl(textOnBackgroundRgb.r, textOnBackgroundRgb.g, textOnBackgroundRgb.b), background.rgb, 'lighter', 4.5);
  
  return {
    background: background.hex,
    surface: surface.hex,
    primary: primary.hex,
    secondary: secondary.hex,
    heading: heading.hex,
    textOnBackground: getContrastYIQ(background.rgb.r, background.rgb.g, background.rgb.b) === 'dark' ? '#f8fafc' : '#0f172a',
    textOnSurface: getContrastYIQ(surface.rgb.r, surface.rgb.g, surface.rgb.b) === 'dark' ? '#f8fafc' : '#0f172a',
    textOnPrimary: getContrastYIQ(primary.rgb.r, primary.rgb.g, primary.rgb.b) === 'dark' ? '#f8fafc' : '#0f172a',
  };
}
