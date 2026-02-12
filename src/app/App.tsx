import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from '../navigation/AppNavigator';
import {UserProvider} from '../context';

function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
