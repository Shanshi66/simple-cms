import { HeroSimpleProps, HeroSimple } from "@repo/ui/components/blocks";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation("block", { keyPrefix: "hero" });
  const heroProps: HeroSimpleProps = {
    h1: t("h1"),
    description: t("description"),
    introduction: {
      text: t("introduction"),
      href: "#",
    },
    primary: {
      text: t("primary"),
      href: "#",
    },
    secondary: {
      text: t("secondary"),
      href: "#",
    },
  };
  return <HeroSimple props={heroProps} />;
}
