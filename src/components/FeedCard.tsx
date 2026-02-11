import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {colors, typography, spacing, radius, shadows} from '../theme';
import {Avatar} from './Avatar';
import type {FeedItem} from '../shared/types';

interface FeedCardProps {
  item: FeedItem;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) {return 'Akkurat nå';}
  if (diffMin < 60) {return `${diffMin} min siden`;}
  if (diffHour < 24) {return `${diffHour} t siden`;}
  if (diffDay === 1) {return 'I går';}
  if (diffDay < 7) {return `${diffDay} dager siden`;}
  return date.toLocaleDateString('nb-NO', {day: 'numeric', month: 'short'});
}

export function FeedCard({item}: FeedCardProps) {
  const roleLabel = item.author.role === 'trener' ? 'Trener' : undefined;
  const isMatchEvent =
    item.type === 'match_event' ||
    item.type === 'match_start' ||
    item.type === 'match_end';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={item.author.name} size="md" uri={item.author.avatarUrl} />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.author.name}</Text>
            {roleLabel && <Text style={styles.role}>{roleLabel}</Text>}
          </View>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>

      {/* Match event badge */}
      {isMatchEvent && item.matchEvent && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>
            {item.matchEvent.minute}' · Kamp
          </Text>
        </View>
      )}

      {/* Innhold */}
      <Text style={[styles.content, isMatchEvent && styles.matchContent]}>
        {item.content}
      </Text>

      {/* Bilde */}
      {item.imageUrl && (
        <View style={styles.imageWrap}>
          <Image
            source={{uri: item.imageUrl}}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xl,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
  },
  role: {
    ...typography.caption,
    color: colors.heia,
    backgroundColor: colors.heiaSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '600',
  },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 1,
  },
  content: {
    ...typography.body,
    lineHeight: 22,
  },
  imageWrap: {
    marginTop: spacing.md,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.sm,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.kampBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  matchBadgeText: {
    ...typography.caption,
    color: colors.kampText,
    fontWeight: '600',
  },
  matchContent: {
    fontWeight: '600',
    fontSize: 17,
  },
});
