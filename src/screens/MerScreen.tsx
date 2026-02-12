import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography, spacing, radius, shadows} from '../theme';
import {Avatar, ListRow} from '../components';
import {useUser} from '../context';
import {team} from '../shared/mockData';

export function MerScreen() {
  const insets = useSafeAreaInsets();
  const {user, clearUser} = useUser();

  if (!user) return null;

  const roleName = user.role === 'trener' ? 'Trener' : 'Forelder';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{paddingBottom: insets.bottom + spacing['3xl']}}>
      {/* Profil-seksjon */}
      <View style={[styles.profileSection, {paddingTop: insets.top + spacing['2xl']}]}>
        <Avatar name={user.name} size="lg" />
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.roleRow}>
          <View
            style={[
              styles.roleBadge,
              user.role === 'trener'
                ? styles.roleBadgeTrener
                : styles.roleBadgeForelder,
            ]}>
            <Text
              style={[
                styles.roleBadgeText,
                user.role === 'trener'
                  ? styles.roleBadgeTrenerText
                  : styles.roleBadgeForelderText,
              ]}>
              {roleName}
            </Text>
          </View>
        </View>

        {/* Lagkort */}
        <View style={styles.teamCard}>
          <Text style={styles.teamIcon}>{'  '}</Text>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamMeta}>
              {team.ageGroup} · {team.memberCount} medlemmer
            </Text>
          </View>
        </View>
      </View>

      {/* Meny */}
      <View style={styles.menuSection}>
        <ListRow
          icon={<Text style={styles.menuIcon}>{'  '}</Text>}
          title="Bytt bruker"
          subtitle="Logg inn som en annen"
          onPress={clearUser}
        />
        <ListRow
          icon={<Text style={styles.menuIcon}>{'  '}</Text>}
          title="Varsler"
          subtitle="Kommer snart"
          showBorder
        />
        <ListRow
          icon={<Text style={styles.menuIcon}>{'  '}</Text>}
          title="Om Heia"
          subtitle="v0.1.0"
          showBorder={false}
        />
      </View>

      {/* Heia footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLogo}>Heia</Text>
        <Text style={styles.footerTagline}>Idrettsglede for alle</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileSection: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  userName: {
    ...typography.heading2,
    marginTop: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  roleBadgeTrener: {
    backgroundColor: 'rgba(2, 255, 171, 0.15)',
  },
  roleBadgeForelder: {
    backgroundColor: colors.background,
  },
  roleBadgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  roleBadgeTrenerText: {
    color: colors.heiaPressed,
  },
  roleBadgeForelderText: {
    color: colors.textSecondary,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    width: '100%',
    gap: spacing.md,
  },
  teamIcon: {
    fontSize: 28,
  },
  teamInfo: {
    flex: 1,
    gap: 2,
  },
  teamName: {
    ...typography.heading3,
  },
  teamMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  menuSection: {
    backgroundColor: colors.surface,
    marginTop: spacing.lg,
    ...shadows.card,
  },
  menuIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.xs,
  },
  footerLogo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.heia,
    letterSpacing: -1,
  },
  footerTagline: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});
