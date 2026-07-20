import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function CustomTabBar({ state, descriptors, navigation, colors, colorScheme }) {
  const indexRoute = state.routes.find(r => r.name === 'index');
  const surveyRoute = state.routes.find(r => r.name === 'survey');
  const historyRoute = state.routes.find(r => r.name === 'surveyHistory');
  const profileRoute = state.routes.find(r => r.name === 'profile');

  const getIsActive = (routeName) => {
    const currentRoute = state.routes[state.index];
    return currentRoute.name === routeName;
  };

  const renderTabButton = (route, label, iconName, activeIconName) => {
    if (!route) return null;
    const isActive = getIsActive(route.name);
    
    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isActive && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable 
        key={route.name} 
        onPress={onPress} 
        style={styles.tabButton}
      >
        <Ionicons 
          name={isActive ? activeIconName : iconName} 
          size={24} 
          color={isActive ? colors.primary : colors.tabIconDefault} 
        />
        <Text style={[styles.tabLabel, { color: isActive ? colors.primary : colors.tabIconDefault }]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.tabBarContainer, { 
      backgroundColor: colors.surface, 
      borderTopColor: colors.border,
      shadowColor: colorScheme === 'dark' ? '#000000' : '#64748B'
    }]}>
      <View style={styles.tabBarInner}>
        {renderTabButton(indexRoute, 'Dashboard', 'home-outline', 'home')}
        {renderTabButton(surveyRoute, 'Surveys', 'document-text-outline', 'document-text')}
        
        {/* Centered elevated FAB */}
        <Pressable 
          onPress={() => {
            navigation.navigate('survey');
          }}
          style={styles.fabContainer}
        >
          <View style={[styles.fab, { backgroundColor: colors.primary }]}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </Pressable>
        
        {renderTabButton(historyRoute, 'Reports', 'bar-chart-outline', 'bar-chart')}
        {renderTabButton(profileRoute, 'Profile', 'person-outline', 'person')}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar 
          {...props} 
          colors={colors} 
          colorScheme={colorScheme}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="survey"
        options={{
          title: 'New Survey',
        }}
      />
      <Tabs.Screen
        name="surveyHistory"
        options={{
          title: 'Survey History',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Student Details',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    height: Platform.OS === 'ios' ? 88 : 70,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  fabContainer: {
    top: Platform.OS === 'ios' ? -18 : -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    height: 68,
    zIndex: 99,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
  },
});
