/** Shared design contract for the bespoke interactive components. */
export interface LuxTheme {
  accent: string;
  dark: boolean;
  pageBg: string;
  surface: string;
  border: string;
  headline: string;
  text: string;
  muted: string;
  fontSerif?: string;
}

export function inkOn(accent: string, dark: boolean): string {
  if (dark) return "#14100a";
  return "#fdf9f3";
}
