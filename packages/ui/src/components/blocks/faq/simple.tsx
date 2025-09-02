import { QAItem, SectionInfo } from "@/type";

export interface FAQSimpleProps {
  section: SectionInfo;
  items: QAItem[];
}

export default function FaqSection({ props }: { props: FAQSimpleProps }) {
  return (
    <section id={props.section.id} className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">
            {props.section.title}
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance dark:text-white">
            {props.section.subtitle}
          </p>
          <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
            {props.section.description}
          </p>
        </div>
        <div className="flex flex-col gap-4 divide-y divide-dashed pt-16">
          {props.items.map((item, index) => (
            <div key={index} className="pb-6">
              <h3 className="font-medium">{item.question}</h3>
              <p className="text-muted-foreground mt-4">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
