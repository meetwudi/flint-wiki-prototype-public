export interface SlackMessage {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isDeleted: boolean;
  editHistory: Array<{
    text: string;
    editedAt: string;
  }>;
  aclRestricted: boolean;
}

export interface Claim {
  id: string;
  text: string;
  sourceMessageId: string;
  episodeId: string;
  isPinned: boolean;
  sourceChanged: boolean;
  aclRestricted: boolean;
}

export interface Episode {
  id: string;
  channelId: string;
  title: string;
  claims: {
    theCall: Claim[];
    whyItMattered: Claim[];
    whatNoLongerBelongs: Claim[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface DemoControl {
  messageId: string;
  action: 'edit' | 'delete';
  newText?: string;
}
