import express from 'express';
import cors from 'cors';
import { dataStore } from './fixtures.js';
import { DemoControl } from './types.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/episodes', (req, res) => {
  const episodes = dataStore.getAllEpisodes();
  res.json(episodes);
});

app.get('/api/episodes/:id', (req, res) => {
  const episode = dataStore.getEpisode(req.params.id);
  if (!episode) {
    return res.status(404).json({ error: 'Episode not found' });
  }

  const hasFinanceAccess = req.query.hasFinanceAccess === 'true';
  dataStore.setViewerAccess(hasFinanceAccess);

  const filteredEpisode = {
    ...episode,
    claims: {
      theCall: episode.claims.theCall.map(filterClaim),
      whyItMattered: episode.claims.whyItMattered.map(filterClaim),
      whatNoLongerBelongs: episode.claims.whatNoLongerBelongs.map(filterClaim),
    },
  };

  res.json(filteredEpisode);
});

function filterClaim(claim: any) {
  if (claim.aclRestricted && !dataStore.getViewerAccess()) {
    return {
      ...claim,
      text: '[Source exists — no access]',
      isStub: true,
    };
  }
  return { ...claim, isStub: false };
}

app.get('/api/messages/:id', (req, res) => {
  const message = dataStore.getMessage(req.params.id);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const hasFinanceAccess = req.query.hasFinanceAccess === 'true';
  if (message.aclRestricted && !hasFinanceAccess) {
    return res.status(403).json({ 
      error: 'Access denied',
      isRestricted: true,
      messageId: message.id,
    });
  }

  res.json(message);
});

app.post('/api/demo/control', (req, res) => {
  const control: DemoControl = req.body;

  if (control.action === 'edit' && control.newText) {
    const success = dataStore.editMessage(control.messageId, control.newText);
    return res.json({ success, action: 'edit' });
  }

  if (control.action === 'delete') {
    const success = dataStore.deleteMessage(control.messageId);
    return res.json({ success, action: 'delete' });
  }

  res.status(400).json({ error: 'Invalid demo control' });
});

app.post('/api/episodes/:episodeId/claims/:claimId/pin', (req, res) => {
  const { episodeId, claimId } = req.params;
  const success = dataStore.togglePin(episodeId, claimId);
  
  if (success) {
    const episode = dataStore.getEpisode(episodeId);
    return res.json(episode);
  }
  
  res.status(404).json({ error: 'Episode or claim not found' });
});

app.post('/api/episodes/:id/reproject', (req, res) => {
  const episode = dataStore.reproject(req.params.id);
  if (!episode) {
    return res.status(404).json({ error: 'Episode not found' });
  }
  res.json(episode);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
