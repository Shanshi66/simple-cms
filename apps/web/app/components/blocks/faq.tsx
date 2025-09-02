import { FAQSimple, FAQSimpleProps } from "@repo/ui/components/blocks";
import { QAItem } from "@repo/ui/type";
import { useTranslation } from "react-i18next";

export default function FAQ() {
  const { t } = useTranslation("block", { keyPrefix: "faq" });
  const faqs = t("items", { returnObjects: true }) as QAItem[];
  const props: FAQSimpleProps = {
    section: {
      title: t("title"),
      subtitle: t("subtitle"),
      description: t("description"),
    },
    items: faqs,
  };
  return <FAQSimple props={props} />;
}
