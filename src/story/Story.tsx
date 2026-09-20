import RolePicker from './RolePicker';
import SmoothSurface from '../components/SmoothSurface';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { legacyImages, lyraPreviewImages } from './content';
import HoloPortrait from './HoloPortrait';

function Reveal({label,children,kind}:{label:string;children:ReactNode;kind:'photos'|'lyra'|'identity'}) {
  const id=useId(), button=useRef<HTMLButtonElement>(null), panel=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false), [closing,setClosing]=useState(false), [position,setPosition]=useState({left:0,top:0});
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const exitTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  function hide(){if(!open)return;setOpen(false);setClosing(true);if(exitTimer.current)clearTimeout(exitTimer.current);exitTimer.current=setTimeout(()=>setClosing(false),180);}
  const clear=()=>{if(timer.current)clearTimeout(timer.current);};
  function place(){
    const rect=button.current?.getBoundingClientRect();if(!rect)return;
    const width=Math.min(320,window.innerWidth-32);
    const height=panel.current?.offsetHeight??(kind==='identity'?width/1.55:125);
    const below=rect.bottom+16,above=rect.top-height-8;
    const preferred=kind==='identity'&&below+height<=window.innerHeight-12?below:above>=12?above:below;
    setPosition({left:Math.max(16,Math.min(window.innerWidth-width-16,rect.left+rect.width/2-width/2)),top:Math.max(12,Math.min(preferred,window.innerHeight-height-12))});
  }
  useLayoutEffect(()=>{if(open)place();},[open]);
  function show(){clear();if(exitTimer.current)clearTimeout(exitTimer.current);setClosing(false);place();setOpen(true);}
  function leave(){clear();timer.current=setTimeout(hide,160);}
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);if(exitTimer.current)clearTimeout(exitTimer.current);},[]);
  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{if(!button.current?.contains(event.target as Node)&&!panel.current?.contains(event.target as Node))hide();};
    const key=(event:KeyboardEvent)=>{if(event.key==='Escape')hide();};
    const close=()=>hide();
    const scroll=()=>{const rect=button.current?.getBoundingClientRect();if(!rect||rect.bottom<0||rect.top>window.innerHeight)hide();else place();};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',close);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',close);};
  },[open]);
  return <><button id={kind==='identity'?'jordi-identity-trigger':undefined} ref={button} className={`story-word story-word--${kind}`} aria-expanded={open} aria-controls={open?id:undefined}
    onPointerEnter={e=>{if(e.pointerType==='mouse')show();}} onPointerLeave={leave}
    onFocus={e=>{if(e.currentTarget.matches(':focus-visible'))show();}} onBlur={hide}
    onClick={show}>{label}</button>
    {(open||closing)&&createPortal(<><div className={`reveal-backdrop ${closing?'is-closing':''}`} aria-hidden="true"/><div id={id} ref={panel} role="region" aria-label={kind==='identity'?'Jordi’s identity card':`${label} image preview`} aria-hidden={!open} className={`word-reveal word-reveal--${kind} ${closing?'is-closing':''}`} style={position} onPointerEnter={clear} onPointerLeave={leave}>{children}</div></>,document.body)}</>;
}
function ImageFan({images,className='' }:{images:{src:string;alt:string}[];className?:string}) {
 return <div className={`photo-fan ${className}`}>{images.map((photo,i)=><figure key={photo.src} style={{'--i':i} as CSSProperties}><SmoothSurface radius={9} className="photo-surface"><img src={photo.src} alt={photo.alt}/></SmoothSurface></figure>)}</div>;
}
export default function Story() {
 return <section id="intro" tabIndex={-1} className="introduction story" aria-labelledby="story-title">
   <h1 id="story-title">I’m <Reveal label="Jordi" kind="identity"><HoloPortrait/></Reveal>, a 21-year-old <RolePicker/> based in New York.</h1>
   <p>I like building and shaping ideas into things people can use.</p>
   <p>I started with sneakers at 14, then built <Reveal label="Legensy" kind="photos"><ImageFan images={legacyImages}/></Reveal>, a clothing brand I launched in college. These days, I’m bringing that curiosity to apps.</p>
   <p>Currently building <Reveal label="Lyra Plus" kind="lyra"><ImageFan images={lyraPreviewImages} className="photo-fan--lyra"/></Reveal>, a place to make plans, find events, and bring people together.</p>
 </section>;
}
