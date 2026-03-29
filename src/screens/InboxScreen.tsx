import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, typography, spacing} from '../theme';
import {TeamHeader} from '../components/TeamHeader';

export function InboxScreen() {
  return (
    <View style={styles.screen}>
      <TeamHeader />
      <View style={styles.content}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>Kommer snart</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.heading2,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});
