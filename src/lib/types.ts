// ---------------------------------------------------------------------------
// Supabase-aligned types — matcher DB-skjemaet og RPC-responser.
// Gamle typer i src/shared/types.ts beholdes midlertidig for
// skjermer som ikke er migrert ennå.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Auth & Profil
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string | null;
  locale: string;
  onboardingCompleted: boolean;
  householdId: string | null;
}

// ---------------------------------------------------------------------------
// Sports & Clubs
// ---------------------------------------------------------------------------

export interface Sport {
  id: string;
  slug: string;
  displayName: string;
}

export interface Club {
  id: string;
  name: string;
  shortName: string | null;
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export interface Team {
  id: string;
  name: string;
  ageGroup: string;
  gender: 'male' | 'female' | 'mixed';
  level: 'recreational' | 'competitive';
  club: Club;
  sport: Sport;
}

// ---------------------------------------------------------------------------
// Team Spaces
// ---------------------------------------------------------------------------

export interface TeamSpace {
  id: string;
  teamId: string;
  displayName: string;
  color: string;
  logoUrl: string | null;
  inviteCode: string;
  isActivated: boolean;
  activatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Memberships
// ---------------------------------------------------------------------------

export type MemberRole =
  | 'trener'
  | 'lagleder'
  | 'admin'
  | 'forelder'
  | 'spiller';

export type MemberStatus = 'invited' | 'active' | 'inactive' | 'removed';

export interface Membership {
  id: string;
  userId: string;
  teamSpaceId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  managedChildId: string | null;
}

export interface EnrichedMembership extends Membership {
  teamSpace: TeamSpace;
  team: Team;
}

// ---------------------------------------------------------------------------
// RPC response types
// ---------------------------------------------------------------------------

export interface InviteCodeResult {
  id: string;
  displayName: string;
  color: string;
  clubName: string;
  sport: string;
  memberCount: number;
}

export interface JoinResult {
  membershipId: string;
  teamSpaceId: string;
  displayName: string;
}

export interface ActivateResult {
  teamSpaceId: string;
  inviteCode: string;
  membershipId: string;
}
