import React from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography, spacing, radius, shadows} from '../theme';
import {Avatar} from '../components';
import {useUser} from '../context';
import {users, memberships} from '../shared/mockData';
import type {User} from '../shared/types';

// Finn "primær" rolle for en bruker (trener i noe lag → trener, ellers forelder)
function getPrimaryRole(userId: string): 'trener' | 'forelder' {
  const userMemberships = memberships.filter(m => m.userId === userId);
  if (userMemberships.some(m => m.role === 'trener')) return 'trener';
  return 'forelder';
}

export function UserPickerScreen() {
  const insets = useSafeAreaInsets();
  const {setUser} = useUser();

  const coaches = users.filter(u => getPrimaryRole(u.id) === 'trener');
  const parents = users.filter(u => getPrimaryRole(u.id) !== 'trener');

  const handleSelect = (user: User) => {
    setUser(user);
    // TeamContext auto-velger første lag via useEffect
  };

  const renderParent = ({item, index}: {item: User; index: number}) => {
    const isLeft = index % 2 === 0;
    return (
      <Pressable
        style={({pressed}) => [
          styles.parentCard,
          isLeft ? styles.parentCardLeft : styles.parentCardRight,
          pressed && styles.cardPressed,
        ]}
        onPress={() => handleSelect(item)}>
        <Avatar name={item.name} size="lg" />
        <Text style={styles.parentName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.roleBadgeGray}>
          <Text style={styles.roleBadgeGrayText}>Forelder</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + spacing['2xl']}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hvem er du?</Text>
        <Text style={styles.subtitle}>
          Velg din bruker for å komme i gang
        </Text>
      </View>

      {/* Trenere — featured kort */}
      {coaches.map(coach => (
        <View key={coach.id} style={styles.coachSection}>
          <Pressable
            style={({pressed}) => [
              styles.coachCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleSelect(coach)}>
            <Avatar name={coach.name} size="lg" />
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{coach.name}</Text>
              <View style={styles.roleBadgeGreen}>
                <Text style={styles.roleBadgeGreenText}>Trener</Text>
              </View>
            </View>
            <Text style={styles.coachArrow}>{'>'}</Text>
          </Pressable>
        </View>
      ))}

      {/* Seksjonstittel */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Foreldre</Text>
        <Text style={styles.sectionCount}>{parents.length}</Text>
      </View>

      {/* Foreldre-grid */}
      <FlatList
        data={parents}
        renderItem={renderParent}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.grid,
          {paddingBottom: insets.bottom + spacing['3xl']},
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.heading1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Trener
  coachSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.heia,
    ...shadows.elevated,
  },
  coachInfo: {
    flex: 1,
    marginLeft: spacing.lg,
    gap: spacing.xs,
  },
  coachName: {
    ...typography.heading3,
  },
  coachArrow: {
    ...typography.heading2,
    color: colors.textTertiary,
  },

  // Rolle-badges
  roleBadgeGreen: {
    backgroundColor: colors.heiaSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  roleBadgeGreenText: {
    ...typography.caption,
    color: colors.heiaPressed,
    fontWeight: '600',
  },
  roleBadgeGray: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  roleBadgeGrayText: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Seksjon
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Grid
  grid: {
    paddingHorizontal: spacing.lg,
  },
  parentCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  parentCardLeft: {
    marginRight: spacing.sm,
  },
  parentCardRight: {
    marginLeft: spacing.sm,
  },
  parentName: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardPressed: {
    backgroundColor: colors.heiaSoft,
  },
});
