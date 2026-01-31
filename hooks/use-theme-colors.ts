/**
 * Hook that returns all theme colors at once to reduce redundant useColorScheme calls
 */

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Returns all theme colors for the current color scheme.
 * More efficient than calling useThemeColor multiple times.
 */
export function useThemeColors<T extends ColorName[]>(
  ...colorNames: T
): { [K in T[number]]: string } {
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  const result = {} as { [K in T[number]]: string };
  for (const name of colorNames) {
    result[name as T[number]] = colors[name];
  }

  return result;
}

/**
 * Returns all common theme colors at once.
 * Use this when you need multiple colors in a component.
 */
export function useAllThemeColors() {
  const theme = useColorScheme() ?? "light";
  return Colors[theme];
}
