import React, {useState} from 'react';
import {View, Text, TextInput, FlatList, Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography, spacing, radius, shadows} from '../theme';
import {getAllTeams} from '../data/teamData';
import type {Team, OnboardingStackParamList} from '../shared/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FindTeam'>;

export function FindTeamScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const {userId} = route.params;
  const [search, setSearch] = useState('');

  const teams = getAllTeams();
  const filtered = search
    ? teams.filter(t => {
        const q = search.toLowerCase();
        return (
          t.club.toLowerCase().includes(q) ||
          t.teamName.toLowerCase().includes(q) ||
          t.ageGroup.toLowerCase().includes(q)
        );
      })
    : teams;

  const handleSelect = (team: Team) => {
    navigation.navigate('TeamJoin', {userId, teamId: team.id});
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + spacing['2xl']}]}>
      <View style={styles.header}>
        <Text style={styles.title}>Finn laget ditt</Text>
        <Text style={styles.subtitle}>Søk etter klubb eller lagsnavn</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="Søk etter lag..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          {paddingBottom: insets.bottom + spacing['3xl']},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <Pressable
            style={({pressed}) => [
              styles.teamCard,
              pressed && styles.teamCardPressed,
            ]}
            onPress={() => handleSelect(item)}>
            <View
              style={[
                styles.sportBadge,
                {backgroundColor: sportColor(item.sport)},
              ]}>
              <Text style={styles.sportEmoji}>{sportIcon(item.sport)}</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>
                {item.club} {item.teamName}
              </Text>
              <Text style={styles.teamMeta}>
                {item.ageGroup} · {formatSport(item.sport)}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Ingen lag funnet</Text>
        }
      />
    </View>
  );
}

function sportIcon(sport: string): string {
  switch (sport) {
    case 'fotball':
      return '⚽';
    case 'handball':
      return '🤾';
    case 'basket':
      return '🏀';
    case 'ishockey':
      return '🏒';
    default:
      return '🏅';
  }
}

function sportColor(sport: string): string {
  switch (sport) {
    case 'fotball':
      return colors.treningBg;
    case 'handball':
      return colors.sosialtBg;
    case 'basket':
      return colors.kampBg;
    default:
      return colors.background;
  }
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
  header: {
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  search: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.card,
  },
  teamCardPressed: {
    backgroundColor: colors.heiaSoft,
  },
  sportBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportEmoji: {
    fontSize: 22,
  },
  teamInfo: {
    flex: 1,
    gap: 2,
  },
  teamName: {
    ...typography.body,
    fontWeight: '600',
  },
  teamMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  arrow: {
    ...typography.heading2,
    color: colors.textTertiary,
  },
  empty: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing['4xl'],
  },
});
