// ---------------------------------------------------------------------------
// Sport & Event-typer — skalerbar via enum-utvidelse
// ---------------------------------------------------------------------------
export type SportType =
  | 'fotball'
  | 'handball'
  | 'basket'
  | 'ishockey'
  | 'annet';

export type EventType = 'trening' | 'kamp' | 'sosialt' | 'annet';

export type RSVPStatus = 'kommer' | 'kan_ikke' | 'venter';

export type UserRole = 'trener' | 'forelder' | 'spiller';

export type MatchStatus = 'upcoming' | 'live' | 'halfTime' | 'finished';

export type MatchEventType =
  | 'avspark'
  | 'mål'
  | 'pause'
  | 'andre_omgang'
  | 'slutt'
  | 'bytte'
  | 'kort'
  | 'melding';

export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  player?: string;
  description: string;
  reportedBy: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Datamodeller
// ---------------------------------------------------------------------------
export interface Team {
  id: string;
  name: string;
  sport: SportType;
  ageGroup: string;
  color: string;
  logoUrl?: string;
  memberCount: number;
}

export interface HeiaEvent {
  id: string;
  teamId: string;
  type: EventType;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description?: string;
  rsvp: RSVPSummary;
  score?: {home: number; away: number};
  opponent?: string;
  matchStatus?: MatchStatus;
  matchEvents?: MatchEvent[];
  reporterId?: string;
}

export interface RSVPSummary {
  coming: number;
  notComing: number;
  pending: number;
  myStatus: RSVPStatus;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface FeedItem {
  id: string;
  type: 'melding' | 'bilde' | 'paaminnelse' | 'resultat' | 'match_event' | 'match_start' | 'match_end';
  author: User;
  createdAt: Date;
  content: string;
  imageUrl?: string;
  matchEvent?: MatchEvent;
  eventId?: string;
}

// ---------------------------------------------------------------------------
// Navigation types
// ---------------------------------------------------------------------------
export type RootTabParamList = {
  HjemStack: undefined;
  Kalender: undefined;
  Opprett: undefined;
  Meldinger: undefined;
  Mer: undefined;
};

export type HomeStackParamList = {
  TeamHome: undefined;
  EventDetail: {eventId: string};
  Support: undefined;
};
