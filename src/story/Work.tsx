import SmoothSurface from '../components/SmoothSurface';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { legacyImages, openSourceProjects, projects, type ProjectId } from './content';
import IsleroShowcase from './IsleroShowcase';

function Cover({id,detail=false}:{id:ProjectId;detail?:boolean}) {
 if(id==='islero')return <div className={`project-art islero-cover${detail?' islero-cover--detail dream-cover':''}`} aria-hidden="true"><img className="islero-cover-wordmark" src="/images/islero/islero-wordmark.svg" alt=""/><img className="islero-cover-island" src="/images/islero/island.webp" alt=""/>{detail&&<span className="dream-cover-blur"/>}</div>;
 if(id==='lyra')return <div className="project-art lyra-photo-cover dream-cover" aria-hidden="true"><img src={detail?'/images/lyra-handheld-hero.png':'/images/lyra-handheld.png'} alt="" width={detail?1100:3840} height={detail?570:2160}/><span className="dream-cover-blur"/></div>;
 return <div className="project-art legacy-art dream-cover" aria-hidden="true"><img src="/images/legensy/dream-cover.jpg" alt="" width="4672" height="7008"/><span className="dream-cover-blur"/></div>;
}

function ProjectSurface({id,detail=false}:{id:ProjectId;detail?:boolean}) {
 const item=projects.find(project=>project.id===id)!;
 return <><Cover id={id} detail={detail}/>{!detail&&<span className="project-card-caption"><b>{item.name}</b><span>{item.category}</span></span>}</>;
}

export default function Work({selected,onSelect}:{selected:ProjectId|null;onSelect:(id:ProjectId|null)=>void}) {
 const title=useRef<HTMLHeadingElement>(null);
 const previous=useRef<ProjectId|null>(null);
 const transitionSequence=useRef(0);
 const track=useRef<HTMLDivElement>(null);
 const galleryScroll=useRef<number|null>(null);
 const [edges,setEdges]=useState({start:true,end:false});
 useEffect(()=>{
   const element=track.current;if(!element)return;
   const sync=()=>setEdges({start:element.scrollLeft<=2,end:element.scrollLeft+element.clientWidth>=element.scrollWidth-2});
   const observer=new ResizeObserver(sync);observer.observe(element);
   element.addEventListener('scroll',sync,{passive:true});sync();
   return()=>{observer.disconnect();element.removeEventListener('scroll',sync);};
 },[selected]);
 function moveGallery(direction:number){
   const element=track.current;if(!element)return;
   const cover=element.querySelector<HTMLElement>('.work-cover');
   const step=(cover?.getBoundingClientRect().width??240)+parseFloat(getComputedStyle(element).columnGap);
   element.scrollBy({left:direction*step,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 useLayoutEffect(()=>{
   if(selected)title.current?.focus({preventScroll:true});
   else if(previous.current){
     const card=document.getElementById(`project-${previous.current}`);
     const gallery=track.current;
     if(gallery){
       // Restore before the view transition takes its destination snapshot.
       const cardLeft=card?card.getBoundingClientRect().left-gallery.getBoundingClientRect().left+gallery.scrollLeft:0;
       gallery.scrollTo({left:galleryScroll.current??cardLeft,behavior:'instant'});
       if(card){
         const bounds=gallery.getBoundingClientRect();
         const cover=card.getBoundingClientRect();
         const correction=cover.right>bounds.right?cover.right-bounds.right:cover.left<bounds.left?cover.left-bounds.left:0;
         if(correction)gallery.scrollBy({left:correction,behavior:'instant'});
       }
     }
     card?.focus({preventScroll:true});
   }
   previous.current=selected;
 },[selected]);
 const project=projects.find(item=>item.id===selected);

 function transitionTo(next:ProjectId|null) {
   if(next&&track.current)galleryScroll.current=track.current.scrollLeft;
   const projectId=next??selected;
   const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if(!projectId||reduceMotion||!document.startViewTransition){onSelect(next);return;}

   const root=document.documentElement;
   const sequence=++transitionSequence.current;
   root.dataset.workProject=projectId;
   root.dataset.workTransition=next?'open':'close';
   const transition=document.startViewTransition(()=>flushSync(()=>onSelect(next)));
   const cleanup=()=>{
     if(sequence!==transitionSequence.current)return;
     delete root.dataset.workProject;
     delete root.dataset.workTransition;
   };
   transition.finished.then(cleanup,cleanup);
 }

 return <section className={`work-page ${project?'has-project':'work-gallery-page'}`} aria-label={project?undefined:'Selected work'} aria-labelledby={project?'work-title':undefined}>
   {project?<article className="project-detail" key={project.id}>
     <div className={`project-hero project-hero--${project.id}`}><SmoothSurface radius={12}><ProjectSurface id={project.id} detail/></SmoothSurface>{project.id==='lyra'&&<div className="project-hero-edge-blur" aria-hidden="true">{[0,1,2,3,4,5].map(layer=><i key={layer} style={{'--layer':layer} as CSSProperties}/>)}</div>}</div>
     <div className="project-information">
       <button className="text-link back-to-work" onClick={()=>transitionTo(null)} aria-label="Back to all work"><svg className="back-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8.5 3 4.5 7l4 4"/><path d="M5 7h5"/></svg><span>back</span></button>
       <div className="project-detail-content">
         <div className="project-detail-copy">
           <div className="project-identity">
             <h1 id="work-title" ref={title} tabIndex={-1}>{project.name}</h1>
             <p className="project-category">{project.category}</p>
           </div>
         </div>
         <div className="project-body">
           <ul className="project-notes" aria-label="Project details">{project.notes.map(note=><li key={note}>{note}</li>)}</ul>
           <p className="project-narrative"><strong>{project.description}</strong> {project.detail}</p>
           {project.id==='islero'&&<IsleroShowcase/>}
           {project.id==='lyra'&&<><p className="project-status">Currently building. More to share as it takes shape.</p><section className="lyra-project-media" aria-label="Lyra product mockups"><figure className="lyra-project-image lyra-project-image--wide"><img src="/images/lyra-event-flyer-cutout.png" alt="Lyra event flyer creation interface shown on an angled phone mockup" width="1448" height="1086" loading="lazy"/></figure><div className="lyra-mockup-pair"><figure className="lyra-project-image"><img src="/images/lyra-social-feed.png" alt="Lyra social feed with event cards and stories" width="1207" height="2484" loading="lazy"/></figure><figure className="lyra-project-image"><img src="/images/lyra-flyer-chat.png" alt="Lyra flyer generation conversation and event poster" width="1207" height="2484" loading="lazy"/></figure></div></section></>}
           {project.id==='legacy'&&<><div className="legacy-gallery">{legacyImages.map(image=><img key={image.src} src={image.src} alt={image.alt} width="800" height="1200" loading="lazy"/>)}</div><div className="legensy-film"><video controls playsInline preload="metadata" poster="/images/legensy/film-poster.jpg" aria-label="Legensy campaign film" width="1600" height="626"><source src="/videos/legensy-film.mp4" type="video/mp4"/>Your browser does not support video playback. <a href="/videos/legensy-film.mp4">Watch the Legensy film</a>.</video></div></>}
         </div>
       </div>
     </div>
   </article>:<>
     <div className="work-gallery">
       <div ref={track} id="work-gallery-track" className="work-gallery-track" aria-label="Selected projects">{projects.map(item=><button id={`project-${item.id}`} key={item.id} className="work-cover" onClick={()=>transitionTo(item.id)} aria-label={`Read about ${item.name}`}><SmoothSurface radius={12}><Cover id={item.id}/></SmoothSurface><span className="work-cover-label">{item.name}</span></button>)}</div>
       {(['left','right'] as const).map(edge=><div key={edge} className={`gallery-edge gallery-edge--${edge}`} aria-hidden="true">{[0,1,2,3].map(layer=><i key={layer} style={{'--layer':layer} as CSSProperties}/>)}</div>)}
     </div>
     <div className="gallery-controls" aria-label="Gallery navigation">
       <button aria-label="Previous projects" aria-controls="work-gallery-track" disabled={edges.start} onClick={()=>moveGallery(-1)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 5v10H5m5-5-5 5 5 5"/></svg></button>
       <button aria-label="Next projects" aria-controls="work-gallery-track" disabled={edges.end} onClick={()=>moveGallery(1)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 5v10h14m-5-5 5 5-5 5"/></svg></button>
     </div>
     <section className="open-source" aria-labelledby="open-source-title"><h2 id="open-source-title">Open Source Projects</h2>{openSourceProjects.length?<ul>{openSourceProjects.map(repo=><li key={repo.url}><a href={repo.url} target="_blank" rel="noreferrer">{repo.name}</a><p>{repo.description}</p></li>)}</ul>:null}</section>
   </>}
 </section>;
}
