import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SurveyProvider, useSurvey } from '@/context/SurveyContext';
import { DrawerContentScrollView } from '@react-navigation/drawer';

function CustomDrawerContent(props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { studentInfo, todaySurveyCount, surveys } = useSurvey();

  // Active route checking
  const activeRouteName = props.state.routeNames[props.state.index];

  const menuItems = [
    { name: 'Dashboard', icon: 'grid-outline', route: '/(tabs)/index', key: '(tabs)' },
    { name: 'Survey Form', icon: 'create-outline', route: '/(tabs)/survey', key: 'survey-direct' },
    { name: 'Camera Scan', icon: 'camera-outline', route: '/camera', key: 'camera' },
    { name: 'Contacts List', icon: 'people-outline', route: '/contact', key: 'contact' },
    { name: 'GPS Location', icon: 'location-outline', route: '/location', key: 'location' },
    { name: 'Clipboard Box', icon: 'clipboard-outline', route: '/clipboard', key: 'clipboard' },
    { name: 'Settings', icon: 'settings-outline', route: '/settings', key: 'settings' },
  ];

  return (
    <View style={[styles.drawerContainer, { backgroundColor: colors.background }]}>
      {/* Student Details Header */}
      <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.avatarWrapper}>
          {studentInfo.profileImage ? (
            <Image source={{ uri: studentInfo.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {studentInfo.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.studentName, { color: colors.text }]}>{studentInfo.name}</Text>
        <Text style={[styles.studentUsername, { color: colors.textSecondary }]}>@{studentInfo.username || 'username'}</Text>
        <Text style={[styles.studentRoll, { color: colors.textSecondary }]}>{studentInfo.rollNumber}</Text>
        <Text style={[styles.studentCollege, { color: colors.textSecondary }]} numberOfLines={1}>
          {studentInfo.college}
        </Text>

        {/* Quick Drawer Stats */}
        <View style={[styles.statsRow, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#EFF6FF' }]}>
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.primary }]}>{todaySurveyCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.secondary }]}>{surveys.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
        </View>
      </View>

      {/* Menu items */}
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        {menuItems.map((item) => {
          // Check if this menu item is active
          let isActive = false;
          if (activeRouteName === '(tabs)') {
            // Find current active tab inside tabs
            const tabState = props.state.routes[props.state.index].state;
            const activeTabName = tabState?.routeNames?.[tabState?.index ?? 0];
            
            if (item.key === '(tabs)' && (activeTabName === 'index' || activeTabName === undefined)) {
              isActive = true;
            } else if (item.key === 'survey-direct' && activeTabName === 'survey') {
              isActive = true;
            }
          } else {
            isActive = activeRouteName === item.key;
          }

          return (
            <Pressable
              key={item.name}
              onPress={() => {
                props.navigation.closeDrawer();
                router.replace(item.route);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: isActive
                    ? (colorScheme === 'dark' ? '#1E293B' : '#E0F2FE')
                    : pressed
                    ? (colorScheme === 'dark' ? '#334155' : '#F1F5F9')
                    : 'transparent',
                },
              ]}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? colors.primary : colors.icon}
                style={styles.menuIcon}
              />
              <Text
                style={[
                  styles.menuText,
                  {
                    color: isActive ? colors.primary : colors.text,
                    fontWeight: isActive ? '600' : 'normal',
                  },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Smart Field Survey App
        </Text>
        <Text style={[styles.footerSubText, { color: colors.textSecondary }]}>
          v1.0.0 • React Native Assignment
        </Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SurveyProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.surface,
                elevation: 2,
                shadowOpacity: 0.1,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
              },
              drawerStyle: {
                width: 280,
              },
            }}
          >
            {/* The main tab interface */}
            <Drawer.Screen
              name="(tabs)"
              options={{
                title: 'Field Survey',
                headerShown: false,
              }}
            />
            {/* Drawer only screens */}
            <Drawer.Screen
              name="camera"
              options={{
                title: 'Camera Capture',
                drawerLabel: 'Camera',
              }}
            />
            <Drawer.Screen
              name="contact"
              options={{
                title: 'Contacts Directory',
                drawerLabel: 'Contacts',
              }}
            />
            <Drawer.Screen
              name="location"
              options={{
                title: 'GPS Location',
                drawerLabel: 'Location',
              }}
            />
            <Drawer.Screen
              name="clipboard"
              options={{
                title: 'Clipboard Manager',
                drawerLabel: 'Clipboard',
              }}
            />
            <Drawer.Screen
              name="settings"
              options={{
                title: 'Settings',
                drawerLabel: 'Settings',
              }}
            />
            <Drawer.Screen
              name="surveyPreview"
              options={{
                title: 'Survey Preview',
                drawerLabel: 'Survey Preview',
                drawerItemStyle: { display: 'none' }, // Hide from drawer list
              }}
            />
          </Drawer>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SurveyProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  studentUsername: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  studentRoll: {
    fontSize: 13,
    marginBottom: 1,
  },
  studentCollege: {
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 15,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  footerSubText: {
    fontSize: 10,
  },
});
