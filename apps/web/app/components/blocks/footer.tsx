import { getFooterLinks } from "@/config/footer";
import { websiteConfig } from "@/config/website";
import {
  FooterWithMission,
  FooterWithMissionProps,
} from "@repo/ui/components/blocks";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation("common");
  const footerLinks = getFooterLinks();
  const props: FooterWithMissionProps = {
    social: {
      github: {
        name: "Github",
        link: websiteConfig.social?.github,
      },
    },
    links: footerLinks,
    product: {
      name: websiteConfig.product.name,
      mission: t("meta.mission"),
      logoLight: websiteConfig.product.logoLight,
      company: websiteConfig.product.company,
    },
  };
  return <FooterWithMission props={props} />;
}
