import LocaleLink from "@/components/common/locale-link";
import { Button } from "@/kit/shadcn/button";
import { SectionInfo } from "@/type";

export interface CTASimpleProps {
  section: SectionInfo;
  primary: {
    text: string;
    href: string;
  };
  secondary?: {
    text: string;
    href: string;
  };
}

export default function CTASimple({ props }: { props: CTASimpleProps }) {
  return (
    <section id="call-to-action" className="px-4 py-24 bg-muted/50">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            {props.section.title}
          </h2>
          {props.section.description && (
            <p className="mt-4 text-muted-foreground">
              {props.section.description}
            </p>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <LocaleLink href={props.primary.href}>
                <span>{props.primary.text}</span>
              </LocaleLink>
            </Button>
            {props.secondary && (
              <Button asChild size="lg" variant="outline">
                <LocaleLink href={props.secondary?.href}>
                  <span>{props.secondary?.text}</span>
                </LocaleLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
