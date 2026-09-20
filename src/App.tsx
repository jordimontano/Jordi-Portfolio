import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import LinenWindow from './linen/LinenWindow';
import LoadingScreen from './loading/LoadingScreen';
import Story from './story/Story';
import useButtonSound from './useButtonSound';
import Work from './story/Work';
import { projects, type ProjectId } from './story/content';

function currentProject(){return projects.find(project=>location.hash===`#work/${project.id}`)?.id??null;}
function currentView(){return location.hash.startsWith('#work')?'work' as const:'home' as const;}
import './story/story.css';

function Icon({ name }: { name: 'home' | 'work' | 'profile' | 'arrow' }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
    work: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V4h8v3" /></>,
    profile: <g fill="currentColor" stroke="none"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2Z" /></g>,
    arrow: <><path d="M5 12h14m-5-5 5 5-5 5" /></>,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const socialProfiles = [
  {name:'X',url:'https://x.com/jordilmontano',path:'M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.4-8.5L.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z'},
  {name:'LinkedIn',url:'https://www.linkedin.com/in/jordilaguardm',path:'M20.5 2h-17C2.7 2 2 2.7 2 3.5v17c0 .8.7 1.5 1.5 1.5h17c.8 0 1.5-.7 1.5-1.5v-17c0-.8-.7-1.5-1.5-1.5ZM8 19H5V9h3v10ZM6.5 7.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM19 19h-3v-5.3c0-1.3-.5-2-1.5-2s-1.5.7-1.5 2V19h-3V9h3v1.3c.6-1 1.6-1.5 2.8-1.5 2.1 0 3.2 1.4 3.2 4.1V19Z'},
  {name:'GitHub',url:'https://github.com/jordimontano',path:'M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.2.8-.5v-2c-3.2.7-3.8-1.4-3.8-1.4-.5-1.3-1.3-1.6-1.3-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.6 0-1.2.4-2.2 1.2-3-.1-.3-.5-1.5.1-3 0 0 1-.3 3.1 1.1a10.8 10.8 0 0 1 5.8 0C17 5.1 18 5.4 18 5.4c.6 1.5.2 2.7.1 3 .8.8 1.2 1.8 1.2 3 0 4.3-2.7 5.3-5.3 5.6.4.4.8 1 .8 2.1v3c0 .3.2.6.8.5A11.2 11.2 0 0 0 12 .8Z'},
];
function SocialLinks(){return <div className="footer-socials" aria-label="Social profiles">{socialProfiles.map(profile=>{
  const icon=<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={profile.path}/></svg>;
  return profile.url?<a key={profile.name} className="footer-social" href={profile.url} aria-label={profile.name} target="_blank" rel="noopener noreferrer">{icon}</a>:<span key={profile.name} className="footer-social" role="img" aria-label={`${profile.name}: profile link pending`}>{icon}</span>;
})}</div>;}

function EdgeBlur({ edge }: { edge: 'top' | 'bottom' }) {
  return <div className={`edge-blur edge-blur--${edge}`} aria-hidden="true">{[0,1,2,3,4,5].map(i=><i key={i} style={{ '--layer': i } as CSSProperties}/>)}</div>;
}

export default function App() {
  useButtonSound();
  const [loading, setLoading] = useState(true);
  const finishLoading = useCallback(() => setLoading(false), []);
  const [opening, setOpening] = useState(18);
  const [view, setView] = useState<'home' | 'work'>(currentView);
  const [selectedProject,setSelectedProject]=useState<ProjectId|null>(currentProject);
  useEffect(()=>{const sync=()=>{setView(currentView());setSelectedProject(currentProject());};window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);

  function navigate(next: 'home' | 'work') {
    setView(next);setSelectedProject(null);
    history.pushState(null,'',next==='work'?'#work':location.pathname+location.search);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  function showProfile() {
    setView('home');
    setSelectedProject(null);
    history.pushState(null, '', location.pathname + location.search);
    requestAnimationFrame(() => {
      const identity = document.getElementById('jordi-identity-trigger');
      identity?.scrollIntoView({ behavior: 'instant', block: 'center' });
      identity?.focus({ preventScroll: true });
      identity?.click();
    });
  }

  function selectProject(id:ProjectId|null){window.scrollTo({top:0,behavior:'instant'});setSelectedProject(id);history.pushState(null,'',id?`#work/${id}`:'#work');}
  return (
    <>
    {loading && <LoadingScreen onComplete={finishLoading} />}
    <div inert={loading} className={`portfolio ${view === 'work' ? 'is-work-view' : ''}`}>
      <a className="skip-link" href="#main-content" onClick={event=>{event.preventDefault();document.getElementById('main-content')?.focus();}}>Skip to content</a>
      <EdgeBlur edge="top" />
      <header className="site-header">
        <nav className="navigation" data-view={view} aria-label="Main navigation">
          <span className="nav-selection" aria-hidden="true" />
          <button className={`nav-button ${view === 'home' ? 'is-active' : ''}`} aria-label="Home" aria-current={view === 'home' ? 'page' : undefined} onClick={() => navigate('home')}><Icon name="home" /></button>
          <button className={`nav-button ${view === 'work' ? 'is-active' : ''}`} aria-label="Work" aria-current={view === 'work' ? 'page' : undefined} onClick={() => navigate('work')}><Icon name="work" /></button>
          <button className="nav-button profile-button" aria-label="About Jordi" onClick={showProfile}><Icon name="profile" /></button>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <div hidden={view!=='home'}>
        <section className="linen-section" aria-label="Interactive linen window">
          <LinenWindow paused={loading || view!=='home'} opening={opening} onOpeningChange={setOpening} />
        </section>

        <Story/>
        </div>
        {view==='work'&&<Work selected={selectedProject} onSelect={selectProject}/>} 
      </main>

      <footer className="site-footer story-footer"><SocialLinks/></footer>
      <EdgeBlur edge="bottom" />
    </div>
    </>
  );
}
