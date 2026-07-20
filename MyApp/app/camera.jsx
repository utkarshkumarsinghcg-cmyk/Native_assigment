import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { updateCurrentSurvey, updateStudentInfo } = useSurvey();

  // Read query params to check if launched from Profile screen
  const searchParams = useLocalSearchParams();
  const origin = searchParams.origin;

  const [facing, setFacing] = useState('back');
  const [photo, setPhoto] = useState(null);
  const [captureTime, setCaptureTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  // Monitor media library permissions on mount
  useEffect(() => {
    const logPermissions = async () => {
      try {
        const res = await MediaLibrary.getPermissionsAsync();
        console.log('Media library permission status:', res.status);
      } catch (e) {
        console.log('Error verifying media permissions:', e);
      }
    };
    logPermissions();
  }, []);

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="camera-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 15 }} />
        <Text style={[styles.title, { color: colors.text }]}>Camera Permission Required</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          Please grant camera permissions to capture inspectable field images.
        </Text>
        <Pressable 
          onPress={requestPermission}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.btnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (result?.uri) {
        setPhoto(result.uri);
        setCaptureTime(new Date().toLocaleString('en-GB'));
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Capture Error', 'Failed to capture photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkToSurvey = async () => {
    if (!photo) return;
    
    if (origin === 'profile') {
      // Update student profile picture in context
      updateStudentInfo({
        profileImage: photo,
      });

      Alert.alert(
        'Avatar Updated', 
        'Profile picture updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/profile');
            }
          }
        ]
      );
    } else {
      // Normal survey linking flow
      updateCurrentSurvey({
        photo: photo,
        captureTime: captureTime,
      });

      // Save to library as well
      try {
        let hasMediaPerm = mediaPermission?.granted;
        if (!hasMediaPerm) {
          const response = await requestMediaPermission();
          hasMediaPerm = response.granted;
        }

        if (hasMediaPerm) {
          await MediaLibrary.saveToLibraryAsync(photo);
        }
      } catch (e) {
        console.log('Error saving to library', e);
      }

      Alert.alert(
        'Linked Successfully', 
        'Photo attached to current survey draft! Returning to Survey Form.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/survey');
            }
          }
        ]
      );
    }
  };

  const sharePhoto = async () => {
    if (!photo) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Unavailable', 'Sharing is not available on this device.');
      return;
    }
    await Sharing.shareAsync(photo);
  };

  const deletePhoto = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to discard this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhoto(null);
            setCaptureTime('');
          },
        },
      ]
    );
  };

  const getCancelRoute = () => {
    return origin === 'profile' ? '/(tabs)/profile' : '/(tabs)/survey';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && (
        <View style={[styles.loader, { backgroundColor: colors.background + 'D0' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.text }]}>Processing Image...</Text>
        </View>
      )}

      {/* Top Header Row */}
      <View style={styles.topHeader}>
        <Pressable 
          onPress={() => router.replace(getCancelRoute())}
          style={[styles.circleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {photo ? 'Verify Image Capture' : (origin === 'profile' ? 'Capture Profile Photo' : 'Capture Survey Photo')}
        </Text>
        <Pressable 
          onPress={() => setFacing((curr) => (curr === 'back' ? 'front' : 'back'))}
          style={[styles.circleBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="camera-reverse-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      {!photo ? (
        <View style={styles.cameraViewportWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            mode="picture"
          />
          {/* Bottom Trigger Panel */}
          <View style={[styles.bottomControlPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.triggerContainer}>
              <Pressable onPress={takePhoto} style={[styles.triggerButtonOuter, { borderColor: colors.primary }]}>
                <View style={[styles.triggerButtonInner, { backgroundColor: colors.primary }]} />
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        /* Preview State */
        <View style={styles.cameraViewportWrapper}>
          <View style={[styles.previewFrame, { borderColor: colors.border }]}>
            <Image source={{ uri: photo }} style={styles.previewImage} />
            
            {/* Details tag */}
            <View style={styles.timeTag}>
              <Ionicons name="time" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.timeTagText}>{captureTime}</Text>
            </View>
          </View>

          {/* Bottom Action Controls */}
          <View style={[styles.previewControls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Pressable onPress={deletePhoto} style={[styles.iconActionBtn, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.iconActionLabel, { color: '#EF4444' }]}>Discard</Text>
            </Pressable>
            
            <Pressable onPress={sharePhoto} style={[styles.iconActionBtn, { backgroundColor: colors.border }]}>
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
              <Text style={[styles.iconActionLabel, { color: colors.text }]}>Share</Text>
            </Pressable>

            <Pressable onPress={handleLinkToSurvey} style={[styles.iconActionBtn, { backgroundColor: colors.primary, flex: 1.5 }]}>
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={[styles.iconActionLabel, { color: '#FFFFFF' }]}>
                {origin === 'profile' ? 'Save Profile' : 'Link Photo'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  cameraViewportWrapper: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomControlPanel: {
    paddingVertical: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  triggerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderText: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: '600',
  },
  previewFrame: {
    flex: 1,
    position: 'relative',
    borderWidth: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timeTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  previewControls: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  iconActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  iconActionLabel: {
    fontSize: 13.5,
    fontWeight: 'bold',
  },
});
