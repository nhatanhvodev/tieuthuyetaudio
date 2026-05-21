export const THEME_OPTIONS = [
  "thu-am-sac",
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset"
] as const;

export type Theme = (typeof THEME_OPTIONS)[number];

const themeSet = new Set<string>(THEME_OPTIONS);
export const LIGHT_THEMES = new Set<Theme>(["thu-am-sac", "light", "cupcake", "winter", "lofi"]);

export function isTheme(value: string): value is Theme {
  return themeSet.has(value);
}
