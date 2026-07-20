import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, FlatList, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { studentInfo, todaySurveyCount, surveys } = useSurvey();
  const navigation = useNavigation();

  // Get 3 most recent surveys
  const recentSurveys = surveys.slice(0, 3);

  // Targets for Today's Surveys
  const targetSurveys = 12;
  const progressPercentage = Math.round((todaySurveyCount / targetSurveys) * 100);

  const quickActions = [
    { 
      name: 'New Survey', 
      desc: 'Start a new\nfield survey', 
      icon: 'camera', 
      bgColor: '#E6F4EA', 
      color: '#137333', 
      route: '/(tabs)/survey' 
    },
    { 
      name: 'Location', 
      desc: 'Capture current\nlocation', 
      icon: 'location', 
      bgColor: '#E8F0FE', 
      color: '#1A73E8', 
      route: '/location' 
    },
    { 
      name: 'Contacts', 
      desc: 'Select from\ncontacts', 
      icon: 'people', 
      bgColor: '#F3E8FF', 
      color: '#8B5CF6', 
      route: '/contact' 
    },
    { 
      name: 'Paste Data', 
      desc: 'Paste survey\nfrom clipboard', 
      icon: 'clipboard', 
      bgColor: '#FEF3C7', 
      color: '#D97706', 
      route: '/clipboard' 
    },
  ];



  // Helper to format leading zero
  const formatCount = (count) => {
    return String(count).padStart(2, '0');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return { text: '#137333', bg: '#E6F4EA' };
      case 'In Progress':
        return { text: '#1A73E8', bg: '#E8F0FE' };
      case 'Pending':
        return { text: '#D97706', bg: '#FEF3C7' };
      default:
        return { text: colors.textSecondary, bg: colors.border };
    }
  };

  const getRecentIcon = (index) => {
    switch (index % 3) {
      case 0:
        return { name: 'water', color: '#137333', bg: '#E6F4EA' };
      case 1:
        return { name: 'map', color: '#1A73E8', bg: '#E8F0FE' };
      case 2:
        return { name: 'business', color: '#8B5CF6', bg: '#F3E8FF' };
      default:
        return { name: 'document-text', color: colors.primary, bg: colors.border };
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      {/* Custom Top Header Bar */}
      <View style={styles.headerBar}>
        <Pressable 
          onPress={() => navigation.openDrawer()}
          style={styles.headerIconBtn}
        >
          <Ionicons name="menu-outline" size={26} color={colors.text} />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitleMain, { color: colors.primary }]}>Smart Field Survey</Text>
          <Text style={[styles.headerTitleSub, { color: colors.primary }]}>& Inspection App</Text>
        </View>

        <View style={styles.headerRightActions}>
          <Pressable style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.notiBadge} />
          </Pressable>
          
          <Pressable 
            onPress={() => router.replace('/(tabs)/profile')}
            style={styles.headerAvatarBtn}
          >
            {studentInfo.profileImage ? (
              <Image source={{ uri: studentInfo.profileImage }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatarFallback, { backgroundColor: colors.primary }]}>
                <Text style={styles.headerAvatarText}>{studentInfo.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Welcome Greetings */}
      <View style={styles.greetingSection}>
        <Text style={[styles.greetingLabel, { color: colors.textSecondary }]}>Welcome back,</Text>
        <Text style={[styles.greetingName, { color: colors.primary }]}>
          {studentInfo.name} 👋
        </Text>
      </View>

      {/* Student Profile Card */}
      <View style={[styles.studentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Left Side Avatar */}
        <View style={styles.cardLeft}>
          <View style={[styles.cardAvatarContainer, { borderColor: colors.border }]}>
            {studentInfo.profileImage ? (
              <Image source={{ uri: studentInfo.profileImage }} style={styles.cardAvatar} />
            ) : (
              <View style={[styles.cardAvatarFallback, { backgroundColor: colors.primary }]}>
                <Text style={styles.cardAvatarFallbackText}>{studentInfo.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right Side Credentials */}
        <View style={styles.cardRight}>
          <View style={styles.credRow}>
            <Ionicons name="card" size={14} color={colors.primary} style={styles.credIcon} />
            <Text style={[styles.credLabel, { color: colors.textSecondary }]}>Student ID:</Text>
            <Text style={[styles.credVal, { color: colors.text }]} numberOfLines={1}>
              {studentInfo.rollNumber}
            </Text>
          </View>

          <View style={styles.credRow}>
            <Ionicons name="school" size={14} color={colors.primary} style={styles.credIcon} />
            <Text style={[styles.credLabel, { color: colors.textSecondary }]}>Course:</Text>
            <Text style={[styles.credVal, { color: colors.text }]} numberOfLines={1}>
              {studentInfo.college}
            </Text>
          </View>

          <View style={styles.credRow}>
            <Ionicons name="git-branch" size={14} color={colors.primary} style={styles.credIcon} />
            <Text style={[styles.credLabel, { color: colors.textSecondary }]}>Department:</Text>
            <Text style={[styles.credVal, { color: colors.text }]} numberOfLines={1}>
              {studentInfo.department || 'N/A'}
            </Text>
          </View>

          <View style={styles.credRow}>
            <Ionicons name="calendar" size={14} color={colors.primary} style={styles.credIcon} />
            <Text style={[styles.credLabel, { color: colors.textSecondary }]}>Year:</Text>
            <Text style={[styles.credVal, { color: colors.text }]} numberOfLines={1}>
              {studentInfo.year || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Decorative Clipboard Icon */}
        <View style={styles.decorativeContainer}>
          <Ionicons name="document-text" size={54} color={colors.primary + '10'} />
        </View>
      </View>

      {/* Today's Survey Count Card */}
      <View style={[styles.countCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.countLeft}>
          <View style={styles.countTitleRow}>
            <Ionicons name="trending-up" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.countTitleText, { color: colors.text }]}>Today&apos;s Survey Count</Text>
          </View>
          <Text style={[styles.countNumbers, { color: colors.text }]}>
            <Text style={[styles.countNumbersHighlight, { color: colors.primary }]}>{formatCount(todaySurveyCount)}</Text>
            <Text style={{ fontSize: 18, color: colors.textSecondary }}> / {targetSurveys} Surveys</Text>
          </Text>
        </View>

        {/* Circular Progress Ring */}
        <View style={styles.countRight}>
          <View style={[styles.progressRing, { borderColor: colors.primary }]}>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>{progressPercentage}%</Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.name}
            onPress={() => router.replace(action.route)}
            style={({ pressed }) => [
              styles.actionCard,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: action.bgColor }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={[styles.actionCardTitle, { color: colors.text }]}>{action.name}</Text>
            <Text style={styles.actionCardDesc} numberOfLines={2}>{action.desc}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recent Survey Summary */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Recent Survey Summary</Text>
        <Pressable onPress={() => router.replace('/(tabs)/surveyHistory')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All &gt;</Text>
        </Pressable>
      </View>

      {recentSurveys.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="file-tray-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No survey inspection recorded yet.</Text>
          <Pressable 
            onPress={() => router.replace('/(tabs)/survey')}
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.emptyBtnText}>Start First Survey</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={recentSurveys}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item, index }) => {
            const statusStyle = getStatusColor(item.status);
            const iconSpec = getRecentIcon(index);

            return (
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: '/surveyPreview',
                    params: { viewOnlyId: item.id }
                  });
                }}
                style={({ pressed }) => [
                  styles.recentCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}
              >
                <View style={[styles.recentIconCircle, { backgroundColor: iconSpec.bg }]}>
                  <Ionicons name={iconSpec.name} size={18} color={iconSpec.color} />
                </View>

                <View style={styles.recentInfo}>
                  <Text style={[styles.recentSite, { color: colors.text }]} numberOfLines={1}>
                    {item.siteName}
                  </Text>
                  <Text style={[styles.recentClient, { color: colors.textSecondary }]} numberOfLines={1}>
                    📍 {item.notes?.split('.')[0] || item.clientName}
                  </Text>
                  <Text style={[styles.recentDate, { color: colors.textSecondary }]}>
                    📅 {item.date} • {item.time || '09:00 AM'}
                  </Text>
                </View>

                <View style={styles.recentRight}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                      {item.status}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </View>
              </Pressable>
            );
          }}
          style={styles.recentList}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 15,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notiBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitleMain: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerTitleSub: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: -2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginLeft: 4,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  greetingSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  greetingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  studentCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  cardAvatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  cardRight: {
    flex: 2.2,
    paddingLeft: 12,
    gap: 6,
    justifyContent: 'center',
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  credIcon: {
    marginRight: 6,
  },
  credLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  credVal: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  decorativeContainer: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    opacity: 0.8,
  },
  countCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  countLeft: {
    flex: 1.5,
    justifyContent: 'center',
  },
  countTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countTitleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  countNumbers: {
    fontSize: 14,
    fontWeight: '600',
  },
  countNumbersHighlight: {
    fontSize: 34,
    fontWeight: '800',
  },
  countRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 15,
    letterSpacing: 0.1,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: '23.5%',
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  actionCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 3,
  },
  actionCardDesc: {
    fontSize: 8.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  recentList: {
    marginBottom: 10,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  recentIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recentInfo: {
    flex: 1,
  },
  recentSite: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  recentClient: {
    fontSize: 11,
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 9.5,
  },
  recentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});
