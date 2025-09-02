import { useTranslation } from "react-i18next";
import { Link, type LinkProps } from "react-router";

// 从 LinkProps 中排除 'to'，因为我们使用 'href'
interface LocaleLinkProps extends Omit<LinkProps, "to"> {
  href: string;
  children: React.ReactNode;
}

export default function LocaleLink({
  children,
  href,
  ...restProps // 接收所有其他 Link 属性
}: LocaleLinkProps) {
  const { i18n } = useTranslation();

  let to = href;
  if (i18n.language !== i18n.options.fallbackLng) {
    if (href === "/") {
      to = `/${i18n.language}`;
    } else {
      to = `/${i18n.language}${href}`;
    }
  }

  return (
    <Link to={to} {...restProps}>
      {children}
    </Link>
  );
}
