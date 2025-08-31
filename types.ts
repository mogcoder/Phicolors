
export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface FullColor {
  hsl: HSLColor;
  rgb: RGBColor;
  hex: string;
}

export type ColorRole =
  | 'background'
  | 'surface'
  | 'primary'
  | 'secondary'
  | 'textOnBackground'
  | 'textOnSurface'
  | 'textOnPrimary'
  | 'heading';

export type ColorMap = Record<ColorRole, string>;
