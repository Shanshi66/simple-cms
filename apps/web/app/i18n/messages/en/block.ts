const hero = {
  h1: "Welcome to Our Application",
  description: "This is the best app ever built with Remix and TypeScript.",
  introduction: "Get started by editing the files in the `apps/web` folder.",
  primary: "Get Started",
  secondary: "Learn More",
};

const feature = {
  title: "Deploy faster",
  subtitle: "Everything you need to deploy your app",
  description:
    "Our platform provides all the tools and services you need to build, deploy, and scale your applications with confidence.",
  features: [
    {
      name: "Push to deploy",
      description:
        "Simply push your code to Git and watch your application deploy automatically with our seamless CI/CD pipeline.",
    },
    {
      name: "SSL certificates",
      description:
        "Get automatic SSL certificate provisioning and renewal for all your domains with zero configuration required.",
    },
    {
      name: "Simple queues",
      description:
        "Handle background tasks and job processing with our built-in queue system that scales automatically with your needs.",
    },
    {
      name: "Global CDN",
      description:
        "Deliver your content lightning-fast worldwide with our global content delivery network and edge caching.",
    },
  ],
};

const footer = {
  product: {
    title: "Product",
    items: {
      features: "Features",
      pricing: "Pricing",
      faq: "FAQ",
    },
  },
  resources: {
    title: "Resources",
    items: {
      blog: "Blog",
      docs: "Documentation",
      changelog: "Changelog",
      roadmap: "Roadmap",
    },
  },
  company: {
    title: "Company",
    items: {
      about: "About",
      contact: "Contact",
      waitlist: "Waitlist",
    },
  },
  legal: {
    title: "Legal",
    items: {
      cookiePolicy: "Cookie Policy",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
    },
  },
};

const faq = {
  title: "FAQ",
  subtitle: "If you have any questions, please contact us.",
  items: [
    {
      question: "What can Easy2Text do?",
      answer:
        "Easy2Text can transcribe audio to text, supporting 98 languages, with an accuracy of up to 99%. In just a few seconds, you can transcribe several hours of audio into text, supporting export in Word, Txt, PDF, subtitle, and other formats",
    },
    {
      question: "Is Easy2Text safe?",
      answer:
        "Easy2Text is absolutely safe. We use encryption technology during data transmission to ensure that no one else can access your data. You can delete your data at any time, and we will not keep any data after deletion",
    },
    {
      question: "How long can I transcribe audio?",
      answer: "Easy2Text supports transcribing audio up to 10 hours",
    },
    {
      question: "What formats can I export the transcription results in?",
      answer:
        "Easy2Text supports exporting in Word, Txt, PDF, subtitle, and other formats, you can choose the format you need",
    },
    {
      question: "What audio formats does Easy2Text support?",
      answer:
        "Easy2Text supports MP3, WAV, M4A, AAC, FLAC, WMA, and other audio formats",
    },
    {
      question: "What formats can I export the transcription results in?",
      answer:
        "Easy2Text supports exporting in Word, Txt, PDF, subtitle, and other formats, you can choose the format you need",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes, we provide a free trial for each user, with a limit of 30 minutes of transcription per day",
    },
  ],
};

const cta = {
  title: "Start Transcribing",
  description:
    "Try for free. No registration required. No credit card required",
  primary: "Transcribing",
};

export default {
  hero,
  feature,
  footer,
  faq,
  cta,
};
