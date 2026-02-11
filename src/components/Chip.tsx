import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, typography, spacing, radius} from '../theme';
import type {EventType} from '../shared/types';

type ChipType = EventType | 'live';

interface ChipProps {
  type: ChipType;
}

const chipConfig: Record<ChipType, {bg: string; text: string; label: string}> =
  {
    trening: {
      bg: colors.treningBg,
      text: colors.treningText,
      label: 'TRENING',
    },
    kamp: {bg: colors.kampBg, text: colors.kampText, label: 'KAMP'},
    sosialt: {
      bg: colors.sosialtBg,
      text: colors.sosialtText,
      label: 'SOSIALT',
    },
    annet: {
      bg: colors.background,
      text: colors.textSecondary,
      label: 'ANNET',
    },
    live: {
      bg: 'rgba(239, 68, 68, 0.1)',
      text: colors.error,
      label: 'LIVE',
    },
  };

export function Chip({type}: ChipProps) {
  const config = chipConfig[type];

  return (
    <View style={[styles.chip, {backgroundColor: config.bg}]}>
      <Text style={[styles.text, {color: config.text}]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.label,
    fontSize: 11,
  },
});
