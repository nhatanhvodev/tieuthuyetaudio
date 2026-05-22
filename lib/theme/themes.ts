export const THEME_OPTIONS = [
  "default",
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
  "sunset",
  "caramellatte",
  "abyss",
  "silk"
] as const;

export type Theme = (typeof THEME_OPTIONS)[number];

const themeSet = new Set<string>(THEME_OPTIONS);
export const LIGHT_THEMES = new Set<Theme>(["default", "light", "cupcake", "winter", "lofi", "caramellatte", "silk"]);

export function isTheme(value: string): value is Theme {
  return themeSet.has(value);
}

export function normalizeTheme(value: string | null | undefined): Theme | undefined {
  if (!value) return undefined;
  if (value === "thu-am-sac") return "default";
  return isTheme(value) ? value : undefined;
}
