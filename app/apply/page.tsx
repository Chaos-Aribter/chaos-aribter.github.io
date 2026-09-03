"use client";

import { FormEvent, useState } from "react";

type FormValues = {
  pilot: string;
  qq: string;
  timezone: string;
  note: string;
  agreement: boolean;
};

const initialValues: FormValues = { pilot: "", qq: "", timezone: "", note: "", agreement: false };

export default function ApplyPage() {
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof FormValues, value: string | boolean) => {
    setSubmitted(false);
    setError("");
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.pilot.trim()) return setError("请填写你的 EVE 游戏角色名。");
    if (!/^\d{5,12}$/.test(values.qq.trim())) return setError("请输入 5–12 位数字 QQ 号。");
    if (!values.timezone) return setError("请选择主要活动时区。");
    if (!values.agreement) return setError("请确认你同意招募官通过 QQ 联系你。");
    setSubmitted(true);
  };

  return <main className="apply-page">
    <header className="apply-nav">
      <a className="brand" href="/"><strong>混沌仲裁者</strong><span>CHAOS ARBITER//</span></a>
      <p>RECRUITMENT CHANNEL // 01</p>
      <a className="back-link" href="/">← 返回门户</a>
    </header>

    <section className="apply-hero">
      <div>
        <p className="eyebrow">[ 招募申请终端 ]</p>
        <h1>进入<br /><em>频道。</em></h1>
        <p className="apply-lead">留下你的飞行员档案。招募官会通过 QQ 与你建立初步联系，再一起确认作战时区、舰队方向与下一次跃迁。</p>
      </div>
      <dl className="apply-status" aria-label="申请流程">
        <div><dt>01</dt><dd>录入档案</dd></div>
        <div><dt>02</dt><dd>招募官联系</dd></div>
        <div><dt>03</dt><dd>频道会谈</dd></div>
      </dl>
    </section>

    <section className="application-terminal" aria-labelledby="application-heading">
      <div className="terminal-label"><span>APPLICATION // INTAKE</span><span>SECURE CHANNEL</span></div>
      <div className="application-grid">
        <aside>
          <p className="eyebrow">[ 传输说明 ]</p>
          <h2 id="application-heading">你的<br /><em>跃迁坐标。</em></h2>
          <p>仅收集招募初筛所需的信息。请使用你希望招募官联系的 QQ。</p>
        </aside>
        <form onSubmit={submit} noValidate>
          <label htmlFor="pilot">EVE 游戏角色名 <b>REQUIRED</b></label>
          <input id="pilot" name="pilot" autoComplete="nickname" value={values.pilot} onChange={(event) => update("pilot", event.target.value)} placeholder="例如：Chaos Pilot" required />

          <label htmlFor="qq">联系 QQ <b>REQUIRED</b></label>
          <input id="qq" name="qq" inputMode="numeric" autoComplete="off" value={values.qq} onChange={(event) => update("qq", event.target.value.replace(/\D/g, ""))} placeholder="仅数字" required />

          <label htmlFor="timezone">主要活动时区 <b>REQUIRED</b></label>
          <select id="timezone" name="timezone" value={values.timezone} onChange={(event) => update("timezone", event.target.value)} required>
            <option value="">选择时区 / SELECT</option>
            <option value="cn">中国时区 UTC+8</option>
            <option value="eu">欧洲时区 UTC+0–3</option>
            <option value="na">北美时区 UTC−4–8</option>
            <option value="other">其他 / 不固定</option>
          </select>

          <label htmlFor="note">想让我们先知道什么？ <span>OPTIONAL</span></label>
          <textarea id="note" name="note" rows={4} maxLength={500} value={values.note} onChange={(event) => update("note", event.target.value)} placeholder="例如：常用舰种、过往经历，或你想尝试的作战方向。" />

          <label className="consent"><input type="checkbox" checked={values.agreement} onChange={(event) => update("agreement", event.target.checked)} /><span>我同意混沌仲裁者的招募官通过以上 QQ 与我联系。</span></label>
          {error && <p className="form-message error" role="alert">// {error}</p>}
          {submitted && <p className="form-message success" role="status">// 档案已通过本地校验。请接入招募提交接口后启用正式传输。</p>}
          <button type="submit">提交招募申请 <b>→</b></button>
        </form>
      </div>
    </section>

    <footer className="apply-footer">CHAOS ARBITER // NEW EDEN RECRUITMENT NETWORK <span>STATUS: OPEN</span></footer>
  </main>;
}
