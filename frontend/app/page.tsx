'use client';

import { FormEvent, useState } from 'react';

type Screen = 'stories' | 'connect' | 'new' | 'brief';
type CreateStep = 'prompt' | 'spine' | 'building';
type SourceTab = 'used' | 'skipped' | 'unknown';

const storyRows = [
  { title: 'Allocation checkup', detail: 'Where the team is spending time, and what changed.', state: 'READY', age: '2h ago', open: true },
  { title: 'Pricing for launch', detail: 'The launch price and the reasoning behind it.', state: 'UPDATING', age: '6m ago', open: true },
  { title: 'Q4 research themes', detail: 'Signals emerging from customer research.', state: 'BUILDING', age: '34%', open: false },
];

const sourceGroups = {
  used: [
    { id: 'U1', author: '@maya', time: 'Today 09:14', text: 'The infrastructure work is necessary, but it has pulled two people away from activation for three weeks.' },
    { id: 'U2', author: '@jon', time: 'Today 10:02', text: 'Let’s move one engineer back to activation after the migration lands Friday.' },
  ],
  skipped: [
    { id: 'S1', author: '@lee', time: 'Yesterday 16:41', text: 'Lunch is arriving at 12:30.' },
  ],
  unknown: [
    { id: 'X1', author: 'unmatched', time: 'Today 08:50', text: 'A planning reference was mentioned, but Flint could not match it to an attached source.' },
  ],
};

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('stories');
  const [createStep, setCreateStep] = useState<CreateStep>('prompt');
  const [prompt, setPrompt] = useState('@channel #product @doc Allocation plan — where are we over-investing, and what should move?');
  const [sourceTab, setSourceTab] = useState<SourceTab>('used');
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [sourceChanged, setSourceChanged] = useState(true);
  const [financeAccess, setFinanceAccess] = useState(true);
  const [ask, setAsk] = useState('');
  const [episodes, setEpisodes] = useState<string[]>([]);
  const [pendingEpisode, setPendingEpisode] = useState('');
  const [updating, setUpdating] = useState(false);
  const commandReady = /@channel\b/i.test(prompt) && /@(doc|document)\b/i.test(prompt);

  function go(next: Screen) {
    setScreen(next);
    if (next === 'new') setCreateStep('prompt');
    window.scrollTo(0, 0);
  }

  function submitAsk(event: FormEvent) {
    event.preventDefault();
    const message = ask.trim();
    if (!message || updating) return;
    setAsk('');
    setPendingEpisode(message);
    setUpdating(true);
    window.setTimeout(() => {
      setEpisodes((current) => [...current, message]);
      setPendingEpisode('');
      setUpdating(false);
    }, 900);
  }

  return (
    <main className="shell">
      <nav className="terminal-bar" aria-label="Flint navigation">
        <button className="path" onClick={() => go('stories')}><span>~/wiki</span> $</button>
        <span className="route">{screen === 'new' ? 'new-story' : screen}</span>
        <span className="live"><i /> LIVE</span>
      </nav>

      {screen === 'stories' && (
        <section className="screen stories-screen">
          <header className="screen-header"><p>// STORIES</p><h1>Living briefs</h1><span>Slack and Docs, kept current.</span></header>
          <div className="story-list">
            {storyRows.map((story) => (
              <button key={story.title} className="story-row" onClick={() => story.open && go('brief')} disabled={!story.open}>
                <span className={`state state-${story.state.toLowerCase()}`}>{story.state}</span>
                <span className="story-copy"><strong>{story.title}</strong><small>{story.detail}</small></span>
                <span className="story-age">{story.age}</span><span className="arrow">›</span>
              </button>
            ))}
          </div>
          <button className="outline-command" onClick={() => go('new')}>+ NEW STORY</button>
        </section>
      )}

      {screen === 'connect' && (
        <section className="screen connect-screen">
          <header className="screen-header"><p>// CONNECT</p><h1>Sources</h1><span>Give Flint a place to read.</span></header>
          <div className="connector-list">
            <div className="connector"><span className="connector-icon slack">#</span><span><strong>Slack</strong><small>Channels and threads</small></span><button>CONNECTED</button></div>
            <div className="connector"><span className="connector-icon docs">D</span><span><strong>Google Docs</strong><small>Documents you mention</small></span><button>CONNECT</button></div>
          </div>
          <p className="security-note">// Flint only reads sources you attach to a story. Existing access controls remain in place.</p>
        </section>
      )}

      {screen === 'new' && (
        <section className="screen new-screen">
          <header className="screen-header"><p>// NEW STORY</p><h1>What should stay true?</h1><span>One command attaches the corpus and sets the spine.</span></header>
          {createStep === 'prompt' && <form className="create-form" onSubmit={(e) => { e.preventDefault(); if (commandReady) setCreateStep('spine'); }}>
            <div className="command-line">
              <label htmlFor="story-prompt">~/wiki $</label>
              <input id="story-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} autoComplete="off" spellCheck="false" autoFocus />
              <button type="submit" aria-label="Run command" disabled={!commandReady}>↵</button>
            </div>
            <div className="autocomplete" aria-live="polite"><span>@channel</span><span>@doc</span><span>@document</span></div>
          </form>}
          {createStep === 'spine' && <div className="spine">
            <p className="spine-label">SHARPENED SPINE</p>
            <blockquote>Show where product and engineering time is concentrated, what is being crowded out, and the allocation change the team has agreed to.</blockquote>
            <div className="attached"><span>@channel #product · @doc Allocation plan</span><span>13 sources</span></div>
            <div className="spine-actions"><button onClick={() => setCreateStep('prompt')}>← EDIT</button><button className="outline-command" onClick={() => setCreateStep('building')}>CONFIRM + BUILD</button></div>
          </div>}
          {createStep === 'building' && <div className="building-line"><i /><span>BUILDING STORY</span><small>Reading attached sources…</small></div>}
        </section>
      )}

      {screen === 'brief' && !financeAccess && (
        <section className="screen denied-screen">
          <p>// ACCESS</p><h1>Access denied</h1>
          <span>This brief requires a source you cannot access. Flint will not render a partial story.</span>
          <button className="outline-command" onClick={() => go('stories')}>← STORIES</button>
          <button className="demo-access" onClick={() => setFinanceAccess(true)}>DEMO: RESTORE ACCESS</button>
        </section>
      )}

      {screen === 'brief' && financeAccess && (
        <section className="screen brief-screen">
          <header className="brief-header"><p>// LIVING BRIEF · #PRODUCT</p><h1>Allocation checkup</h1><div className="meta"><span>STATUS: CURRENT</span><span>UPDATED: 2H AGO</span><span>OWNER: MAYA</span></div></header>
          <article className="story-prose">
            <p className="lead">The team is over-investing in infrastructure relative to its immediate goal: improving activation before the next planning cycle.</p>
            <p>Three weeks of migration work pulled two engineers from activation. The migration still needs to land, but the team agreed that one engineer will return to activation after Friday rather than rolling directly into the next infrastructure project. <button className="evidence-link" onClick={() => setSourcesOpen(!sourcesOpen)}>› E1 SOURCES</button>{sourceChanged && <span className="source-changed">! Source changed 2h ago</span>}</p>
            <p>That shift protects the work most closely tied to the quarter’s outcome without abandoning reliability. The remaining infrastructure owner will finish the migration and document follow-up work for the next cycle. <button className="evidence-link" onClick={() => setSourcesOpen(!sourcesOpen)}>› E2 SOURCES</button></p>
            <p>The budget impact stays within the approved headcount plan.</p>
            {episodes.map((episode, index) => <p className="reader-focus" key={`${episode}-${index}`}><span>EPISODE {index + 1} · ADDED TO STORY</span>{episode}</p>)}
          </article>

          {sourcesOpen && <aside className="source-panel">
            <div className="source-title"><span>SOURCES</span><button onClick={() => setSourcesOpen(false)}>×</button></div>
            <p className="how"><strong>HOW WE GOT HERE</strong>The recommendation combines the migration timeline with the team’s activation commitment.</p>
            <div className="source-tabs" role="tablist">
              {(['used', 'skipped', 'unknown'] as SourceTab[]).map((tab) => <button key={tab} className={sourceTab === tab ? 'active' : ''} onClick={() => setSourceTab(tab)}>{tab.toUpperCase()} <b>{sourceGroups[tab].length}</b></button>)}
            </div>
            <div className="quote-stack">{sourceGroups[sourceTab].map((source) => <blockquote key={source.id}><header><code>{source.id}</code><strong>{source.author}</strong><span>{source.time}</span></header><p>{source.text}</p></blockquote>)}</div>
          </aside>}

          {updating && <div className="updating-line"><i /><span>UPDATING STORY</span><small>Considering new episode: “{pendingEpisode}”</small></div>}
          <form className="ask-bar" onSubmit={submitAsk}><span>&gt;</span><input value={ask} onChange={(e) => setAsk(e.target.value)} disabled={updating} aria-label="Ask or share an idea about this page" placeholder="Ask or share an idea about this page…" /><button disabled={updating}>SEND ↵</button></form>

          <details className="demo-controls"><summary>DEMO_CONTROLS</summary><div><label><input type="checkbox" checked={financeAccess} onChange={(e) => setFinanceAccess(e.target.checked)} /> FINANCE_ACCESS</label><button onClick={() => setSourceChanged(!sourceChanged)}>{sourceChanged ? 'CLEAR' : 'CHANGE SOURCE'}</button></div></details>
        </section>
      )}

      <footer className="tabbar">
        <button className={screen === 'stories' || screen === 'brief' ? 'active' : ''} onClick={() => go('stories')}><span>▤</span>STORIES</button>
        <button className={screen === 'new' ? 'active' : ''} onClick={() => go('new')}><span>＋</span>NEW</button>
        <button className={screen === 'connect' ? 'active' : ''} onClick={() => go('connect')}><span>⌁</span>CONNECT</button>
      </footer>
    </main>
  );
}
