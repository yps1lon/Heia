import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from '../navigation/AppNavigator';
import {UserProvider, TeamProvider} from '../context';

function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <TeamProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </TeamProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
