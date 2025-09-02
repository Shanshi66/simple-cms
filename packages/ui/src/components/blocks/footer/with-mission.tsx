import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  GitHubIcon,
  YouTubeIcon,
} from "@/components/icon";
import { NestedMenuItem, SocialLink } from "@/type";
import { Logo } from "@/components/common/logo";

export interface FooterWithMissionProps {
  product: {
    name: string;
    mission: string;
    company: string;
    logoLight: string;
    logoDark?: string;
  };
  links: NestedMenuItem[];
  social: {
    github?: SocialLink;
    x?: SocialLink;
    youtube?: SocialLink;
    facebook?: SocialLink;
    instagram?: SocialLink;
  };
}

// TODO: locale link
export default function FooterWithMission({
  props,
}: {
  props: FooterWithMissionProps;
}) {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Logo url={props.product.logoLight} className="dark:hidden" />
            {props.product.logoDark && (
              <Logo url={props.product.logoDark} className="not-dark:hidden" />
            )}
            <p className="text-sm/6 text-balance text-muted-foreground">
              {props.product.mission}
            </p>
            <div className="flex gap-x-6">
              {props.social.github && (
                <GitHubIcon
                  icon={props.social.github}
                  aria-hidden="true"
                  className="size-6"
                />
              )}
              {props.social.x && (
                <XIcon
                  icon={props.social.x}
                  aria-hidden="true"
                  className="size-6"
                />
              )}
              {props.social.youtube && (
                <YouTubeIcon
                  icon={props.social.youtube}
                  aria-hidden="true"
                  className="size-6"
                />
              )}
              {props.social.facebook && (
                <FacebookIcon
                  icon={props.social.facebook}
                  aria-hidden="true"
                  className="size-6"
                />
              )}
              {props.social.instagram && (
                <InstagramIcon
                  icon={props.social.instagram}
                  aria-hidden="true"
                  className="size-6"
                />
              )}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {props.links.slice(0, 2).map((section, sectionIndex) => (
                <div
                  key={section.title}
                  className={sectionIndex > 0 ? "mt-10 md:mt-0" : ""}
                >
                  <h3 className="text-sm/6 font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {section.items?.map((item) => (
                      <li key={item.title}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-muted-foreground hover:text-foreground"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {props.links.slice(2, 4).map((section, sectionIndex) => (
                <div
                  key={section.title}
                  className={sectionIndex > 0 ? "mt-10 md:mt-0" : ""}
                >
                  <h3 className="text-sm/6 font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {section.items?.map((item) => (
                      <li key={item.title}>
                        <a
                          href={item.href}
                          className="text-sm/6 text-muted-foreground hover:text-foreground"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 sm:mt-20 lg:mt-24">
          <p className="text-sm/6 text-muted-foreground">
            &copy; {new Date().getFullYear()} {props.product.company}. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
