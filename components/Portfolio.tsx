'use client';

import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experience, processSteps, profile, projects } from '../lib/content';
import { motion, requestSceneFrame } from '../lib/motion';
import Navigation from './Navigation';
import { heroTextOffset, sampleScroll } from '../lib/scroll-state';

const World = lazy(()=>import('./scene/World'));
gsap.registerPlugin(ScrollTrigger);

class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed?null:this.props.children;}
}

function Arrow({diagonal=false}:{diagonal?:boolean}) {return <span aria-hidden="true">{diagonal?'↗':'↓'}</span>;}

export default function Portfolio({nativeScroll=false}:{nativeScroll?:boolean}) {
  const root=useRef<HTMLDivElement>(null);
  const [active,setActive]=useState(0),[project,setProject]=useState(0),[step,setStep]=useState(0);
  const [reduced,setReduced]=useState(false),[scene,setScene]=useState<'loading'|'ready'|'unavailable'>('loading');
  const [supported,setSupported]=useState(false),[details,setDetails]=useState(false);
  const ready=useCallback(()=>setScene('ready'),[]);
  const failure=useCallback(()=>setScene('unavailable'),[]);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const sync=()=>{setReduced(media.matches);motion.reduced=media.matches;requestSceneFrame();};sync();
    if(media.addEventListener)media.addEventListener('change',sync);else media.addListener(sync);
    let available=false;
    try {
      const canvas=document.createElement('canvas'); const context=canvas.getContext('webgl2');
      available=Boolean(context);context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { /* Some privacy modes throw instead of returning null. */ }
    setSupported(available);if(!available)setScene('unavailable');
    window.addEventListener('portfolio-context-lost',failure);
    return()=>{if(media.removeEventListener)media.removeEventListener('change',sync);else media.removeListener(sync);window.removeEventListener('portfolio-context-lost',failure);};
  },[failure]);
  useEffect(()=>{motion.reduced=reduced;requestSceneFrame();document.documentElement.style.scrollBehavior=reduced?'auto':'smooth';return()=>{document.documentElement.style.removeProperty('scroll-behavior');};},[reduced]);
  useEffect(()=>{motion.project=project;requestSceneFrame();},[project]);
  useEffect(()=>{
    let destroyed=false;let cleanupSmooth=()=>{};
    if(!reduced&&!nativeScroll){
      import('lenis').then(({default:Lenis})=>{
        if(destroyed)return;
        const lenis=new Lenis({duration:1.15,anchors:true});
        lenis.on('scroll',ScrollTrigger.update);
        const tick=(time:number)=>lenis.raf(time*1000);gsap.ticker.add(tick);
        cleanupSmooth=()=>{gsap.ticker.remove(tick);lenis.destroy();};
      }).catch(()=>{ /* Native scrolling remains available if enhancement fails. */ });
    }
    const sections=Array.from(root.current?.querySelectorAll<HTMLElement>('.chapter')??[]);
    let bounds=sections.map(s=>({top:s.offsetTop,height:s.offsetHeight}));
    let previousChapter=-1,previousStep=-1;
    let previousY=Number.NaN;
    const measure=()=>{bounds=sections.map(s=>({top:s.offsetTop,height:s.offsetHeight}));previousY=Number.NaN;};
    const update=()=>{
      const y=window.scrollY;
      if(y===previousY)return;
      previousY=y;
      const state=sampleScroll(y,bounds,reduced);
      motion.chapter=state.chapter;motion.local=state.local;motion.progress=state.progress;
      // Transform only: no layout measurement or React render on the scroll path.
      root.current?.style.setProperty('--hero-scroll-y',`${heroTextOffset(y,reduced)}px`);
      if(previousChapter!==state.chapter){setActive(state.chapter);previousChapter=state.chapter;}
      if(state.chapter===2){motion.process=state.process;if(previousStep!==state.process){setStep(state.process);previousStep=state.process;}}
      requestSceneFrame();
    };
    const trigger=ScrollTrigger.create({start:0,end:'max',onUpdate:update,onRefresh:()=>{measure();update();}});
    // Listen to actual page movement; never consume wheel/touch input. The first
    // scroll works even before the smooth-scroll enhancement finishes loading.
    window.addEventListener('scroll',update,{passive:true});
    update();ScrollTrigger.refresh();
    return()=>{destroyed=true;cleanupSmooth();window.removeEventListener('scroll',update);trigger.kill();};
  },[reduced,nativeScroll]);
  useEffect(()=>{ScrollTrigger.refresh();requestSceneFrame();},[scene]);
  useEffect(()=>{
    const move=(e:PointerEvent)=>{if(e.pointerType==='touch')return;motion.pointerX=e.clientX/window.innerWidth-.5;motion.pointerY=.5-e.clientY/window.innerHeight;requestSceneFrame();};
    if(!reduced&&matchMedia('(pointer: fine)').matches)window.addEventListener('pointermove',move,{passive:true});
    return()=>window.removeEventListener('pointermove',move);
  },[reduced]);
  useEffect(()=>{
    if(reduced)return;
    const ctx=gsap.context(()=>{gsap.fromTo('.project-copy',{y:16,opacity:0},{y:0,opacity:1,duration:.65,ease:'power3.out'});},root);
    return()=>ctx.revert();
  },[project,reduced]);
  const select=(direction:number)=>{setProject(p=>(p+direction+projects.length)%projects.length);setDetails(false);};
  const jumpStep=(i:number)=>{
    const section=document.getElementById('process');if(!section)return;
    window.scrollTo({top:section.offsetTop+section.offsetHeight*(i*.72/5+.015),behavior:reduced?'auto':'smooth'});
  };
  const p=projects[project];
  return <div ref={root} className={`portfolio ${scene==='unavailable'?'no-webgl':''}`} data-chapter={active} data-reduced={reduced}>
    <a className="skip-link" href="#work">Skip to selected work</a>
    <div className="world" aria-hidden="true">{supported&&scene!=='unavailable'&&<SceneBoundary onFailure={failure}><Suspense fallback={null}><World onReady={ready}/></Suspense></SceneBoundary>}</div>
    <div className="scene-status" role="status">{scene==='loading'?'Initializing environment…':scene==='unavailable'?'3D unavailable · content view':''}</div>
    <Navigation active={active}/>
    <main>
      <section id="home" className="chapter chapter-home" aria-labelledby="home-title"><div className="chapter-panel">
        <div className="hero-intro"><p className="eyebrow">01 / THE INTRODUCTION</p><p className="hero-statement">Behind every<br/>great experience,<br/><em>a reliable system.</em></p><p className="hero-subtitle">DevOps · Cloud Infrastructure<br/>AI Engineering</p></div>
        <div className="hero-bottom"><h1 id="home-title">ALAM ZIA<span>—</span></h1><div className="hero-location"><span className="status-dot"/> BASED IN BENGALURU<br/><span>BUILDING FOR PRODUCTION</span></div></div>
        <a href="#work" className="next-chapter" aria-label="Explore selected work"><Arrow/></a>
        <div className="scene-caption">FIG. 01 — CONNECTED BY DESIGN</div>
      </div></section>
      <section id="work" className="chapter chapter-work" aria-labelledby="work-title"><div className="chapter-panel">
        <div className="chapter-top"><p className="eyebrow">02 / SELECTED WORK</p><p className="chapter-aside"><strong>{p.metric}</strong><br/>{p.metricLabel}</p></div>
        <div className="gallery-controls"><button onClick={()=>select(-1)} aria-label="Previous project">←</button><button onClick={()=>select(1)} aria-label="Next project">→</button></div>
        <div className="work-bottom"><div className="project-copy" aria-live="polite" aria-atomic="true"><p className="eyebrow">{p.category}</p><h2 id="work-title">{p.title}</h2><p className="project-context">{p.context}</p><div className="project-tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div></div>
        <div className="project-description"><p>{p.description}</p><button className="text-button" onClick={()=>setDetails(!details)} aria-expanded={details} aria-controls="project-details">{details?'LESS DETAIL −':'ENGINEERING NOTES +'}</button>{details&&<p id="project-details" className="expanded-detail">{p.detail}</p>}</div></div>
        <div className="project-index" role="group" aria-label="Select project">{projects.map((item,i)=><button key={item.title} aria-label={`Show ${item.title}`} aria-pressed={i===project} onClick={()=>{setProject(i);setDetails(false);}}>0{i+1}</button>)}</div>
      </div></section>
      <section id="process" className="chapter chapter-process" aria-labelledby="process-title"><div className="chapter-panel">
        <div className="chapter-top"><div><p className="eyebrow">03 / HOW A SYSTEM IS MADE</p><div className="process-progress" role="group" aria-label="Engineering process steps">{processSteps.map((s,i)=><button key={s[0]} aria-label={s[0]} aria-pressed={step===i} onClick={()=>jumpStep(i)}><span>0{i+1}</span></button>)}</div></div><span className="chapter-aside">FROM INTENT<br/>TO OPERATION.</span></div>
        <div className="process-bottom"><div><p className="eyebrow">0{step+1} / 05</p><h2 id="process-title">{processSteps[step][0]}</h2></div><p className="process-description">{processSteps[step][1]}</p></div>
        {scene==='unavailable'&&<ol className="fallback-process">{processSteps.map(([title,description])=><li key={title}><h3>{title}</h3><p>{description}</p></li>)}</ol>}
        <span className="scene-caption">FIG. 03 — THE ARCHITECTURE OF RELIABILITY</span>
      </div></section>
      <section id="about" className="chapter chapter-about" aria-labelledby="about-title"><div className="chapter-panel">
        <div className="about-copy"><p className="eyebrow">04 / THE ENGINEER</p><h2 id="about-title">Built on curiosity.<br/><em>Grounded in production.</em></h2><p>I’m Alam, a DevOps engineer in Bengaluru. My work spans cloud infrastructure, delivery automation and AI agents—with production experience on webMethods Managed File Transfer at Software AG and IBM.</p><div className="experience-list">{experience.map(([date,company,role])=><div key={date}><span>{date}</span><div><h3>{company}</h3><p>{role}</p></div></div>)}</div><p className="education">B.Tech · Electronics & Communication Engineering<br/>Noida Institute of Engineering and Technology<br/>2020–2024 · CGPA 8.3/10</p></div>
        <div className="capabilities"><p className="eyebrow">THE TOOLKIT</p><p>AWS / Azure / Kubernetes / OpenShift<br/>Terraform / Helm / Argo CD / Tekton<br/>Python / Bash / Prometheus / Grafana</p><a href={profile.resume} download className="text-button">DOWNLOAD RÉSUMÉ <Arrow diagonal/></a></div>
      </div></section>
      <section id="contact" className="chapter chapter-contact" aria-labelledby="contact-title"><div className="chapter-panel">
        <div className="contact-heading"><p className="eyebrow">05 / THE NEXT CHAPTER</p><h2 id="contact-title">Let’s build<br/><em>what comes next.</em></h2></div>
        <div className="contact-grid"><a href={`mailto:${profile.email}`}><span>Email <Arrow diagonal/></span><small>{profile.email}</small></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><span>LinkedIn <Arrow diagonal/></span><small>/in/alamzia23</small></a><a href={profile.github} target="_blank" rel="noreferrer"><span>GitHub <Arrow diagonal/></span><small>/alamzia23</small></a><a href={profile.resume} download><span>Résumé <Arrow diagonal/></span><small>PDF / DOWNLOAD</small></a></div>
        <footer><span>ALAM ZIA © {new Date().getFullYear()}</span><span>DEVOPS / PLATFORM / SRE</span><a href="#home">BACK TO THE TOP ↑</a></footer>
      </div></section>
    </main>
    <button className="motion-toggle" aria-pressed={reduced} onClick={()=>setReduced(r=>!r)}>{reduced?'MOTION OFF':'MOTION ON'} <span aria-hidden="true">{reduced?'○':'◉'}</span></button>
  </div>;
}
