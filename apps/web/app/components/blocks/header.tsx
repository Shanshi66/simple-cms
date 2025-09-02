import { useLocation } from "react-router";
import {
  HeaderSimpleCenter,
  HeaderSimpleCenterProps,
} from "@repo/ui/components/blocks";
import { useTranslation } from "react-i18next";
import { getLocale, localeData } from "@/i18n";
import { authClient } from "@/lib/auth";
import { Theme, useTheme } from "@repo/ui/provider/theme";
import { websiteConfig } from "@/config/website";

export default function Header() {
  const { t, i18n } = useTranslation("common");
  const locale = getLocale(i18n.language);
  const location = useLocation();
  const { setTheme } = useTheme();
  const headerProps: HeaderSimpleCenterProps = {
    meta: {
      logoUrl: websiteConfig.product.logoLight,
      productName: websiteConfig.product.name,
    },
    i18n: {
      locale,
      localeData,
      messages: {
        signUp: t("auth.signUp"),
        logIn: t("auth.signIn"),
      },
    },
    nav: {
      items: [
        { title: "Home", href: "/" },
        { title: "About", href: "/about" },
        { title: "Contact", href: "/contact" },
      ],
    },
    auth: {
      onLogin: () => {
        const callbackURL = `${import.meta.env.VITE_BASE_URL}${
          location.pathname
        }`;
        void authClient.signIn.social({
          provider: "google",
          callbackURL: callbackURL,
        });
      },
      userButton: undefined,
    },
    theme: {
      messages: {
        toggle: t("theme.toggle"),
        light: t("theme.light"),
        dark: t("theme.dark"),
        system: t("theme.system"),
      },
      setTheme: (theme: Theme) => {
        setTheme(theme);
        const formData = new FormData();
        formData.append("theme", theme);
        void fetch("/action/set-theme", { method: "POST", body: formData });
      },
    },
  };
  return <HeaderSimpleCenter props={headerProps} />;
}
