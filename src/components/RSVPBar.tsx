import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, radius, typography} from '../theme';
import type {RSVPSummary} from '../shared/types';

interface RSVPBarProps {
  rsvp: RSVPSummary;
}

export function RSVPBar({rsvp}: RSVPBarProps) {
  const total = rsvp.coming + rsvp.notComing + rsvp.pending;
  if (total === 0) {
    return null;
  }

  const comingPct = (rsvp.coming / total) * 100;
  const notComingPct = (rsvp.notComing / total) * 100;
  // pending fyller resten

  return (
    <View style={styles.container}>
      <View style={styles.barTrack}>
        {rsvp.coming > 0 && (
          <View
            style={[
              styles.barSegment,
              styles.barComing,
              {width: `${comingPct}%`},
            ]}
          />
        )}
        {rsvp.notComing > 0 && (
          <View
            style={[
              styles.barSegment,
              styles.barNotComing,
              {width: `${notComingPct}%`},
            ]}
          />
        )}
      </View>
      <View style={styles.labels}>
        <Text style={[styles.label, {color: colors.success}]}>
          {rsvp.coming} kommer
        </Text>
        {rsvp.notComing > 0 && (
          <Text style={[styles.label, {color: colors.error}]}>
            {rsvp.notComing} kan ikke
          </Text>
        )}
        {rsvp.pending > 0 && (
          <Text style={[styles.label, {color: colors.textTertiary}]}>
            {rsvp.pending} venter
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  barTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  barComing: {
    backgroundColor: colors.success,
  },
  barNotComing: {
    backgroundColor: colors.error,
  },
  labels: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    ...typography.caption,
  },
});
