import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {colors, typography, spacing} from '../theme';
import {TeamHomeScreen} from '../screens/TeamHomeScreen';
import {EventDetailScreen} from '../screens/EventDetailScreen';
import {SupportScreen} from '../screens/SupportScreen';
import type {RootTabParamList, HomeStackParamList} from '../shared/types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

// ---------------------------------------------------------------------------
// Home stack (Hjem-tab med push-navigasjon)
// ---------------------------------------------------------------------------
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.surface},
        headerTintColor: colors.textPrimary,
        headerTitleStyle: typography.heading3,
        headerShadowVisible: false,
        headerBackTitle: 'Tilbake',
      }}
    >
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

function KalenderScreen() {
  return <PlaceholderScreen title="Kalender" />;
}
function OpprettScreen() {
  return <PlaceholderScreen title="Ny hendelse" />;
}
function MeldingerScreen() {
  return <PlaceholderScreen title="Meldinger" />;
}
function MerScreen() {
  return <PlaceholderScreen title="Mer" />;
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
// Rot-navigator
// ---------------------------------------------------------------------------
export function AppNavigator() {
  return (
    <NavigationContainer>
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
        })}
      >
        <Tab.Screen
          name="HjemStack"
          component={HomeStackNavigator}
          options={{tabBarLabel: 'Hjem'}}
        />
        <Tab.Screen
          name="Kalender"
          component={KalenderScreen}
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
