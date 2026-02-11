import React, {useEffect, useRef} from 'react';
import {Text, StyleSheet, Animated} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography, spacing, radius, shadows} from '../theme';

interface SimulatedPushProps {
  title: string;
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function SimulatedPush({
  title,
  message,
  visible,
  onHide,
}: SimulatedPushProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(-200);
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.delay(3000),
        Animated.timing(translateY, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, translateY, onHide]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + spacing.sm,
          transform: [{translateY}],
        },
      ]}>
      <Text style={styles.appLabel}>Heia</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: colors.heia,
    ...shadows.elevated,
  },
  appLabel: {
    ...typography.caption,
    color: colors.heia,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
