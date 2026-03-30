import {supabase} from '../supabase';
import type {
  EnrichedMembership,
  InviteCodeResult,
  JoinResult,
  ActivateResult,
} from '../types';

function mapEnrichedMembership(row: any): EnrichedMembership {
  const ts = row.team_space;
  const t = ts.team;
  return {
    id: row.id,
    userId: row.user_id,
    teamSpaceId: row.team_space_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    managedChildId: row.managed_child_id,
    teamSpace: {
      id: ts.id,
      teamId: ts.team_id,
      displayName: ts.display_name,
      color: ts.color,
      logoUrl: ts.logo_url,
      inviteCode: ts.invite_code,
      isActivated: ts.is_activated,
      activatedAt: ts.activated_at,
    },
    team: {
      id: t.id,
      name: t.name,
      ageGroup: t.age_group,
      gender: t.gender,
      level: t.level,
      club: {
        id: t.club.id,
        name: t.club.name,
        shortName: t.club.short_name,
      },
      sport: {
        id: t.sport.id,
        slug: t.sport.slug,
        displayName: t.sport.display_name,
      },
    },
  };
}

export interface TeamSearchResult {
  id: string;
  name: string;
  ageGroup: string;
  gender: string;
  level: string;
  clubName: string;
  sportSlug: string;
  sportDisplayName: string;
}

export async function searchTeams(query?: string): Promise<TeamSearchResult[]> {
  let q = supabase
    .from('teams')
    .select('*, club:clubs(name), sport:sports(slug, display_name)')
    .order('name');

  if (query && query.trim().length > 0) {
    q = q.or(`name.ilike.%${query}%,clubs.name.ilike.%${query}%`);
  }

  const {data, error} = await q.limit(50);
  if (error) {
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    ageGroup: row.age_group,
    gender: row.gender,
    level: row.level,
    clubName: row.club?.name ?? '',
    sportSlug: row.sport?.slug ?? '',
    sportDisplayName: row.sport?.display_name ?? '',
  }));
}

export async function getUserMemberships(): Promise<EnrichedMembership[]> {
  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const {data, error} = await supabase
    .from('memberships')
    .select(
      `
      *,
      team_space:team_spaces!inner(
        *,
        team:teams!inner(
          *,
          club:clubs(*),
          sport:sports(*)
        )
      )
    `,
    )
    .eq('user_id', user.id)
    .eq('status', 'active')
    .is('team_space.deleted_at', null);

  if (error) {
    throw error;
  }
  return (data || []).map(mapEnrichedMembership);
}

export async function lookupInviteCode(
  code: string,
): Promise<InviteCodeResult | null> {
  const {data, error} = await supabase.rpc('lookup_invite_code', {
    code,
  });

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    displayName: data.display_name,
    color: data.color,
    clubName: data.club_name,
    sport: data.sport,
    memberCount: data.member_count,
  };
}

export async function joinTeamSpace(
  inviteCode: string,
  role: string,
): Promise<JoinResult> {
  const {data, error} = await supabase.rpc('join_team_space', {
    p_invite_code: inviteCode,
    p_role: role,
  });

  if (error) {
    throw error;
  }
  return {
    membershipId: data.membership_id,
    teamSpaceId: data.team_space_id,
    displayName: data.display_name,
  };
}

export async function activateTeamSpace(
  teamId: string,
  displayName: string,
  color: string = '#6366F1',
): Promise<ActivateResult> {
  const {data, error} = await supabase.rpc('activate_team_space', {
    p_team_id: teamId,
    p_display_name: displayName,
    p_color: color,
  });

  if (error) {
    throw error;
  }
  return {
    teamSpaceId: data.team_space_id,
    inviteCode: data.invite_code,
    membershipId: data.membership_id,
  };
}
