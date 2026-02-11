import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {colors, typography, spacing, radius} from '../theme';
import {Avatar} from './Avatar';
import type {User} from '../shared/types';

interface ReporterBarProps {
  reporter: User | undefined;
  isAdmin: boolean;
  isMe: boolean;
  isMember: boolean;
  onChangeReporter: () => void;
  onClaimReporter: () => void;
}

export function ReporterBar({
  reporter,
  isAdmin,
  isMe,
  isMember,
  onChangeReporter,
  onClaimReporter,
}: ReporterBarProps) {
  // Ingen reporter satt
  if (!reporter) {
    // Kun lagmedlemmer kan claime
    if (!isMember) {
      return (
        <View style={styles.container}>
          <View style={styles.emptyDot} />
          <Text style={styles.emptyLabel}>Ingen kampreporter</Text>
        </View>
      );
    }

    return (
      <Pressable
        style={({pressed}) => [styles.container, pressed && styles.pressed]}
        onPress={onClaimReporter}>
        <View style={styles.emptyDot} />
        <Text style={styles.emptyLabel}>Ingen kampreporter</Text>
        <View style={styles.claimButton}>
          <Text style={styles.claimText}>Ta rollen</Text>
        </View>
      </Pressable>
    );
  }

  const canChange = isAdmin || isMe;

  return (
    <View style={styles.container}>
      <Avatar name={reporter.name} size="sm" />
      <View style={styles.info}>
        <Text style={styles.roleLabel}>Kampreporter</Text>
        <Text style={styles.name}>
          {isMe ? 'Deg' : reporter.name}
        </Text>
      </View>
      {canChange && (
        <Pressable
          style={({pressed}) => [
            styles.changeButton,
            pressed && styles.changePressed,
          ]}
          onPress={onChangeReporter}>
          <Text style={styles.changeText}>Bytt</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.heiaSoft,
    borderColor: colors.heia,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  roleLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
  },
  emptyDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyLabel: {
    ...typography.body,
    color: colors.textTertiary,
    flex: 1,
  },
  claimButton: {
    backgroundColor: colors.heia,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  claimText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  changeButton: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  changePressed: {
    backgroundColor: colors.border,
  },
  changeText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
