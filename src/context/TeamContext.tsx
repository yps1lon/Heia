import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type {Membership, Team, TeamSpace} from '../shared/types';
import {getMembershipsForUser} from '../data/teamData';
import {useUser} from './UserContext';

type EnrichedMembership = Membership & {teamSpace: TeamSpace; team: Team};

interface TeamContextValue {
  activeTeamSpaceId: string | null;
  activeTeamSpace: TeamSpace | null;
  activeTeam: Team | null;
  userMemberships: EnrichedMembership[];
  setActiveTeamSpace: (teamSpaceId: string) => void;
}

const TeamContext = createContext<TeamContextValue | undefined>(undefined);

export function TeamProvider({children}: PropsWithChildren) {
  const {user} = useUser();
  const [activeTeamSpaceId, setActiveTeamSpaceId] = useState<string | null>(
    null,
  );

  const userMemberships = useMemo<EnrichedMembership[]>(() => {
    if (!user) return [];
    return getMembershipsForUser(user.id);
  }, [user]);

  // Auto-velg første lag ved innlogging
  useEffect(() => {
    if (user && userMemberships.length > 0 && !activeTeamSpaceId) {
      setActiveTeamSpaceId(userMemberships[0].teamSpaceId);
    }
    if (!user) {
      setActiveTeamSpaceId(null);
    }
  }, [user, userMemberships, activeTeamSpaceId]);

  const activeTeamSpace = useMemo(
    () =>
      userMemberships.find(m => m.teamSpaceId === activeTeamSpaceId)
        ?.teamSpace ?? null,
    [userMemberships, activeTeamSpaceId],
  );

  const activeTeam = useMemo(
    () =>
      userMemberships.find(m => m.teamSpaceId === activeTeamSpaceId)?.team ??
      null,
    [userMemberships, activeTeamSpaceId],
  );

  const setActiveTeamSpace = useCallback((teamSpaceId: string) => {
    setActiveTeamSpaceId(teamSpaceId);
  }, []);

  return (
    <TeamContext.Provider
      value={{
        activeTeamSpaceId,
        activeTeamSpace,
        activeTeam,
        userMemberships,
        setActiveTeamSpace,
      }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useActiveTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error('useActiveTeam must be used within TeamProvider');
  }
  return ctx;
}
