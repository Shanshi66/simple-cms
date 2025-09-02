const hero = {
  h1: "欢迎使用我们的应用程序",
  description: "这是用 Remix 和 TypeScript 构建的最好的应用程序。",
  introduction: "通过编辑 `apps/web` 文件夹中的文件开始使用。",
  primary: "开始使用",
  secondary: "了解更多",
};

const feature = {
  title: "更快部署",
  subtitle: "部署应用所需的一切",
  description:
    "我们的平台提供构建、部署和扩展应用程序所需的所有工具和服务，让您充满信心地从开发到生产。",
  features: [
    {
      name: "推送部署",
      description:
        "只需将代码推送到 Git，通过我们无缝的 CI/CD 管道集成，即可自动部署您的应用程序。",
    },
    {
      name: "SSL 证书",
      description: "为所有域名自动提供和更新 SSL 证书，无需任何配置。",
    },
    {
      name: "简单队列",
      description:
        "使用我们内置的队列系统处理后台任务和作业处理，可根据您的需求自动扩展。",
    },
    {
      name: "全球 CDN",
      description:
        "通过我们的全球内容分发网络和边缘缓存，在全球范围内快速交付您的内容。",
    },
  ],
};

const footer = {
  product: {
    title: "产品",
    items: {
      features: "功能",
      pricing: "价格",
      faq: "常见问题",
    },
  },
  resources: {
    title: "资源",
    items: {
      blog: "博客",
      docs: "文档",
      changelog: "更新日志",
      roadmap: "路线图",
    },
  },
  company: {
    title: "公司",
    items: {
      about: "关于我们",
      contact: "联系我们",
      waitlist: "邮件列表",
    },
  },
  legal: {
    title: "法律",
    items: {
      cookiePolicy: "Cookie政策",
      privacyPolicy: "隐私政策",
      termsOfService: "服务条款",
    },
  },
};

const faq = {
  title: "常见问题",
  subtitle: "如果你有任何问题，请随时联系我们",
  items: [
    {
      question: "Easy2Text 能干什么？",
      answer:
        "Easy2Text 可以将音频转写为文本，支持 98 种语言，准确率高达 99%。在几秒内就可以把几个小时的音频转写成文本，支持导出 Word、Txt、PDF、字幕等多种格式",
    },
    {
      question: "我们提供免费试用吗？",
      answer: "是的，我们为每个用户提供 100 分钟的免费转写时间",
    },
    {
      question: "Easy2Text 安全吗？",
      answer:
        "Easy2Text 是绝对安全的，我们在数据传输过程中采用加密技术，确保不会有其他人访问您的数据。你可以随时删除数据，删除后我们不会保留任何数据",
    },
    {
      question: "我最长能转写多长时间的音频？",
      answer: "Easy2Text 支持转写 10 小时以内的音频",
    },
    {
      question: "Easy2Text 支持哪些音频格式？",
      answer: "Easy2Text 支持 MP3、WAV、M4A、AAC、FLAC、WMA 等多种音频格式",
    },
    {
      question: "我能将转写结果导出哪些格式？",
      answer:
        "Easy2Text 支持导出 Word、Txt、PDF、字幕等多种格式，你可以根据需要选择导出格式",
    },
    {
      question: "Easy2Text 有免费试用吗？",
      answer:
        "是的，我们为每个用户每天提供一次免费转写机会，转写音频不超过30 分钟",
    },
  ],
};

const cta = {
  title: "开始转写",
  description: "免费试用，无需注册，无需绑卡",
  button: "转写",
};

export default {
  hero,
  feature,
  footer,
  faq,
  cta,
};
