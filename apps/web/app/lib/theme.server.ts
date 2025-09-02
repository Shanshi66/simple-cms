import { getSession } from "@/sesstion.server";
import type { Theme } from "@repo/ui/provider/theme";

export const DEFAULT_THEME: Theme = "system";

export const isValidTheme = (theme: string): theme is Theme => {
  return theme === "dark" || theme === "light" || theme === "system";
};

export async function getThemeFromSession(request: Request): Promise<Theme> {
  const session = await getSession(request.headers.get("Cookie"));
  const theme = session.get("theme");

  if (theme && isValidTheme(theme)) {
    return theme;
  }

  return DEFAULT_THEME;
}
