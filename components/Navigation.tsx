'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { chapters } from '../lib/content';
export default memo(function Navigation({active}:{active:number}) {
  const menu=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    if(!open)return;
    const previousFocus=document.activeElement as HTMLElement|null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const focusable=()=>Array.from(menu.current?.querySelectorAll<HTMLElement>('button, a[href]')??[]);
    focusable()[0]?.focus();
    const keyboard=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false);}
      if(event.key!=='Tab')return;
      const controls=focusable(),first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',keyboard);
    return()=>{document.removeEventListener('keydown',keyboard);document.body.style.overflow=previousOverflow;previousFocus?.focus();};
  },[open]);
  return <>
    <header className="site-header">
      <a href="#home" className="brand" aria-label="Alam Zia — home">a<span>/</span>z<span className="brand-dot">.</span></a>
      <span className="header-note">ENGINEERING, WITH INTENT.</span>
      <div className="header-actions"><button className="menu-button" onClick={()=>setOpen(true)} aria-label="Open chapter navigation" aria-haspopup="dialog" aria-expanded={open}><span/><span/></button><a className="contact-button" href="#contact">LET’S TALK <span aria-hidden="true">↗</span></a></div>
    </header>
    {open&&<div className="navigation-backdrop" data-lenis-prevent onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
    <div ref={menu} className="navigation-dialog" role="dialog" aria-modal="true" aria-labelledby="navigation-title">
      <div className="menu-inner"><div className="menu-top"><p id="navigation-title" className="eyebrow">EXPLORE THE CHAPTERS</p><button onClick={()=>setOpen(false)} aria-label="Close navigation">✕</button></div>
      <nav>{chapters.map((name,i)=><a key={name} href={`#${name.toLowerCase()}`} onClick={()=>setOpen(false)} aria-current={active===i?'location':undefined}><small>0{i+1}</small>{name}<span aria-hidden="true">↗</span></a>)}</nav><p className="menu-location">ALAM ZIA / BENGALURU, INDIA</p></div>
    </div></div>}
    <aside className="chapter-rail" aria-label="Current chapter">{chapters.map((name,i)=><a key={name} href={`#${name.toLowerCase()}`} aria-label={`${i+1}. ${name}`} aria-current={active===i?'location':undefined}><span>0{i+1}</span><i/></a>)}</aside>
  </>;
});
