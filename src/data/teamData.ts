import type {
  HeiaEvent,
  FeedItem,
  Membership,
  Team,
  TeamSpace,
  User,
  UserRole,
} from '../shared/types';
import {
  events,
  feedItems,
  teamSpaces,
  memberships,
  users,
  teams,
} from '../shared/mockData';

export function getEventsForTeamSpace(teamSpaceId: string): HeiaEvent[] {
  return events.filter(e => e.teamSpaceId === teamSpaceId);
}

export function getFeedForTeamSpace(teamSpaceId: string): FeedItem[] {
  return feedItems.filter(f => f.teamSpaceId === teamSpaceId);
}

export function getMembersForTeamSpace(
  teamSpaceId: string,
): (User & {role: UserRole})[] {
  const mships = memberships.filter(m => m.teamSpaceId === teamSpaceId);
  return mships.map(m => {
    const user = users.find(u => u.id === m.userId)!;
    return {...user, role: m.role};
  });
}

export function getMembershipsForUser(
  userId: string,
): (Membership & {teamSpace: TeamSpace; team: Team})[] {
  return memberships
    .filter(m => m.userId === userId)
    .map(m => {
      const ts = teamSpaces.find(t => t.id === m.teamSpaceId)!;
      const team = teams.find(t => t.id === ts.teamId)!;
      return {...m, teamSpace: ts, team};
    });
}

export function getUserRoleInTeam(
  userId: string,
  teamSpaceId: string,
): UserRole | null {
  const m = memberships.find(
    ms => ms.userId === userId && ms.teamSpaceId === teamSpaceId,
  );
  return m?.role ?? null;
}

export function getTeamSpaceById(teamSpaceId: string): TeamSpace | null {
  return teamSpaces.find(ts => ts.id === teamSpaceId) ?? null;
}

export function getTeamForSpace(teamSpaceId: string): Team | null {
  const ts = teamSpaces.find(t => t.id === teamSpaceId);
  if (!ts) return null;
  return teams.find(t => t.id === ts.teamId) ?? null;
}

export function getMemberCount(teamSpaceId: string): number {
  return memberships.filter(m => m.teamSpaceId === teamSpaceId).length;
}
