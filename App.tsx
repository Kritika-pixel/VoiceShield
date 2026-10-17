import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Activity, AudioLines, Bell, BookOpen, Check, ChevronDown, CircleHelp, Clock3,
  FileAudio, FileText, Fingerprint, Gauge, Headphones, Home, LockKeyhole, LogOut,
  Menu, Mic, Moon, Plus, ScanLine, Search, Settings, Shield, ShieldAlert,
  ShieldCheck, Sparkles, Upload, Users, X, Eye, EyeOff, Zap, ArrowUpRight
} from "lucide-react";
import { supabase, supabaseConfigured } from "./lib/supabase";

type View = "dashboard" | "analyze" | "protection" | "history" | "contacts" | "reports" | "settings";
type Analysis = { fileName: string; risk: number; classification: "Low" | "Medium" | "High"; note: string; time: string };

const sampleHistory: Analysis[] = [
  { fileName: "unknown_caller_042.wav", risk: 82, classification: "High", note: "Unusual spectral consistency", time: "Today · 10:42 AM" },
  { fileName: "family_call_sample.wav", risk: 12, classification: "Low", note: "No strong synthetic indicators", time: "Today · 09:18 AM" },
  { fileName: "voicemail_08.mp3", risk: 48, classification: "Medium", note: "Inconclusive voice artifacts", time: "Yesterday · 06:31 PM" }
];

function App() {
  const [session, setSession] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login");
  const [view, setView] = useState<View>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(true);
  const [protection, setProtection] = useState(true);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>(sampleHistory);
  const [filter, setFilter] = useState("All");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contacts, setContacts] = useState([{ name: "Mum", phone: "+91 ••••• 1284" }, { name: "Aarav", phone: "+91 ••••• 8042" }]);
  const [reportNote, setReportNote] = useState("");

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  const signedIn = supabaseConfigured ? Boolean(session) : Boolean(session?.demo);
  const navItems: { id: View; label: string; icon: typeof Home }[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "analyze", label: "Voice analysis", icon: ScanLine },
    { id: "protection", label: "Live protection", icon: ShieldCheck },
    { id: "history", label: "Call history", icon: Clock3 },
    { id: "contacts", label: "Trusted contacts", icon: Users },
    { id: "reports", label: "Incident reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  async function handleAuth(e: FormEvent) {
    e.preventDefault(); setAuthError(""); setAuthMessage(""); setAuthBusy(true);
    try {
      if (authMode === "reset") {
        if (!supabase) { setAuthMessage("Add your Supabase credentials to enable password reset."); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setAuthMessage("Password reset instructions sent if this email is registered.");
      } else if (!supabaseConfigured || !supabase) {
        if (password.length < 6) throw new Error("Use at least 6 characters for your password.");
        if (authMode === "signup" && !fullName.trim()) throw new Error("Please enter your name.");
        if (authMode === "signup" && password !== confirmPassword) throw new Error("Passwords do not match.");
        setSession({ demo: true, user: { email, name: fullName || email.split("@")[0] } });
        setView("dashboard");
      } else if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) throw error;
        if (data.session) setSession(data.session);
        else setAuthMessage("Account created. Check your email to confirm your account, then log in.");
        setAuthMode("login");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSession(data.session);
      }
    } catch (err) { setAuthError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setAuthBusy(false); }
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSession(null); setPassword(""); setAuthMode("login");
  }

  async function analyzeFile(file?: File) {
    if (!file) return;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try {
      const form = new FormData(); form.append("file", file);
      const res = await fetch(`${apiUrl}/analyze`, { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        const item: Analysis = { fileName: file.name, risk: Math.round(data.risk_score), classification: data.classification, note: data.explanation || "Analysis completed", time: "Just now" };
        setAnalysis(item); setHistory(prev => [item, ...prev]); return;
      }
    } catch { /* Backend is optional during UI setup. */ }
    // Clearly labelled demo result — never presented as a real model prediction.
    const item: Analysis = { fileName: file.name, risk: 0, classification: "Low", note: "Demo only — connect the model backend for real analysis.", time: "Just now" };
    setAnalysis(item); setHistory(prev => [item, ...prev]);
  }

  if (!authReady) return <div className="boot-screen"><div className="boot-logo"><Shield size={26} /></div><span>INITIALIZING VOICESHIELD...</span><div className="boot-bar"><i /></div></div>;
  if (!signedIn) return <AuthScreen mode={authMode} setMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} fullName={fullName} setFullName={setFullName} showPassword={showPassword} setShowPassword={setShowPassword} remember={remember} setRemember={setRemember} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} error={authError} message={authMessage} busy={authBusy} onSubmit={handleAuth} />;

  return (
    <div className="app-shell">
      {mobileNav && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-row"><div className="brand-icon"><Shield size={23} strokeWidth={2.5} /></div><div><div className="brand-name">VoiceShield<span>™</span></div><div className="brand-tag">VOICE SECURITY SYSTEM</div></div><button className="icon-button mobile-close" onClick={() => setMobileNav(false)}><X size={17}/></button></div>
        <div className="system-chip"><span className="status-dot" /> SYSTEM ONLINE <span className="chip-version">v0.1</span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav>{navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${view === item.id ? "nav-active" : ""}`} onClick={() => { setView(item.id); setMobileNav(false); }}><Icon size={17}/><span>{item.label}</span>{item.id === "reports" && <span className="nav-count">2</span>}</button>; })}</nav>
        <div className="sidebar-bottom"><div className="mini-terminal"><div className="terminal-top"><span>● ● ●</span><span>sys.log</span></div><p><b>&gt;</b> listening_for_threats</p><p><b>&gt;</b> model_status: <em>standby</em></p><p><b>&gt;</b> privacy_mode: <em>enabled</em></p><div className="terminal-cursor">_</div></div><button className="profile-row" onClick={() => setView("settings")}><div className="avatar">{(session?.user?.user_metadata?.full_name || session?.user?.name || email || "U").slice(0,1).toUpperCase()}</div><div className="profile-text"><strong>{session?.user?.user_metadata?.full_name || session?.user?.name || email.split("@")[0]}</strong><span>Personal workspace</span></div><ChevronDown size={15}/></button></div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)}><Menu size={19}/></button><span className="breadcrumb">SYSTEM <b>/</b> {view.toUpperCase().replace("-", " ")}</span></div><div className="topbar-actions"><div className="search-box"><Search size={15}/><input placeholder="Search workspace..." aria-label="Search workspace" /></div><button className="icon-button notification-button" aria-label="Notifications"><Bell size={17}/><i /></button><div className="top-avatar">{(session?.user?.user_metadata?.full_name || session?.user?.name || email || "U").slice(0,1).toUpperCase()}</div></div></header>
        <div className="content-wrap">
          {view === "dashboard" && <Dashboard history={history} protection={protection} onAnalyze={() => setView("analyze")} onProtection={() => setView("protection")} onHistory={() => setView("history")} />}
          {view === "analyze" && <AnalyzePage analysis={analysis} onAnalyze={analyzeFile} />}
          {view === "protection" && <ProtectionPage active={protection} setActive={setProtection} />}
          {view === "history" && <HistoryPage history={history} filter={filter} setFilter={setFilter} />}
          {view === "contacts" && <ContactsPage contacts={contacts} setContacts={setContacts} name={contactName} setName={setContactName} phone={contactPhone} setPhone={setContactPhone} />}
          {view === "reports" && <ReportsPage note={reportNote} setNote={setReportNote} />}
          {view === "settings" && <SettingsPage email={session?.user?.email || email} onLogout={logout} />}
        </div>
        <footer className="app-footer"><span>© 2026 VOICESHIELD LABS</span><span><LockKeyhole size={11}/> AUDIO NOT STORED BY DEFAULT</span><span>BUILT FOR SAFER CONVERSATIONS <span className="footer-heart">♥</span></span></footer>
      </main>
    </div>
  );
}

function AuthScreen(props: any) {
  const { mode, setMode, email, setEmail, password, setPassword, fullName, setFullName, confirmPassword, setConfirmPassword, showPassword, setShowPassword, remember, setRemember, error, message, busy, onSubmit } = props;
  const signup = mode === "signup";
  return <div className="auth-screen">
    <div className="auth-noise" />
    <div className="auth-frame">
      <div className="auth-topline"><span><span className="status-dot"/> SECURE CONNECTION ESTABLISHED</span><span>BUILD 0.1.26 <span className="pixel-heart">♥</span></span></div>
      <div className="auth-grid">
        <section className="auth-hero">
          <div className="hero-logo"><Shield size={30}/><AudioLines size={24} className="hero-wave"/></div>
          <div className="retro-label"><span className="tiny-square"/> NEXT-GEN VOICE DEFENSE</div>
          <h1>Trust every voice.<br/><span>Verify every call.</span></h1>
          <p className="hero-copy">Your personal shield against synthetic voices, deepfakes, and the scams that sound just like someone you know.</p>
          <div className="hero-terminal">
            <div className="terminal-head"><span><i/> <i/> <i/></span><b>voiceshield://system_check</b><span>− □ ×</span></div>
            <div className="terminal-body"><p><span>01</span> Initializing voice protection<span className="term-ok">[ READY ]</span></p><p><span>02</span> Loading threat intelligence<span className="term-ok">[ READY ]</span></p><p><span>03</span> Listening for anomalies<span className="term-wait">[ STANDBY ]</span></p><div className="waveform" aria-label="Decorative audio waveform">{Array.from({length:48}, (_,i)=><i key={i} style={{height:`${12+((i*17+i%5*11)%34)}px`}}/>)}</div><div className="terminal-bottom"><span>ALL SYSTEMS NOMINAL</span><span>█ 98.4% UPTIME</span></div></div>
          </div>
          <div className="auth-proof"><div className="proof-icon"><Fingerprint size={17}/></div><div><b>Privacy by design</b><span>Your audio stays yours. No recordings stored by default.</span></div><div className="proof-pixel">✳</div></div>
          <div className="decor decor-one">✳</div><div className="decor decor-two">✦</div><div className="decor decor-three">▧</div>
        </section>
        <section className="auth-form-panel">
          <div className="form-window-bar"><span><i/><i/><i/></span><span>{mode === "reset" ? "PASSWORD_RECOVERY.exe" : signup ? "NEW_USER.exe" : "AUTHENTICATION.exe"}</span><span>v1.0</span></div>
          <div className="auth-form-inner">
            <div className="form-overline">{mode === "reset" ? "ACCOUNT RECOVERY" : signup ? "JOIN THE NETWORK" : "WELCOME BACK, OPERATOR"}</div>
            <h2>{mode === "reset" ? "Reset password" : signup ? "Create account" : "Sign in to your"}{mode === "login" && <><br/><span>safe space.</span></>}</h2>
            <p className="form-subtitle">{mode === "reset" ? "We'll send you a secure reset link." : signup ? "Set up your personal voice security system." : "Your voice security console is waiting."}</p>
            <form onSubmit={onSubmit}>
              {signup && <label>FULL NAME<div className="field-wrap"><Users size={16}/><input value={fullName} onChange={(e:any)=>setFullName(e.target.value)} placeholder="How should we call you?" autoComplete="name" required/></div></label>}
              <label>EMAIL ADDRESS<div className="field-wrap"><span className="field-at">@</span><input type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div></label>
              {mode !== "reset" && <label>PASSWORD<div className="field-wrap"><LockKeyhole size={16}/><input type={showPassword ? "text" : "password"} value={password} onChange={(e:any)=>setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={signup ? "new-password" : "current-password"} minLength={6} required/><button type="button" className="field-action" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>}
              {signup && <label>CONFIRM PASSWORD<div className="field-wrap"><LockKeyhole size={16}/><input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e:any)=>setConfirmPassword(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" minLength={6} required/></div></label>}
              {mode === "login" && <div className="form-options"><label className="remember-option"><input type="checkbox" checked={remember} onChange={(e:any)=>setRemember(e.target.checked)}/> <span>Remember me</span></label><button type="button" className="text-link" onClick={()=>setMode("reset")}>Forgot password?</button></div>}
              {error && <div className="auth-alert"><ShieldAlert size={15}/>{error}</div>}{message && <div className="auth-message"><Check size={15}/>{message}</div>}
              <button className="primary-button auth-submit" disabled={busy}>{busy ? <><span className="spinner"/> Working...</> : <>{mode === "reset" ? "Send reset link" : signup ? "Create my account" : "Log in"} <ArrowUpRight size={16}/></>}</button>
            </form>
            <div className="auth-divider"><span/> <small>SECURE ACCESS ONLY</small> <span/></div>
            <p className="auth-switch">{signup ? "Already have an account?" : mode === "reset" ? "Remember your password?" : "New around here?"} <button onClick={()=>{setMode(signup || mode==="reset" ? "login" : "signup");}}>{signup || mode==="reset" ? "Log in" : "Create an account"}</button></p>
            {!supabaseConfigured && <div className="demo-note"><Sparkles size={14}/><span><b>Preview mode</b> — sign-in is simulated until Supabase is configured.</span></div>}
            <div className="auth-legal"><span><LockKeyhole size={11}/> 256-BIT ENCRYPTION</span><span>PRIVACY <b>·</b> TERMS</span></div>
          </div>
        </section>
      </div>
      <div className="auth-bottomline"><span>© 2026 VOICESHIELD LABS</span><span>DESIGNED FOR A SAFER DIGITAL WORLD <span className="pixel-heart">♥</span></span><span>SYS.STATUS: <b>OPTIMAL</b></span></div>
    </div>
  </div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow:string; title:string; description:string; action?:ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow"><span/> {eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function Panel({ title, tag, children, className="" }: { title:string; tag?:string; children:ReactNode; className?:string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><div className="panel-title"><span className="panel-mark"/> {title}</div>{tag && <span className="panel-tag">{tag}</span>}</div>{children}</section>;
}
function Dashboard({ history, protection, onAnalyze, onProtection, onHistory }: any) {
  const recent = history.slice(0,3);
  return <><PageHeading eyebrow="YOUR SECURITY OVERVIEW" title="Good to see you, operator." description="Here's what's happening across your voice security system." action={<button className="primary-button" onClick={onAnalyze}><Plus size={16}/> Analyze audio</button>}/>
    <div className="status-banner"><div className="status-banner-icon"><ShieldCheck size={23}/></div><div className="status-banner-copy"><strong>You're {protection ? "protected" : "not currently protected"}</strong><span>{protection ? "Voice monitoring preferences are active on this device." : "Turn protection on to enable monitoring status."}</span></div><span className={`pill ${protection ? "pill-green":"pill-red"}`}><i/>{protection ? "PROTECTION ON":"PROTECTION OFF"}</span><button className="banner-link" onClick={onProtection}>Manage <ArrowUpRight size={14}/></button></div>
    <div className="metric-grid"><Metric icon={<Activity/>} label="AUDIO ANALYZED" value={String(history.length+124)} delta="+12 this week" tone="violet"/><Metric icon={<ShieldAlert/>} label="SUSPICIOUS FLAGS" value="08" delta="2 need review" tone="pink"/><Metric icon={<Gauge/>} label="SYSTEM HEALTH" value="98.4%" delta="All systems nominal" tone="green"/><Metric icon={<Users/>} label="TRUSTED CONTACTS" value="02" delta="Your inner circle" tone="amber"/></div>
    <div className="dashboard-grid"><Panel title="THREAT ACTIVITY" tag="LAST 7 DAYS" className="chart-panel"><div className="chart-legend"><span><i className="legend-violet"/> Scans</span><span><i className="legend-pink"/> Flags</span><span className="chart-note">DEMO METRICS</span></div><div className="activity-chart">{[{d:"MON",a:42,b:13},{d:"TUE",a:64,b:21},{d:"WED",a:49,b:9},{d:"THU",a:80,b:27},{d:"FRI",a:59,b:16},{d:"SAT",a:91,b:33},{d:"SUN",a:70,b:18}].map(x=><div className="chart-day" key={x.d}><div className="bar-pair"><i style={{height:`${x.a}%`}}/><i style={{height:`${x.b}%`}}/></div><span>{x.d}</span></div>)}</div><div className="chart-footer"><span><b>124</b> scans processed</span><span><b>8</b> anomalies flagged</span><span className="tiny-change">↗ 18.6%</span></div></Panel>
      <Panel title="SYSTEM MONITOR" tag="LIVE"><div className="monitor-status"><div className="monitor-orb"><AudioLines size={24}/></div><div><strong>VoiceGuard Core</strong><span>Detection engine</span></div><span className="pill pill-green"><i/> {protection?"ACTIVE":"STANDBY"}</span></div><div className="monitor-list"><div><span>Model connection</span><b className="green-text">● Ready</b></div><div><span>Audio buffer</span><b>0.0 MB</b></div><div><span>Privacy shield</span><b className="green-text">● Enabled</b></div><div><span>Last sync</span><b>Just now</b></div></div><button className="outline-button full-button" onClick={onProtection}>Open monitor <ArrowUpRight size={14}/></button></Panel>
    </div>
    <Panel title="RECENT ACTIVITY" tag="LATEST EVENTS"><div className="table-wrap"><table className="data-table"><thead><tr><th>FILE / CALL</th><th>RISK LEVEL</th><th>RISK SCORE</th><th>ANALYZED</th><th></th></tr></thead><tbody>{recent.map((h:Analysis,i:number)=><tr key={`${h.fileName}-${i}`}><td><div className="file-cell"><div className="file-icon"><FileAudio size={16}/></div><div><b>{h.fileName}</b><span>{h.note}</span></div></div></td><td><RiskBadge level={h.classification}/></td><td><div className="score-cell"><span>{h.risk}%</span><div className="score-track"><i style={{width:`${h.risk}%`}} className={h.classification.toLowerCase()}/></div></div></td><td className="muted-cell">{h.time}</td><td><button className="icon-button table-action" title="View details"><ArrowUpRight size={15}/></button></td></tr>)}</tbody></table></div><button className="table-footer-link" onClick={onHistory}>View all activity <ArrowUpRight size={14}/></button></Panel>
    <div className="bottom-tip"><div className="tip-icon"><BookOpen size={17}/></div><div><b>Safety tip of the day</b><p>If someone calls with an urgent request for money, hang up and call them back on a number you already trust.</p></div><span className="tip-sparkle">✳</span></div>
  </>;
}
function Metric({icon,label,value,delta,tone}:any){return <div className="metric-card"><div className="metric-top"><div className={`metric-icon ${tone}`}>{icon}</div><span className="metric-dots">···</span></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-delta"><span className={`delta-dot ${tone}`}/> {delta}</div></div>}
function RiskBadge({level}:{level:string}){return <span className={`risk-badge risk-${level.toLowerCase()}`}><i/>{level} risk</span>}
function AnalyzePage({analysis,onAnalyze}:any){
  const [drag,setDrag]=useState(false);
  return <><PageHeading eyebrow="VOICE INTELLIGENCE" title="Analyze a voice sample." description="Check an audio file for indicators of synthetic or manipulated speech."/><div className="analyze-layout"><Panel title="AUDIO INPUT" tag="WAV · MP3 · M4A" className="upload-panel"><label className={`dropzone ${drag?"dragging":""}`} onDragOver={(e:any)=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={(e:any)=>{e.preventDefault();setDrag(false);onAnalyze(e.dataTransfer.files?.[0]);}}><input type="file" accept="audio/*" onChange={(e:any)=>onAnalyze(e.target.files?.[0])}/><div className="upload-icon"><Upload size={24}/></div><strong>Drop your audio file here</strong><span>or click to browse your device</span><small>Supported: WAV, MP3, M4A · Max 20 MB</small></label><div className="privacy-note"><LockKeyhole size={15}/><span><b>Privacy first.</b> Audio is sent to your configured backend for analysis. Do not upload sensitive recordings without consent.</span></div><div className="analysis-steps"><div><span className="step-num">01</span><div><b>Upload sample</b><small>Select an audio file</small></div></div><div><span className="step-num">02</span><div><b>Analyze features</b><small>Audio model checks patterns</small></div></div><div><span className="step-num">03</span><div><b>Review findings</b><small>See risk and explanation</small></div></div></div></Panel>
  <Panel title="ANALYSIS RESULT" tag={analysis?"LATEST RESULT":"AWAITING INPUT"} className="result-panel">{analysis?<><div className="result-file"><div className="file-icon large"><FileAudio size={20}/></div><div><b>{analysis.fileName}</b><span>{analysis.time}</span></div></div><div className="result-score"><div className="score-ring" style={{"--score":`${analysis.risk}%`} as any}><div><strong>{analysis.risk}%</strong><span>RISK SCORE</span></div></div><RiskBadge level={analysis.classification}/></div><div className="result-explanation"><b><Sparkles size={15}/> FINDINGS</b><p>{analysis.note}</p></div><div className="demo-disclaimer"><CircleHelp size={14}/> If the result says demo only, no AI classifier has run yet.</div></>:<div className="empty-result"><div className="empty-orbit"><AudioLines size={28}/></div><b>Ready when you are</b><p>Upload a sample to see its analysis results here.</p><div className="empty-line"/></div>}</Panel></div></>;
}
function ProtectionPage({active,setActive}:any){return <><PageHeading eyebrow="REAL-TIME DEFENSE" title="Live protection." description="Manage monitoring preferences and review your current protection state."/><div className="protection-hero"><div className="protection-graphic"><div className={`protection-ring ${active?"is-active":""}`}><ShieldCheck size={47}/><span/></div><div className="orbit-dot one"/><div className="orbit-dot two"/></div><div className="protection-info"><div className="eyebrow"><span/> VOICEGUARD CORE</div><h2>{active?"Your shield is up.":"Protection is paused."}</h2><p>{active?"Your local protection preference is active. Connect a supported live audio source to analyze calls in real time.":"Turn protection on when you're ready to monitor supported audio sources."}</p><div className="protection-meta"><span><i className={active?"green-text":"amber-text"}>●</i> {active?"STATUS: ACTIVE":"STATUS: STANDBY"}</span><span><LockKeyhole size={13}/> PRIVATE BY DEFAULT</span></div><button className={`primary-button ${active?"button-muted":""}`} onClick={()=>setActive(!active)}>{active?<><Moon size={16}/> Pause protection</>:<><ShieldCheck size={16}/> Enable protection</>}</button></div><div className="protection-stamp">VS<br/><span>SECURE</span></div></div><div className="three-cards"><Panel title="DETECTION SETTINGS" tag="CONFIG"><div className="setting-row"><div><b>Risk warnings</b><span>Show an alert for medium and high risk</span></div><Toggle initial /></div><div className="setting-row"><div><b>Subtle alerts</b><span>Use quiet notifications when possible</span></div><Toggle /></div><div className="setting-row"><div><b>Keep audio recordings</b><span>Off by default for privacy</span></div><Toggle /></div></Panel><Panel title="MONITORING STATUS" tag="LIVE"><div className="status-list"><div><span>Audio source</span><b>Not connected</b></div><div><span>Detection model</span><b>Backend required</b></div><div><span>Chunk duration</span><b>2–4 seconds (planned)</b></div><div><span>Last event</span><b>—</b></div></div></Panel><Panel title="SAFETY CHECKLIST" tag="QUICK TIPS"><ul className="check-list"><li><Check size={14}/> Verify urgent requests independently</li><li><Check size={14}/> Never share one-time passwords</li><li><Check size={14}/> Use a known number to call back</li></ul><button className="table-footer-link">Read all safety tips <ArrowUpRight size={14}/></button></Panel></div></>}
function Toggle({initial=false}:{initial?:boolean}){const [on,setOn]=useState(initial);return <button className={`toggle ${on?"toggle-on":""}`} role="switch" aria-checked={on} onClick={()=>setOn(!on)}><i/></button>}
function HistoryPage({history,filter,setFilter}:any){const filtered=useMemo(()=>filter==="All"?history:history.filter((x:Analysis)=>x.classification===filter),[history,filter]);return <><PageHeading eyebrow="EVENT ARCHIVE" title="Call history." description="Review previously analyzed samples and their risk assessments." action={<button className="outline-button" onClick={()=>{const csv=["File,Risk,Classification,Note,Time",...history.map((h:Analysis)=>`"${h.fileName}",${h.risk},${h.classification},"${h.note}","${h.time}"`)].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="voiceshield-history.csv";a.click();URL.revokeObjectURL(a.href);}}><Upload size={15}/> Export CSV</button>}/><Panel title="ANALYSIS ARCHIVE" tag={`${filtered.length} RECORDS`}><div className="filter-row"><div className="filter-tabs">{["All","Low","Medium","High"].map(x=><button key={x} className={filter===x?"filter-active":""} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="search-box compact"><Search size={14}/><input placeholder="Find a file..." /></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>FILE / CALL</th><th>RISK LEVEL</th><th>RISK SCORE</th><th>DATE ANALYZED</th></tr></thead><tbody>{filtered.map((h:Analysis,i:number)=><tr key={h.fileName+i}><td><div className="file-cell"><div className="file-icon"><FileAudio size={16}/></div><div><b>{h.fileName}</b><span>{h.note}</span></div></div></td><td><RiskBadge level={h.classification}/></td><td><div className="score-cell"><span>{h.risk}%</span><div className="score-track"><i style={{width:`${h.risk}%`}} className={h.classification.toLowerCase()}/></div></div></td><td className="muted-cell">{h.time}</td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-table">No records for this risk level.</div>}</div></Panel><p className="footnote"><LockKeyhole size={13}/> Demo history is stored in memory for this session only. Database persistence is not configured.</p></>}
function ContactsPage({contacts,setContacts,name,setName,phone,setPhone}:any){return <><PageHeading eyebrow="PEOPLE YOU TRUST" title="Trusted contacts." description="Keep important contacts close. Trusted status is informational and does not disable security checks." action={<button className="primary-button" onClick={()=>document.getElementById("contact-name")?.focus()}><Plus size={16}/> Add contact</button>}/><div className="contacts-layout"><Panel title="YOUR INNER CIRCLE" tag={`${contacts.length} CONTACTS`}><div className="contact-grid">{contacts.map((c:any,i:number)=><div className="contact-card" key={c.phone+i}><div className={`contact-avatar avatar-${i%4}`}>{c.name.slice(0,1).toUpperCase()}</div><div><b>{c.name}</b><span>{c.phone}</span><small><ShieldCheck size={12}/> TRUSTED CONTACT</small></div><button className="icon-button contact-remove" title="Remove contact" onClick={()=>setContacts((old:any[])=>old.filter((_:any,j:number)=>j!==i))}><X size={15}/></button></div>)}</div></Panel><Panel title="ADD A CONTACT" tag="NEW ENTRY"><form className="contact-form" onSubmit={(e:any)=>{e.preventDefault();if(name.trim()&&phone.trim()){setContacts((old:any[])=>[...old,{name:name.trim(),phone:phone.trim()}]);setName("");setPhone("");}}}><label>CONTACT NAME<input id="contact-name" value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="e.g. Alex" required/></label><label>PHONE NUMBER<input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="+91 98765 43210" required/></label><button className="primary-button full-button"><Plus size={15}/> Save contact</button><p className="footnote">Only add contacts with their knowledge. Contact sync is not connected yet.</p></form></Panel></div></>}
function ReportsPage({note,setNote}:any){return <><PageHeading eyebrow="INCIDENT RESPONSE" title="Incident reports." description="Keep track of suspicious interactions and find official reporting resources."/><div className="report-grid"><Panel title="CREATE AN INCIDENT NOTE" tag="PRIVATE DRAFT"><div className="report-intro"><div className="report-icon"><FileText size={22}/></div><div><b>Document what happened</b><p>Record the details while they're fresh. This note stays in this session until storage is connected.</p></div></div><label className="report-label">INCIDENT DETAILS<textarea value={note} onChange={(e:any)=>setNote(e.target.value)} placeholder="What happened? Include date, time, caller details, and why it seemed suspicious..." rows={6}/></label><button className="primary-button" onClick={()=>{const blob=new Blob([`VoiceShield Incident Note\n\n${note}\n\nCreated: ${new Date().toLocaleString()}`],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="voiceshield-incident-note.txt";a.click();URL.revokeObjectURL(a.href);}} disabled={!note.trim()}><FileText size={15}/> Download incident note</button></Panel><Panel title="OFFICIAL HELP IN INDIA" tag="VERIFIED ROUTES"><div className="official-resource"><div className="official-icon"><ShieldAlert size={20}/></div><div><b>National Cyber Crime Reporting Portal</b><p>Report suspected online financial fraud or cybercrime using the official government portal.</p><a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer">cybercrime.gov.in <ArrowUpRight size={13}/></a></div></div><div className="official-resource"><div className="official-icon pink"><Headphones size={20}/></div><div><b>Cyber financial fraud helpline</b><p>For suspected financial cyber fraud in India, call 1930 promptly and contact your bank.</p><strong className="helpline">1930</strong></div></div><div className="report-caution"><CircleHelp size={15}/><span>Voice risk scores are indicators, not proof. Preserve relevant evidence and verify details before submitting a report.</span></div></Panel></div></>}
function SettingsPage({email,onLogout}:any){return <><PageHeading eyebrow="PREFERENCES & PRIVACY" title="Settings." description="Manage your account and how VoiceShield handles your information."/><div className="settings-layout"><Panel title="ACCOUNT" tag="PROFILE"><div className="account-settings"><div className="settings-avatar">{(email||"U").slice(0,1).toUpperCase()}</div><div><b>{email||"Demo operator"}</b><span>Personal workspace</span><small>{supabaseConfigured?"Supabase authentication":"Preview session"}</small></div></div><button className="outline-button full-button" onClick={onLogout}><LogOut size={15}/> Sign out</button></Panel><Panel title="PRIVACY CENTER" tag="YOUR DATA"><div className="privacy-setting"><div className="privacy-setting-icon"><LockKeyhole size={17}/></div><div><b>Audio retention</b><p>Voice recordings are not saved by default in this starter app. Uploaded audio is sent to the configured backend for analysis.</p></div></div><div className="privacy-setting"><div className="privacy-setting-icon"><Fingerprint size={17}/></div><div><b>Session storage</b><p>Without a configured database, contacts, notes, and demo history exist only in the current app session.</p></div></div><div className="privacy-setting"><div className="privacy-setting-icon"><ShieldCheck size={17}/></div><div><b>Model transparency</b><p>Demo results are labelled. Real predictions require a validated model and should be treated as probabilistic indicators.</p></div></div></Panel></div></>}
export default App;