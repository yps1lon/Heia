import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography, spacing} from '../theme';
import {useActiveTeam} from '../context';

export function TeamHeader() {
  const insets = useSafeAreaInsets();
  const {activeTeamSpace} = useActiveTeam();

  if (!activeTeamSpace) return null;

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.sm}]}>
      <View
        style={[styles.dot, {backgroundColor: activeTeamSpace.color}]}
      />
      <Text style={styles.name}>{activeTeamSpace.displayName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    ...typography.heading3,
  },
});
