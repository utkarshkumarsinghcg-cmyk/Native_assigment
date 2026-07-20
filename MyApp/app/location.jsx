import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function LocationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { updateCurrentSurvey } = useSurvey();

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState(null);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermission(false);
        setLoading(false);
        return;
      }

      setPermission(true);
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLoc);
    } catch (e) {
      console.log('Error getting location', e);
      Alert.alert('GPS Error', 'Could not retrieve coordinates. Check if location service is enabled.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleCopyLocation = async () => {
    if (!location) return;
    const text = `Latitude: ${location.coords.latitude.toFixed(6)}, Longitude: ${location.coords.longitude.toFixed(6)}`;
    await Clipboard.setStringAsync(text);
    Alert.alert('Success', 'GPS coordinates copied to clipboard successfully.');
  };

  const handleLinkToSurvey = () => {
    if (!location) return;

    const accuracy = location.coords.accuracy || 100;
    
    // Warn if accuracy is poor (e.g. > 30 meters)
    if (accuracy > 30) {
      Alert.alert(
        'Poor GPS Accuracy',
        `Current GPS accuracy is ±${accuracy.toFixed(1)}m. We recommend refreshing in an open area for better results. Do you still want to link this location?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Link Anyway',
            onPress: () => linkAndRedirect(),
          },
        ]
      );
    } else {
      linkAndRedirect();
    }
  };

  const linkAndRedirect = () => {
    if (!location) return;
    updateCurrentSurvey({
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      },
    });

    Alert.alert(
      'Linked',
      'Location attached to the current survey draft! Returning to Survey Form.',
      [
        {
          text: 'Return to Survey',
          onPress: () => router.replace('/(tabs)/survey'),
        },
      ]
    );
  };

  const getAccuracyRating = (accuracy) => {
    if (accuracy < 10) return { label: 'Excellent', color: colors.secondary };
    if (accuracy < 30) return { label: 'Good', color: colors.warning };
    return { label: 'Poor', color: colors.error };
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Pinpointing coordinates...</Text>
      </View>
    );
  }

  if (permission === false) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="location-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 15 }} />
        <Text style={[styles.title, { color: colors.text }]}>GPS Permission Required</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          Please allow location permissions to tie precise geographic coordinates to your structural field surveys.
        </Text>
        <Pressable 
          onPress={fetchLocation}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.btnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const accuracy = location?.coords.accuracy || 100;
  const rating = getAccuracyRating(accuracy);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* GPS Dashboard Widget */}
      <View style={[styles.widget, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.widgetHeader}>
          <Ionicons name="navigate-circle" size={28} color={colors.primary} />
          <Text style={[styles.widgetTitle, { color: colors.text }]}>Active GPS Status</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Latitude */}
        <View style={styles.coordRow}>
          <View>
            <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>Latitude</Text>
            <Text style={[styles.coordValue, { color: colors.text }]}>
              {location?.coords.latitude.toFixed(6) || 'N/A'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>North/South</Text>
          </View>
        </View>

        {/* Longitude */}
        <View style={styles.coordRow}>
          <View>
            <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>Longitude</Text>
            <Text style={[styles.coordValue, { color: colors.text }]}>
              {location?.coords.longitude.toFixed(6) || 'N/A'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>East/West</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Accuracy */}
        <View style={styles.accuracyRow}>
          <View>
            <Text style={[styles.coordLabel, { color: colors.textSecondary }]}>Signal Accuracy</Text>
            <Text style={[styles.coordValue, { color: colors.text }]}>
              ± {accuracy.toFixed(1)} meters
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: rating.color + '15' }]}>
            <Text style={[styles.badgeText, { color: rating.color }]}>{rating.label}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBlock}>
        <Pressable 
          onPress={fetchLocation}
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
          <Ionicons name="refresh-circle-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Refresh Location</Text>
        </Pressable>

        <Pressable 
          onPress={handleCopyLocation}
          style={({ pressed }) => [
            styles.actionBtn, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.textSecondary,
              borderWidth: 1,
              opacity: pressed ? 0.9 : 1
            }
          ]}
        >
          <Ionicons name="copy-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
          <Text style={[styles.actionBtnText, { color: colors.text }]}>Copy Coordinates</Text>
        </Pressable>

        <Pressable 
          onPress={handleLinkToSurvey}
          style={({ pressed }) => [
            styles.actionBtn, 
            { 
              backgroundColor: colors.secondary,
              opacity: pressed ? 0.9 : 1
            }
          ]}
        >
          <Ionicons name="checkmark-done-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Link to Survey Draft</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 20,
    lineHeight: 20,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  widget: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  coordLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionBlock: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    elevation: 1,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
