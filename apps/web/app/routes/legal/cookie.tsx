import { useTranslation } from "react-i18next";

export function meta() {
  const { t } = useTranslation();
  return [
    { title: t("CookiePage.title") },
    { name: "description", content: t("CookiePage.description") },
  ];
}

export default function Terms() {
  return <div></div>;
}
