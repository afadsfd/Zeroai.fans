/* ZeroAI Redesign — cinematic dark, plasma-lime accent */
const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

/* ─────────────────────────────────────────── */
/* Helpers                                    */
/* ─────────────────────────────────────────── */
const cls = (...xs) => xs.filter(Boolean).join(' ');

function useTweaks() {
  const raw = document.getElementById('__tweaks')?.textContent || '';
  const m = raw.match(/\/\*EDITMODE-BEGIN\*\/([\s\S]*?)\/\*EDITMODE-END\*\//);
  const def = m ? JSON.parse(m[1]) : {};
  const [t, setT] = useState(def);
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--serif', t.serif);
  }, [t]);
  return [t, setT];
}

/* scramble text on mount */
function useScramble(final, on = true, speed = 22) {
  const [out, setOut] = useState(on ? '' : final);
  useEffect(() => {
    if (!on) { setOut(final); return; }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      let s = '';
      for (let j = 0; j < final.length; j++) {
        if (j < i) s += final[j];
        else if (final[j] === ' ') s += ' ';
        else s += chars[Math.floor(Math.random() * chars.length)];
      }
      setOut(s);
      if (i >= final.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [final, on, speed]);
  return out;
}

/* in-view trigger */
function useInView(ref, opt = { threshold: 0.15, once: true }) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); if (opt.once) io.disconnect(); }
      else if (!opt.once) setV(false);
    }, { threshold: opt.threshold });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return v;
}

/* counter animate */
function useCount(target, on, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setN(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, target]);
  return n;
}

/* ─────────────────────────────────────────── */
/* Cursor aura                                */
/* ─────────────────────────────────────────── */
function CursorAura() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener('mousemove', onMove);
    let raf;
    const tick = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      if (el) el.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} style={{
      position:'fixed', width:600, height:600, pointerEvents:'none', zIndex:0,
      background:'radial-gradient(circle, rgba(198,255,63,.08), rgba(198,255,63,0) 60%)',
      mixBlendMode:'screen', filter:'blur(20px)',
      top:0, left:0,
    }}/>
  );
}

/* ─────────────────────────────────────────── */
/* Nav                                        */
/* ─────────────────────────────────────────── */
function Nav({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', on); on();
    return () => window.removeEventListener('scroll', on);
  }, []);
  const items = [
    { h: '#about',    en: 'About',    zh: '关于' },
    { h: '#products', en: 'Products', zh: '产品' },
    { h: '#services', en: 'Services', zh: '服务' },
    { h: '#contact',  en: 'Contact',  zh: '联系' },
  ];
  return (
    <nav style={{
      position:'fixed', top:18, left:0, right:0, zIndex:50,
      display:'flex', justifyContent:'center', pointerEvents:'none',
    }}>
      <div style={{
        pointerEvents:'auto',
        display:'flex', alignItems:'center', gap:28,
        padding:'10px 14px 10px 20px',
        borderRadius:999,
        border:'1px solid var(--line-2)',
        background: scrolled ? 'rgba(10,10,11,.72)' : 'rgba(10,10,11,.35)',
        backdropFilter:'blur(16px) saturate(140%)',
        WebkitBackdropFilter:'blur(16px) saturate(140%)',
        transition:'background .3s',
      }}>
        <a href="#hero" style={{display:'flex',alignItems:'center',gap:8,fontFamily:'var(--sans)',fontWeight:600,letterSpacing:'-.01em'}}>
          <span style={{
            width:22,height:22,borderRadius:'50%',
            background:'conic-gradient(from 0deg, var(--accent), #fff, var(--accent))',
            animation:'spin 6s linear infinite',
            boxShadow:'0 0 20px rgba(198,255,63,.5)',
          }}/>
          <span>Zero<span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400,color:'var(--accent)'}}>AI</span></span>
        </a>
        <div style={{height:16,width:1,background:'var(--line-2)'}}/>
        <ul style={{display:'flex',gap:22,listStyle:'none',fontSize:13,color:'var(--ink-dim)'}}>
          {items.map(i => (
            <li key={i.h}>
              <a href={i.h} className="nav-link">
                {lang === 'zh' ? i.zh : i.en}
              </a>
            </li>
          ))}
        </ul>
        <div className="lang-switch" style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontFamily:'var(--mono)',padding:'4px',border:'1px solid var(--line-2)',borderRadius:999}}>
          <button onClick={()=>setLang('en')} style={{padding:'3px 8px',borderRadius:999,background:lang==='en'?'var(--accent)':'transparent',color:lang==='en'?'#000':'var(--ink-dim)'}}>EN</button>
          <button onClick={()=>setLang('zh')} style={{padding:'3px 8px',borderRadius:999,background:lang==='zh'?'var(--accent)':'transparent',color:lang==='zh'?'#000':'var(--ink-dim)'}}>中</button>
        </div>
        <a href="#contact" className="cta-pill">
          <span>{lang==='zh'?'联系我':'Get In Touch'}</span>
          <span className="arrow">→</span>
        </a>
      </div>
      <style>{`
        .nav-link{position:relative;transition:color .2s}
        .nav-link:hover{color:var(--ink)}
        .nav-link::after{content:'';position:absolute;left:0;bottom:-4px;width:0;height:1px;background:var(--accent);transition:width .25s}
        .nav-link:hover::after{width:100%}
        .cta-pill{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:var(--accent);color:#000;font-size:12px;font-weight:600;transition:transform .2s}
        .cta-pill:hover{transform:translateX(-2px)}
        .cta-pill:hover .arrow{transform:translateX(4px)}
        .cta-pill .arrow{transition:transform .2s}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </nav>
  );
}

/* ─────────────────────────────────────────── */
/* Hero                                       */
/* ─────────────────────────────────────────── */
function Hero({ lang }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 150); return () => clearTimeout(t); }, []);
  const title = useScramble('ZEROAI · CRYPTO × AI BUILDER', loaded);

  return (
    <section id="hero" style={{
      position:'relative', minHeight:'100vh',
      padding:'140px 40px 80px',
      display:'flex', flexDirection:'column', justifyContent:'center',
      overflow:'hidden',
    }}>
      {/* animated grid background */}
      <HeroGrid />
      {/* orbit rings */}
      <div style={{
        position:'absolute', right:-200, top:'50%', transform:'translateY(-50%)',
        width:900, height:900, pointerEvents:'none', opacity:.6,
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            position:'absolute', inset:i*60, borderRadius:'50%',
            border:'1px solid rgba(255,255,255,.06)',
            animation:`ring ${20+i*5}s linear infinite ${i%2?'reverse':''}`,
          }}>
            <div style={{
              position:'absolute', top:'50%', left:`${i===1?100:0}%`, width:6, height:6,
              borderRadius:'50%', background:'var(--accent)',
              boxShadow:'0 0 12px var(--accent)', transform:'translate(-50%,-50%)',
            }}/>
          </div>
        ))}
        <div style={{
          position:'absolute', inset:'35%', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(198,255,63,.25), transparent 70%)',
          filter:'blur(30px)', animation:'pulse 4s ease-in-out infinite',
        }}/>
      </div>

      <div style={{maxWidth:1280, margin:'0 auto', width:'100%', position:'relative'}}>
        {/* status pill */}
        <div className={cls('fade-in', loaded && 'is-in')} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'6px 12px 6px 8px',borderRadius:999,background:'rgba(198,255,63,.08)',border:'1px solid rgba(198,255,63,.25)',fontSize:11,fontFamily:'var(--mono)',letterSpacing:'.08em',marginBottom:28}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
            <span className="blip"/>
            <span style={{color:'var(--accent)'}}>{title}</span>
          </span>
        </div>

        {/* headline */}
        <h1 style={{
          fontFamily:'var(--sans)', fontWeight:500,
          fontSize:'clamp(48px, 7.4vw, 116px)', lineHeight:.95,
          letterSpacing:'-.035em',
          maxWidth:'15ch',
        }}>
          <SplitLine delay={100} active={loaded}>Building AI at</SplitLine>
          <SplitLine delay={180} active={loaded}>
            the <span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400,color:'var(--accent)'}}>Edge</span> of
          </SplitLine>
          <SplitLine delay={260} active={loaded}>Intelligence</SplitLine>
        </h1>
        <h2 style={{
          fontFamily:'var(--sans)', fontWeight:300,
          fontSize:'clamp(22px, 2.6vw, 40px)', lineHeight:1.1,
          letterSpacing:'-.02em', color:'var(--ink-dim)',
          marginTop:18, maxWidth:'18ch',
        }}>
          <SplitLine delay={420} active={loaded}>在加密与智能</SplitLine>
          <SplitLine delay={490} active={loaded}>
            的<span style={{color:'var(--ink)'}}>边界</span> 构建 AI
          </SplitLine>
        </h2>

        {/* sub copy */}
        <div className={cls('fade-in', loaded && 'is-in')} style={{transitionDelay:'.7s', marginTop:40, display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, maxWidth:820}}>
          <p style={{fontSize:15,lineHeight:1.6,color:'var(--ink-dim)',maxWidth:'38ch'}}>
            From <span style={{color:'var(--ink)',fontWeight:500}}>deep crypto operations</span> to AI product engineering — every product starts with a real business problem.
          </p>
          <p style={{fontSize:14,lineHeight:1.7,color:'var(--ink-dim)',maxWidth:'24ch'}}>
            从深厚的<span style={{color:'var(--ink)'}}>加密行业运营经验</span>出发，每一个 AI 产品都源于真实的业务痛点。
          </p>
        </div>

        {/* ctas */}
        <div className={cls('fade-in', loaded && 'is-in')} style={{transitionDelay:'.8s', marginTop:40, display:'flex', gap:14, flexWrap:'wrap'}}>
          <MagneticBtn href="#products" primary>
            <span>Explore Products</span>
            <span style={{opacity:.6,fontSize:12,fontFamily:'var(--mono)'}}>探索产品</span>
            <span className="arrow">↘</span>
          </MagneticBtn>
          <MagneticBtn href="#contact">
            <span>Work With Me</span>
            <span style={{opacity:.6,fontSize:12,fontFamily:'var(--mono)'}}>合作咨询</span>
          </MagneticBtn>
        </div>

        {/* stats */}
        <Stats loaded={loaded}/>
      </div>

      {/* scroll hint */}
      <div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',fontFamily:'var(--mono)',fontSize:10,letterSpacing:'.2em',color:'var(--ink-dim)',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
        <span>SCROLL</span>
        <div style={{width:1,height:40,background:'linear-gradient(to bottom, var(--accent), transparent)',animation:'drip 2s ease-in-out infinite'}}/>
      </div>

      <style>{`
        .fade-in{opacity:0;transform:translateY(20px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}
        .fade-in.is-in{opacity:1;transform:none}
        .blip{width:6px;height:6px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px var(--accent);animation:pulse 1.4s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
        @keyframes ring{to{transform:rotate(360deg)}}
        @keyframes drip{0%,100%{transform:scaleY(.4);transform-origin:top}50%{transform:scaleY(1)}}
      `}</style>
    </section>
  );
}

function SplitLine({ children, delay = 0, active }) {
  return (
    <span style={{display:'block', overflow:'hidden', paddingBottom:'.05em'}}>
      <span style={{
        display:'inline-block',
        transform: active ? 'translateY(0)' : 'translateY(110%)',
        transition:`transform 1s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
      }}>{children}</span>
    </span>
  );
}

function HeroGrid() {
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.5,pointerEvents:'none'}}>
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
        </pattern>
        <radialGradient id="gridMask" cx="50%" cy="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="m"><rect width="100%" height="100%" fill="url(#gridMask)"/></mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" mask="url(#m)"/>
    </svg>
  );
}

function MagneticBtn({ children, href, primary }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    const on = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x*.2}px, ${y*.3}px)`;
    };
    const off = () => el.style.transform = '';
    el.addEventListener('mousemove', on);
    el.addEventListener('mouseleave', off);
    return () => { el.removeEventListener('mousemove', on); el.removeEventListener('mouseleave', off); };
  }, []);
  return (
    <a ref={ref} href={href} className={cls('mgbtn', primary && 'primary')}>
      <style>{`
        .mgbtn{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:999px;border:1px solid var(--line-2);background:var(--card);backdrop-filter:blur(10px);font-size:14px;font-weight:500;transition:transform .3s cubic-bezier(.2,.8,.2,1),background .2s,border-color .2s;will-change:transform}
        .mgbtn:hover{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.25)}
        .mgbtn.primary{background:var(--accent);color:#000;border-color:var(--accent)}
        .mgbtn.primary:hover{background:#d6ff5a;box-shadow:0 0 40px rgba(198,255,63,.4)}
        .mgbtn .arrow{transition:transform .3s}
        .mgbtn:hover .arrow{transform:translate(3px,3px)}
      `}</style>
      {children}
    </a>
  );
}

function Stats({ loaded }) {
  const ref = useRef();
  const inView = useInView(ref);
  const on = loaded && inView;
  const items = [
    { v: 3, label: 'AI Products', zh: 'AI 产品', suffix:'' },
    { v: 2, label: 'Live & Deployed', zh: '已上线产品', suffix:'' },
    { v: 50, label: 'Languages Supported', zh: '支持语言数', suffix:'+' },
    { v: 'Web3', label: 'Native Expertise', zh: '原生专业背景' },
  ];
  return (
    <div ref={ref} style={{marginTop:80, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, borderTop:'1px solid var(--line)'}}>
      {items.map((s,i) => (
        <div key={i} style={{padding:'24px 22px 0',borderRight: i<3?'1px solid var(--line)':'none',position:'relative'}}>
          <div style={{display:'flex',alignItems:'baseline',gap:4}}>
            {typeof s.v === 'number' ? (
              <span style={{fontFamily:'var(--serif)',fontSize:72,lineHeight:.9,letterSpacing:'-.02em'}}>
                <Counter to={s.v} on={on}/>
              </span>
            ) : (
              <span style={{fontFamily:'var(--serif)',fontSize:72,lineHeight:.9,letterSpacing:'-.02em',fontStyle:'italic',color:'var(--accent)'}}>{s.v}</span>
            )}
            {s.suffix && <span style={{fontFamily:'var(--serif)',fontSize:48,color:'var(--accent)'}}>{s.suffix}</span>}
          </div>
          <div style={{marginTop:12,fontSize:12,color:'var(--ink-dim)',fontFamily:'var(--mono)',letterSpacing:'.05em',textTransform:'uppercase'}}>
            {s.label}
          </div>
          <div style={{fontSize:11,color:'var(--ink-dim)',marginTop:2}}>{s.zh}</div>
        </div>
      ))}
    </div>
  );
}

function Counter({ to, on }) {
  const v = useCount(to, on);
  return <>{Math.floor(v)}</>;
}

/* ─────────────────────────────────────────── */
/* Section heading                            */
/* ─────────────────────────────────────────── */
function SectionLabel({ idx, en, zh }) {
  const ref = useRef();
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{display:'flex',alignItems:'center',gap:14,fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--ink-dim)'}}>
      <span style={{display:'inline-block',width:inView?40:0,height:1,background:'var(--accent)',transition:'width .8s cubic-bezier(.2,.8,.2,1)'}}/>
      <span style={{color:'var(--accent)'}}>{idx}</span>
      <span>{en}</span>
      <span style={{color:'var(--ink-dim)',opacity:.6}}>· {zh}</span>
    </div>
  );
}

function BigTitle({ children, sub, cn }) {
  const ref = useRef();
  const v = useInView(ref);
  return (
    <div ref={ref} style={{marginTop:20}}>
      <h2 style={{
        fontFamily:'var(--sans)',fontWeight:500,
        fontSize:'clamp(36px,5.2vw,80px)',letterSpacing:'-.03em',lineHeight:1,
        opacity:v?1:0,transform:v?'none':'translateY(30px)',
        transition:'opacity 1s cubic-bezier(.2,.8,.2,1), transform 1s cubic-bezier(.2,.8,.2,1)',
      }}>{children}</h2>
      {cn && (
        <div style={{
          fontFamily:'var(--sans)',fontWeight:300,
          fontSize:'clamp(18px,1.9vw,30px)',color:'var(--ink-dim)',
          marginTop:12,letterSpacing:'-.01em',lineHeight:1.15,
          opacity:v?1:0,transform:v?'none':'translateY(20px)',
          transition:'opacity 1s cubic-bezier(.2,.8,.2,1) .12s, transform 1s cubic-bezier(.2,.8,.2,1) .12s',
        }}>{cn}</div>
      )}
      {sub && (
        <p style={{marginTop:18, fontSize:16, color:'var(--ink-dim)', maxWidth:640, lineHeight:1.5,
          opacity:v?1:0,transform:v?'none':'translateY(20px)',
          transition:'opacity 1s cubic-bezier(.2,.8,.2,1) .15s, transform 1s cubic-bezier(.2,.8,.2,1) .15s',
        }}>{sub}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* About                                      */
/* ─────────────────────────────────────────── */
function About() {
  const tags = ['Crypto Operations','AI Product Dev','Web3 Native','Multi-platform','Business Automation','DeFi'];
  return (
    <section id="about" style={{padding:'140px 40px', position:'relative'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <SectionLabel idx="01" en="About" zh="关于我"/>
        <div style={{display:'grid',gridTemplateColumns:'1.2fr .9fr',gap:80,alignItems:'start',marginTop:24}}>
          <div>
            <h2 style={{fontFamily:'var(--sans)',fontWeight:500,fontSize:'clamp(36px,5vw,72px)',letterSpacing:'-.03em',lineHeight:1.02}}>
              From Crypto Ops to{' '}
              <span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400,color:'var(--accent)'}}>AI Builder</span>
            </h2>
            <div style={{fontFamily:'var(--sans)',fontWeight:300,fontSize:22,color:'var(--ink-dim)',letterSpacing:'-.01em',marginTop:10}}>
              从加密运营 到 <span style={{fontFamily:'var(--serif)',fontStyle:'italic',color:'var(--ink)'}}>AI 产品构建者</span>
            </div>
            <div style={{marginTop:40,display:'flex',flexDirection:'column',gap:28,maxWidth:620}}>
              <p style={{fontSize:17,lineHeight:1.55}}>
                Years operating at the frontier of the crypto industry gave me something most AI builders don't have — a <span style={{color:'var(--accent)'}}>visceral understanding of real business pain</span>. I know what breaks, what scales, and what users actually need.
              </p>
              <p style={{fontSize:14,lineHeight:1.7,color:'var(--ink-dim)'}}>
                多年在加密行业前线的运营经验，让我拥有大多数 AI 产品人所没有的东西——对<span style={{color:'var(--ink)'}}>真实业务痛点的深刻理解</span>。我清楚什么会出问题，什么能规模化，用户真正需要什么。
              </p>
              <p style={{fontSize:17,lineHeight:1.55}}>
                Now I build AI products — not to chase trends, but to solve problems I've personally lived through. ZeroAI is the vessel for that journey.
              </p>
              <p style={{fontSize:14,lineHeight:1.7,color:'var(--ink-dim)'}}>
                现在我构建 AI 产品，不是为了追风口，而是为了解决我亲身经历过的问题。ZeroAI 是这段旅程的载体。
              </p>
            </div>

            <div style={{marginTop:40,display:'flex',flexWrap:'wrap',gap:8}}>
              {tags.map((t,i) => (
                <span key={i} className="tagchip" style={{animationDelay:`${i*.07}s`}}>{t}</span>
              ))}
            </div>
            <style>{`
              .tagchip{padding:7px 14px;border:1px solid var(--line-2);border-radius:999px;font-size:12px;font-family:var(--mono);color:var(--ink-dim);transition:all .3s}
              .tagchip:hover{background:var(--accent);color:#000;border-color:var(--accent);transform:translateY(-2px)}
            `}</style>
          </div>

          <ProfileCard/>
        </div>

        {/* pull quote */}
        <div style={{marginTop:120,borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)',padding:'56px 0',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60}}>
          <div>
            <div style={{fontFamily:'var(--serif)',fontSize:48,color:'var(--accent)',lineHeight:1,height:30}}>"</div>
            <p style={{fontFamily:'var(--serif)',fontSize:'clamp(26px,2.6vw,38px)',lineHeight:1.2,letterSpacing:'-.01em',marginTop:10}}>
              Every product I build solves a problem I've seen with my own eyes. No vaporware. No demos. <em style={{color:'var(--accent)'}}>Just tools that work.</em>
            </p>
          </div>
          <div>
            <div style={{fontFamily:'var(--serif)',fontSize:48,color:'var(--ink-dim)',lineHeight:1,height:30}}>「</div>
            <p style={{fontFamily:'var(--serif)',fontSize:'clamp(22px,2.2vw,32px)',lineHeight:1.35,color:'var(--ink-dim)',marginTop:10}}>
              每一个产品，都源于我亲眼见过的真实问题。不做 PPT 产品，不做 Demo 展示，<span style={{color:'var(--ink)'}}>只做真正能用的工具。</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileCard() {
  const ref = useRef();
  const v = useInView(ref);
  const rows = [
    ['Identity','身份','ZeroAI'],
    ['Domain','领域','Crypto × AI'],
    ['Products Built','已构建产品','3'],
    ['Live Products','已上线','2 ↑'],
    ['Philosophy','理念','Real Use Cases / 真实场景优先'],
    ['Status','—','Builder Mode / 构建中'],
  ];
  return (
    <div ref={ref} style={{
      position:'sticky',top:100,
      background:'linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01))',
      border:'1px solid var(--line-2)', borderRadius:20, padding:28,
      backdropFilter:'blur(12px)',
      opacity:v?1:0, transform:v?'none':'translateY(30px)',
      transition:'all 1s cubic-bezier(.2,.8,.2,1)',
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:10,height:10,borderRadius:'50%',background:'var(--accent)',boxShadow:'0 0 12px var(--accent)',animation:'pulse 1.6s ease-in-out infinite'}}/>
          <span style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:'var(--ink-dim)'}}>Profile</span>
        </div>
        <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--ink-dim)'}}>SYS.ID-0xAI</span>
      </div>

      {/* avatar placeholder */}
      <div style={{position:'relative',height:180,borderRadius:14,overflow:'hidden',background:'#0a0a0b',border:'1px solid var(--line)',marginBottom:20}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0 1px, transparent 1px 10px)'}}/>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 30% 40%, rgba(198,255,63,.22), transparent 55%)'}}/>
        <AsciiFace/>
        <div style={{position:'absolute',bottom:10,left:12,fontFamily:'var(--mono)',fontSize:10,color:'var(--ink-dim)'}}>
          // operator.render()
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:0}}>
        {rows.map(([k,kz,val],i) => (
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'12px 0',borderBottom: i<rows.length-1 ? '1px dashed var(--line)' : 'none'}}>
            <span style={{fontSize:12}}>
              <span style={{color:'var(--ink)'}}>{k}</span>
              <span style={{color:'var(--ink-dim)',marginLeft:6,fontSize:11}}>{kz}</span>
            </span>
            <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--accent)',textAlign:'right',maxWidth:'60%'}}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AsciiFace(){
  const [frame, setFrame] = useState(0);
  useEffect(()=>{ const id = setInterval(()=>setFrame(f=>f+1), 600); return ()=>clearInterval(id); },[]);
  const art = [
`    ┌─────────────┐
    │  ▲   ▲      │
    │             │
    │     ─       │
    │   ◟   ◞     │
    └─────────────┘`,
`    ┌─────────────┐
    │  ●   ●      │
    │             │
    │     ─       │
    │   ◟   ◞     │
    └─────────────┘`,
  ];
  return (
    <pre style={{
      position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:'var(--mono)',fontSize:12,color:'var(--ink)',margin:0,
    }}>{art[frame%2]}</pre>
  );
}

/* ─────────────────────────────────────────── */
/* Products                                   */
/* ─────────────────────────────────────────── */
const PRODUCTS = [
  {
    id:'meetsimul', status:'LIVE', statusZh:'已上线',
    name:'Meet', italic:'Simul',
    desc:"AI-powered simultaneous interpretation for every online meeting — speak your language, they hear theirs.",
    descZh:'AI 驱动的实时同声传译，兼容所有主流会议平台。你说中文，对方听英文。',
    stats:[
      {v:'<0.5s', k:'Latency', kz:'延迟'},
      {v:'50+',   k:'Languages', kz:'支持语种'},
      {v:'7+',    k:'Platforms', kz:'会议平台'},
      {v:'Free',  k:'To Try', kz:'试用'},
    ],
    bullets:[
      ['Zoom, Teams, Meet, Webex, 腾讯会议, 飞书, 钉钉', '兼容 Zoom、Teams、腾讯会议、飞书、钉钉等 7+ 平台'],
      ['System-level audio bridge — no plugins or API keys required', '系统级音频桥接，无需插件，无需平台 API'],
      ['Natural AI voice synthesis — sounds human, not robotic', 'AI 自然语音合成，听起来像真人，不像机器'],
      ['14-day free trial, macOS app, under 6MB', '14 天免费试用，macOS 应用，不足 6MB'],
    ],
    cta:{label:'Launch App →', zh:'立即体验 →', href:'https://afadsfd.github.io/AI/'},
    visual:'waves',
  },
  {
    id:'cryptobox', status:'LIVE', statusZh:'已上线',
    name:'Crypto', italic:'Box',
    desc:'All your exchange balances in one dashboard. API keys encrypted on-device, never leave your phone.',
    descZh:'聚合多交易所资产，API 密钥本地加密存储，零服务器风险，一屏掌握全部持仓。',
    stats:[
      {v:'6',     k:'Exchanges', kz:'交易所'},
      {v:'0',     k:'Registration', kz:'注册'},
      {v:'Free',  k:'Forever', kz:'永久免费'},
      {v:'Local', k:'Keys Only', kz:'密钥本地'},
    ],
    chips:['Binance','OKX','Bybit','Gate','Coinbase','Bitget'],
    bullets:[
      ['iOS Keychain / Android Keystore — hardware-level encryption', 'iOS Keychain / Android Keystore 硬件级加密'],
      ['Read-only API access — no withdrawal risk, ever', '只读 API，从架构上杜绝提币风险'],
      ['Real-time P&L with 7 / 30 / 90-day history charts', '实时持仓盈亏 + 7/30/90 天历史曲线'],
      ['~21MB install, no account, no tracking', '约 21MB，无账号，无追踪'],
    ],
    cta:{label:'Try Now →', zh:'立即体验 →', href:'https://afadsfd.github.io/CryptoBox/'},
    visual:'portfolio',
  },
  {
    id:'predmarket', status:'COMING SOON', statusZh:'即将上线',
    name:'Pred', italic:'Market',
    desc:'Prediction market aggregator — all platforms, one view, built for crypto-native traders.',
    descZh:'预测市场聚合器，多平台数据汇总，专为加密原生用户打造。',
    chips:['Multi-platform','Real-time data','Info arbitrage','多平台聚合','实时数据','信息套利'],
    cta:{label:'Join Waitlist →', zh:'加入等待名单 →', href:'#contact'},
    visual:'orbs',
    soon:true,
  },
];

function Products() {
  return (
    <section id="products" style={{padding:'140px 40px', position:'relative'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <SectionLabel idx="02" en="Products" zh="产品"/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:40,flexWrap:'wrap',marginTop:20}}>
          <BigTitle cn={<><span style={{fontFamily:'var(--serif)',fontStyle:'italic',color:'var(--ink)'}}>ZeroAI</span> 旗下产品</>}>
            Products by <span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400,color:'var(--accent)'}}>ZeroAI</span>
          </BigTitle>
          <div style={{maxWidth:380}}>
            <p style={{fontSize:14,lineHeight:1.6}}>Each product starts with a real pain point — built to be used, not just demonstrated.</p>
            <p style={{fontSize:13,lineHeight:1.7,color:'var(--ink-dim)',marginTop:10}}>每个产品都从真实痛点出发，做真正可用的工具，而非 Demo。</p>
          </div>
        </div>

        <div style={{marginTop:70,display:'flex',flexDirection:'column',gap:40}}>
          {PRODUCTS.map((p,i) => <ProductCard key={p.id} p={p} i={i}/>)}
        </div>

        <div style={{marginTop:60,textAlign:'center',padding:'40px 0',borderTop:'1px solid var(--line)'}}>
          <p style={{fontFamily:'var(--serif)',fontSize:26,fontStyle:'italic'}}>
            More products in development — <span style={{color:'var(--accent)'}}>ZeroAI is just getting started</span>
          </p>
          <p style={{marginTop:10,color:'var(--ink-dim)',fontSize:14}}>
            更多产品正在开发中 — <span style={{fontStyle:'italic'}}>ZeroAI 才刚开始</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ p, i }) {
  const ref = useRef();
  const v = useInView(ref, { threshold: 0.1 });
  const [hover, setHover] = useState(false);
  return (
    <article
      ref={ref}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        position:'relative',
        borderRadius:24,
        border:'1px solid var(--line-2)',
        background:'linear-gradient(180deg, rgba(255,255,255,.025), rgba(255,255,255,.005))',
        overflow:'hidden',
        opacity:v?1:0, transform:v?'translateY(0)':'translateY(40px)',
        transition:`opacity 1s cubic-bezier(.2,.8,.2,1) ${i*.1}s, transform 1s cubic-bezier(.2,.8,.2,1) ${i*.1}s, border-color .3s`,
        borderColor: hover? 'rgba(198,255,63,.35)' : 'var(--line-2)',
      }}
    >
      {/* glow on hover */}
      <div style={{
        position:'absolute',inset:-1,borderRadius:24,pointerEvents:'none',
        background:'radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(198,255,63,.12), transparent 40%)',
        opacity:hover?1:0, transition:'opacity .3s',
      }}/>

      <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr', minHeight:480}}>
        {/* LEFT */}
        <div style={{padding:'36px 40px',display:'flex',flexDirection:'column',gap:24,borderRight:'1px solid var(--line)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{
              padding:'4px 10px',borderRadius:999,fontSize:10,fontFamily:'var(--mono)',letterSpacing:'.15em',
              background: p.soon ? 'rgba(255,255,255,.06)' : 'rgba(198,255,63,.12)',
              color: p.soon ? 'var(--ink-dim)' : 'var(--accent)',
              border:`1px solid ${p.soon?'var(--line-2)':'rgba(198,255,63,.3)'}`,
              display:'inline-flex',alignItems:'center',gap:6,
            }}>
              <span style={{width:6,height:6,borderRadius:'50%',background:p.soon?'#888':'var(--accent)',boxShadow:p.soon?'':'0 0 8px var(--accent)'}}/>
              {p.status} · {p.statusZh}
            </span>
            <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--ink-dim)'}}>0{i+1} / 0{PRODUCTS.length}</span>
          </div>

          <h3 style={{fontFamily:'var(--sans)',fontWeight:500,fontSize:'clamp(48px,5.5vw,84px)',letterSpacing:'-.035em',lineHeight:.95}}>
            {p.name}<span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400,color:'var(--accent)'}}>{p.italic}</span>
          </h3>

          <div>
            <p style={{fontSize:16,lineHeight:1.55,maxWidth:'44ch'}}>{p.desc}</p>
            <p style={{fontSize:13,lineHeight:1.7,color:'var(--ink-dim)',marginTop:8,maxWidth:'34ch'}}>{p.descZh}</p>
          </div>

          {p.stats && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)'}}>
              {p.stats.map((s,j) => (
                <div key={j} style={{padding:'14px 0',borderRight:j<3?'1px solid var(--line)':'none',paddingLeft:j===0?0:14}}>
                  <div style={{fontFamily:'var(--serif)',fontSize:28,letterSpacing:'-.02em'}}>{s.v}</div>
                  <div style={{fontSize:11,color:'var(--ink-dim)',fontFamily:'var(--mono)',letterSpacing:'.05em',textTransform:'uppercase',marginTop:4}}>{s.k}</div>
                  <div style={{fontSize:10,color:'var(--ink-dim)'}}>{s.kz}</div>
                </div>
              ))}
            </div>
          )}

          {p.chips && (
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {p.chips.map((c,j) => <span key={j} style={{padding:'5px 10px',border:'1px solid var(--line-2)',borderRadius:6,fontSize:11,fontFamily:'var(--mono)',color:'var(--ink-dim)'}}>{c}</span>)}
            </div>
          )}

          {p.bullets && (
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:10}}>
              {p.bullets.map((b,j) => (
                <li key={j} style={{display:'flex',gap:12,fontSize:13}}>
                  <span style={{color:'var(--accent)',fontFamily:'var(--mono)',fontSize:10,marginTop:3}}>◆</span>
                  <span>
                    <div>{b[0]}</div>
                    <div style={{color:'var(--ink-dim)',fontSize:12,marginTop:2}}>{b[1]}</div>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div style={{marginTop:'auto',paddingTop:14}}>
            <a href={p.cta.href} target={p.cta.href.startsWith('http')?'_blank':undefined} rel="noreferrer"
               className="prodcta">
              <span>{p.cta.label}</span>
              <span style={{color:'var(--ink-dim)',fontSize:12}}>{p.cta.zh}</span>
            </a>
            <style>{`
              .prodcta{display:inline-flex;align-items:center;gap:10px;padding:12px 20px;border-radius:12px;background:var(--accent);color:#000;font-weight:600;font-size:14px;transition:all .2s;border:1px solid var(--accent)}
              .prodcta:hover{background:#d6ff5a;box-shadow:0 0 30px rgba(198,255,63,.3);transform:translateX(2px)}
            `}</style>
          </div>
        </div>

        {/* RIGHT — visual */}
        <div style={{position:'relative',overflow:'hidden',background:'linear-gradient(135deg,#0d0e10, #0a0a0b)'}}>
          <ProductVisual kind={p.visual} hover={hover}/>
        </div>
      </div>
    </article>
  );
}

function ProductVisual({ kind, hover }) {
  if (kind === 'waves') return <WavesVisual hover={hover}/>;
  if (kind === 'portfolio') return <PortfolioVisual hover={hover}/>;
  return <OrbsVisual hover={hover}/>;
}

function WavesVisual({ hover }) {
  return (
    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'28px 32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,fontFamily:'var(--mono)',fontSize:11,color:'var(--ink-dim)'}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#ff6b5d'}}/>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#ffd25d'}}/>
          <span style={{width:8,height:8,borderRadius:'50%',background:'var(--accent)'}}/>
          <span style={{marginLeft:8}}>meetsimul · live</span>
        </div>
        <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)'}}>● REC</span>
      </div>

      <div style={{flex:1,padding:'0 32px',display:'flex',flexDirection:'column',justifyContent:'center',gap:28}}>
        <div>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--ink-dim)',marginBottom:8}}>ZH → EN · 0.3s</div>
          <div style={{fontSize:16,fontWeight:500}}>你好，感谢今天来参加会议</div>
          <AudioWave color="#8a8a8a" animate={hover}/>
        </div>

        <div style={{paddingLeft:20,borderLeft:'2px solid var(--accent)'}}>
          <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',marginBottom:8}}>EN OUT · synthesized</div>
          <div style={{fontSize:18,fontWeight:500,color:'var(--accent)',fontFamily:'var(--serif)',fontStyle:'italic'}}>"Hello, thanks for joining today's meeting"</div>
          <AudioWave color="var(--accent)" animate={hover}/>
        </div>

        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['Zoom','Teams','Meet','腾讯','飞书','钉钉','Webex'].map((p,i)=>(
            <span key={i} style={{padding:'4px 10px',border:'1px solid var(--line-2)',borderRadius:6,fontSize:10,fontFamily:'var(--mono)',color:'var(--ink-dim)',background:'rgba(255,255,255,.02)'}}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudioWave({ color, animate }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:3,height:28,marginTop:10}}>
      {Array.from({length:40}).map((_,i) => (
        <div key={i} style={{
          width:2,borderRadius:2,background:color,
          height:`${20 + Math.sin(i*.6)*40 + Math.random()*20}%`,
          animation: animate ? `wave 1.2s ease-in-out ${i*.03}s infinite alternate` : 'none',
        }}/>
      ))}
      <style>{`@keyframes wave{to{height:90%}}`}</style>
    </div>
  );
}

function PortfolioVisual({ hover }) {
  const holdings = [
    { name:'BTC', v:42380.12, pct:+2.34, color:'#f7931a' },
    { name:'ETH', v:18920.50, pct:+1.12, color:'#627eea' },
    { name:'SOL', v:6240.00, pct:-0.48, color:'#c6ff3f' },
    { name:'USDT', v:12400.00, pct:0, color:'#888' },
  ];
  const total = holdings.reduce((a,b)=>a+b.v,0);
  return (
    <div style={{position:'absolute',inset:0,padding:'28px 32px',display:'flex',flexDirection:'column',gap:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--ink-dim)'}}>TOTAL PORTFOLIO</span>
        <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',display:'flex',alignItems:'center',gap:6}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',boxShadow:'0 0 8px var(--accent)'}}/>
          SYNC · 6 exchanges
        </span>
      </div>
      <div>
        <div style={{fontFamily:'var(--serif)',fontSize:56,lineHeight:1,letterSpacing:'-.02em'}}>
          ${total.toLocaleString(undefined,{maximumFractionDigits:2})}
        </div>
        <div style={{marginTop:6,fontSize:13,color:'var(--accent)'}}>+$1,847.22 · +2.38% · 24h</div>
      </div>

      {/* mini chart */}
      <svg viewBox="0 0 300 80" style={{width:'100%',height:80}}>
        <defs>
          <linearGradient id="pg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".5"/>
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={(()=>{
          let d='M 0 50';
          for (let i=1;i<=30;i++){
            const x = i*10;
            const y = 50 - Math.sin(i*.4)*15 - Math.random()*6;
            d += ` L ${x} ${y}`;
          }
          return d;
        })()} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
        <path d={`M 0 80 ${Array.from({length:30}).map((_,i)=>`L ${(i+1)*10} ${50 - Math.sin((i+1)*.4)*15}`).join(' ')} L 300 80 Z`} fill="url(#pg)"/>
      </svg>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {holdings.map((h,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:10,background:'rgba(255,255,255,.02)',border:'1px solid var(--line)'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:h.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#000'}}>{h.name[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500}}>{h.name}</div>
              <div style={{fontSize:11,color:'var(--ink-dim)',fontFamily:'var(--mono)'}}>${h.v.toLocaleString()}</div>
            </div>
            <div style={{fontSize:12,fontFamily:'var(--mono)',color:h.pct>0?'var(--accent)':h.pct<0?'#ff6b5d':'var(--ink-dim)'}}>{h.pct>0?'+':''}{h.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrbsVisual({ hover }){
  return (
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <svg viewBox="-200 -200 400 400" style={{width:'90%',height:'90%'}}>
        <defs>
          <radialGradient id="og" cx="50%" cy="50%">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".6"/>
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="0" cy="0" r="60" fill="url(#og)"/>
        {[0,1,2,3,4,5].map(i=>{
          const r = 80 + i*18;
          return <circle key={i} cx="0" cy="0" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeDasharray={i%2?'4 6':'none'}/>;
        })}
        {[0,45,90,135,180,225,270,315].map((a,i)=>{
          const r = 90 + (i%3)*24;
          const x = Math.cos(a*Math.PI/180)*r;
          const y = Math.sin(a*Math.PI/180)*r;
          return (
            <g key={i} style={{transformOrigin:'0 0',animation:`rotate ${20+i*3}s linear infinite`}}>
              <circle cx={x} cy={y} r={3+i%3} fill="var(--accent)" opacity=".7"/>
            </g>
          );
        })}
        <text x="0" y="6" textAnchor="middle" fill="var(--ink)" fontFamily="var(--serif)" fontStyle="italic" fontSize="22">PredMarket</text>
        <text x="0" y="30" textAnchor="middle" fill="var(--ink-dim)" fontFamily="var(--mono)" fontSize="10">aggregating…</text>
      </svg>
      <style>{`@keyframes rotate{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* Services                                   */
/* ─────────────────────────────────────────── */
const SERVICES = [
  { n:'01', en:'AI Product Consulting', zh:'AI 产品咨询与规划',
    desc:'Turn business pain points into AI product blueprints. From ideation to architecture to go-to-market strategy.',
    descZh:'帮助你将业务痛点转化为可落地的 AI 产品方案，从 0 到 1 全程规划。',
    for:'Founders & Teams', forZh:'创业团队' },
  { n:'02', en:'Meeting AI Solutions', zh:'会议 AI 解决方案',
    desc:'Enterprise multilingual meeting systems built on MeetSimul — custom translation, transcription and automation.',
    descZh:'基于 MeetSimul 为企业定制多语言会议系统、同声传译与会议记录自动化。',
    for:'Global Teams & DAOs', forZh:'跨国团队 & DAO' },
  { n:'03', en:'Crypto × AI Development', zh:'加密 × AI 产品开发',
    desc:'AI tooling built for the crypto industry: asset management, data analytics, and operational automation.',
    descZh:'专为加密行业构建 AI 工具：资产管理、数据分析与运营自动化。',
    for:'Exchanges & Projects', forZh:'交易所 & 项目方' },
  { n:'04', en:'Partnership & Collaboration', zh:'早期项目合作',
    desc:"Open to early-stage collaborations. If you need a builder with Crypto + AI background, let's talk.",
    descZh:'开放早期项目合作，欢迎需要 Crypto + AI 复合背景的创始人探讨。',
    for:'Early-stage Founders', forZh:'早期创业者' },
];

function Services() {
  return (
    <section id="services" style={{padding:'140px 40px',position:'relative'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <SectionLabel idx="03" en="Services" zh="服务"/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',gap:40,flexWrap:'wrap',marginTop:20}}>
          <BigTitle cn={<><span style={{fontFamily:'var(--serif)',fontStyle:'italic',color:'var(--ink)'}}>ZeroAI</span> 能为你做什么</>}>
            What <span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400,color:'var(--accent)'}}>ZeroAI</span> Can Do For You
          </BigTitle>
          <div style={{maxWidth:380}}>
            <p style={{fontSize:14,lineHeight:1.6}}>Combining deep crypto expertise with AI development capability to solve real problems.</p>
            <p style={{fontSize:13,lineHeight:1.7,color:'var(--ink-dim)',marginTop:10}}>结合深厚的加密行业经验与 AI 开发能力，为你的业务创造真实价值。</p>
          </div>
        </div>

        <div style={{marginTop:60,display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,border:'1px solid var(--line)'}}>
          {SERVICES.map((s,i)=> <ServiceCard key={s.n} s={s} i={i}/>)}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ s, i }) {
  const ref = useRef();
  const v = useInView(ref, { threshold: 0.2 });
  const [hover, setHover] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        position:'relative',padding:'40px 36px 36px',
        borderRight:i%2===0?'1px solid var(--line)':'none',
        borderBottom:i<2?'1px solid var(--line)':'none',
        minHeight:280,
        opacity:v?1:0, transform:v?'translateY(0)':'translateY(30px)',
        transition:`all .9s cubic-bezier(.2,.8,.2,1) ${i*.1}s, background .3s`,
        background:hover?'rgba(198,255,63,.02)':'transparent',
        cursor:'default',
      }}>
      <div style={{position:'absolute',top:0,left:0,height:hover?'100%':0,width:2,background:'var(--accent)',transition:'height .35s cubic-bezier(.2,.8,.2,1)'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:24}}>
        <span style={{fontFamily:'var(--serif)',fontSize:48,fontStyle:'italic',color:'var(--accent)',lineHeight:1}}>{s.n}</span>
        <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--ink-dim)',textAlign:'right'}}>
          → {s.for}<br/><span style={{opacity:.6}}>适合：{s.forZh}</span>
        </span>
      </div>
      <h3 style={{fontFamily:'var(--sans)',fontWeight:500,fontSize:28,letterSpacing:'-.02em',lineHeight:1.05}}>{s.en}</h3>
      <div style={{fontSize:15,color:'var(--ink-dim)',marginTop:4}}>{s.zh}</div>
      <p style={{marginTop:20,fontSize:14,lineHeight:1.55,maxWidth:'42ch'}}>{s.desc}</p>
      <p style={{marginTop:8,fontSize:12,lineHeight:1.7,color:'var(--ink-dim)',maxWidth:'32ch'}}>{s.descZh}</p>

      <div style={{position:'absolute',right:28,bottom:28,fontFamily:'var(--mono)',fontSize:14,color:'var(--accent)',opacity:hover?1:0,transform:hover?'translateX(0)':'translateX(-10px)',transition:'all .3s'}}>
        →
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* Contact                                    */
/* ─────────────────────────────────────────── */
function Contact() {
  return (
    <section id="contact" style={{padding:'140px 40px 80px',position:'relative',overflow:'hidden'}}>
      {/* giant italic backdrop */}
      <div aria-hidden style={{
        position:'absolute',bottom:-40,left:'50%',transform:'translateX(-50%)',
        fontFamily:'var(--serif)',fontStyle:'italic',fontSize:'clamp(200px, 30vw, 480px)',
        color:'rgba(255,255,255,.025)',pointerEvents:'none',whiteSpace:'nowrap',
        lineHeight:.8,
      }}>ZeroAI</div>

      <div style={{maxWidth:1280,margin:'0 auto',position:'relative'}}>
        <SectionLabel idx="04" en="Contact" zh="联系"/>
        <BigTitle cn={<>与我 <span style={{fontFamily:'var(--serif)',fontStyle:'italic',color:'var(--ink)'}}>建立连接</span></>}>
          Let's <span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400,color:'var(--accent)'}}>Connect</span>
        </BigTitle>
        <p style={{fontSize:17,color:'var(--ink-dim)',marginTop:22}}>Have a product idea? Want to collaborate? Let's talk.</p>
        <p style={{fontSize:14,color:'var(--ink-dim)',marginTop:4}}>有产品想法？想聊聊合作？随时联系。</p>

        <div style={{marginTop:60,display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <ContactCard href="mailto:lz3862680@gmail.com" label="Email" value="lz3862680@gmail.com" icon="✉"/>
          <ContactCard href="https://t.me/sky87531" label="Telegram" value="@sky87531" icon="✈"/>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ href, label, value, icon }) {
  const [hover, setHover] = useState(false);
  return (
    <a href={href} target={href.startsWith('http')?'_blank':undefined} rel="noreferrer"
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        position:'relative',padding:'36px 32px',borderRadius:20,
        border:'1px solid var(--line-2)',
        background:'linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.005))',
        display:'flex',flexDirection:'column',gap:18,
        overflow:'hidden',transition:'all .3s',
        borderColor:hover?'var(--accent)':'var(--line-2)',
      }}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(400px circle at 20% 100%, rgba(198,255,63,.12), transparent 60%)',opacity:hover?1:0,transition:'opacity .3s'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',position:'relative'}}>
        <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--ink-dim)',letterSpacing:'.2em',textTransform:'uppercase'}}>{label}</span>
        <span style={{fontSize:28,color:'var(--accent)',transition:'transform .3s',transform:hover?'translate(4px,-4px) rotate(-10deg)':'none'}}>↗</span>
      </div>
      <div style={{fontFamily:'var(--serif)',fontSize:'clamp(28px, 3.4vw, 44px)',letterSpacing:'-.01em',lineHeight:1.1,wordBreak:'break-all',position:'relative'}}>{value}</div>
    </a>
  );
}

/* ─────────────────────────────────────────── */
/* Footer                                     */
/* ─────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{padding:'40px 40px 30px',borderTop:'1px solid var(--line)',position:'relative',zIndex:2}}>
      <div style={{maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',gap:20,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:600}}>
          <span style={{width:18,height:18,borderRadius:'50%',background:'conic-gradient(from 0deg, var(--accent), #fff, var(--accent))',animation:'spin 6s linear infinite'}}/>
          Zero<span style={{fontFamily:'var(--serif)',fontStyle:'italic',fontWeight:400,color:'var(--accent)'}}>AI</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4,fontSize:12,color:'var(--ink-dim)',textAlign:'center'}}>
          <span>© 2025 ZeroAI · All rights reserved</span>
          <span>© 2025 ZeroAI · 保留所有权利</span>
        </div>
        <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--ink-dim)',letterSpacing:'.15em'}}>CRYPTO × INTELLIGENCE</div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────── */
/* Marquee — between sections                 */
/* ─────────────────────────────────────────── */
function Marquee({ text }) {
  return (
    <div style={{borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)',overflow:'hidden',padding:'22px 0',margin:'0'}}>
      <div style={{display:'flex',gap:56,animation:'marquee 30s linear infinite',whiteSpace:'nowrap'}}>
        {Array.from({length:6}).map((_,i)=>(
          <span key={i} style={{fontFamily:'var(--serif)',fontStyle:'italic',fontSize:'clamp(36px,5vw,72px)',letterSpacing:'-.02em',display:'inline-flex',alignItems:'center',gap:56}}>
            {text} <span style={{color:'var(--accent)',fontSize:'.6em'}}>✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* Tweaks                                     */
/* ─────────────────────────────────────────── */
function TweaksPanel({ tweaks, setTweaks, active, onClose }) {
  if (!active) return null;
  const accents = [
    ['#c6ff3f','Plasma Lime'],
    ['#ff7a5c','Ember'],
    ['#8ab4ff','Ion Blue'],
    ['#e5e5e5','Mono White'],
    ['#b388ff','Orchid'],
  ];
  const serifs = [
    ["'Instrument Serif'",'Instrument'],
    ["'Playfair Display'",'Playfair'],
    ["Georgia",'Georgia'],
  ];
  const update = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    window.parent.postMessage({type:'__edit_mode_set_keys', edits: patch}, '*');
  };
  return (
    <div style={{position:'fixed',bottom:24,right:24,width:300,padding:20,borderRadius:16,background:'rgba(15,16,18,.92)',border:'1px solid var(--line-2)',backdropFilter:'blur(16px)',zIndex:200,color:'var(--ink)',fontFamily:'var(--sans)',fontSize:13}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <span style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.15em',color:'var(--ink-dim)'}}>TWEAKS</span>
        <button onClick={onClose} style={{color:'var(--ink-dim)',fontSize:16}}>×</button>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:'var(--ink-dim)',marginBottom:8}}>Accent</div>
        <div style={{display:'flex',gap:8}}>
          {accents.map(([c,n])=>(
            <button key={c} title={n} onClick={()=>update({accent:c})} style={{width:28,height:28,borderRadius:'50%',background:c,border:tweaks.accent===c?'2px solid #fff':'1px solid var(--line-2)',cursor:'pointer'}}/>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,color:'var(--ink-dim)',marginBottom:8}}>Display serif</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {serifs.map(([f,n])=>(
            <button key={f} onClick={()=>update({serif:f})} style={{textAlign:'left',padding:'8px 10px',borderRadius:8,border:tweaks.serif===f?'1px solid var(--accent)':'1px solid var(--line-2)',background:tweaks.serif===f?'rgba(198,255,63,.08)':'transparent',color:'var(--ink)',fontFamily:f,fontStyle:'italic',fontSize:14}}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* App                                        */
/* ─────────────────────────────────────────── */
function App() {
  const [lang, setLang] = useState('en');
  const [tweaks, setTweaks] = useTweaks();
  const [editOn, setEditOn] = useState(false);

  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setEditOn(true);
      if (d.type === '__deactivate_edit_mode') setEditOn(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({type:'__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // Auto-tag elements by language based on CJK characters, then toggle via root class
  useEffect(() => {
    const CJK = /[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/;
    const root = document.getElementById('root');
    if (!root) return;

    const tag = () => {
      const all = root.querySelectorAll('*:not(.__lang-tagged)');
      all.forEach(el => {
        let direct = '';
        for (const n of el.childNodes) {
          if (n.nodeType === 3) direct += n.textContent;
        }
        if (!direct.trim()) return;
        const cjkCount = (direct.match(/[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/g) || []).length;
        const latinCount = (direct.match(/[A-Za-z]/g) || []).length;
        if (cjkCount === 0 && latinCount === 0) return;
        // Predominance ratio: if one is 2x+ the other, lock to that language
        if (cjkCount > 0 && cjkCount >= latinCount * 0.5) {
          // Chinese-dominant (allows brand words like AI, Zero, PPT inside)
          el.setAttribute('data-lang', 'zh');
        } else if (latinCount > 0 && cjkCount === 0) {
          if (direct.trim().length > 2 && (direct.includes(' ') || direct.length > 15 || /^[A-Z]/.test(direct.trim()))) {
            el.setAttribute('data-lang', 'en');
          }
        }
        // else: leave untagged (shows in both — brand words, initials, numbers)
      });
    };
    // Initial + observe for re-renders
    tag();
    const mo = new MutationObserver(() => tag());
    mo.observe(root, { childList:true, subtree:true });
    return () => mo.disconnect();
  }, []);

  // Apply lang class to document root
  useEffect(() => {
    document.body.setAttribute('data-active-lang', lang);
  }, [lang]);

  return (
    <div>
      <style>{`
        /* When EN active: hide zh-only elements */
        body[data-active-lang="en"] [data-lang="zh"]{ display:none !important; }
        /* When ZH active: hide en-only elements */
        body[data-active-lang="zh"] [data-lang="en"]{ display:none !important; }
        /* Never hide items inside the language switcher */
        .lang-switch [data-lang]{ display:inline-flex !important; }
        /* Never hide footer copyright (has both) — handled via 'mixed' naturally */
      `}</style>
      <CursorAura/>
      <Nav lang={lang} setLang={setLang}/>
      <Hero lang={lang}/>
      <About/>
      <Marquee text={lang==='zh' ? '加密 × 智能' : 'Crypto × Intelligence'}/>
      <Products/>
      <Services/>
      <Marquee text={lang==='zh' ? '只做真正能用的工具' : 'Just tools that work'}/>
      <Contact/>
      <Footer/>
      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} active={editOn} onClose={()=>setEditOn(false)}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
