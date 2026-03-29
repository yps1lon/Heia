import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography, spacing, radius, shadows} from '../theme';
import {Button} from '../components';
import {useUser} from '../context';
import {useActiveTeam} from '../context';
import {
  getTeamSpaceForTeam,
  getMemberCount,
  activateTeam,
  joinTeamSpace,
} from '../data/teamData';
import {teams, users} from '../shared/mockData';
import type {UserRole, OnboardingStackParamList} from '../shared/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TeamJoin'>;

const ROLES: {key: UserRole; label: string; description: string}[] = [
  {key: 'forelder', label: 'Forelder', description: 'Følger opp barnet'},
  {key: 'trener', label: 'Trener', description: 'Leder laget'},
];

export function TeamJoinScreen({route}: Props) {
  const insets = useSafeAreaInsets();
  const {userId, teamId} = route.params;
  const {setUser} = useUser();
  const {setActiveTeamSpace} = useActiveTeam();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const team = teams.find(t => t.id === teamId)!;
  const existingTeamSpace = getTeamSpaceForTeam(teamId);
  const memberCount = existingTeamSpace
    ? getMemberCount(existingTeamSpace.id)
    : 0;

  const handleConfirm = () => {
    if (!selectedRole) return;

    let teamSpaceId: string;

    if (existingTeamSpace) {
      const membership = joinTeamSpace(existingTeamSpace.id, userId, selectedRole);
      teamSpaceId = membership.teamSpaceId;
    } else {
      const {teamSpace} = activateTeam(teamId, userId, selectedRole);
      teamSpaceId = teamSpace.id;
    }

    const user = users.find(u => u.id === userId)!;
    setUser(user);
    setActiveTeamSpace(teamSpaceId);
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + spacing['2xl']}]}>
      <View style={styles.content}>
        {/* Lag-info */}
        <View style={styles.teamCard}>
          <Text style={styles.club}>{team.club}</Text>
          <Text style={styles.teamName}>{team.teamName}</Text>
          <Text style={styles.meta}>
            {team.ageGroup} · {formatSport(team.sport)}
          </Text>

          {existingTeamSpace ? (
            <View style={styles.statusRow}>
              <View style={styles.badgeActive}>
                <Text style={styles.badgeActiveText}>Aktivt i Heia</Text>
              </View>
              <Text style={styles.memberCount}>
                {memberCount} {memberCount === 1 ? 'medlem' : 'medlemmer'}
              </Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <View style={styles.badgeInactive}>
                <Text style={styles.badgeInactiveText}>
                  Ikke aktivert ennå
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Rollevalg */}
        <Text style={styles.sectionLabel}>Din rolle</Text>
        <View style={styles.roleRow}>
          {ROLES.map(role => {
            const isSelected = selectedRole === role.key;
            return (
              <Pressable
                key={role.key}
                style={[
                  styles.roleCard,
                  isSelected && styles.roleCardSelected,
                ]}
                onPress={() => setSelectedRole(role.key)}>
                <Text style={styles.roleLabel}>{role.label}</Text>
                <Text style={styles.roleDesc}>{role.description}</Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Handlingsknapp */}
      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.lg}]}>
        <Button
          title={existingTeamSpace ? 'Bli med i laget' : 'Aktiver laget'}
          onPress={handleConfirm}
          disabled={!selectedRole}
          size="lg"
        />
      </View>
    </View>
  );
}

function formatSport(sport: string): string {
  switch (sport) {
    case 'fotball':
      return 'Fotball';
    case 'handball':
      return 'Håndball';
    case 'basket':
      return 'Basket';
    case 'ishockey':
      return 'Ishockey';
    default:
      return 'Annet';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
  },
  teamCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    ...shadows.elevated,
  },
  club: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  teamName: {
    ...typography.heading1,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeActiveText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  memberCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  badgeInactive: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeInactiveText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.card,
  },
  roleCardSelected: {
    borderColor: colors.heia,
    backgroundColor: colors.heiaSoft,
  },
  roleLabel: {
    ...typography.heading3,
  },
  roleDesc: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.heia,
  },
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
