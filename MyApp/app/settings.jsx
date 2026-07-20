import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { studentInfo, updateStudentInfo, deleteSurvey, surveys } = useSurvey();

  // Local state for editing student info
  const [name, setName] = useState(studentInfo.name);
  const [username, setUsername] = useState(studentInfo.username || '');
  const [roll, setRoll] = useState(studentInfo.rollNumber);
  const [college, setCollege] = useState(studentInfo.college);
  const [department, setDepartment] = useState(studentInfo.department || '');
  const [year, setYear] = useState(studentInfo.year || '');
  const [email, setEmail] = useState(studentInfo.email);
  const [phone, setPhone] = useState(studentInfo.phone || '');

  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Sync state when details update elsewhere
  useEffect(() => {
    setName(studentInfo.name);
    setUsername(studentInfo.username || '');
    setRoll(studentInfo.rollNumber);
    setCollege(studentInfo.college);
    setDepartment(studentInfo.department || '');
    setYear(studentInfo.year || '');
    setEmail(studentInfo.email);
    setPhone(studentInfo.phone || '');
  }, [studentInfo, isEditing]);

  const handleSaveProfile = () => {
    if (!name.trim() || !username.trim() || !roll.trim() || !college.trim() || !department.trim() || !year.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'All student profile fields are required.');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Validation Error', 'Username can only contain alphanumeric characters and underscores.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (!/^\+?[0-9\s\-()]{7,15}$/.test(phone)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }
    
    updateStudentInfo({
      name,
      username,
      rollNumber: roll,
      college,
      department,
      year,
      email,
      phone,
    });
    
    setIsEditing(false);
    Alert.alert('Profile Saved', 'Student investigator details updated successfully.');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All Surveys',
      'This will delete all completed surveys from history. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            surveys.forEach((s) => deleteSurvey(s.id));
            Alert.alert('Cleared', 'All survey inspection history deleted.');
          },
        },
      ]
    );
  };

  const getInputStyle = (fieldName) => {
    const isFocused = focusedField === fieldName;

    return [
      styles.input,
      {
        color: colors.text,
        borderColor: isFocused ? colors.primary : colors.border,
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
      {/* Student Investigator Info Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Investigator Credentials</Text>
          <Pressable 
            onPress={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            style={[styles.editBtn, { backgroundColor: colors.primary + '15' }]}
          >
            <Ionicons name={isEditing ? 'save-outline' : 'create-outline'} size={16} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>{isEditing ? 'Save' : 'Edit'}</Text>
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {isEditing ? (
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('name')}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              style={getInputStyle('username')}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Student ID / Roll No</Text>
            <TextInput
              value={roll}
              onChangeText={setRoll}
              onFocus={() => setFocusedField('roll')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('roll')}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              style={getInputStyle('email')}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              keyboardType="phone-pad"
              style={getInputStyle('phone')}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Course</Text>
            <TextInput
              value={college}
              onChangeText={setCollege}
              onFocus={() => setFocusedField('college')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('college')}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Department</Text>
            <TextInput
              value={department}
              onChangeText={setDepartment}
              onFocus={() => setFocusedField('department')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('department')}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Year</Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              onFocus={() => setFocusedField('year')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('year')}
            />
          </View>
        ) : (
          <View style={styles.display}>
            <View style={styles.displayRow}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>Name:</Text>
              <Text style={[styles.displayValue, { color: colors.text }]}>{studentInfo.name}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>Username:</Text>
              <Text style={[styles.displayValue, { color: colors.text }]}>@{studentInfo.username || 'username'}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>Student ID:</Text>
              <Text style={[styles.displayValue, { color: colors.text }]}>{studentInfo.rollNumber}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>Email:</Text>
              <Text style={[styles.displayValue, { color: colors.text }]}>{studentInfo.email}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>Phone:</Text>
              <Text style={[styles.displayValue, { color: colors.text }]}>{studentInfo.phone || 'No phone set'}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>Course:</Text>
              <Text style={[styles.displayValue, { color: colors.text }]}>{studentInfo.college}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>Department:</Text>
              <Text style={[styles.displayValue, { color: colors.text }]}>{studentInfo.department || 'N/A'}</Text>
            </View>
            <View style={styles.displayRow}>
              <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>Year:</Text>
              <Text style={[styles.displayValue, { color: colors.text }]}>{studentInfo.year || 'N/A'}</Text>
            </View>
          </View>
        )}
      </View>

      {/* App Data Settings Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Data Operations</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Manage stored inspection reports and clear diagnostic logs.
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Clear All Surveys */}
        <Pressable 
          onPress={handleClearHistory}
          style={({ pressed }) => [
            styles.dangerRow, 
            { 
              backgroundColor: pressed ? '#FEF2F2' : 'transparent',
            }
          ]}
        >
          <View style={styles.dangerLeft}>
            <Ionicons name="trash" size={20} color="#EF4444" />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.dangerTitle, { color: '#EF4444' }]}>Clear Survey History</Text>
              <Text style={[styles.dangerDesc, { color: colors.textSecondary }]}>Deletes all completed surveys permanently</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Diagnostics info */}
      <View style={styles.diagnostics}>
        <Text style={[styles.diagnosticsText, { color: colors.textSecondary }]}>
          SDK Version: Expo 54.0.36
        </Text>
        <Text style={[styles.diagnosticsText, { color: colors.textSecondary }]}>
          Environment: Development Build
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  form: {
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: -4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  display: {
    gap: 12,
  },
  displayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  displayLabel: {
    fontSize: 13,
  },
  displayValue: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '70%',
  },
  dangerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  dangerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dangerDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  diagnostics: {
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  diagnosticsText: {
    fontSize: 11,
  },
});
