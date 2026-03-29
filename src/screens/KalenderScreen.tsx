import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {colors, typography, spacing} from '../theme';
import {EventCard, LiveBadge, TeamHeader} from '../components';
import {useActiveTeam} from '../context';
import {getEventsForTeamSpace} from '../data/teamData';
import type {KalenderStackParamList, HeiaEvent} from '../shared/types';

type Nav = NativeStackNavigationProp<KalenderStackParamList, 'KalenderList'>;

function getSectionLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.round(
    (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return 'Tidligere';
  if (diffDays === 0) return 'I dag';
  if (diffDays === 1) return 'I morgen';
  if (diffDays <= 7) return 'Denne uken';
  return 'Kommende';
}

export function KalenderScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const {activeTeamSpaceId} = useActiveTeam();

  if (!activeTeamSpaceId) return null;

  const teamEvents = getEventsForTeamSpace(activeTeamSpaceId);
  const sortedEvents = [...teamEvents].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  // Grupper etter seksjon
  const sections: {label: string; events: HeiaEvent[]}[] = [];
  let currentLabel = '';
  for (const event of sortedEvents) {
    const label = getSectionLabel(event.startTime);
    if (label !== currentLabel) {
      currentLabel = label;
      sections.push({label, events: [event]});
    } else {
      sections[sections.length - 1].events.push(event);
    }
  }

  return (
    <View style={styles.screen}>
      <TeamHeader />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + spacing['3xl'],
        }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kalender</Text>
          <Text style={styles.subtitle}>Kommende hendelser for laget</Text>
        </View>

        {/* Seksjoner */}
        {sections.map(section => (
          <View key={section.label}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              {section.label === 'I dag' &&
                section.events.some(e => e.matchStatus === 'live') && (
                  <LiveBadge />
                )}
            </View>
            {section.events.map(event => (
              <View key={event.id} style={styles.cardWrap}>
                <EventCard
                  event={event}
                  featured={event.matchStatus === 'live'}
                  onPress={() =>
                    navigation.navigate('EventDetail', {eventId: event.id})
                  }
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading1,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
  },
  cardWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
