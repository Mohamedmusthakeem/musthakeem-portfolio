import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { createRoot } from 'react-dom/client';

import { Canvas, useFrame } from '@react-three/fiber';


import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

import { ArrowUpRight, Check, Command, Download, ExternalLink, Github, Linkedin, Mail, Menu, Moon, Search, Send, Sparkles, Sun, X } from 'lucide-react';

import * as THREE from 'three';

import { achievements, certifications, education, experiences, projects, site, skills } from './data/site';

import './styles.css';

type Project = typeof projects[number];
const pointerState = { x: 0.5, y: 0.3, active: false };
const navItems = ['home','about','skills','experience','projects','education','contact'] as const;

function NetworkScene({ reduced = false }: { reduced?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodeCount = reduced ? 18 : 36;
  const nodes = useMemo(() => Array.from({ length: nodeCount }, (_, i) => ({
    p: new THREE.Vector3((Math.random() - .5) * 6.2, (Math.random() - .5) * 5.1, (Math.random() - .5) * 3.2),
    s: .022 + (i % 5) * .009,
    phase: Math.random() * Math.PI * 2,
  })), [nodeCount]);
  const links = useMemo(() => {
    const result: Array<readonly [THREE.Vector3, THREE.Vector3]> = [];
    const max = reduced ? 10 : 22;
    for (let i = 0; i < max; i++) result.push([nodes[i % nodes.length].p, nodes[(i * 7 + 5) % nodes.length].p]);
    return result;
  }, [nodes, reduced]);
  const dust = useMemo(() => {
    const count = reduced ? 80 : 170;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = (Math.random() - .5) * 7.2;
      data[i * 3 + 1] = (Math.random() - .5) * 5.8;
      data[i * 3 + 2] = (Math.random() - .5) * 4.5 - .8;
    }
    return data;
  }, [reduced]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const intensity = reduced ? 0.10 : 0.28;
    const targetY = pointerState.active ? (pointerState.x - 0.5) * intensity : 0;
    const targetX = pointerState.active ? (0.5 - pointerState.y) * intensity * 0.72 : 0;
    const ease = Math.min(1, delta * 2.4);
    group.current.rotation.y += (targetY - group.current.rotation.y) * ease;
    group.current.rotation.x += (targetX - group.current.rotation.x) * ease;
    group.current.position.x += ((pointerState.x - 0.5) * intensity * 0.42 - group.current.position.x) * Math.min(1, delta * 1.6);
    group.current.position.y += ((0.5 - pointerState.y) * intensity * 0.20 - group.current.position.y) * Math.min(1, delta * 1.4);
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.18) * 0.018;
  });

  return <group ref={group}>
    <group position={[0, 0, -1.25]}>
      <mesh rotation={[0.2, 0.35, 0]}>
        <icosahedronGeometry args={[1.12, 2]} />
        <meshBasicMaterial color="#48aaff" transparent opacity={reduced ? .045 : .075} wireframe />
      </mesh>
      <mesh rotation={[0.7, 0.2, 0]}>
        <torusGeometry args={[1.42, 0.012, 8, reduced ? 48 : 72]} />
        <meshBasicMaterial color="#76caff" transparent opacity={reduced ? .13 : .23} />
      </mesh>
      <mesh rotation={[1.1, -0.4, 0.45]}>
        <torusGeometry args={[1.72, 0.008, 8, reduced ? 48 : 72]} />
        <meshBasicMaterial color="#bcecff" transparent opacity={reduced ? .07 : .13} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.34, reduced ? 12 : 20, reduced ? 12 : 20]} />
        <meshBasicMaterial color="#bfeeff" transparent opacity={reduced ? .16 : .28} />
      </mesh>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.p}>
          <sphereGeometry args={[node.s, 7, 7]} />
          <meshBasicMaterial color={i % 7 === 0 ? '#e5f8ff' : '#58baff'} transparent opacity={reduced ? .45 : .78} />
        </mesh>
      ))}
     {links.map(([a, b], i) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([a, b]);

  return (
    <primitive
      key={`l-${i}`}
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: i % 4 === 0 ? '#bfeeff' : '#58baff',
            transparent: true,
            opacity: reduced ? 0.06 : 0.16,
          })
        )
      }
    />
  );
})}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#65c5ff" size={reduced ? .018 : .026} transparent opacity={reduced ? .22 : .42} sizeAttenuation />
      </points>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.45, 0]}>
        <planeGeometry args={[9, 9, 1, 1]} />
        <meshBasicMaterial color="#2e9eff" transparent opacity={reduced ? .014 : .028} wireframe />
      </mesh>
    </group>
  </group>;
}
function BlueGlitter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 700;
    const maxParticles = reducedMotion.matches ? 0 : coarse.matches || lowPower ? 48 : 96;
    type Particle = { x:number; y:number; vx:number; vy:number; life:number; max:number; size:number; alpha:number; streak:number };
    const particles: Particle[] = [];
    let width = 0, height = 0, dpr = 1, raf = 0, last = 0, lastSpawn = 0;
    let px = -1000, py = -1000, active = false, disposed = false, hidden = document.visibilityState !== 'visible';
    let previousX = px, previousY = py;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, coarse.matches ? 1.15 : 1.35);
      width = rect.width; height = rect.height;
      canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (count:number) => {
      for (let i=0; i<count && particles.length < maxParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.1 + Math.random() * 0.34;
        const life = 230 + Math.random() * 340;
        particles.push({ x:px+(Math.random()-.5)*10, y:py+(Math.random()-.5)*10, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed, life, max:life, size:.45+Math.random()*1.25, alpha:.16+Math.random()*.48, streak:Math.random() });
      }
    };
    const schedule = () => {
      if (!raf && !disposed && !hidden && (active || particles.length)) raf = requestAnimationFrame(frame);
    };
    const move = (e: PointerEvent) => {
      if (reducedMotion.matches || hidden) return;
      px=e.clientX; py=e.clientY; active=true;
      pointerState.x=px/window.innerWidth; pointerState.y=py/window.innerHeight; pointerState.active=true;
      const dist=Math.hypot(px-previousX,py-previousY);
      if (dist > 3 && performance.now()-lastSpawn > (coarse.matches ? 38 : 24)) {
        spawn(coarse.matches ? 1 : Math.min(2, Math.ceil(dist/28))); lastSpawn=performance.now();
      }
      previousX=px; previousY=py; schedule();
    };
    const end = () => { active=false; pointerState.active=false; schedule(); };
    const onVisibility = () => { hidden=document.visibilityState !== 'visible'; if (hidden) { active=false; pointerState.active=false; if (raf) cancelAnimationFrame(raf); raf=0; } else schedule(); };
    const frame = (time:number) => {
      raf=0;
      if (disposed || hidden) return;
      const dt=Math.min(32,time-(last||time)); last=time;
      ctx.clearRect(0,0,width,height);
      if (active && maxParticles && time-lastSpawn>80) { spawn(coarse.matches ? 1 : 2); lastSpawn=time; }
      for (let i=particles.length-1;i>=0;i--) {
        const p=particles[i]; p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=.993; p.vy*=.993;
        if(p.life<=0){particles.splice(i,1);continue;}
        const fade=Math.min(1,p.life/150)*Math.min(1,(p.max-p.life)/80); const a=p.alpha*fade;
        ctx.beginPath(); ctx.fillStyle=`rgba(72,176,255,${a})`; ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
        if(p.streak>.74){ctx.beginPath();ctx.strokeStyle=`rgba(164,226,255,${a*.36})`;ctx.lineWidth=.6;ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*13,p.y-p.vy*13);ctx.stroke();}
      }
      if(active && !reducedMotion.matches){
        const radius=coarse.matches?90:135;
        const glow=ctx.createRadialGradient(px,py,0,px,py,radius);
        glow.addColorStop(0,'rgba(62,170,255,.11)'); glow.addColorStop(.45,'rgba(62,170,255,.045)'); glow.addColorStop(1,'rgba(62,170,255,0)');
        ctx.fillStyle=glow; ctx.fillRect(px-radius,py-radius,radius*2,radius*2);
      }
      if (active || particles.length) raf=requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize',resize,{passive:true});
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerup',end,{passive:true});
    window.addEventListener('pointercancel',end,{passive:true});
    window.addEventListener('blur',end,{passive:true});
    document.addEventListener('visibilitychange',onVisibility,{passive:true});
    return ()=>{disposed=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',end);window.removeEventListener('blur',end);document.removeEventListener('visibilitychange',onVisibility);particles.length=0;};
  },[]);
  return <canvas ref={canvasRef} className="blue-glitter" aria-hidden="true" />;
}

function Hero3D() {
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const low = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 700;
    setReduced(mq.matches || low);
    const host = hostRef.current;
    const observer = host ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '140px 0px' }) : null;
    if (host) observer?.observe(host);
    const onVisibility = () => setVisible(document.visibilityState === 'visible' && !!host?.getBoundingClientRect().height);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  return <div ref={hostRef} className="hero-3d-host" aria-hidden="true">
    {!webgl || !visible ? <div className="hero-3d-fallback"><span>MM</span><i>AI / ML</i></div> :
      <div className="hero-3d"><Canvas frameloop="always" dpr={[1, 1.25]} camera={{ position: [0,0,7], fov: 48 }} onCreated={({ gl }) => setWebgl(Boolean(gl.getContext()))}><ambientLight intensity={.5}/><NetworkScene reduced={reduced}/></Canvas></div>}
  </div>;
}

function ExternalLinkSafe({ href, children, className = '' }: { href?: string; children: React.ReactNode; className?: string }) {
  if (!href) return null;
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [formState, setFormState] = useState<'idle'|'sending'|'sent'|'error'|'invalid'>('idle');
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const root = document.documentElement;
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let px = 0;
    let py = 0;
    let active = false;

    const render = () => {
      frame = 0;
      if (!active || reducedMotion.matches) return;
      root.style.setProperty('--pointer-x', `${px * 100}%`);
      root.style.setProperty('--pointer-y', `${py * 100}%`);
      root.style.setProperty('--pointer-rx', `${(0.5 - py) * 3}deg`);
      root.style.setProperty('--pointer-ry', `${(px - 0.5) * 3}deg`);
      root.style.setProperty('--pointer-dx', `${(px - 0.5) * (finePointer.matches ? 14 : 6)}px`);
      root.style.setProperty('--pointer-dy', `${(py - 0.5) * (finePointer.matches ? 10 : 5)}px`);
      pointerState.x = px; pointerState.y = py; pointerState.active = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion.matches) return;
      px = event.clientX / window.innerWidth;
      py = event.clientY / window.innerHeight;
      active = true;
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onPointerLeave = () => {
      active = false; pointerState.active = false;
      root.style.setProperty('--pointer-x', '50%');
      root.style.setProperty('--pointer-y', '30%');
      root.style.setProperty('--pointer-rx', '0deg');
      root.style.setProperty('--pointer-ry', '0deg');
      root.style.setProperty('--pointer-dx', '0px');
      root.style.setProperty('--pointer-dy', '0px');
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) onPointerLeave();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerLeave, { passive: true });
    window.addEventListener('pointercancel', onPointerLeave, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });
    reducedMotion.addEventListener?.('change', onMotionChange);
    finePointer.addEventListener?.('change', onPointerLeave);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerLeave);
      window.removeEventListener('pointercancel', onPointerLeave);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      reducedMotion.removeEventListener?.('change', onMotionChange);
      finePointer.removeEventListener?.('change', onPointerLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.isIntersecting && setActive(entry.target.id)), { rootMargin: '-35% 0px -55% 0px' });
    navItems.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); }
      if (e.key === 'Escape') { setPalette(false); setMobileMenu(false); setSelectedProject(null); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setPalette(false); setMobileMenu(false); };
  const filteredCommands = useMemo(() => navItems.filter(x => x.includes(query.toLowerCase())), [query]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.message.trim()) { setFormState('invalid'); return; }
    setFormState('sending');
    try {
      const body = new URLSearchParams({ 'form-name': 'contact', ...form });
      const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!response.ok) throw new Error('submit failed');
      setForm({ name:'', email:'', subject:'', message:'' }); setFormState('sent');
    } catch { setFormState('error'); }
  };

  return <div className="app">
    <div className="noise" aria-hidden="true" /><BlueGlitter />
    <header className="nav-shell">
      <a className="brand" href="#home" onClick={() => go('home')} aria-label="Mohamed Musthakeem home"><span>MM</span><strong>Mohamed Musthakeem</strong></a>
      <nav className={mobileMenu ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
        {navItems.map(item => <button className={active === item ? 'active' : ''} key={item} onClick={() => go(item)}>{item[0].toUpperCase()+item.slice(1)}</button>)}
      </nav>
      <div className="nav-tools">
        <button className="theme-toggle" onClick={() => setDark(v => !v)} aria-label={dark ? 'Switch to day mode' : 'Switch to night mode'}>{dark ? <Sun size={16}/> : <Moon size={16}/>}<span>{dark ? 'Day' : 'Night'}</span></button>
        <button className="command-key" onClick={() => setPalette(true)} aria-label="Open command palette"><Command size={15}/><kbd>⌘K</kbd></button>
        <button className="mobile-menu" onClick={() => setMobileMenu(v => !v)} aria-label={mobileMenu ? 'Close navigation' : 'Open navigation'}>{mobileMenu ? <X/> : <Menu/>}</button>
      </div>
    </header>

    <main>
      <section id="home" className="hero section">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14}/> AI / ML / DATA / GENERATIVE AI</div>
          <p className="hero-kicker">{site.positioning}</p>
          <h1>{site.displayName}</h1>
          <h2>{site.role}</h2>
          <p className="hero-intro">{site.intro}</p>
          <div className="hero-actions"><button className="button primary magnetic-button" onClick={() => go('projects')}>Explore My Work <ArrowUpRight size={17}/></button><button className="button secondary magnetic-button" onClick={() => go('contact')}>Let's Connect</button><a className="button secondary magnetic-button" href="/Mohamed-Musthakeem-Resume.pdf" download>Download Resume <Download size={17}/></a></div>
          <div className="hero-proof"><span>Python</span><span>Machine Learning</span><span>Generative AI</span><span>Data Science</span></div>
        </div>
        <div className="hero-visual pointer-reactive">
          <Hero3D />
          <div className="portrait-orbit orbit-a"/><div className="portrait-orbit orbit-b"/>
          <motion.div className="portrait-frame" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.8 }}>
            {!photoFailed ? <img src="/profile-photo.webp" alt="Mohamed Musthakeem M" onError={() => setPhotoFailed(true)} /> : <div className="portrait-fallback"><span>MM</span><small>AI / ML ENGINEER</small></div>}
            <div className="portrait-glass"/><div className="portrait-label">AI / ML <span>•</span> 01</div>
          </motion.div>
          <div className="floating-chip chip-one">Python + ML</div><div className="floating-chip chip-two">Generative AI</div>
        </div>
      </section>

      <section id="about" className="section about-section">
        <div className="section-index">01 / ABOUT</div><div className="about-grid"><h3>Engineering intelligence with practical software.</h3><div className="section-copy"><p>AI/ML-focused developer working across Machine Learning, Data Science, Generative AI and Python, with practical experience spanning model experimentation and responsive web development.</p><p>The portfolio keeps the evidence visible: projects, internships, skills and credentials are presented without inflated performance claims.</p></div></div>
      </section>

      <section id="skills" className="section"><div className="section-index">02 / SKILLS</div><div className="section-heading"><h3>Technical toolkit.</h3><p>Organized by practical use instead of artificial proficiency percentages.</p></div><div className="skills-grid">{Object.entries(skills).map(([group,list]) => <article className="glass skill-card" key={group}><div className="skill-number">{String(Object.keys(skills).indexOf(group)+1).padStart(2,'0')}</div><h4>{group}</h4><div className="chips">{list.map(item => <span key={item}>{item}</span>)}</div></article>)}</div></section>

      <section id="experience" className="section"><div className="section-index">03 / EXPERIENCE</div><div className="section-heading"><h3>Practical experience.</h3><p>Internship work across machine learning, data science and web development.</p></div><div className="timeline">{experiences.map((item,index) => <article className="timeline-item" key={item.role}><div className="timeline-marker">0{index+1}</div><div className="glass timeline-card"><div className="timeline-top"><div><h4>{item.role}</h4><p>{item.company}</p></div><time>{item.dates}</time></div><div className="bullet-grid">{item.points.map(point => <span key={point}>{point}</span>)}</div></div></article>)}</div></section>

      <section id="projects" className="section projects-section"><div className="section-index">04 / SELECTED WORK</div><div className="section-heading"><h3>Built to be explored.</h3><p>Projects are the center of the portfolio — clear context, real links and no invented metrics.</p></div><div className="projects-grid">{projects.map(project => <ProjectCard key={project.id} project={project} onOpen={() => setSelectedProject(project)}/>)}</div></section>

      <section id="education" className="section"><div className="section-index">05 / EDUCATION & CREDENTIALS</div><div className="edu-grid"><div><h3>Education.</h3>{education.map(item => <article className="glass edu-card" key={item.degree}><div><h4>{item.degree}</h4><p>{item.school}</p></div><strong>{item.value}</strong></article>)}</div><div><h3>Certifications.</h3>{certifications.map(([name,issuer,date]) => <article className="glass cert-card" key={name}><div className="cert-icon"><Check size={15}/></div><div><h4>{name}</h4><p>{issuer} · {date}</p></div></article>)}</div></div><div className="achievement-block"><h3>Achievements & activity.</h3><div className="achievement-grid">{achievements.map((item,i)=><div className="achievement" key={item}><span>0{i+1}</span><p>{item}</p></div>)}</div></div></section>

      <section id="contact" className="section contact-section"><div><div className="section-index">06 / CONTACT</div><h3>Let's Build Something Intelligent.</h3><p className="section-copy">For opportunities, collaborations and technical conversations.</p><div className="contact-links"><ExternalLinkSafe href={site.github}><Github size={16}/> GitHub</ExternalLinkSafe><ExternalLinkSafe href={site.linkedin}><Linkedin size={16}/> LinkedIn</ExternalLinkSafe><a href={`mailto:${site.email}`}><Mail size={16}/> {site.email}</a></div></div><form className="glass contact-form" name="contact" method="POST" data-netlify="true" onSubmit={submit}><input type="hidden" name="form-name" value="contact"/><label>Name<input name="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required autoComplete="name"/></label><label>Email<input name="email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required autoComplete="email"/></label><label>Subject<input name="subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label><label>Message<textarea name="message" rows={5} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required/></label><button className="button primary" disabled={formState==='sending'}>{formState==='sending' ? 'Sending…' : formState==='sent' ? 'Message sent' : 'Send Message'} <Send size={16}/></button>{formState==='invalid' && <small className="form-status error">Please enter a valid name, email and message.</small>}{formState==='error' && <small className="form-status error">Submission failed. Please use the email link or try again on the deployed Netlify site.</small>}{formState==='sent' && <small className="form-status success">Your message was submitted successfully.</small>}</form></section>
    </main>

    <footer><div><strong>{site.name}</strong><span>{site.role}</span></div><div className="footer-links"><ExternalLinkSafe href={site.github}>GitHub</ExternalLinkSafe><ExternalLinkSafe href={site.linkedin}>LinkedIn</ExternalLinkSafe><a href={`mailto:${site.email}`}>Email</a><a href="/Mohamed-Musthakeem-Resume.pdf" download>Download Resume</a></div><small>© {new Date().getFullYear()} {site.name}. Built with React + TypeScript.</small></footer>

    <AnimatePresence>{palette && <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={() => setPalette(false)}><motion.div className="command-palette glass" initial={{y:-18,scale:.98}} animate={{y:0,scale:1}} onMouseDown={e=>e.stopPropagation()}><div className="command-search"><Search size={17}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Jump to a section…"/></div>{filteredCommands.map(item => <button key={item} onClick={()=>go(item)}>{item[0].toUpperCase()+item.slice(1)}<ArrowUpRight size={15}/></button>)}<button onClick={()=>{setDark(v=>!v);setPalette(false)}}>Toggle Theme {dark?<Sun size={15}/>:<Moon size={15}/>}</button><button onClick={()=>{window.location.href=`mailto:${site.email}`;setPalette(false)}}>Send Email <Mail size={15}/></button></motion.div></motion.div>}</AnimatePresence>

    <AnimatePresence>{selectedProject && <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={()=>setSelectedProject(null)}><motion.div className="case-modal glass" initial={{y:24,opacity:0}} animate={{y:0,opacity:1}} onMouseDown={e=>e.stopPropagation()}><button className="close-button" onClick={()=>setSelectedProject(null)} aria-label="Close project details"><X size={18}/></button><span className="project-category">{selectedProject.category}</span><h3>{selectedProject.title}</h3><p>{selectedProject.description}</p><div className="case-layout"><div><h4>Technologies</h4><div className="chips">{selectedProject.stack.map(item=><span key={item}>{item}</span>)}</div></div><div><h4>Project details</h4><ul>{selectedProject.details.map(detail=><li key={detail}>{detail}</li>)}</ul></div></div><div className="modal-links">{selectedProject.github && <ExternalLinkSafe href={selectedProject.github}><Github size={16}/> View on GitHub</ExternalLinkSafe>}{selectedProject.demo && <ExternalLinkSafe href={selectedProject.demo}><ExternalLink size={16}/> Live Demo</ExternalLinkSafe>}</div></motion.div></motion.div>}</AnimatePresence>
  </div>;
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const ref = useRef<HTMLElement>(null); const x = useMotionValue(0); const y = useMotionValue(0); const rx = useSpring(y, { stiffness: 180, damping: 20 }); const ry = useSpring(x, { stiffness: 180, damping: 20 });
  const move = (e: React.MouseEvent) => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 900) return; const r=ref.current?.getBoundingClientRect(); if(!r)return; x.set(((e.clientX-r.left)/r.width-.5)*5); y.set(-((e.clientY-r.top)/r.height-.5)*5); };
  const leave=()=>{x.set(0);y.set(0)};
  return <motion.article ref={ref} className={`project-card glass ${project.featured?'featured':''}`} style={{ rotateX: rx, rotateY: ry }} whileTap={{ scale: .995 }} onMouseMove={move} onMouseLeave={leave}><div className={`project-visual ${project.visual}`}><div className="visual-grid"/><div className="visual-core">{project.visual==='evaluation'?'AI':project.visual==='network'?'NET':project.visual==='chart'?'ML':'WEB'}</div><span className="visual-caption">{project.category}</span></div><div className="project-body"><span className="project-category">{project.category}</span><h4>{project.title}</h4><p>{project.description}</p><div className="chips mini">{project.stack.map(item=><span key={item}>{item}</span>)}</div><div className="project-actions"><button className="text-button" onClick={onOpen}>View case study <ArrowUpRight size={15}/></button>{project.github && <ExternalLinkSafe href={project.github}><Github size={15}/> GitHub</ExternalLinkSafe>}{project.demo && <ExternalLinkSafe href={project.demo}><ExternalLink size={15}/> Live Demo</ExternalLinkSafe>}</div></div></motion.article>;
}

createRoot(document.getElementById('root')!).render(<App />);
