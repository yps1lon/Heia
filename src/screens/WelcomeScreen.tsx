import React, {useEffect, useRef} from 'react';
import {View, Text, Pressable, StyleSheet, Animated} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {colors, typography, spacing, radius} from '../theme';
import type {OnboardingStackParamList} from '../shared/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo + tagline animasjon
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Knapp fader inn etter logo
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim, slideAnim, buttonFade]);

  return (
    <View style={styles.screen}>
      <View style={[styles.content, {paddingTop: insets.top + spacing['5xl']}]}>
        {/* Sport-ikoner i bakgrunnen for stemning */}
        <Animated.View
          style={[
            styles.sportIcons,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <Text style={styles.sportEmoji}>
            {'  '}
          </Text>
        </Animated.View>

        {/* Heia logo */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
            alignItems: 'center',
          }}>
          <Text style={styles.logo}>Heia</Text>
          <Text style={styles.tagline}>Idrettsglede for alle</Text>
        </Animated.View>
      </View>

      {/* Knapp */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {paddingBottom: insets.bottom + spacing['3xl'], opacity: buttonFade},
        ]}>
        <Pressable
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => navigation.navigate('UserPicker')}>
          <Text style={styles.buttonText}>Kom i gang</Text>
        </Pressable>

        <Text style={styles.footerText}>For lag, klubber og idrettsglede</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.heia,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  sportIcons: {
    marginBottom: spacing['3xl'],
  },
  sportEmoji: {
    fontSize: 40,
    letterSpacing: 8,
  },
  logo: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  tagline: {
    ...typography.heading3,
    color: colors.textPrimary,
    opacity: 0.7,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.textPrimary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['3xl'],
    borderRadius: radius.xl,
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    ...typography.heading3,
    color: colors.surface,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    opacity: 0.5,
  },
});
