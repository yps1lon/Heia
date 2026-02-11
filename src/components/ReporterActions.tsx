import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {colors, typography, spacing, radius} from '../theme';
import type {MatchEventType} from '../shared/types';

interface ActionButton {
  type: MatchEventType;
  label: string;
  icon: string;
}

interface ReporterActionsProps {
  onAction: (type: MatchEventType) => void;
}

const actions: ActionButton[] = [
  {type: 'mål', label: 'Mål', icon: '⚽'},
  {type: 'pause', label: 'Pause', icon: '⏸'},
  {type: 'slutt', label: 'Slutt', icon: '🏁'},
  {type: 'melding', label: 'Annet', icon: '💬'},
];

export function ReporterActions({onAction}: ReporterActionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rapporter hendelse</Text>
      <View style={styles.grid}>
        {actions.map(action => (
          <Pressable
            key={action.type}
            onPress={() => onAction(action.type)}
            style={({pressed}) => [
              styles.button,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.icon}>{action.icon}</Text>
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  title: {
    ...typography.heading3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  button: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.heiaSoft,
    borderColor: colors.heia,
  },
  icon: {
    fontSize: 36,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
});
