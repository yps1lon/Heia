import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {colors, typography, spacing} from '../theme';
import {useUser} from '../context';
import {TeamHomeScreen} from '../screens/TeamHomeScreen';
import {EventDetailScreen} from '../screens/EventDetailScreen';
import {SupportScreen} from '../screens/SupportScreen';
import {WelcomeScreen} from '../screens/WelcomeScreen';
import {UserPickerScreen} from '../screens/UserPickerScreen';
import {KalenderScreen} from '../screens/KalenderScreen';
import {MerScreen} from '../screens/MerScreen';
import type {
  RootTabParamList,
  HomeStackParamList,
  OnboardingStackParamList,
  KalenderStackParamList,
} from '../shared/types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OnboardingNav =
  createNativeStackNavigator<OnboardingStackParamList>();
const KalenderNav = createNativeStackNavigator<KalenderStackParamList>();

// ---------------------------------------------------------------------------
// Felles stack-innstillinger
// ---------------------------------------------------------------------------
const stackScreenOptions = {
  headerStyle: {backgroundColor: colors.surface},
  headerTintColor: colors.textPrimary,
  headerTitleStyle: typography.heading3,
  headerShadowVisible: false,
  headerBackTitle: 'Tilbake',
};

// ---------------------------------------------------------------------------
// Home stack (Hjem-tab med push-navigasjon)
// ---------------------------------------------------------------------------
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen
        name="TeamHome"
        component={TeamHomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{title: 'Hendelse'}}
      />
      <HomeStack.Screen
        name="Support"
        component={SupportScreen}
        options={{title: 'Støtt laget'}}
      />
    </HomeStack.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Kalender stack (Kalender-tab med push til EventDetail)
// ---------------------------------------------------------------------------
function KalenderStackNavigator() {
  return (
    <KalenderNav.Navigator screenOptions={stackScreenOptions}>
      <KalenderNav.Screen
        name="KalenderList"
        component={KalenderScreen}
        options={{headerShown: false}}
      />
      <KalenderNav.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{title: 'Hendelse'}}
      />
    </KalenderNav.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Onboarding stack (velkommen + brukervelger)
// ---------------------------------------------------------------------------
function OnboardingStackNavigator() {
  return (
    <OnboardingNav.Navigator screenOptions={{headerShown: false}}>
      <OnboardingNav.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingNav.Screen name="UserPicker" component={UserPickerScreen} />
    </OnboardingNav.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Placeholder-skjerm for tabs som ikke er implementert ennå
// ---------------------------------------------------------------------------
function PlaceholderScreen({title}: {title: string}) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{title}</Text>
      <Text style={styles.placeholderSub}>Kommer snart</Text>
    </View>
  );
}

function OpprettScreen() {
  return <PlaceholderScreen title="Ny hendelse" />;
}
function MeldingerScreen() {
  return <PlaceholderScreen title="Meldinger" />;
}

// ---------------------------------------------------------------------------
// Tab-ikon (enkel tekst-basert — byttes til ikon-bibliotek senere)
// ---------------------------------------------------------------------------
const tabIcons: Record<keyof RootTabParamList, string> = {
  HjemStack: '⌂',
  Kalender: '▦',
  Opprett: '+',
  Meldinger: '✉',
  Mer: '⋯',
};

// ---------------------------------------------------------------------------
// Hoved-tabs
// ---------------------------------------------------------------------------
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.heia,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({color}) => {
          const icon = tabIcons[route.name];
          if (route.name === 'Opprett') {
            return (
              <View style={styles.createButton}>
                <Text style={styles.createIcon}>{icon}</Text>
              </View>
            );
          }
          return <Text style={[styles.tabIcon, {color}]}>{icon}</Text>;
        },
      })}>
      <Tab.Screen
        name="HjemStack"
        component={HomeStackNavigator}
        options={{tabBarLabel: 'Hjem'}}
      />
      <Tab.Screen
        name="Kalender"
        component={KalenderStackNavigator}
      />
      <Tab.Screen
        name="Opprett"
        component={OpprettScreen}
        options={{tabBarLabel: ''}}
      />
      <Tab.Screen
        name="Meldinger"
        component={MeldingerScreen}
      />
      <Tab.Screen
        name="Mer"
        component={MerScreen}
      />
    </Tab.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Rot-navigator — betinget onboarding vs. hoved-app
// ---------------------------------------------------------------------------
export function AppNavigator() {
  const {user} = useUser();

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <OnboardingStackNavigator />}
    </NavigationContainer>
  );
}

// ---------------------------------------------------------------------------
// Stiler
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 88,
    paddingTop: spacing.sm,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabIcon: {
    fontSize: 22,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.heia,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  createIcon: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    ...typography.heading2,
  },
  placeholderSub: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});
