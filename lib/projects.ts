export type ProjectLayout = "wide" | "standard";

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  coverUrl: string;
  coverKey: string | null;
  pdfKey: string | null;
  pdfUrl?: string | null;
  gallery: string[];
  sortOrder: number;
  layout: ProjectLayout;
  published: boolean;
  deleted?: boolean;
};

function pages(path: string, count: number) {
  return Array.from({ length: count }, (_, index) =>
    `${path}/page-${String(index + 1).padStart(2, "0")}.jpg`,
  );
}

export const defaultProjects: Project[] = [
  {
    slug: "aoleao-global-catalog",
    title: "Aoleao Global Catalog",
    subtitle: "116 页游乐设备全球产品画册",
    description:
      "面向海外客户与项目咨询场景设计的 A3 横版产品总画册。全册以品牌信息、材料与认证、合作流程为开篇，并通过模块化版式系统呈现室内乐园、蹦床、高空拓展、忍者赛道与配套设备等完整产品矩阵，在高密度信息与大型三维项目视觉之间保持清晰的阅读节奏。",
    tags: ["Editorial Design", "Catalog System", "Commercial"],
    coverUrl: "/assets/project-aoleao-catalog.jpg",
    coverKey: null,
    pdfKey: null,
    pdfUrl: "/assets/aoleao-global-catalog-2026.pdf",
    gallery: pages("/work/aoleao-global-catalog", 18).slice(1),
    sortOrder: 5,
    layout: "wide",
    published: true,
  },
  {
    slug: "wang-yu-xia",
    title: "汪玉霞 · 糕点西施",
    subtitle: "老字号的年轻表达 · IP 形象与衍生设计",
    description: "以武汉老字号糕点品牌汪玉霞为设计主题，将传统旗袍、麦穗与樱花糕等元素融入 Q 版角色，塑造亲切、鲜明的「糕点西施」形象。从角色设定与收藏玩偶出发，延展至盲盒包装、文创周边及门店宣传物料，以明黄色、红白角色与简洁的图形语言，探索老字号与年轻消费者沟通的新方式。",
    tags: ["IP Design", "Packaging", "AI Design"],
    coverUrl: "/work/wang-yu-xia/packaging-hero.webp",
    coverKey: null,
    pdfKey: null,
    gallery: [
      "/work/wang-yu-xia/character.webp",
      "/work/wang-yu-xia/three-views.webp",
      "/work/wang-yu-xia/collectibles.webp",
      "/work/wang-yu-xia/packaging-hero.webp",
      "/work/wang-yu-xia/packaging-system.webp",
      "/work/wang-yu-xia/display-box.webp",
      "/work/wang-yu-xia/unboxing.webp",
      "/work/wang-yu-xia/gift-bags.webp",
      "/work/wang-yu-xia/accessories.webp",
      "/work/wang-yu-xia/stationery.webp",
      "/work/wang-yu-xia/lifestyle.webp",
      "/work/wang-yu-xia/retail.webp"
    ],
    sortOrder: 10,
    layout: "wide",
    published: true,
  },
  {
    slug: "sichuan-yibin-vis-manual",
    title: "Sichuan Yibin VIS Manual",
    subtitle: "中国浓香白酒核心产区视觉识别手册",
    description:
      "围绕四川宜宾的地域文化与白酒产业特征，建立从标志、标准色、字体、辅助图形到城市与商业应用的完整视觉识别规范。手册共 40 页，呈现系统化的品牌规则与应用边界。",
    tags: ["VI Manual", "Brand System", "Guideline"],
    coverUrl: "/assets/project-vi-manual.png",
    coverKey: null,
    pdfKey: null,
    gallery: pages("/work/sichuan-yibin-vis-manual", 40),
    sortOrder: 20,
    layout: "standard",
    published: true,
  },
  {
    slug: "yibin-brand-applications",
    title: "Yibin Brand Applications",
    subtitle: "宜宾品牌视觉与应用延展",
    description:
      "将宜宾产区视觉识别系统延展到名片、包装、导视、纪念品与公共传播场景，验证品牌语言在不同尺度和介质中的一致性。",
    tags: ["Brand Identity", "VIS", "Application"],
    coverUrl: "/assets/project-brand.png",
    coverKey: null,
    pdfKey: null,
    gallery: ["/assets/project-brand.png"],
    sortOrder: 30,
    layout: "standard",
    published: true,
  },
  {
    slug: "fruit-wine-packaging",
    title: "Fruit Wine Packaging",
    subtitle: "东方叙事包装系统",
    description:
      "以东方绘画语言与年轻化插画建立果酒包装系列，在礼盒、瓶身与传播物料之间保持统一识别，同时兼顾陈列效果与产品区分。",
    tags: ["Packaging", "Illustration", "Campaign"],
    coverUrl: "/assets/project-packaging.png",
    coverKey: null,
    pdfKey: null,
    gallery: ["/assets/project-packaging.png"],
    sortOrder: 40,
    layout: "standard",
    published: true,
  },
  {
    slug: "super-slide-catalog",
    title: "Super Slide Catalog",
    subtitle: "游乐设备画册视觉系统",
    description:
      "面向海外客户的游乐设备产品画册，以高对比排版、三维产品渲染与模块化信息结构展示大型滑梯产品。完整画册共 18 页。",
    tags: ["Editorial", "3D Visual", "Commercial"],
    coverUrl: "/assets/project-catalog.png",
    coverKey: null,
    pdfKey: null,
    gallery: pages("/work/super-slide-catalog", 18),
    sortOrder: 50,
    layout: "wide",
    published: true,
  },
  {
    slug: "you-app",
    title: "You App",
    subtitle: "内容型移动端体验设计",
    description:
      "围绕内容浏览、发现与个人收藏流程展开的移动端产品设计，覆盖信息架构、界面视觉、核心页面与原型表达。",
    tags: ["UI Design", "UX Flow", "Prototype"],
    coverUrl: "/assets/project-ui.png",
    coverKey: null,
    pdfKey: null,
    gallery: ["/assets/project-ui.png"],
    sortOrder: 60,
    layout: "standard",
    published: true,
  },
  {
    slug: "logo-studies",
    title: "Logo Studies",
    subtitle: "品牌标识与字体实验",
    description:
      "收录多组品牌标识、字标与风格化字体探索，覆盖娱乐、消费与儿童品牌方向。完整样图共 17 页。",
    tags: ["Logo", "Typography", "Exploration"],
    coverUrl: "/assets/project-logo.png",
    coverKey: null,
    pdfKey: null,
    gallery: pages("/work/logo-studies", 17),
    sortOrder: 70,
    layout: "standard",
    published: true,
  },
  {
    slug: "commerce-poster-system",
    title: "Commerce Poster System",
    subtitle: "电商海报与促销视觉概念系列",
    description:
      "以高密度信息、强对比色彩和模块化价格区为核心的电商传播概念练习，探索主视觉、商品卖点与促销节奏在不同版位中的统一表达。此项目为个人概念创作，用于展示商业海报设计能力。",
    tags: ["E-commerce", "Poster", "Campaign"],
    coverUrl: "/assets/project-ecommerce.svg",
    coverKey: null,
    pdfKey: null,
    gallery: [
      "/assets/project-ecommerce.svg",
      "/assets/project-ecommerce-detail.svg",
    ],
    sortOrder: 80,
    layout: "wide",
    published: true,
  },
  {
    slug: "anime-con-h5",
    title: "Anime Con H5",
    subtitle: "漫展预约与活动互动 H5 概念",
    description:
      "围绕漫展预约、节目日程、地图导览与集章互动构建的移动端 H5 概念。通过鲜明角色化配色、漫画分镜与轻量动效，兼顾活动氛围和移动端信息效率。此项目为个人概念创作。",
    tags: ["H5", "UI Design", "Digital Experience"],
    coverUrl: "/assets/project-convention-h5.svg",
    coverKey: null,
    pdfKey: null,
    gallery: [
      "/assets/project-convention-h5.svg",
      "/assets/project-convention-h5-detail.svg",
    ],
    sortOrder: 90,
    layout: "standard",
    published: true,
  },
  {
    slug: "anime-con-materials",
    title: "Anime Con Materials",
    subtitle: "漫展主视觉与线下物料概念系统",
    description:
      "从活动主视觉延展到门票、胸卡、手环、导视和手提袋的漫展物料概念系统，以统一的网格、符号和高识别配色连接线上传播与线下现场。此项目为个人概念创作。",
    tags: ["Event", "Material", "Campaign"],
    coverUrl: "/assets/project-event-materials.svg",
    coverKey: null,
    pdfKey: null,
    gallery: [
      "/assets/project-event-materials.svg",
      "/assets/project-event-materials-detail.svg",
    ],
    sortOrder: 100,
    layout: "standard",
    published: true,
  },
];

export function getDefaultProject(slug: string) {
  return defaultProjects.find((project) => project.slug === slug) ?? null;
}
