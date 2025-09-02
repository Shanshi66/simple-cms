import { useTranslation } from "react-i18next";

export function meta() {
  const { t } = useTranslation();
  return [
    { title: t("TermsPage.title") },
    { name: "description", content: t("TermsPage.description") },
  ];
}

export default function Terms() {
  return <div></div>;
}
