import { AppRoutes } from "@/routes";
import { CTASimple, CTASimpleProps } from "@repo/ui/components/blocks";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { t } = useTranslation("block", { keyPrefix: "cta" });
  const props: CTASimpleProps = {
    section: {
      title: t("title"),
      subtitle: t("subtitle"),
      description: t("description"),
    },
    primary: {
      text: t("primary"),
      href: AppRoutes.Root,
    },
  };
  return <CTASimple props={props} />;
}
