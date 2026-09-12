import { v4 as uuidv4 } from 'uuid';
import { SlackMessage, Episode, Claim } from './types.js';

export const CHANNEL_ID = 'C_flint_v0_fixture';

export const fixtureMessages: SlackMessage[] = [
  {
    id: 'msg_001',
    channelId: CHANNEL_ID,
    userId: 'U001',
    userName: 'Alice',
    text: 'We should price at $49/mo for launch. That gives us room to add features and move up-market later.',
    timestamp: '2026-09-10T14:23:00Z',
    isDeleted: false,
    editHistory: [],
    aclRestricted: false,
  },
  {
    id: 'msg_002',
    channelId: CHANNEL_ID,
    userId: 'U002',
    userName: 'Bob',
    text: 'Agree. Our CAC analysis shows we need at least $40 to break even on paid acquisition.',
    timestamp: '2026-09-10T14:25:00Z',
    isDeleted: false,
    editHistory: [],
    aclRestricted: false,
  },
  {
    id: 'msg_003',
    channelId: CHANNEL_ID,
    userId: 'U003',
    userName: 'Charlie',
    text: 'The competitor analysis shows most are in the $39-$69 range, so $49 positions us right in the middle.',
    timestamp: '2026-09-10T14:30:00Z',
    isDeleted: false,
    editHistory: [],
    aclRestricted: false,
  },
  {
    id: 'msg_004',
    channelId: CHANNEL_ID,
    userId: 'U001',
    userName: 'Alice',
    text: 'Our burn rate is $180K/mo and we have 8 months runway. The $49 price point gives us the best shot at getting to breakeven before we run out.',
    timestamp: '2026-09-10T14:35:00Z',
    isDeleted: false,
    editHistory: [],
    aclRestricted: true,
  },
  {
    id: 'msg_005',
    channelId: CHANNEL_ID,
    userId: 'U002',
    userName: 'Bob',
    text: 'Initially we thought $29 would drive more volume, but the unit economics don\'t work.',
    timestamp: '2026-09-10T14:40:00Z',
    isDeleted: false,
    editHistory: [],
    aclRestricted: false,
  },
  {
    id: 'msg_006',
    channelId: CHANNEL_ID,
    userId: 'U004',
    userName: 'Dana',
    text: 'Decided: Launch pricing is $49/month. Will revisit in Q4 based on conversion data.',
    timestamp: '2026-09-10T15:00:00Z',
    isDeleted: false,
    editHistory: [],
    aclRestricted: false,
  },
];

export const fixtureEpisode: Episode = {
  id: 'episode_001',
  channelId: CHANNEL_ID,
  title: 'Pricing for launch',
  claims: {
    theCall: [
      {
        id: uuidv4(),
        text: 'Launch pricing set at $49/month, will revisit in Q4 based on conversion data.',
        sourceMessageId: 'msg_006',
        episodeId: 'episode_001',
        isPinned: false,
        shouldntStand: false,
        aclRestricted: false,
      },
    ],
    whyItMattered: [
      {
        id: uuidv4(),
        text: 'Positioned in competitive middle ($39-$69 range) while maintaining unit economics.',
        sourceMessageId: 'msg_003',
        episodeId: 'episode_001',
        isPinned: false,
        shouldntStand: false,
        aclRestricted: false,
      },
      {
        id: uuidv4(),
        text: 'CAC analysis required minimum $40 price point to break even on paid acquisition.',
        sourceMessageId: 'msg_002',
        episodeId: 'episode_001',
        isPinned: false,
        shouldntStand: false,
        aclRestricted: false,
      },
      {
        id: uuidv4(),
        text: '[Financial details about runway and burn rate]',
        sourceMessageId: 'msg_004',
        episodeId: 'episode_001',
        isPinned: false,
        shouldntStand: false,
        aclRestricted: true,
      },
    ],
    whatNoLongerBelongs: [
      {
        id: uuidv4(),
        text: 'Earlier $29 price point rejected due to poor unit economics.',
        sourceMessageId: 'msg_005',
        episodeId: 'episode_001',
        isPinned: false,
        shouldntStand: false,
        aclRestricted: false,
      },
    ],
  },
  createdAt: '2026-09-10T15:00:00Z',
  updatedAt: '2026-09-10T15:00:00Z',
};

export class DataStore {
  private messages: Map<string, SlackMessage>;
  private episodes: Map<string, Episode>;
  private currentViewerHasFinanceAccess: boolean = false;

  constructor() {
    this.messages = new Map(fixtureMessages.map((m) => [m.id, { ...m }]));
    this.episodes = new Map([[fixtureEpisode.id, JSON.parse(JSON.stringify(fixtureEpisode))]]);
  }

  setViewerAccess(hasFinanceAccess: boolean) {
    this.currentViewerHasFinanceAccess = hasFinanceAccess;
  }

  getViewerAccess(): boolean {
    return this.currentViewerHasFinanceAccess;
  }

  getMessage(id: string): SlackMessage | undefined {
    return this.messages.get(id);
  }

  getAllMessages(): SlackMessage[] {
    return Array.from(this.messages.values());
  }

  editMessage(id: string, newText: string): boolean {
    const msg = this.messages.get(id);
    if (!msg || msg.isDeleted) return false;

    msg.editHistory.push({
      text: msg.text,
      editedAt: new Date().toISOString(),
    });
    msg.text = newText;

    this.markClaimsFromMessage(id);
    return true;
  }

  deleteMessage(id: string): boolean {
    const msg = this.messages.get(id);
    if (!msg || msg.isDeleted) return false;

    msg.isDeleted = true;
    this.markClaimsFromMessage(id);
    return true;
  }

  private markClaimsFromMessage(messageId: string) {
    for (const episode of this.episodes.values()) {
      const allClaims = [
        ...episode.claims.theCall,
        ...episode.claims.whyItMattered,
        ...episode.claims.whatNoLongerBelongs,
      ];

      for (const claim of allClaims) {
        if (claim.sourceMessageId === messageId && !claim.isPinned) {
          claim.shouldntStand = true;
        }
      }
    }
  }

  getEpisode(id: string): Episode | undefined {
    return this.episodes.get(id);
  }

  getAllEpisodes(): Episode[] {
    return Array.from(this.episodes.values());
  }

  togglePin(episodeId: string, claimId: string): boolean {
    const episode = this.episodes.get(episodeId);
    if (!episode) return false;

    const allClaims = [
      ...episode.claims.theCall,
      ...episode.claims.whyItMattered,
      ...episode.claims.whatNoLongerBelongs,
    ];

    const claim = allClaims.find((c) => c.id === claimId);
    if (!claim) return false;

    claim.isPinned = !claim.isPinned;
    if (claim.isPinned) {
      claim.shouldntStand = false;
    }
    return true;
  }

  reproject(episodeId: string): Episode | undefined {
    const episode = this.episodes.get(episodeId);
    if (!episode) return undefined;

    const allClaims = [
      ...episode.claims.theCall,
      ...episode.claims.whyItMattered,
      ...episode.claims.whatNoLongerBelongs,
    ];

    for (const claim of allClaims) {
      if (!claim.isPinned) {
        const msg = this.messages.get(claim.sourceMessageId);
        if (msg && (msg.isDeleted || msg.editHistory.length > 0)) {
          claim.shouldntStand = true;
        }
      }
    }

    episode.updatedAt = new Date().toISOString();
    return episode;
  }
}

export const dataStore = new DataStore();
