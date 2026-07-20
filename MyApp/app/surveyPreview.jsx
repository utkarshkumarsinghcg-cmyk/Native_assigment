import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function SurveyPreviewScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { currentSurvey, surveys, submitCurrentSurvey } = useSurvey();
  const params = useLocalSearchParams();
  const viewOnlyId = params.viewOnlyId;

  // Determine which survey data to display
  let displaySurvey = {};
  let isViewOnly = false;

  if (viewOnlyId) {
    const historical = surveys.find((s) => s.id === viewOnlyId);
    if (historical) {
      displaySurvey = historical;
      isViewOnly = true;
    }
  } else {
    displaySurvey = currentSurvey;
  }

  const handleEdit = () => {
    // Navigate back to the form
    router.replace('/(tabs)/survey');
  };

  const handleSubmit = () => {
    const res = submitCurrentSurvey();
    if (res.success) {
      Alert.alert(
        'Submission Success',
        'Field survey report has been submitted to history.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Redirect to history tab
              router.replace('/(tabs)/surveyHistory');
            },
          },
        ]
      );
    } else {
      Alert.alert('Submission Failed', res.error || 'Please check required fields.');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return colors.highPriority;
      case 'Medium':
        return colors.mediumPriority;
      case 'Low':
        return colors.lowPriority;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header Info */}
      <View style={styles.headerRow}>
        <Pressable 
          onPress={() => isViewOnly ? router.back() : router.replace('/(tabs)/survey')}
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isViewOnly ? 'Historical Record' : 'Survey Draft Preview'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Inspection Image */}
      {displaySurvey.photo ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: displaySurvey.photo }} style={styles.image} />
          {displaySurvey.captureTime && (
            <View style={styles.timeTag}>
              <Ionicons name="time" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.timeTagText}>{displaySurvey.captureTime}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.noImageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="image-outline" size={44} color={colors.textSecondary} />
          <Text style={[styles.noImageText, { color: colors.textSecondary }]}>No Inspection Photo attached</Text>
        </View>
      )}

      {/* Site and Client Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.siteName, { color: colors.text }]}>{displaySurvey.siteName || 'Site Name Not Set'}</Text>
          {displaySurvey.priority && (
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(displaySurvey.priority) + '15' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(displaySurvey.priority) }]}>
                {displaySurvey.priority}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.textSecondary }]}>CLIENT</Text>
        <Text style={[styles.val, { color: colors.text, marginBottom: 12 }]}>{displaySurvey.clientName || 'N/A'}</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>INSPECTION DETAILS / DESCRIPTION</Text>
        <Text style={[styles.val, { color: colors.text, lineHeight: 22 }]}>{displaySurvey.description || 'N/A'}</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.textSecondary }]}>SURVEY DATE</Text>
        <Text style={[styles.val, { color: colors.text }]}>{displaySurvey.date || 'N/A'}</Text>
      </View>

      {/* GPS Location details */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconHeading}>
            <Ionicons name="location" size={20} color="#10B981" />
            <Text style={[styles.cardHeadingTitle, { color: colors.text }]}>GPS Coordinates</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {displaySurvey.location ? (
          <View>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Latitude</Text>
                <Text style={[styles.val, { color: colors.text, fontWeight: 'bold' }]}>
                  {displaySurvey.location.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.statCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Longitude</Text>
                <Text style={[styles.val, { color: colors.text, fontWeight: 'bold' }]}>
                  {displaySurvey.location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
            {displaySurvey.location.accuracy !== undefined && (
              <Text style={[styles.accuracyText, { color: colors.textSecondary }]}>
                Estimated accuracy: ± {displaySurvey.location.accuracy.toFixed(1)} meters
              </Text>
            )}
          </View>
        ) : (
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>No GPS Coordinates Linked</Text>
        )}
      </View>

      {/* Contact details */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconHeading}>
            <Ionicons name="people" size={20} color="#F59E0B" />
            <Text style={[styles.cardHeadingTitle, { color: colors.text }]}>Associated Site Manager</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {displaySurvey.contact ? (
          <View style={styles.contactRow}>
            <View style={[styles.contactAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.contactAvatarText}>
                {displaySurvey.contact.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.val, { color: colors.text, fontWeight: 'bold' }]}>{displaySurvey.contact.name}</Text>
              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 2 }]}>{displaySurvey.contact.phoneNumber}</Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>No Site Manager Linked</Text>
        )}
      </View>

      {/* Clipboard Notes details */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.iconHeading}>
            <Ionicons name="clipboard" size={20} color="#8B5CF6" />
            <Text style={[styles.cardHeadingTitle, { color: colors.text }]}>Clipboard Field Notes</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {displaySurvey.notes ? (
          <Text style={[styles.val, { color: colors.text, fontStyle: 'italic', lineHeight: 20 }]}>
            &ldquo;{displaySurvey.notes}&rdquo;
          </Text>
        ) : (
          <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>No Field Notes Linked</Text>
        )}
      </View>

      {/* Action buttons (only in draft mode) */}
      {!isViewOnly ? (
        <View style={styles.actions}>
          <Pressable 
            onPress={handleEdit}
            style={({ pressed }) => [
              styles.actionBtn, 
              { 
                backgroundColor: colors.surface,
                borderColor: colors.primary,
                borderWidth: 1,
                opacity: pressed ? 0.9 : 1
              }
            ]}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit Details</Text>
          </Pressable>

          <Pressable 
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.actionBtn, 
              { 
                backgroundColor: colors.secondary,
                opacity: pressed ? 0.9 : 1
              }
            ]}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Submit Survey</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable 
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backReturnBtn, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.textSecondary,
              borderWidth: 1,
              opacity: pressed ? 0.9 : 1
            }
          ]}
        >
          <Text style={[styles.backReturnBtnText, { color: colors.textSecondary }]}>Go Back</Text>
        </Pressable>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timeTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  timeTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  noImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 12,
    marginTop: 6,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  siteName: {
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: '75%',
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.5,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  val: {
    fontSize: 14,
  },
  iconHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeadingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptySectionText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  accuracyText: {
    fontSize: 11,
    marginTop: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  backReturnBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 1,
  },
  backReturnBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
