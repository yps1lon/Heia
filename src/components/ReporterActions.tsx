import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {colors, typography, spacing, radius} from '../theme';

export type ReporterActionType =
  | 'mål_oss'
  | 'mål_dem'
  | 'pause'
  | 'slutt'
  | 'melding';

interface ActionButton {
  type: ReporterActionType;
  label: string;
  icon: string;
}

interface ReporterActionsProps {
  onAction: (type: ReporterActionType) => void;
}

const actions: ActionButton[] = [
  {type: 'mål_oss', label: 'Mål oss', icon: '⚽'},
  {type: 'mål_dem', label: 'Mål dem', icon: '⚽'},
  {type: 'pause', label: 'Pause', icon: '⏸'},
  {type: 'slutt', label: 'Slutt', icon: '🏁'},
  {type: 'melding', label: 'Kommentar', icon: '💬'},
];

export function ReporterActions({onAction}: ReporterActionsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.goalRow}>
        {actions.slice(0, 2).map(action => (
          <Pressable
            key={action.type}
            onPress={() => onAction(action.type)}
            style={({pressed}) => [
              styles.goalButton,
              action.type === 'mål_dem' && styles.goalButtonAway,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.goalIcon}>{action.icon}</Text>
            <Text style={styles.goalLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        {actions.slice(2).map(action => (
          <Pressable
            key={action.type}
            onPress={() => onAction(action.type)}
            style={({pressed}) => [
              styles.smallButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.smallIcon}>{action.icon}</Text>
            <Text style={styles.smallLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  goalRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  goalButton: {
    flex: 1,
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.heia,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  goalButtonAway: {
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.heiaSoft,
    borderColor: colors.heia,
  },
  goalIcon: {
    fontSize: 28,
  },
  goalLabel: {
    ...typography.body,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  smallButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  smallIcon: {
    fontSize: 20,
  },
  smallLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
