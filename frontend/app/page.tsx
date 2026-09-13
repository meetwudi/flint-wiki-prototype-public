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

const story = {
  title: 'Allocation checkup',
  subtitle: 'Where product and engineering time is concentrated—and what should move next.',
  summary: [
    'The team is over-investing in infrastructure relative to its immediate goal: improving activation before the next planning cycle.',
    'Three weeks of migration work pulled two engineers from activation. The migration still needs to land, but the team agreed that one engineer will return to activation after Friday rather than rolling directly into the next infrastructure project.',
    'That shift protects the quarter’s outcome without abandoning reliability. The remaining infrastructure owner will finish the migration and document follow-up work for the next cycle. The budget impact stays within the approved headcount plan.',
  ],
  evidence: [
    {
      id: 'E1',
      title: 'Migration work displaced activation capacity',
      note: 'Two source excerpts · Slack',
      quotes: sourceGroups.used,
    },
    {
      id: 'E2',
      title: 'One engineer returns after Friday',
      note: 'One source excerpt · Allocation plan',
      quotes: [sourceGroups.used[1]],
    },
  ],
};

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('brief');
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
  const [timelineOpen, setTimelineOpen] = useState(false);
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
    setTimelineOpen(true);
    window.setTimeout(() => {
      setEpisodes((current) => [...current, message]);
      setPendingEpisode('');
      setUpdating(false);
      setTimelineOpen(false);
    }, 900);
  }

  return (
    <main className="shell">
      <nav className="terminal-bar" aria-label="Flint navigation">
        <button className="path" onClick={() => go('stories')}><span>~/wiki</span> $</button>
        <span className="route">chrome <b>—</b> {screen === 'new' ? 'new-story' : screen}</span>
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
          <article className="article">
            <header className="brief-header"><p>// LIVING BRIEF · #PRODUCT</p><h1>{story.title}</h1><p className="subtitle">{story.subtitle}</p><div className="meta"><span>STATUS: CURRENT</span><span>UPDATED: 2H AGO</span><span>OWNER: MAYA</span></div></header>

            {(updating || episodes.length > 0) && <details className="process" open={timelineOpen} onToggle={(event) => setTimelineOpen(event.currentTarget.open)}>
              <summary><span><i />{updating ? 'UPDATING STORY' : 'LATEST UPDATE RESOLVED'}</span><small>{updating ? 'RUNNING NOW' : 'COLLAPSED · VIEW PROCESS'}</small></summary>
              <ol>
                <li><time>10:42:01</time><b>RUN</b><span>Received “{pendingEpisode || episodes[episodes.length - 1]}”</span></li>
                <li><time>10:42:02</time><b>RUN</b><span>Importing threads from #product</span></li>
                <li><time>10:42:04</time><b>SYNTHESIS</b><span>Comparing the new episode with the current story and evidence</span></li>
                <li className={updating ? 'waiting' : 'resolved'}><time>10:42:06</time><b>{updating ? 'RUNNING' : 'RESOLVED'}</b><span>{updating ? 'Updating the article…' : 'Article updated; source links retained'}</span></li>
              </ol>
            </details>}

            <section className="story-prose" aria-labelledby="summary-heading">
              <h2 id="summary-heading">Summary</h2>
              {story.summary.map((paragraph, index) => <p className={index === 0 ? 'lead' : ''} key={paragraph}>{paragraph}{index === 1 && sourceChanged && <span className="source-changed">! Source changed 2h ago</span>}</p>)}
              {episodes.map((episode, index) => <p className="reader-focus" key={`${episode}-${index}`}><span>EPISODE {index + 1} · INCORPORATED</span>{episode}</p>)}
            </section>

            <section className="evidence" aria-labelledby="evidence-heading">
              <div className="section-heading"><p>// GROUNDED IN SOURCE MATERIAL</p><h2 id="evidence-heading">Evidence</h2></div>
              {story.evidence.map((item) => <details className="evidence-card" key={item.id}>
                <summary><code>{item.id}</code><span><strong>{item.title}</strong><small>{item.note}</small></span><i>+</i></summary>
                <div className="evidence-quotes">{item.quotes.map((quote) => <blockquote key={quote.id}><p>“{quote.text}”</p><footer><strong>{quote.author}</strong><span>{quote.time}</span></footer></blockquote>)}</div>
              </details>)}
              <button className="sources-button" onClick={() => setSourcesOpen(!sourcesOpen)} aria-expanded={sourcesOpen}>SOURCES / HOW WE GOT HERE <span>{sourcesOpen ? '↑' : '↓'}</span></button>
              {sourcesOpen && <aside className="source-panel">
                <div className="source-title"><span>SOURCES / HOW WE GOT HERE</span><button onClick={() => setSourcesOpen(false)} aria-label="Close sources">×</button></div>
                <p className="how">The recommendation combines the migration timeline with the team’s activation commitment.</p>
                <div className="source-tabs" role="tablist">
                  {(['used', 'skipped', 'unknown'] as SourceTab[]).map((tab) => <button key={tab} className={sourceTab === tab ? 'active' : ''} onClick={() => setSourceTab(tab)}>{tab.toUpperCase()} <b>{sourceGroups[tab].length}</b></button>)}
                </div>
                <div className="quote-stack">{sourceGroups[sourceTab].map((source) => <blockquote key={source.id}><header><code>{source.id}</code><strong>{source.author}</strong><span>{source.time}</span></header><p>{source.text}</p></blockquote>)}</div>
              </aside>}
            </section>
          </article>

          <form className="ask-bar" onSubmit={submitAsk}><span className="prompt-mark">~/wiki $</span><input value={ask} onChange={(e) => setAsk(e.target.value)} disabled={updating} aria-label="Ask or share an idea about this page" placeholder="Ask or share an idea about this page…" /><button type="button" className="mic" aria-label="Start voice input" title="Voice input"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4Zm-7-4a7 7 0 0 0 14 0M12 18v4m-4 0h8" /></svg></button><button className="send" disabled={updating} aria-label="Send">↵</button></form>

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
