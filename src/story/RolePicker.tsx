import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SmoothSurface from '../components/SmoothSurface';

const roles = ['design engineer', 'founder', 'brother', 'student'];
export default function RolePicker() {
  const [role,setRole]=useState(roles[0]);
  const [open,setOpen]=useState(false);
  const [position,setPosition]=useState({left:0,top:0});
  const trigger=useRef<HTMLButtonElement>(null), menu=useRef<HTMLDivElement>(null);
  const id=useId();
  function close(restore=false){setOpen(false);if(restore)trigger.current?.focus();}
  function show(){setOpen(true);}
  useLayoutEffect(()=>{
    if(!open||!trigger.current||!menu.current)return;
    const anchor=trigger.current.getBoundingClientRect();
    const {offsetWidth:width,offsetHeight:height}=menu.current;
    const below=anchor.bottom+8;
    const top=below+height<=window.innerHeight-12?below:anchor.top-height-8;
    setPosition({left:Math.max(12,Math.min(anchor.left,window.innerWidth-width-12)),top:Math.max(12,Math.min(top,window.innerHeight-height-12))});
  },[open]);
  useEffect(()=>{
    if(!open)return;
    menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus({preventScroll:true});
    const outside=(e:PointerEvent)=>{if(!menu.current?.contains(e.target as Node)&&!trigger.current?.contains(e.target as Node))close();};
    const dismiss=()=>close();
    document.addEventListener('pointerdown',outside);window.addEventListener('resize',dismiss);window.addEventListener('scroll',dismiss,{passive:true});
    return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',dismiss);window.removeEventListener('scroll',dismiss);};
  },[open]);
  return <><button ref={trigger} className="role-trigger" aria-label={`Explore my roles: ${role}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>open?close():show()} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();show();}}}>{role}</button>
  {open&&createPortal(<div className="role-menu" style={position} ref={menu} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))close();}} onKeyDown={e=>{
    const items=Array.from(menu.current!.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
    const index=items.indexOf(document.activeElement as HTMLButtonElement);
    if(e.key==='Escape'){e.preventDefault();close(true);}
    if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next]?.focus();}
  }}><SmoothSurface radius={12} className="role-menu-surface"><span className="role-menu-label">Roles</span><div role="menu" aria-label="Choose a role" id={id}>{roles.map(title=><button key={title} role="menuitemradio" aria-checked={role===title} tabIndex={-1} className="role-option" onClick={()=>{setRole(title);close(true);}}><span>{title}</span><span aria-hidden="true" className="role-check">{role===title?'✓':''}</span></button>)}</div></SmoothSurface></div>,document.body)}</>;
}
