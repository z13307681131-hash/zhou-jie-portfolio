import {
  ArrowDown,
  ArrowUpRight,
  Download,
  LockKeyhole,
  Mail,
  Phone,
} from "lucide-react";
import { listProjects } from "@/lib/project-store";
import { ExperienceRuntime } from "./experience-runtime";
import { SiteNav } from "./site-nav";
import { ProjectShowcase } from "./project-showcase";

export const dynamic = "force-dynamic";

const strengths = [
  {
    no: "01",
    title: "品牌策略与视觉系统",
    en: "BRAND SYSTEM",
    text: "从品牌目标、受众和传播场景出发，建立可延展的视觉母题、规范与应用体系。",
  },
  {
    no: "02",
    title: "AI 创意与视觉实验",
    en: "AI DIRECTION",
    text: "把生成式 AI、Codex 与传统设计流程结合，用于概念探索、内容生产和体验原型。",
  },
  {
    no: "03",
    title: "平面、画册与物料",
    en: "GRAPHIC DELIVERY",
    text: "熟悉画册、广告、包装、展会物料与生产工艺，让视觉从屏幕稳定走向真实场景。",
  },
  {
    no: "04",
    title: "数字界面与动态内容",
    en: "DIGITAL EXPERIENCE",
    text: "覆盖 UI、H5、独立站视觉维护、视频拍摄剪辑，以多媒介表达完整的品牌体验。",
  },
];

const experience = [
  {
    period: "2026.04 — 2026.08",
    company: "广州奥乐奥游乐设备有限公司",
    role: "平面设计师",
    summary:
      "主导公司视觉风格与品牌规范，完成产品画册、宣传画册及 VI 手册；维护独立站与中国制造网视觉内容，并对接工厂跟进设计生产落地。",
  },
  {
    period: "2024.03 — 2025.03",
    company: "武汉东奔西跑设计有限公司",
    role: "设计主管",
    summary:
      "独立负责品牌方案，从主题、风格、色彩到产品、尺寸与面料进行整体把控；整理设计资料并协同采购团队控制项目预算。",
  },
];

export default async function Home() {
  const projects = await listProjects();

  return (
    <main className="site-home">
      <ExperienceRuntime />
      <SiteNav />

      <section className="hero depth-passage" id="home" data-depth-passage>
        <div className="hero-sticky" data-depth-stage>
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/project-ip.png"
            aria-hidden="true"
          >
            <source src="/assets/hero-loop.mp4" type="video/mp4" />
          </video>
          <div className="hero-veil" />
          <div className="hero-grid" />
          <div className="hero-scan" />



          <div className="hero-signal hero-signal-a" aria-hidden="true" />
          <div className="hero-signal hero-signal-b" aria-hidden="true" />

          <div className="depth-space" aria-hidden="true">
            <span className="depth-word depth-word-a">BRAND</span>
            <span className="depth-word depth-word-b">SYSTEM</span>
            <span className="depth-word depth-word-c">CAMPAIGN</span>
            <span className="depth-word depth-word-d">EXPERIENCE</span>
            <div className="depth-horizon" />
          </div>

          <div className="depth-gallery" aria-hidden="true">
            <figure className="depth-project depth-project-a" data-depth-scene data-start="0.10" data-end="0.38">
              <img src="/assets/project-aoleao-catalog.jpg" alt="" />
              <figcaption><span>01 / EDITORIAL</span><strong>AOLEAO GLOBAL CATALOG</strong><em>2026</em></figcaption>
            </figure>
            <figure className="depth-project depth-project-b" data-depth-scene data-start="0.29" data-end="0.58">
              <img src="/assets/project-vi-manual.png" alt="" />
              <figcaption><span>02 / IDENTITY</span><strong>VISUAL IDENTITY SYSTEM</strong><em>2026</em></figcaption>
            </figure>
            <figure className="depth-project depth-project-c" data-depth-scene data-start="0.49" data-end="0.78">
              <img src="/assets/project-ecommerce.svg" alt="" />
              <figcaption><span>03 / COMMERCE</span><strong>E-COMMERCE CAMPAIGN</strong><em>SELECTED</em></figcaption>
            </figure>
            <figure className="depth-project depth-project-d" data-depth-scene data-start="0.69" data-end="0.96">
              <img src="/assets/project-ip.png" alt="" />
              <figcaption><span>04 / DIGITAL</span><strong>IP &amp; INTERACTIVE EXPERIENCE</strong><em>SELECTED</em></figcaption>
            </figure>
          </div>

          <div className="depth-portal" aria-hidden="true">
            <span className="depth-frame depth-frame-1" />
            <span className="depth-frame depth-frame-2" />
            <span className="depth-frame depth-frame-3" />
            <span className="depth-frame depth-frame-4" />
            <span className="depth-rail depth-rail-left" />
            <span className="depth-rail depth-rail-right" />
          </div>

          <div className="hero-stage shell" data-depth-intro>
            <div className="hero-status">
              <span className="status-dot" />
              <span>OPEN TO OPPORTUNITIES</span>
              <em>SHANGHAI / GUANGZHOU / REMOTE</em>
            </div>

            <h1 className="hero-name" aria-label="ZHOU JIE">
              <span className="hero-name-top" data-text="ZHOU">ZHOU</span>
              <span className="hero-name-bottom" data-text="JIE">JIE</span>
            </h1>

            <div className="hero-signal-core" aria-hidden="true">
              <span className="signal-shard signal-shard-left">CREATIVE</span>
              <span className="signal-shard signal-shard-right">DIRECTION</span>
              <span className="signal-orbit signal-orbit-outer" />
              <span className="signal-orbit signal-orbit-inner" />
              <div className="signal-core-shell">
                <span className="signal-core-index">SUBJECT / ZJ—026</span>
                <div className="signal-core-monogram"><span>Z</span><span>J</span></div>
                <span className="signal-core-axis signal-core-axis-x" />
                <span className="signal-core-axis signal-core-axis-y" />
                <span className="signal-core-scan" />
                <span className="signal-core-caption">DESIGN SYSTEM IN MOTION</span>
                <span className="signal-corner signal-corner-a" />
                <span className="signal-corner signal-corner-b" />
                <span className="signal-corner signal-corner-c" />
                <span className="signal-corner signal-corner-d" />
              </div>
            </div>

            <div className="hero-role-list" aria-label="职业方向">
              <span>BRAND PLANNER</span>
              <span>VISUAL DESIGNER</span>
              <span>AI DESIGNER</span>
              <span>UI DESIGNER</span>
            </div>

            <div className="hero-bottom">
              <p>
                以品牌思维组织视觉，
                <br />
                用鲜明表达连接策略与落地。
              </p>
              <div className="hero-actions">
                <a className="signal-button" href="/rondel">RONDEL 互动体验 <ArrowUpRight size={17} /></a>
                <a className="signal-button signal-button-primary" href="#projects">
                  查看精选作品 <ArrowDown size={17} />
                </a>
                <a className="signal-button" href="/assets/zhou-jie-resume-2026.pdf" target="_blank">
                  下载最新简历 <Download size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="depth-caption shell" aria-hidden="true">
            <span className="depth-caption-no" data-depth-stage-number>00</span>
            <div>
              <em data-depth-stage-label>IDENTITY / INTRODUCTION</em>
              <strong data-depth-stage-title>ZHOU JIE — VISUAL DESIGNER</strong>
            </div>
          </div>

          <div className="depth-arrival" aria-hidden="true">
            <span>SELECTED WORK / 2024—2026</span>
            <strong>ENTER<br />THE INDEX</strong>
            <em>KEEP SCROLLING</em>
          </div>

          <div className="depth-meter" aria-hidden="true">
            <span data-depth-percent>00</span>
            <i><b data-depth-meter /></i>
            <em>100</em>
          </div>

          <div className="hero-coordinate">30.5728° N / 104.0668° E</div>
          <a className="hero-scroll" href="#profile" aria-label="向下浏览">
            <span>SCROLL TO ENTER</span><ArrowDown size={16} />
          </a>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div>
          <span>BRAND</span><i>✦</i><span>VISUAL</span><i>✦</i><span>AI</span><i>✦</i>
          <span>GRAPHIC</span><i>✦</i><span>UI</span><i>✦</i><span>CAMPAIGN</span><i>✦</i>
          <span>BRAND</span><i>✦</i><span>VISUAL</span><i>✦</i><span>AI</span><i>✦</i>
          <span>GRAPHIC</span><i>✦</i><span>UI</span><i>✦</i><span>CAMPAIGN</span><i>✦</i>
        </div>
      </div>

      <section className="section profile shell" id="profile">
        <header className="section-label reveal">
          <span>01</span><em>POSITIONING</em><i />
        </header>
        <div className="profile-headline reveal">
          <p>BRAND PLANNER / MULTI-DISCIPLINARY DESIGNER</p>
          <h2>
            MAKE THE SIGNAL
            <br />
            <span>VISIBLE.</span>
          </h2>
        </div>
        <div className="profile-layout">
          <figure className="profile-archive reveal" aria-label="周杰设计档案视觉图形">
            <div className="archive-heading"><span>DESIGNER FILE</span><em>NO. 026</em></div>
            <div className="archive-field" aria-hidden="true">
              <span className="archive-ring archive-ring-a" />
              <span className="archive-ring archive-ring-b" />
              <span className="archive-cross archive-cross-x" />
              <span className="archive-cross archive-cross-y" />
              <strong>ZJ</strong>
              <div className="archive-code">010110<br />110010<br />DESIGN<br />SIGNAL</div>
            </div>
            <figcaption><span>BRAND / VISUAL / AI</span><span>2026</span></figcaption>
          </figure>
          <div className="profile-copy reveal">
            <p className="profile-lead">
              我是周杰，一名以品牌策划为核心，覆盖视觉、平面、AI 与数字体验的综合型设计师。
            </p>
            <p>
              具备平面设计与广告设计工作经验，熟悉设计及工艺流程。能够从视觉概念、品牌规范、画册与物料，到独立站内容和视频传播完成一体化表达，并持续把新技术转化为可控、可落地的设计方法。
            </p>
            <div className="profile-facts">
              <div><span>EDUCATION</span><strong>武汉华夏理工学院</strong><em>视觉传达设计 · 2020—2024</em></div>
              <div><span>CONTACT</span><strong>1489923843@qq.com</strong><em>+86 133 0768 1131</em></div>
            </div>
          </div>
        </div>
        <div className="fact-strip reveal" aria-label="个人数据">
          <div><strong>02</strong><span>段设计工作经历</span></div>
          <div><strong>02</strong><span>项设计奖项</span></div>
          <div><strong>08</strong><span>项核心设计工具</span></div>
          <div><strong>05</strong><span>个跨学科方向</span></div>
        </div>
      </section>

      <section className="section projects shell" id="projects">
        <header className="section-label reveal">
          <span>02</span><em>SELECTED WORK</em><i />
        </header>
        <div className="projects-heading reveal">
          <h2>WORK<br /><span>INDEX</span></h2>
          <p>品牌系统、商业视觉、编辑设计与数字体验。点击任一项目进入完整案例。</p>
        </div>
        <ProjectShowcase projects={projects} />
      </section>

      <section className="section experience shell" id="experience">
        <header className="section-label reveal">
          <span>03</span><em>EXPERIENCE</em><i />
        </header>
        <div className="experience-heading reveal">
          <h2>FROM IDEA<br />TO <span>DELIVERY.</span></h2>
          <p>从设计概念、品牌规范到内容维护与工厂落地，我关注设计在真实生产链路中的完整度。</p>
        </div>
        <div className="experience-list">
          {experience.map((item, index) => (
            <article className="experience-row reveal" key={item.company}>
              <span className="experience-no">0{index + 1}</span>
              <time>{item.period}</time>
              <div><h3>{item.company}</h3><em>{item.role}</em></div>
              <p>{item.summary}</p>
              <ArrowUpRight size={24} />
            </article>
          ))}
        </div>
        <div className="award-line reveal">
          <span>AWARDS</span>
          <p>米兰设计周校赛二等奖</p>
          <p>大学生广告艺术大赛二等奖</p>
        </div>
      </section>

      <section className="section capabilities shell" id="capabilities">
        <header className="section-label reveal">
          <span>04</span><em>CAPABILITIES</em><i />
        </header>
        <div className="capability-grid">
          {strengths.map((item) => (
            <article className="capability-card reveal" key={item.no}>
              <span>{item.no}</span>
              <ArrowUpRight size={22} />
              <div><em>{item.en}</em><h3>{item.title}</h3><p>{item.text}</p></div>
            </article>
          ))}
        </div>
        <div className="tool-console reveal">
          <span>TOOL STACK / 2026</span>
          <p>AI · Illustrator · Photoshop · After Effects · Premiere · CorelDRAW · Blender · Lightroom Classic · Codex</p>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-grid" />
        <div className="contact-content shell">
          <div className="contact-top">
            <span>05 / CONTACT</span>
            <p>正在寻找视觉、品牌、AI 或数字体验设计师？<br />欢迎直接联系我。</p>
          </div>
          <a className="contact-title" href="mailto:1489923843@qq.com">
            LET&apos;S WORK <ArrowUpRight />
          </a>
          <div className="contact-bottom">
            <a href="mailto:1489923843@qq.com"><Mail size={18} /> 1489923843@qq.com</a>
            <a href="tel:+8613307681131"><Phone size={18} /> +86 133 0768 1131</a>
            <a href="/assets/zhou-jie-resume-2026.pdf" target="_blank"><Download size={17} /> RESUME</a>
            <a href="/admin"><LockKeyhole size={16} /> ADMIN</a>
            <span>© 2026 ZHOU JIE</span>
          </div>
        </div>
      </section>
    </main>
  );
}
