"use client";

import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type MouseEvent, useEffect, useRef, useState } from "react";

const SpaceScene = dynamic(() => import("./space-scene"), { ssr: false });
gsap.registerPlugin(ScrollTrigger);

const copy = {
  zh: {
    lang: "EN", switchLabel: "Switch to English", skip: "跳至内容", loader: "正在连接新伊甸", status: "状态",
    nav: ["作战准则", "情报", "加入我们"], unit: "[ 01 — 零安军团 ]", hero: ["掌控", "未知"], intro: "不是追逐星辰。我们决定航线。混沌仲裁者是一支以纪律、情报和舰队默契为核心的 EVE Online 军团。", scroll: "向下探索",
    doctrine: "[ 舰队准则 ]", doctrineTitle: <>战区不是<br /><em>偶然。</em></>, doctrineLead: "我们将成员、舰船与时机编组为可复现的胜利。选择你的作战席位。",
    ops: [["01 /", "前线打击", "小队游击、主力会战与资本舰部署。快速集结，清晰指挥，干净撤离。"], ["02 /", "深空工业", "从月矿到泰坦级蓝图，以完整供应链支撑每一次舰队投送。"], ["03 /", "情报网络", "观察、定位、判断。让每一颗本地频道里的名字都带有意义。"], ["04 /", "新兵学院", "系统化训练、导师带队和实战复盘，让你的第一艘战舰真正活起来。"]],
    compareEyebrow: "SOLO PLAYER // CORPORATION", compareTitle: <>一个人的 EVE，<em>走不远。</em></>, compareLead: "EVE 是硬核的 MMO：大量内容不加军团根本玩不到，而重复的日常，只有和靠谱的伙伴一起才有意义。", solo: ["独狼", "SOLO", ["大量游戏内容需要组队，单人无法体验", "无论想玩什么，全流程都需要自己弄：采购 · 运输 · 出货", "缺少社交，内容很快就重复乏味"]], corporation: ["加入军团", "IN CORP", ["解锁所有组队、社区内容：高价值任务区、团队副本 / PVP", "分工合作，专人出货回收 · 快递 · 后勤", "找到志同道合的伙伴，长期玩下去"]],
    whyEyebrow: "[ 为什么是 CACX ]", whyTitle: <>新人，为什么选<br /><em>混沌仲裁者。</em></>, whyLead: "最大的华人军团，专为新人与长期玩家打造。", whyPoints: [["01", "零门槛新人社区", "专门面向新人的社区与组织，纯新也可立即开始生产与战斗。"], ["02", "完整发育路线", "经过检验的新人成长路径，无论后期想玩什么，前期都能让你打好基础。"], ["03", "最大华人军团", "最大的华人军团，最多样的活动，最正常友善的社区文化。"]],
    intel: "[ 军团实时情报 ]", intelTitle: <>你看到的是宇宙。<br /><em>我们看到机会。</em></>, metrics: [["24/7", "持续侦察"], ["08", "核心时区"], ["∞", "新伊甸航线"], ["01", "共同目标"]], partnersEyebrow: "[ 联合星图 ]", partnersTitle: <>同一片星海，<br /><em>共同的立场。</em></>, partnerLead: "与值得信赖的军团、联盟和服务伙伴协同作战。", partners: [["SV", "联盟伙伴", "SOVEREIGN VECTOR", "战略协同 / 主权作战"], ["ND", "作战伙伴", "NIGHTFALL DIVISION", "舰队协作 / 前线支援"], ["OF", "工业伙伴", "ORBITAL FORGE", "制造补给 / 物流网络"]],
    channel: "[ 开放频道 ]", join: <>你的<br /><em>下一次跃迁。</em></>, joinText: "寻找一支认真作战、也认真照顾成员的军团？提交申请，先与招募官聊聊你的故事和目标。", cta: "开启招募申请", footer: "新伊甸 // 版权所有"
  },
  en: {
    lang: "中", switchLabel: "切换至中文", skip: "Skip to content", loader: "CONNECTING TO NEW EDEN", status: "STATUS",
    nav: ["DOCTRINE", "INTEL", "ENLIST"], unit: "[ 01 — NULLSEC CORPORATION ]", hero: ["OWN THE", "UNSEEN"], intro: "We do not chase the stars. We decide the course. Chaos Arbiter is an EVE Online corporation built on discipline, intelligence, and fleet coordination.", scroll: "SCROLL TO DESCEND",
    doctrine: "[ FLEET DOCTRINE ]", doctrineTitle: <>The battlefield is<br /><em>never an accident.</em></>, doctrineLead: "We assemble pilots, ships, and timing into repeatable victories. Find your position in the fleet.",
    ops: [["01 /", "FRONTLINE", "Roaming squads, decisive fleet fights, and capital deployment. Fast form-ups, clear command, clean exits."], ["02 /", "DEEP SPACE INDUSTRY", "From moon ore to titan blueprints, a complete supply chain supports every fleet projection."], ["03 /", "INTELLIGENCE NETWORK", "Observe, locate, decide. Every name in local should mean something."], ["04 /", "RECRUIT ACADEMY", "Structured training, mentors, and fleet debriefs make your first warship truly come alive."]],
    compareEyebrow: "SOLO PLAYER // CORPORATION", compareTitle: <>EVE ALONE<br />DOESN&apos;T <em>GO FAR.</em></>, compareLead: "EVE is a demanding MMO: much of its best content begins with a corporation, and daily repetition only matters when shared with dependable pilots.", solo: ["LONE WOLF", "SOLO", ["Much of the game requires a group; solo pilots cannot access it", "Every step is yours alone: procurement · hauling · sales", "Without a social circle, the routine soon runs out of meaning"]], corporation: ["JOIN THE CORP", "IN CORP", ["Unlock group and community content: valuable sites, team PvE, and PVP", "Specialists handle recovery · logistics · courier work", "Find pilots with the same intent—and keep flying together"]],
    whyEyebrow: "[ WHY CACX ]", whyTitle: <>NEW PILOTS, WHY<br /><em>CHAOS ARBITER?</em></>, whyLead: "A major Chinese-speaking corporation built for new and long-term pilots.", whyPoints: [["01", "A WELCOMING START", "A community designed for new pilots. Start building and fighting from day one."], ["02", "A PROVEN GROWTH PATH", "A tested route that builds strong foundations for whatever you choose later."], ["03", "A THRIVING CHINESE COMMUNITY", "More ways to fly, more pilots to meet, and a friendly culture built to last."]],
    intel: "[ LIVE CORPORATION INTEL ]", intelTitle: <>You see the universe.<br /><em>We see opportunity.</em></>, metrics: [["24/7", "ACTIVE SCOUTING"], ["08", "CORE TIMEZONES"], ["∞", "NEW EDEN ROUTES"], ["01", "SHARED OBJECTIVE"]], partnersEyebrow: "[ UNITED STARMAP ]", partnersTitle: <>One starfield.<br /><em>A shared position.</em></>, partnerLead: "We fly alongside trusted corporations, alliances, and service partners.", partners: [["SV", "ALLIANCE PARTNER", "SOVEREIGN VECTOR", "Strategic coordination / sovereignty warfare"], ["ND", "COMBAT PARTNER", "NIGHTFALL DIVISION", "Fleet operations / frontline support"], ["OF", "INDUSTRY PARTNER", "ORBITAL FORGE", "Manufacturing supply / logistics network"]],
    channel: "[ OPEN CHANNEL ]", join: <>YOUR <em>NEXT JUMP.</em></>, joinText: "Looking for a corporation that takes the fight—and its pilots—seriously? Send your application and tell a recruiter where you want to go.", cta: "OPEN RECRUITMENT", footer: "NEW EDEN // ALL RIGHTS RESERVED"
  }
} as const;

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [assetProgress, setAssetProgress] = useState(.025);
  const [assetReady, setAssetReady] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(.025);
  const [loaderComplete, setLoaderComplete] = useState(false);
  const displayProgressRef = useRef(.025);
  const [locale, setLocale] = useState<keyof typeof copy>("zh");
  const t = copy[locale];

  const navigateTo = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    const section = document.querySelector(target);
    if (!section) return;
    const targetY = Math.max(0, section.getBoundingClientRect().top + window.scrollY - 82);
    const startY = window.scrollY, distance = targetY - startY, duration = 1450, started = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = progress < .5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
    window.history.replaceState(null, "", target);
  };

  useEffect(() => {
    const context = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: "top top", end: "bottom bottom", scrub: .25, onUpdate: self => setProgress(self.progress) });
      gsap.utils.toArray<HTMLElement>(".reveal").forEach(node => gsap.fromTo(node, { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: .85, scrollTrigger: { trigger: node, start: "top 85%", once: true } }));
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    // Network progress can stop at an arbitrary value while Three.js decodes
    // the model. Keep the last portion for a deliberate completion sequence.
    const target = assetReady ? 1 : Math.min(assetProgress, .94);
    if (target <= displayProgressRef.current) return;
    const meter = { value: displayProgressRef.current };
    const tween = gsap.to(meter, {
      value: target,
      duration: assetReady ? Math.max(.78, (target - meter.value) * 1.45) : .2,
      ease: assetReady ? "power2.out" : "power1.out",
      onUpdate: () => {
        displayProgressRef.current = meter.value;
        setDisplayProgress(meter.value);
      },
      onComplete: () => {
        if (assetReady && target === 1) setLoaderComplete(true);
      }
    });
    return () => { tween.kill(); };
  }, [assetProgress, assetReady]);

  useEffect(() => {
    if (!loaderComplete) return;
    const animation = gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".loader", { yPercent: -100, duration: .72, delay: .18 })
      .from(".hero-reveal", { y: 80, opacity: 0, stagger: .12, duration: 1.05 }, "<.15");
    return () => { animation.kill(); };
  }, [loaderComplete]);

  return <main ref={root} className="journey" lang={locale === "zh" ? "zh-CN" : "en"}>
    <a className="skip" href="#doctrine">{t.skip}</a><div className="loader" aria-hidden="true"><p>{t.loader} // {Math.round(displayProgress * 100)}%</p><span><i className="loader-line" style={{ transform: `scaleX(${displayProgress})` }} /></span></div><div className="scene" aria-hidden="true"><SpaceScene progress={progress} onAssetProgress={setAssetProgress} onAssetReady={() => setAssetReady(true)} /></div><div className="nebula" aria-hidden="true" /><div className="grain" /><div className="progress" style={{ transform: `scaleX(${progress})` }} />
    <nav><a className="brand" href="#top" onClick={(event) => navigateTo(event, "#top")}><strong>混沌仲裁者</strong><span>CHAOS ARBITER//</span></a><div><a href="#doctrine" onClick={(event) => navigateTo(event, "#doctrine")}>{t.nav[0]}</a><a href="#intel" onClick={(event) => navigateTo(event, "#intel")}>{t.nav[1]}</a><a href="#join" onClick={(event) => navigateTo(event, "#join")}>{t.nav[2]}</a></div><div className="nav-tools"><button className="locale" onClick={() => setLocale(locale === "zh" ? "en" : "zh")} aria-label={t.switchLabel}>{t.lang}</button></div></nav>
    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow hero-reveal">{t.unit}</p><h1 className="hero-reveal">{t.hero[0]} <em>{t.hero[1]}</em></h1><p className="hero-reveal intro">{t.intro}</p></div><p className="scroll hero-reveal">{t.scroll}</p></section>
    <section id="doctrine" className="section"><header className="reveal"><p className="eyebrow">{t.doctrine}</p><h2>{t.doctrineTitle}</h2><p>{t.doctrineLead}</p></header><div className="op-list reveal">{t.ops.map(([number, title, body]) => <article className="op" key={number}><small>{number}</small><h3>{title}</h3><p>{body}</p><i>↗</i></article>)}</div></section>
    <section className="comparison section"><header className="reveal"><p className="eyebrow">{t.compareEyebrow}</p><h2>{t.compareTitle}</h2><p>{t.compareLead}</p></header><div className="flight-choice reveal"><article className="choice solo"><div><small>01 //</small><h3>{t.solo[0]} <em>{t.solo[1]}</em></h3></div><ul>{t.solo[2].map((item) => <li key={item}>{item}</li>)}</ul></article><article className="choice corp"><div><small>02 //</small><h3>{t.corporation[0]} <em>{t.corporation[1]}</em></h3></div><ul>{t.corporation[2].map((item) => <li key={item}>{item}</li>)}</ul></article></div></section>
    <section className="why-cacx section"><header className="reveal"><p className="eyebrow">{t.whyEyebrow}</p><h2>{t.whyTitle}</h2><p>{t.whyLead}</p></header><div className="why-list reveal">{t.whyPoints.map(([number, title, body]) => <article key={number}><small>{number} //</small><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section id="intel" className="section intel"><div className="reveal"><p className="eyebrow">{t.intel}</p><h2>{t.intelTitle}</h2><div className="metrics">{t.metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><small>{label}</small></div>)}</div></div><div className="radar reveal" /></section>
    <section className="partners section"><header className="reveal"><p className="eyebrow">{t.partnersEyebrow}</p><h2>{t.partnersTitle}</h2><p>{t.partnerLead}</p></header><div className="partner-grid reveal">{t.partners.map(([mark, type, name, detail]) => <article className="partner" key={name}><div className="partner-logo" aria-label={`${name} logo placeholder`}><span>{mark}</span><i /></div><small>{type}</small><h3>{name}</h3><p>{detail}</p></article>)}</div></section>
    <section id="join" className="join"><p className="eyebrow">{t.channel}</p><h2 className="reveal">{t.join}</h2><div className="join-row reveal"><p>{t.joinText}</p><a className="cta" href="/apply">{t.cta} <b>→</b></a></div></section><footer>© 2026 CHAOS ARBITER <span>{t.footer}</span></footer>
  </main>;
}
