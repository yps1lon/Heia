import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, TextInput, FlatList, Pressable, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography, spacing, radius, shadows} from '../theme';
import {searchTeams, type TeamSearchResult} from '../lib/api/teams';
import {useAuth} from '../context';
import type {OnboardingStackParamList} from '../shared/types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FindTeam'>;

export function FindTeamScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {signOut} = useAuth();
  const [search, setSearch] = useState('');
  const [teams, setTeams] = useState<TeamSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const doSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await searchTeams(query);
      setTeams(results);
    } catch {
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(search);
  }, [search, doSearch]);

  const handleSelect = (team: TeamSearchResult) => {
    navigation.navigate('TeamJoin', {
      teamId: team.id,
      clubName: team.clubName,
      teamName: team.name,
      ageGroup: team.ageGroup,
      sportDisplayName: team.sportDisplayName,
    });
  };

  return (
    <View style={[styles.screen, {paddingTop: insets.top + spacing['2xl']}]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={signOut}
          activeOpacity={0.5}
          style={styles.logoutButton}>
          <Text style={styles.backText}>Logg ut</Text>
        </TouchableOpacity>
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
        data={teams}
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
                {backgroundColor: sportColor(item.sportSlug)},
              ]}>
              <Text style={styles.sportEmoji}>{sportIcon(item.sportSlug)}</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>
                {item.clubName} {item.name}
              </Text>
              <Text style={styles.teamMeta}>
                {item.ageGroup} · {item.sportDisplayName}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.heia} style={{marginTop: spacing['4xl']}} />
          ) : (
            <Text style={styles.empty}>Ingen lag funnet</Text>
          )
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading1,
    marginBottom: spacing.xs,
  },
  backText: {
    ...typography.body,
    color: colors.textTertiary,
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
