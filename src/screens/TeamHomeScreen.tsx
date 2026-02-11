import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {colors, typography, spacing, radius} from '../theme';
import {
  Avatar,
  SectionHeader,
  FeedCard,
  Button,
  LiveMatchBanner,
} from '../components';
import {team, events, feedItems} from '../shared/mockData';
import type {HomeStackParamList} from '../shared/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'TeamHome'>;

export function TeamHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  // Finn live kamp
  const liveMatch = events.find(
    e => e.type === 'kamp' && e.matchStatus === 'live',
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{paddingBottom: insets.bottom + spacing['3xl']}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.heia}
        />
      }>
      {/* Lag-header */}
      <View style={[styles.teamHeader, {paddingTop: insets.top + spacing.lg}]}>
        <Avatar name={team.name} size="lg" />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamMeta}>
            {team.ageGroup} · {team.memberCount} medlemmer
          </Text>
        </View>
      </View>

      {/* Live kamp-banner — HERO */}
      {liveMatch && (
        <View style={styles.section}>
          <LiveMatchBanner
            event={liveMatch}
            onPress={() =>
              navigation.navigate('EventDetail', {eventId: liveMatch.id})
            }
          />
        </View>
      )}

      {/* Feed — hovedinnhold */}
      <SectionHeader title="Siste fra laget" />
      {feedItems.map(item => (
        <View key={item.id} style={styles.cardWrap}>
          <FeedCard item={item} />
        </View>
      ))}

      {/* Støtt laget */}
      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>Støtt {team.name}</Text>
        <Text style={styles.supportText}>
          Hjelp laget med å dekke utgifter til kamper, utstyr og sosiale
          arrangementer.
        </Text>
        <Button
          title="Støtt laget"
          variant="secondary"
          onPress={() => navigation.navigate('Support')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.surface,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    ...typography.heading1,
  },
  teamMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  cardWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  supportCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing['2xl'],
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  supportTitle: {
    ...typography.heading3,
  },
  supportText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
