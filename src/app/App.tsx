import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from '../navigation/AppNavigator';
import {AuthProvider, TeamProvider} from '../context';

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TeamProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </TeamProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
