import { useTranslation } from "react-i18next";

export function meta() {
  const { t } = useTranslation();
  return [
    { title: t("PrivacyPage.title") },
    { name: "description", content: t("PrivacyPage.description") },
  ];
}

export default function Terms() {
  return <div></div>;
}
