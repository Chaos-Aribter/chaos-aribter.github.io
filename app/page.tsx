"use client";

import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type MouseEvent, useEffect, useRef, useState } from "react";

const SpaceScene = dynamic(() => import("./space-scene"), { ssr: false });
gsap.registerPlugin(ScrollTrigger);

type RemoteStats = { members: number; isk: number; kills: number; fetchedAt: string | null };
const fallbackStats: RemoteStats = { members: 8525, isk: 48.27e12, kills: 192733, fetchedAt: null };

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatIsk(value: number) {
  const units: Array<[number, string]> = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];
  for (const [scale, suffix] of units) {
    if (Math.abs(value) >= scale) return `${(value / scale).toFixed(2).replace(/\\.?0+$/, "")}${suffix}`;
  }
  return formatNumber(Math.round(value));
}

const copy = {
  zh: {
    lang: "EN", switchLabel: "Switch to English", skip: "跳至内容", loader: "正在连接新伊甸", status: "状态",
    nav: ["军团内容", "军团数据", "加入混沌"], unit: "[ CHAOS ARBITER ]", hero: ["混沌", "仲裁者"], intro: "致力于为成员提供优质内容、营造舒适氛围的综合型 EVE 玩家社区。", scroll: "向下探索",
    intel: "[ 军团数据 ]", intelTitle: <>每一个数字背后<br /><em>都是一段故事。</em></>, metrics: [["8,525", "成员"], ["48.27T", "击杀价值"], ["192,733", "击杀舰船"], ["2012", "年 / 成立"]],
    resourcesEyebrow: "[ 军团资源 ]", resourcesTitle: <>价值源自<br /><em>需求。</em></>, resourcesLead: "多处专属内部工业基建，生产体系完善齐全，可覆盖从常规物资、T1 舰船到旗舰级舰船的全门类制造需求。", resources: [["01 /", "内部专属工业建筑", "多处专属内部工业基建，生产体系完善齐全。"], ["02 /", "常态化旗舰 & 战列级别战斗", "成熟的大船作战体系与稳定后勤兜底；合规参战的无畏战损可享受军团专项补损。"], ["03 /", "成熟的制度建设", "LP 制度铭记每个人的付出；多个社区、小组提供大展拳脚的舞台。"], ["04 /", "多样生产环境", "不仅拥有主权区域的生产环境，更能在每个任务区看到混沌成员的身影。"]],
    doctrine: "[ 军团内容 ]", doctrineTitle: <>战斗不是<br /><em>偶然。</em></>, doctrineLead: "我们将成员、舰船与时机编组为可复现的胜利。选择你的作战席位。", ops: [["1 /", "建制对抗", "多种战列级别建制、普遍的旗舰使用，你想玩的大船都有。"], ["2 /", "低安游击", "与低安土著高强度交锋，每一分钟都在战斗。"], ["3 /", "兴趣小组", "多样化的散打内容，不一样的乐趣。"], ["4 /", "从士兵到将军", "成熟的训练机制，让你的指挥梦想不停留在纸上。"]],
    compareEyebrow: "SOLO PLAYER // CORPORATION", compareTitle: <>一个人的 EVE，<em>走不远。</em></>, compareLead: "EVE 是硬核的 MMO：大量内容不加军团根本玩不到，而重复的日常，只有和靠谱的伙伴一起才有意义。", solo: ["独狼", "SOLO", ["大量游戏内容需要组队，单人无法体验", "无论想玩什么，全流程都需要自己弄：采购 · 运输 · 出货", "缺少社交，内容很快就重复乏味"]], corporation: ["加入军团", "IN CORP", ["解锁所有组队、社区内容：高价值任务区、团队副本 / PVP", "分工合作，专人出货回收 · 快递 · 后勤", "找到志同道合的伙伴，长期玩下去"]],
    whyEyebrow: "[ 为什么是 CACX ]", whyTitle: <>新人，为什么选<br /><em>混沌仲裁者。</em></>, whyLead: "最大的华人军团，专为新人与长期玩家打造。", whyPoints: [["01", "零门槛新人社区", "专门面向新人的社区与组织，纯新也可立即开始生产与战斗。"], ["02", "完整发育路线", "经过检验的新人成长路径，无论后期想玩什么，前期都能让你打好基础。"], ["03", "最大华人军团", "最大的华人军团，最多样的活动，最正常友善的社区文化。"]],
    partnersEyebrow: "[ 关注我们 ]", partnersTitle: <>关注<br /><em>我们。</em></>, partnerLead: "公众号与 Bilibili。", partners: [["WX", "官方渠道", "公众号", "关注军团动态与活动信息"], ["B", "视频平台", "Bilibili", "观看军团内容与作战记录"]],
    channel: "[ 加入混沌 ]", join: <>加入<br /><em>混沌。</em></>, joinText: "扫码加入军团招募群，与我们建立联系。", cta: "扫码加入招募群", qrTitle: <>扫码加入<br /><em>军团群。</em></>, qrLead: "使用 QQ 扫描二维码，加入混沌仲裁者军团群。", wechatChannel: "[ 官方公众号 ]", wechatTitle: <>扫码关注<br /><em>公众号。</em></>, wechatLead: "公众号二维码将在此展示。", assetPending: "二维码待接入", close: "关闭", footer: "新伊甸 // 版权所有"
  },
  en: {
    lang: "中", switchLabel: "切换至中文", skip: "Skip to content", loader: "CONNECTING TO NEW EDEN", status: "STATUS",
    nav: ["CONTENT", "CORPORATION DATA", "JOIN CACX"], unit: "[ CHAOS ARBITER ]", hero: ["CHAOS", "ARBITER"], intro: "A comprehensive EVE player community committed to high-quality content and a comfortable place for its members.", scroll: "SCROLL TO DESCEND",
    intel: "[ CORPORATION DATA ]", intelTitle: <>EVERY NUMBER<br /><em>HAS A STORY.</em></>, metrics: [["8,525", "MEMBERS"], ["48.27T", "KILL VALUE"], ["192,733", "SHIPS DESTROYED"], ["2012", "FOUNDED"]],
    resourcesEyebrow: "[ CORPORATION RESOURCES ]", resourcesTitle: <>VALUE COMES<br /><em>FROM DEMAND.</em></>, resourcesLead: "Dedicated internal industry facilities and a complete production system—from standard supplies and T1 hulls to capital ships.", resources: [["01 /", "DEDICATED INDUSTRY", "Internal facilities and a complete production system."], ["02 /", "CAPITAL & BATTLESHIP FLEETS", "A mature capital doctrine, reliable support, and reimbursement for eligible dread losses."], ["03 /", "MATURE SYSTEMS", "LP records every contribution, while groups and communities make room to excel."], ["04 /", "DIVERSE PRODUCTION", "From sovereignty space to mission areas, Chaos pilots build wherever demand exists."]],
    doctrine: "[ CORPORATION CONTENT ]", doctrineTitle: <>COMBAT IS<br /><em>NO ACCIDENT.</em></>, doctrineLead: "We assemble pilots, ships, and timing into repeatable victories. Find your position in the fleet.", ops: [["1 /", "FORMED COMBAT", "Battlecruiser and capital formations: the big ships you want to fly."], ["2 /", "LOW-SEC ROAMING", "High-intensity engagements with low-sec residents—every minute is a fight."], ["3 /", "INTEREST GROUPS", "A variety of small-gang content and a different kind of fun."], ["4 /", "SOLDIER TO GENERAL", "A mature training system so your command ambitions do not stay on paper."]],
    compareEyebrow: "SOLO PLAYER // CORPORATION", compareTitle: <>EVE ALONE<br />DOESN&apos;T <em>GO FAR.</em></>, compareLead: "EVE is a demanding MMO: much of its best content begins with a corporation, and daily repetition only matters when shared with dependable pilots.", solo: ["LONE WOLF", "SOLO", ["Much of the game requires a group; solo pilots cannot access it", "Every step is yours alone: procurement · hauling · sales", "Without a social circle, the routine soon runs out of meaning"]], corporation: ["JOIN THE CORP", "IN CORP", ["Unlock group and community content: valuable sites, team PvE, and PVP", "Specialists handle recovery · logistics · courier work", "Find pilots with the same intent—and keep flying together"]],
    whyEyebrow: "[ WHY CACX ]", whyTitle: <>NEW PILOTS, WHY<br /><em>CHAOS ARBITER?</em></>, whyLead: "A major Chinese-speaking corporation built for new and long-term pilots.", whyPoints: [["01", "A WELCOMING START", "A community designed for new pilots. Start building and fighting from day one."], ["02", "A PROVEN GROWTH PATH", "A tested route that builds strong foundations for whatever you choose later."], ["03", "A THRIVING CHINESE COMMUNITY", "More ways to fly, more pilots to meet, and a friendly culture built to last."]],
    partnersEyebrow: "[ FOLLOW US ]", partnersTitle: <>FOLLOW<br /><em>US.</em></>, partnerLead: "WeChat Official Account and Bilibili.", partners: [["WX", "OFFICIAL CHANNEL", "WECHAT", "Corporation updates and event information"], ["B", "VIDEO PLATFORM", "BILIBILI", "Corporation stories and battle records"]],
    channel: "[ JOIN CHAOS ]", join: <>JOIN<br /><em>CHAOS.</em></>, joinText: "Scan the group code to connect with Chaos Arbiter recruitment.", cta: "SCAN TO JOIN", qrTitle: <>SCAN TO JOIN<br /><em>THE CORP.</em></>, qrLead: "Scan the QR code with QQ to join the Chaos Arbiter corporation group.", wechatChannel: "[ WECHAT OFFICIAL ACCOUNT ]", wechatTitle: <>FOLLOW ON<br /><em>WECHAT.</em></>, wechatLead: "The WeChat QR code will appear here.", assetPending: "QR ASSET PENDING", close: "CLOSE", footer: "NEW EDEN // ALL RIGHTS RESERVED"
  }
} as const;

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [assetProgress, setAssetProgress] = useState(.025);
  const [assetReady, setAssetReady] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(.025);
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [activeModal, setActiveModal] = useState<"join" | "wechat" | null>(null);
  const [remoteStats, setRemoteStats] = useState<RemoteStats>(fallbackStats);
  const displayProgressRef = useRef(.025);
  const [locale, setLocale] = useState<keyof typeof copy>("zh");
  const t = copy[locale];
  const modal = activeModal === "join" ? { eyebrow: t.channel, title: t.qrTitle, lead: t.qrLead, image: "https://cdn.cacx.online/images/join-group-qr.png", fallback: "/images/join-group-qr.png", alt: "混沌仲裁者军团群二维码" } : activeModal === "wechat" ? { eyebrow: t.wechatChannel, title: t.wechatTitle, lead: t.wechatLead, image: "https://cdn.cacx.online/images/wechat-qr.png", fallback: "/images/wechat-qr.png", alt: "混沌仲裁者官方公众号二维码" } : null;

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
    const controller = new AbortController();
    fetch(`data/remote-stats.json?at=${Date.now()}`, { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then((data: unknown) => {
        if (!data || typeof data !== "object") return;
        const stats = data as RemoteStats;
        if ([stats.members, stats.isk, stats.kills].every((value) => typeof value === "number" && Number.isFinite(value))) {
          setRemoteStats(stats);
        }
      })
      .catch(() => { /* Keep the embedded fallback when the cache is temporarily unavailable. */ });
    return () => controller.abort();
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

  useEffect(() => {
    if (!activeModal) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setActiveModal(null); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeModal]);

  const displayedMetrics = [
    [formatNumber(remoteStats.members), t.metrics[0][1]],
    [formatIsk(remoteStats.isk), t.metrics[1][1]],
    [formatNumber(remoteStats.kills), t.metrics[2][1]],
    [t.metrics[3][0], t.metrics[3][1]],
  ];

  return <main ref={root} className="journey" lang={locale === "zh" ? "zh-CN" : "en"}>
    <a className="skip" href="#doctrine">{t.skip}</a><div className="loader" aria-hidden="true"><p>{t.loader} // {Math.round(displayProgress * 100)}%</p><span><i className="loader-line" style={{ transform: `scaleX(${displayProgress})` }} /></span></div><div className="nebula" aria-hidden="true" /><div className="grain" /><div className="progress" style={{ transform: `scaleX(${progress})` }} />
    <nav><a className="brand" href="#top" onClick={(event) => navigateTo(event, "#top")}><strong>混沌仲裁者</strong><span>CHAOS ARBITER//</span></a><div><a href="#doctrine" onClick={(event) => navigateTo(event, "#doctrine")}>{t.nav[0]}</a><a href="#intel" onClick={(event) => navigateTo(event, "#intel")}>{t.nav[1]}</a><a href="#join" onClick={(event) => navigateTo(event, "#join")}>{t.nav[2]}</a></div><div className="nav-tools"><button className="locale" onClick={() => setLocale(locale === "zh" ? "en" : "zh")} aria-label={t.switchLabel}>{t.lang}</button></div></nav>
    <section id="top" className="hero"><div className="hero-stage"><div className="scene" aria-hidden="true"><SpaceScene onAssetProgress={setAssetProgress} onAssetReady={() => setAssetReady(true)} /></div><div className="hero-copy"><p className="eyebrow hero-reveal">{t.unit}</p><h1 className={`hero-reveal hero-title ${locale === "zh" ? "hero-title-zh" : "hero-title-en"}`}><span>{t.hero[0]}</span> <em>{t.hero[1]}</em></h1><p className="hero-reveal intro">{t.intro}</p></div><p className="scroll hero-reveal">{t.scroll}</p></div></section>
    <section id="intel" className="section intel"><div className="reveal"><p className="eyebrow">{t.intel}</p><h2>{t.intelTitle}</h2><div className="metrics">{displayedMetrics.map(([value, label]) => <div key={label}><strong>{value}</strong><small>{label}</small></div>)}</div></div><div className="radar reveal" /></section>
    <section className="resources section"><header className="reveal"><p className="eyebrow">{t.resourcesEyebrow}</p><h2>{t.resourcesTitle}</h2><p>{t.resourcesLead}</p></header><div className="resource-list reveal">{t.resources.map(([number, title, body]) => <article key={number}><small>{number}</small><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section id="doctrine" className="section"><header className="reveal"><p className="eyebrow">{t.doctrine}</p><h2>{t.doctrineTitle}</h2><p>{t.doctrineLead}</p></header><div className="op-list reveal">{t.ops.map(([number, title, body]) => <article className="op" key={number}><small>{number}</small><h3>{title}</h3><p>{body}</p><i>↗</i></article>)}</div></section>
    <section className="comparison section"><header className="reveal"><p className="eyebrow">{t.compareEyebrow}</p><h2>{t.compareTitle}</h2><p>{t.compareLead}</p></header><div className="flight-choice reveal"><article className="choice solo"><div><small>01 //</small><h3>{t.solo[0]} <em>{t.solo[1]}</em></h3></div><ul>{t.solo[2].map((item) => <li key={item}>{item}</li>)}</ul></article><article className="choice corp"><div><small>02 //</small><h3>{t.corporation[0]} <em>{t.corporation[1]}</em></h3></div><ul>{t.corporation[2].map((item) => <li key={item}>{item}</li>)}</ul></article></div></section>
    <section className="why-cacx section"><header className="reveal"><p className="eyebrow">{t.whyEyebrow}</p><h2>{t.whyTitle}</h2><p>{t.whyLead}</p></header><div className="why-list reveal">{t.whyPoints.map(([number, title, body]) => <article key={number}><small>{number} //</small><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className="partners section"><header className="reveal"><p className="eyebrow">{t.partnersEyebrow}</p><h2>{t.partnersTitle}</h2><p>{t.partnerLead}</p></header><div className="partner-grid reveal">{t.partners.map(([mark, type, name, detail], index) => index === 0 ? <button className="partner" type="button" key={name} onClick={() => setActiveModal("wechat")} aria-haspopup="dialog"><div className="partner-logo" aria-hidden="true"><span>{mark}</span><i /></div><small>{type}</small><h3>{name}</h3><p>{detail}</p></button> : <a className="partner" key={name} href="https://space.bilibili.com/15346174" target="_blank" rel="noreferrer"><div className="partner-logo" aria-hidden="true"><span>{mark}</span><i /></div><small>{type}</small><h3>{name}</h3><p>{detail}</p></a>)}</div></section>
    <section id="join" className="join"><p className="eyebrow">{t.channel}</p><h2 className="reveal">{t.join}</h2><div className="join-row reveal"><p>{t.joinText}</p><button className="cta" type="button" onClick={() => setActiveModal("join")} aria-haspopup="dialog">{t.cta} <b>→</b></button></div></section><footer><span>© 2026 CHAOS ARBITER</span><span>{t.footer}</span><a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">粤ICP备2026130616号</a></footer>
    {modal && <div className="qr-modal" role="presentation" onMouseDown={() => setActiveModal(null)}><section className="qr-terminal" role="dialog" aria-modal="true" aria-labelledby="channel-modal-title" onMouseDown={(event) => event.stopPropagation()}><button className="qr-close" type="button" onClick={() => setActiveModal(null)} aria-label={t.close}>×</button><p className="eyebrow">{modal.eyebrow}</p><h2 id="channel-modal-title">{modal.title}</h2><img className="join-qr" src={modal.image} alt={modal.alt} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = modal.fallback; }} /><p>{modal.lead}</p></section></div>}
  </main>;
}
