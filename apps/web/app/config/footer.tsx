import { useTranslation } from "react-i18next";
import { NestedMenuItem } from "@repo/ui/type";
import { AppRoutes } from "@/routes";

export function getFooterLinks(): NestedMenuItem[] {
  const { t } = useTranslation("block");

  return [
    {
      title: t("footer.product.title"),
      items: [
        {
          title: t("footer.product.items.features"),
          href: AppRoutes.Features,
        },
        {
          title: t("footer.product.items.pricing"),
          href: AppRoutes.Pricing,
        },
        {
          title: t("footer.product.items.faq"),
          href: AppRoutes.FAQ,
        },
      ],
    },
    {
      title: t("footer.resources.title"),
      items: [
        {
          title: t("footer.resources.items.blog"),
          href: AppRoutes.Blog,
        },
        {
          title: t("footer.resources.items.docs"),
          href: AppRoutes.Docs,
        },
        {
          title: t("footer.resources.items.changelog"),
          href: AppRoutes.Changelog,
        },
      ],
    },
    {
      title: t("legal.label", { ns: "common" }),
      items: [
        {
          title: t("legal.cookie", { ns: "common" }),
          href: AppRoutes.CookiePolicy,
        },
        {
          title: t("legal.privacy", { ns: "common" }),
          href: AppRoutes.PrivacyPolicy,
        },
        {
          title: t("legal.terms", { ns: "common" }),
          href: AppRoutes.TermsOfService,
        },
      ],
    },
  ];
}
