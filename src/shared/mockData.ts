import type {Team, HeiaEvent, User, FeedItem, MatchEvent} from './types';

// ---------------------------------------------------------------------------
// Brukere
// ---------------------------------------------------------------------------
export const currentUser: User = {
  id: 'u1',
  name: 'Marte Johansen',
  role: 'forelder',
};

export const coach: User = {
  id: 'u2',
  name: 'Henrik Solvang',
  role: 'trener',
};

export const users: User[] = [
  currentUser,
  coach,
  {id: 'u3', name: 'Sofie Berg', role: 'forelder'},
  {id: 'u4', name: 'Erlend Haugen', role: 'forelder'},
  {id: 'u5', name: 'Ingrid Nordli', role: 'forelder'},
  {id: 'u6', name: 'Thomas Bakke', role: 'forelder'},
  {id: 'u7', name: 'Camilla Strand', role: 'forelder'},
  {id: 'u8', name: 'Andreas Vik', role: 'forelder'},
  {id: 'u9', name: 'Kristin Dale', role: 'forelder'},
  {id: 'u10', name: 'Lars Moen', role: 'forelder'},
  {id: 'u11', name: 'Hilde Lund', role: 'forelder'},
  {id: 'u12', name: 'Ole Martin Skår', role: 'forelder'},
  {id: 'u13', name: 'Ragnhild Fjeld', role: 'forelder'},
  {id: 'u14', name: 'Eirik Brekke', role: 'forelder'},
  {id: 'u15', name: 'Silje Aas', role: 'forelder'},
];

export function isAdmin(userId: string): boolean {
  const user = users.find(u => u.id === userId);
  return user?.role === 'trener';
}

// ---------------------------------------------------------------------------
// Lag
// ---------------------------------------------------------------------------
export const team: Team = {
  id: 't1',
  name: 'Fjellørn G13',
  sport: 'fotball',
  ageGroup: 'Gutter 13 år',
  color: '#2563EB',
  memberCount: 15,
};

// ---------------------------------------------------------------------------
// Hjelpefunksjon for datoer relative til "nå"
// ---------------------------------------------------------------------------
function daysFromNow(days: number, hour: number, minute: number = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Live kamp-hendelser
// ---------------------------------------------------------------------------
export const liveMatchEvents: MatchEvent[] = [
  {
    id: 'me1',
    matchId: 'e2',
    type: 'avspark',
    minute: 0,
    description: 'Kampen er i gang!',
    reportedBy: 'u2',
    createdAt: daysFromNow(0, 11, 0),
  },
  {
    id: 'me2',
    matchId: 'e2',
    type: 'mål',
    minute: 8,
    player: 'Erlend H.',
    description: 'Erlend H. scorer på en flott heading! 1-0 til Fjellørn!',
    reportedBy: 'u2',
    createdAt: daysFromNow(0, 11, 8),
  },
  {
    id: 'me3',
    matchId: 'e2',
    type: 'mål',
    minute: 23,
    player: 'Oliver K.',
    description: 'Lyn utligner med et langskudd. 1-1.',
    reportedBy: 'u2',
    createdAt: daysFromNow(0, 11, 23),
  },
  {
    id: 'me4',
    matchId: 'e2',
    type: 'pause',
    minute: 30,
    description: 'Pause. Stillingen er 1-1.',
    reportedBy: 'u2',
    createdAt: daysFromNow(0, 11, 30),
  },
  {
    id: 'me5',
    matchId: 'e2',
    type: 'andre_omgang',
    minute: 30,
    description: 'Andre omgang er i gang!',
    reportedBy: 'u2',
    createdAt: daysFromNow(0, 11, 45),
  },
  {
    id: 'me6',
    matchId: 'e2',
    type: 'mål',
    minute: 52,
    player: 'Sofie B. jr.',
    description: 'MÅL! Sofie B. jr. med et kremmål! 2-1 til Fjellørn!',
    reportedBy: 'u2',
    createdAt: daysFromNow(0, 12, 7),
  },
  {
    id: 'me7',
    matchId: 'e2',
    type: 'bytte',
    minute: 55,
    player: 'Thomas B.',
    description: 'Bytte: Thomas B. inn for Magnus L.',
    reportedBy: 'u2',
    createdAt: daysFromNow(0, 12, 10),
  },
];

// ---------------------------------------------------------------------------
// Hendelser
// ---------------------------------------------------------------------------
export const events: HeiaEvent[] = [
  {
    id: 'e1',
    teamId: 't1',
    type: 'trening',
    title: 'Trening',
    startTime: daysFromNow(1, 17, 0),
    endTime: daysFromNow(1, 18, 30),
    location: 'Nadderud kunstgress',
    description: 'Vanlig trening. Husk leggskinn og vannflaske!',
    rsvp: {
      coming: 10,
      notComing: 2,
      pending: 3,
      myStatus: 'venter',
    },
  },
  {
    id: 'e2',
    teamId: 't1',
    type: 'kamp',
    title: 'Kamp vs. Lyn G13',
    startTime: daysFromNow(0, 11, 0),
    endTime: daysFromNow(0, 12, 30),
    location: 'Bislett stadion, bane 2',
    description:
      'Seriekamp! Oppmøte senest 10:30. Ta med begge draktsett (hvit + blå).',
    opponent: 'Lyn G13',
    matchStatus: 'live',
    score: {home: 2, away: 1},
    matchEvents: liveMatchEvents,
    reporterId: 'u2',
    rsvp: {
      coming: 12,
      notComing: 1,
      pending: 2,
      myStatus: 'venter',
    },
  },
  {
    id: 'e3',
    teamId: 't1',
    type: 'sosialt',
    title: 'Lagkveld med pizza',
    startTime: daysFromNow(8, 18, 0),
    endTime: daysFromNow(8, 20, 0),
    location: 'Klubbhuset',
    description:
      'Sesongavslutning! Pizza og brus. Foreldre er velkomne. Ta med godt humør!',
    rsvp: {
      coming: 8,
      notComing: 0,
      pending: 7,
      myStatus: 'venter',
    },
  },
];

// ---------------------------------------------------------------------------
// RSVP-lister for event-detalj
// ---------------------------------------------------------------------------
export const eventAttendees = {
  e1: {
    coming: users.filter(u => ['u1', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u2'].includes(u.id)),
    notComing: users.filter(u => ['u11', 'u12'].includes(u.id)),
    pending: users.filter(u => ['u13', 'u14', 'u15'].includes(u.id)),
  },
  e2: {
    coming: users.filter(u =>
      [
        'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11',
        'u13', 'u14',
      ].includes(u.id),
    ),
    notComing: users.filter(u => ['u12'].includes(u.id)),
    pending: users.filter(u => ['u1', 'u15'].includes(u.id)),
  },
};

// ---------------------------------------------------------------------------
// Feed (match-events øverst, deretter vanlige innlegg)
// ---------------------------------------------------------------------------
export const feedItems: FeedItem[] = [
  {
    id: 'f_me6',
    type: 'match_event',
    author: coach,
    createdAt: daysFromNow(0, 12, 7),
    content: 'MÅL! Sofie B. jr. med et kremmål! 2-1 til Fjellørn!',
    matchEvent: liveMatchEvents[5],
    eventId: 'e2',
  },
  {
    id: 'f_me4',
    type: 'match_event',
    author: coach,
    createdAt: daysFromNow(0, 11, 30),
    content: 'Pause. Stillingen er 1-1.',
    matchEvent: liveMatchEvents[3],
    eventId: 'e2',
  },
  {
    id: 'f_me2',
    type: 'match_event',
    author: coach,
    createdAt: daysFromNow(0, 11, 8),
    content: 'Erlend H. scorer på en flott heading! 1-0 til Fjellørn!',
    matchEvent: liveMatchEvents[1],
    eventId: 'e2',
  },
  {
    id: 'f1',
    type: 'melding',
    author: coach,
    createdAt: daysFromNow(0, 9, 15),
    content:
      'Hei alle sammen! Husk trening i morgen kl 17. Vi jobber med pasninger og avslutninger. Ta med vannflaske!',
  },
  {
    id: 'f2',
    type: 'bilde',
    author: users[2],
    createdAt: daysFromNow(-1, 18, 45),
    content: 'For en kamp i dag! Gutta ga alt. Stolt lagmamma her!',
    imageUrl: 'https://picsum.photos/seed/heia1/400/300',
  },
  {
    id: 'f3',
    type: 'paaminnelse',
    author: coach,
    createdAt: daysFromNow(-2, 20, 0),
    content:
      'Påminnelse: Seriekamp mot Lyn på lørdag! Oppmøte 10:30 på Bislett. Hvem kan kjøre?',
  },
  {
    id: 'f4',
    type: 'melding',
    author: users[3],
    createdAt: daysFromNow(-3, 12, 30),
    content:
      'Noen som vil dele på kjøring til kampen? Har plass til 3 i bilen.',
  },
  {
    id: 'f5',
    type: 'resultat',
    author: coach,
    createdAt: daysFromNow(-5, 14, 0),
    content:
      'Fjellørn G13 3 - 1 Grei G13. Fantastisk innsats av hele laget! Erlend med to mål og Sofie junior med et kremmål.',
  },
];
