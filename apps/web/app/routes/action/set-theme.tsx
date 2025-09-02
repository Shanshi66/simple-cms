import { getSession, commitSession } from "@/sesstion.server";
import { data } from "react-router";
import { Route } from "./+types/set-theme";
import { isValidTheme } from "@/lib/theme.server";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const formData = await request.formData();
  const theme = formData.get("theme");

  if (!theme || typeof theme !== "string") {
    return data({ error: "Theme is required" }, { status: 400 });
  }

  if (isValidTheme(theme)) {
    session.set("theme", theme);
    return data(
      {},
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      },
    );
  } else {
    return data({ error: "Invalid theme" }, { status: 400 });
  }
}
