import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, ActivityIndicator } from 'react-native';

import { AuthContext, AuthProvider } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SubmitReportScreen from './screens/SubmitReportScreen';

// --- Placeholder Screens for the main app ---
// These will be fleshed out in later steps.

const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Home Screen (Map View)</Text>
  </View>
);

import MyReportsScreen from './screens/MyReportsScreen';

const SettingsScreen = () => {
    const { logout } = useContext(AuthContext);
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Settings</Text>
            <Button title="Logout" onPress={() => logout()} />
        </View>
    );
};


// --- Navigators ---

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navigator for the main app (after login)
const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="Submit" component={SubmitReportScreen} options={{ title: 'New Report' }} />
      <Tab.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'My Reports' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Navigator logic that switches between Auth and Main App
const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken ? (
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;