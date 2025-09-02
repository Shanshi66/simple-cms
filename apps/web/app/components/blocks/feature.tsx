import { FeatureSimpleProps, FeatureSimple } from "@repo/ui/components/blocks";
import { useTranslation } from "react-i18next";

export default function Feature() {
  const { t } = useTranslation("block", { keyPrefix: "feature" });
  const features = t("features", { returnObjects: true }) as {
    name: string;
    description: string;
  }[];
  const heroProps: FeatureSimpleProps = {
    title: t("title"),
    subTitle: t("subtitle"),
    description: t("description"),
    features: features.map((f) => ({
      name: f.name,
      description: f.description,
    })),
  };
  return <FeatureSimple props={heroProps} />;
}
