import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {typography, spacing, colors} from '../theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({title, actionLabel, onAction}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={spacing.sm}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.heading3,
  },
  action: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});
