import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography, spacing, radius, shadows} from '../theme';
import {Button} from '../components';
import {useActiveTeam} from '../context';
import {activateTeamSpace} from '../lib/api/teams';
import type {OnboardingStackParamList} from '../shared/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

type UserRole = 'trener' | 'forelder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TeamJoin'>;

const ROLES: {key: UserRole; label: string; description: string}[] = [
  {key: 'forelder', label: 'Forelder', description: 'Følger opp barnet'},
  {key: 'trener', label: 'Trener', description: 'Leder laget'},
];

export function TeamJoinScreen({route}: Props) {
  const insets = useSafeAreaInsets();
  const {teamId, clubName, teamName, ageGroup, sportDisplayName} = route.params;
  const {setActiveTeamSpace, refreshMemberships} = useActiveTeam();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      const result = await activateTeamSpace(
        teamId,
        `${clubName} ${teamName}`,
      );
      await refreshMemberships();
      setActiveTeamSpace(result.teamSpaceId);
    } catch (e: any) {
      Alert.alert('Feil', e.message || 'Kunne ikke aktivere laget');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + spacing['2xl']}]}>
      <View style={styles.content}>
        {/* Lag-info */}
        <View style={styles.teamCard}>
          <Text style={styles.club}>{clubName}</Text>
          <Text style={styles.teamName}>{teamName}</Text>
          <Text style={styles.meta}>
            {ageGroup} · {sportDisplayName}
          </Text>

          <View style={styles.statusRow}>
            <View style={styles.badgeInactive}>
              <Text style={styles.badgeInactiveText}>
                Aktiver laget i Heia
              </Text>
            </View>
          </View>
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
          title="Aktiver laget"
          onPress={handleConfirm}
          disabled={!selectedRole || submitting}
          size="lg"
        />
      </View>
    </View>
  );
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
