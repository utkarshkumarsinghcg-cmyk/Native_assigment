import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Alert, Share, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { studentInfo, surveys, todaySurveyCount, updateStudentInfo } = useSurvey();

  // Local state for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [name, setName] = useState(studentInfo.name);
  const [username, setUsername] = useState(studentInfo.username || '');
  const [email, setEmail] = useState(studentInfo.email);
  const [phone, setPhone] = useState(studentInfo.phone || '');
  const [college, setCollege] = useState(studentInfo.college);
  const [department, setDepartment] = useState(studentInfo.department || '');
  const [year, setYear] = useState(studentInfo.year || '');

  const [errors, setErrors] = useState({});

  // Sync state with studentInfo context when editing is toggled or context changes
  useEffect(() => {
    setName(studentInfo.name);
    setUsername(studentInfo.username || '');
    setEmail(studentInfo.email);
    setPhone(studentInfo.phone || '');
    setCollege(studentInfo.college);
    setDepartment(studentInfo.department || '');
    setYear(studentInfo.year || '');
  }, [studentInfo, isEditing]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!college.trim()) newErrors.college = 'Course is required';
    if (!department.trim()) newErrors.department = 'Department is required';
    if (!year.trim()) newErrors.year = 'Year is required';

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      updateStudentInfo({
        name,
        username,
        email,
        phone,
        college,
        department,
        year,
      });
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your investigator profile has been successfully saved!');
    } else {
      Alert.alert('Validation Error', 'Please fill all required fields correctly.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Field Investigator Profile:\nName: ${studentInfo.name}\nUsername: @${studentInfo.username}\nRoll No: ${studentInfo.rollNumber}\nPhone: ${studentInfo.phone}\nCollege: ${studentInfo.college}\nTotal Inspections: ${surveys.length}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Please grant photo library access permissions to pick an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        updateStudentInfo({
          profileImage: result.assets[0].uri,
        });
        Alert.alert('Success', 'Profile photo updated successfully!');
      }
    } catch (e) {
      console.log('Error selecting photo from library:', e);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option to update your investigator avatar:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: () => {
            router.replace('/camera?origin=profile');
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: handleChooseFromGallery,
        },
      ]
    );
  };

  const getInputStyle = (fieldName) => {
    const hasError = errors[fieldName];
    const isFocused = focusedField === fieldName;

    return [
      styles.textInput,
      {
        color: colors.text,
        borderColor: hasError 
          ? colors.error 
          : isFocused 
          ? colors.primary 
          : colors.border,
        backgroundColor: colors.background,
        elevation: isFocused ? 2 : 0,
        shadowColor: colors.primary,
        shadowOpacity: isFocused ? 0.08 : 0,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      }
    ];
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      {/* Profile Card / Header */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerTop}>
          {/* Avatar Container with Camera/Gallery option trigger */}
          <View style={styles.avatarWrapper}>
            <Pressable onPress={handleChangeAvatar} style={styles.avatarPressable}>
              {studentInfo.profileImage ? (
                <Image source={{ uri: studentInfo.profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarFallbackText}>
                    {studentInfo.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {/* Overlay camera circle */}
              <View style={[styles.cameraOverlay, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          <View style={styles.avatarMeta}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {studentInfo.name}
            </Text>
            <Text style={[styles.usernameText, { color: colors.textSecondary }]}>
              @{studentInfo.username || 'username'}
            </Text>
            <Text style={[styles.roll, { color: colors.textSecondary }]}>
              Student ID: {studentInfo.rollNumber}
            </Text>
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>Student Investigator</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {isEditing ? (
          <View style={styles.formContainer}>
            <Text style={[styles.formHeader, { color: colors.text }]}>Edit Credentials</Text>
            
            {/* Name Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('name')}
            />
            {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}

            {/* Username Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Username *</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              style={getInputStyle('username')}
            />
            {errors.username && <Text style={[styles.errorText, { color: colors.error }]}>{errors.username}</Text>}

            {/* Email Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              style={getInputStyle('email')}
            />
            {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}

            {/* Phone Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone Number *</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              keyboardType="phone-pad"
              style={getInputStyle('phone')}
            />
            {errors.phone && <Text style={[styles.errorText, { color: colors.error }]}>{errors.phone}</Text>}

            {/* Course Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Course *</Text>
            <TextInput
              value={college}
              onChangeText={setCollege}
              onFocus={() => setFocusedField('college')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('college')}
            />
            {errors.college && <Text style={[styles.errorText, { color: colors.error }]}>{errors.college}</Text>}

            {/* Department Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Department *</Text>
            <TextInput
              value={department}
              onChangeText={setDepartment}
              onFocus={() => setFocusedField('department')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('department')}
            />
            {errors.department && <Text style={[styles.errorText, { color: colors.error }]}>{errors.department}</Text>}

            {/* Year Input */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Year *</Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              onFocus={() => setFocusedField('year')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('year')}
            />
            {errors.year && <Text style={[styles.errorText, { color: colors.error }]}>{errors.year}</Text>}

            {/* Edit actions */}
            <View style={styles.editActionsRow}>
              <Pressable 
                onPress={handleCancel}
                style={[styles.editActionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
              >
                <Text style={[styles.editActionBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleSave}
                style={[styles.editActionBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.editActionBtnText, { color: '#FFFFFF' }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.detailsContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={16} color={colors.textSecondary} style={styles.infoIcon} />
              <Text style={[styles.infoVal, { color: colors.text }]}>{studentInfo.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={colors.textSecondary} style={styles.infoIcon} />
              <Text style={[styles.infoVal, { color: colors.text }]}>{studentInfo.phone || 'No phone set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="school" size={16} color={colors.textSecondary} style={styles.infoIcon} />
              <Text style={[styles.infoVal, { color: colors.text }]} numberOfLines={1}>{studentInfo.college}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="git-branch" size={16} color={colors.textSecondary} style={styles.infoIcon} />
              <Text style={[styles.infoVal, { color: colors.text }]} numberOfLines={1}>{studentInfo.department || 'No department set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color={colors.textSecondary} style={styles.infoIcon} />
              <Text style={[styles.infoVal, { color: colors.text }]} numberOfLines={1}>{studentInfo.year || 'No year set'}</Text>
            </View>

            <Pressable 
              onPress={() => setIsEditing(true)}
              style={({ pressed }) => [
                styles.inlineEditBtn, 
                { 
                  backgroundColor: colors.primary + '15',
                  opacity: pressed ? 0.8 : 1
                }
              ]}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.inlineEditBtnText, { color: colors.primary }]}>Edit Profile Details</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Inspection Stats */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Investigation Analytics</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="documents" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.statNum, { color: colors.text }]}>{surveys.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Surveys</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.statIconBox, { backgroundColor: colors.secondary + '15' }]}>
            <Ionicons name="checkmark-done" size={24} color={colors.secondary} />
          </View>
          <Text style={[styles.statNum, { color: colors.text }]}>{todaySurveyCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today&apos;s Count</Text>
        </View>
      </View>

      {/* Academic Details Card */}
      <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>Academic Details</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Course Department</Text>
          <Text style={[styles.detailValMain, { color: colors.text }]}>Civil & Construction Engineering</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Study Program</Text>
          <Text style={[styles.detailValMain, { color: colors.text }]}>B.Tech, 4th Year (Seventh Semester)</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Specialization</Text>
          <Text style={[styles.detailValMain, { color: colors.text }]}>Structural Auditing & Non-Destructive Testing</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Course Assignment</Text>
          <Text style={[styles.detailValMain, { color: colors.text }]}>React Native Mini Project Assignment</Text>
        </View>
      </View>

      {/* Action Buttons */}
      {!isEditing && (
        <Pressable 
          onPress={handleShareProfile}
          style={({ pressed }) => [
            styles.actionBtn, 
            { 
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1
            }
          ]}
        >
          <Ionicons name="share-social-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.actionBtnText}>Share Investigator Profile</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'visible',
    position: 'relative',
  },
  avatarPressable: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  avatarMeta: {
    marginLeft: 18,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  roll: {
    fontSize: 13,
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoIcon: {
    marginRight: 10,
    width: 20,
  },
  infoVal: {
    fontSize: 14,
    flex: 1,
  },
  inlineEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  inlineEditBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  formContainer: {
    marginTop: 5,
  },
  formHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 11,
    marginTop: -8,
    marginBottom: 10,
  },
  editActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 15,
  },
  editActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 15,
    letterSpacing: 0.1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNum: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  detailsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 11,
  },
  detailValMain: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
