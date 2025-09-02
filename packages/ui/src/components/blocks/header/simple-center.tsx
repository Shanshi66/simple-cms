import { cn } from "@repo/ui/lib/utils";
import PageContainer from "@/components/common/page-container";
import LocaleLink from "@/components/common/locale-link";
import { Button, buttonVariants } from "@repo/ui/kit/shadcn/button";
import LocaleSelector from "@/components/common/locale-switcher";
import { Locale, LocaleData } from "@repo/types/i18n";
import { Logo } from "@/components/common/logo";
import LocaleSwitcher from "@/components/common/locale-switcher";
import { MenuIcon, XIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/kit/shadcn/navigation-menu";
import { useState } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { Portal } from "@radix-ui/react-portal";
import { MenuItem, ThemeMessage } from "@/type";
import { ModeSwitcher } from "@/components/common/mode-switcher";
import { Theme } from "@/provider/theme";

export interface HeaderSimpleCenterProps {
  meta: {
    logoUrl: string;
    productName: string;
  };
  i18n: {
    locale: Locale;
    localeData: LocaleData;
    messages: {
      signUp: string;
      logIn: string;
    };
  };
  nav: {
    items: MenuItem[];
  };
  auth: {
    onLogin: () => void;
    userButton?: React.ReactNode;
  };
  theme: {
    messages: ThemeMessage;
    setTheme: (theme: Theme) => void;
  };
}

const customNavigationMenuTriggerStyle = cn(
  navigationMenuTriggerStyle(),
  "relative bg-transparent text-mute-foreground cursor-pointer",
  "hover:text-primary hover:bg-primary-foreground",
);

export default function HeaderSimpleCenter({
  props,
}: {
  props: HeaderSimpleCenterProps;
}) {
  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-50 transition-all duration-300 h-[64px] flex items-center",
        "bg-transparent",
      )}
    >
      <PageContainer>
        <NavbarDesktop props={props} />
        <NavbarMobile props={props} className="lg:hidden" />
      </PageContainer>
    </header>
  );
}

export function NavbarDesktop({ props }: { props: HeaderSimpleCenterProps }) {
  return (
    <nav className="hidden lg:flex">
      {/* logo and name */}
      <div className="flex items-center">
        <LocaleLink href="/" className="flex items-center space-x-2">
          <Logo url={props.meta.logoUrl} />
          <span className="text-xl font-semibold">
            {props.meta.productName}
          </span>
        </LocaleLink>
      </div>

      {/* menu links */}
      <div className="flex-1 flex items-center justify-center space-x-2">
        <NavigationMenu className="relative">
          <NavigationMenuList className="flex items-center">
            {props.nav.items.map((item, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink
                  asChild
                  className={customNavigationMenuTriggerStyle}
                >
                  <LocaleLink
                    href={item.href ?? "#"}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  >
                    {item.title}
                  </LocaleLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {/* navbar right show sign in or user */}
      <div className="flex items-center gap-x-4">
        {props.auth.userButton ?? (
          <div className="flex items-center gap-x-4">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer text-primary"
              onClick={props.auth.onLogin}
            >
              {props.i18n.messages.logIn}
            </Button>
          </div>
        )}
        <ModeSwitcher
          messages={props.theme.messages}
          setTheme={props.theme.setTheme}
        />
        <LocaleSwitcher
          _locale={props.i18n.locale}
          localeData={props.i18n.localeData}
        />
      </div>
    </nav>
  );
}

export function NavbarMobile({
  props,
  className,
}: {
  props: HeaderSimpleCenterProps;
  className?: string;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const handleToggleMobileMenu = (): void => {
    setOpen((open) => !open);
  };

  return (
    <>
      <div className={cn("flex items-center justify-between", className)}>
        {/* navbar left shows logo */}
        <LocaleLink href="/" className="flex items-center gap-2">
          <Logo url={props.meta.logoUrl} />
          <span className="text-xl font-semibold">
            {props.meta.productName}
          </span>
        </LocaleLink>

        {/* navbar right shows menu icon and user button */}
        <div className="flex items-center justify-end gap-4">
          {props.auth.userButton}
          <Button
            variant="ghost"
            size="icon"
            aria-expanded={open}
            aria-label="Toggle Mobile Menu"
            onClick={handleToggleMobileMenu}
            className="size-8 flex aspect-square h-fit select-none items-center
              justify-center rounded-md border cursor-pointer"
          >
            {open ? (
              <XIcon className="size-4" />
            ) : (
              <MenuIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <Portal asChild>
          {/* if we don't add RemoveScroll component, the underlying
            page will scroll when we scroll the mobile menu */}
          <RemoveScroll allowPinchZoom enabled>
            {/* Only render MainMobileMenu when not in loading state */}
            <MainMobileMenu
              onLinkClicked={handleToggleMobileMenu}
              props={props}
            />
          </RemoveScroll>
        </Portal>
      )}
    </>
  );
}

function MainMobileMenu({
  props,
  onLinkClicked,
}: {
  props: HeaderSimpleCenterProps;
  onLinkClicked: () => void;
}) {
  return (
    <div
      className="fixed w-full inset-0 z-50 mt-[64px] overflow-y-auto
      bg-background backdrop-blur-md animate-in fade-in-0"
    >
      <div className="size-full flex flex-col items-start space-y-4 py-4">
        {props.auth.userButton ?? (
          <div className="w-full flex flex-col gap-4 px-4">
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer text-primary"
              onClick={props.auth.onLogin}
            >
              {props.i18n.messages.logIn}
            </Button>
          </div>
        )}

        {/* main menu */}
        <ul className="w-full px-4">
          {props.nav.items.map((item) => {
            return (
              <li key={item.title} className="py-1">
                <LocaleLink
                  href={item.href ?? "#"}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-full !pl-2 justify-start cursor-pointer group",
                    "bg-transparent text-muted-foreground",
                    "hover:bg-transparent hover:text-foreground",
                    "focus:bg-transparent focus:text-foreground",
                  )}
                  onClick={onLinkClicked}
                >
                  <div className="flex items-center w-full pl-0">
                    <span className="text-base">{item.title}</span>
                  </div>
                </LocaleLink>
              </li>
            );
          })}
        </ul>

        {/* bottom buttons */}
        <div className="flex w-full items-center justify-between gap-4 border-t border-border/50 p-4">
          <LocaleSelector
            _locale={props.i18n.locale}
            localeData={props.i18n.localeData}
          />
        </div>
      </div>
    </div>
  );
}
