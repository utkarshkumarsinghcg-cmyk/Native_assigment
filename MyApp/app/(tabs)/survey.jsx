import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function SurveyFormScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { currentSurvey, updateCurrentSurvey } = useSurvey();

  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Input Focus Refs
  const siteNameRef = useRef(null);
  const clientNameRef = useRef(null);
  const descRef = useRef(null);
  const dateRef = useRef(null);

  // Set default date on mount if empty
  useEffect(() => {
    if (!currentSurvey.date) {
      const todayStr = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      updateCurrentSurvey({ date: todayStr });
    }
  }, [currentSurvey.date, updateCurrentSurvey]);

  // Helper to set field and clear error
  const setField = (key, value) => {
    updateCurrentSurvey({ [key]: value });
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!currentSurvey.siteName?.trim()) newErrors.siteName = 'Site Name is required';
    if (!currentSurvey.clientName?.trim()) newErrors.clientName = 'Client Name is required';
    if (!currentSurvey.description?.trim()) newErrors.description = 'Description is required';
    if (!currentSurvey.priority) newErrors.priority = 'Priority is required';
    if (!currentSurvey.date?.trim()) newErrors.date = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validate()) {
      router.push('/surveyPreview');
    } else {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before proceeding.');
    }
  };

  const getInputStyle = (fieldName, multiline = false) => {
    const hasError = errors[fieldName];
    const isFocused = focusedField === fieldName;

    return [
      styles.input,
      multiline && styles.textArea,
      {
        backgroundColor: colors.surface,
        borderColor: hasError 
          ? colors.error 
          : isFocused 
          ? colors.primary 
          : colors.border,
        color: colors.text,
        elevation: isFocused ? 2 : 0,
        shadowColor: colors.primary,
        shadowOpacity: isFocused ? 0.08 : 0,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      }
    ];
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Inspection Details</Text>

          {/* Site Name */}
          <Text style={[styles.label, { color: colors.text }]}>Site Name *</Text>
          <TextInput
            ref={siteNameRef}
            placeholder="e.g. Metro Station Extension"
            placeholderTextColor={colors.textSecondary}
            value={currentSurvey.siteName || ''}
            onChangeText={(val) => setField('siteName', val)}
            onFocus={() => setFocusedField('siteName')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
            onSubmitEditing={() => clientNameRef.current?.focus()}
            style={getInputStyle('siteName')}
          />
          {errors.siteName && <Text style={[styles.errorText, { color: colors.error }]}>{errors.siteName}</Text>}

          {/* Client Name */}
          <Text style={[styles.label, { color: colors.text }]}>Client Name *</Text>
          <TextInput
            ref={clientNameRef}
            placeholder="e.g. L&T Construction"
            placeholderTextColor={colors.textSecondary}
            value={currentSurvey.clientName || ''}
            onChangeText={(val) => setField('clientName', val)}
            onFocus={() => setFocusedField('clientName')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
            onSubmitEditing={() => descRef.current?.focus()}
            style={getInputStyle('clientName')}
          />
          {errors.clientName && <Text style={[styles.errorText, { color: colors.error }]}>{errors.clientName}</Text>}

          {/* Description */}
          <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
          <TextInput
            ref={descRef}
            placeholder="Write inspection summary, objectives, and concerns..."
            placeholderTextColor={colors.textSecondary}
            value={currentSurvey.description || ''}
            onChangeText={(val) => setField('description', val)}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            multiline
            numberOfLines={4}
            returnKeyType="default"
            style={getInputStyle('description', true)}
          />
          {errors.description && <Text style={[styles.errorText, { color: colors.error }]}>{errors.description}</Text>}

          {/* Priority Pill Selector */}
          <Text style={[styles.label, { color: colors.text }]}>Priority *</Text>
          <View style={styles.priorityRow}>
            {['High', 'Medium', 'Low'].map((p) => {
              const isSelected = currentSurvey.priority === p;
              let activeBg = colors.lowPriority;
              if (p === 'High') activeBg = colors.highPriority;
              if (p === 'Medium') activeBg = colors.mediumPriority;

              return (
                <Pressable
                  key={p}
                  onPress={() => setField('priority', p)}
                  style={[
                    styles.priorityPill,
                    {
                      backgroundColor: isSelected ? activeBg : colors.background,
                      borderColor: isSelected ? activeBg : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityPillText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.priority && <Text style={[styles.errorText, { color: colors.error }]}>{errors.priority}</Text>}

          {/* Date */}
          <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
          <TextInput
            ref={dateRef}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textSecondary}
            value={currentSurvey.date || ''}
            onChangeText={(val) => setField('date', val)}
            onFocus={() => setFocusedField('date')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="done"
            onSubmitEditing={handlePreview}
            style={getInputStyle('date')}
          />
          {errors.date && <Text style={[styles.errorText, { color: colors.error }]}>{errors.date}</Text>}
        </View>

        {/* Survey Attachments Status */}
        <View style={[styles.attachmentsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Linked Survey Elements</Text>
          <Text style={[styles.attachmentsDesc, { color: colors.textSecondary }]}>
            Use the Sidebar Drawer to attach live assets (Camera, GPS Location, Contacts, Clipboard Notes) to this survey draft.
          </Text>

          {/* Camera Attachment Status */}
          <View style={[styles.attachmentItem, { borderBottomColor: colors.border }]}>
            <View style={styles.attachmentLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: '#E6F4EA' }]}>
                <Ionicons 
                  name="camera" 
                  size={20} 
                  color={currentSurvey.photo ? colors.secondary : '#137333'} 
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.attachmentName, { color: colors.text }]}>Inspection Photo</Text>
                <Text style={[styles.attachmentStatusText, { color: colors.textSecondary }]}>
                  {currentSurvey.photo ? 'Photo linked successfully' : 'Not attached yet'}
                </Text>
              </View>
            </View>
            {currentSurvey.photo ? (
              <Image source={{ uri: currentSurvey.photo }} style={styles.thumbnail} />
            ) : (
              <Pressable 
                onPress={() => router.replace('/camera')} 
                style={[styles.attachBtn, { backgroundColor: colors.primary + '15' }]}
              >
                <Text style={[styles.attachBtnText, { color: colors.primary }]}>Capture</Text>
              </Pressable>
            )}
          </View>

          {/* GPS Location Attachment Status */}
          <View style={[styles.attachmentItem, { borderBottomColor: colors.border }]}>
            <View style={styles.attachmentLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: '#E8F0FE' }]}>
                <Ionicons 
                  name="location" 
                  size={20} 
                  color={currentSurvey.location ? colors.secondary : '#1A73E8'} 
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.attachmentName, { color: colors.text }]}>GPS Coordinates</Text>
                <Text style={[styles.attachmentStatusText, { color: colors.textSecondary }]}>
                  {currentSurvey.location 
                    ? `${currentSurvey.location.latitude.toFixed(4)}, ${currentSurvey.location.longitude.toFixed(4)}` 
                    : 'Not attached yet'}
                </Text>
              </View>
            </View>
            {currentSurvey.location ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            ) : (
              <Pressable 
                onPress={() => router.replace('/location')} 
                style={[styles.attachBtn, { backgroundColor: colors.primary + '15' }]}
              >
                <Text style={[styles.attachBtnText, { color: colors.primary }]}>Locate</Text>
              </Pressable>
            )}
          </View>

          {/* Contacts Attachment Status */}
          <View style={[styles.attachmentItem, { borderBottomColor: colors.border }]}>
            <View style={styles.attachmentLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons 
                  name="people" 
                  size={20} 
                  color={currentSurvey.contact ? colors.secondary : '#8B5CF6'} 
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.attachmentName, { color: colors.text }]}>Site Contact</Text>
                <Text style={[styles.attachmentStatusText, { color: colors.textSecondary }]}>
                  {currentSurvey.contact 
                    ? `${currentSurvey.contact.name} (${currentSurvey.contact.phoneNumber})` 
                    : 'Not attached yet'}
                </Text>
              </View>
            </View>
            {currentSurvey.contact ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            ) : (
              <Pressable 
                onPress={() => router.replace('/contact')} 
                style={[styles.attachBtn, { backgroundColor: colors.primary + '15' }]}
              >
                <Text style={[styles.attachBtnText, { color: colors.primary }]}>Select</Text>
              </Pressable>
            )}
          </View>

          {/* Notes Clipboard Attachment Status */}
          <View style={styles.attachmentItem}>
            <View style={styles.attachmentLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons 
                  name="clipboard" 
                  size={20} 
                  color={currentSurvey.notes ? colors.secondary : '#D97706'} 
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.attachmentName, { color: colors.text }]}>Clipboard Notes</Text>
                <Text style={[styles.attachmentStatusText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {currentSurvey.notes ? currentSurvey.notes : 'Not attached yet'}
                </Text>
              </View>
            </View>
            {currentSurvey.notes ? (
              <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            ) : (
              <Pressable 
                onPress={() => router.replace('/clipboard')} 
                style={[styles.attachBtn, { backgroundColor: colors.primary + '15' }]}
              >
                <Text style={[styles.attachBtnText, { color: colors.primary }]}>Paste</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Action Button */}
        <Pressable 
          onPress={handlePreview}
          style={({ pressed }) => [
            styles.previewBtn, 
            { 
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1
            }
          ]}
        >
          <Ionicons name="eye-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.previewBtnText}>Preview Survey Details</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  formCard: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14.5,
    marginBottom: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  priorityPill: {
    width: '31%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityPillText: {
    fontSize: 13.5,
  },
  attachmentsCard: {
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
  attachmentsDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  attachmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '700',
  },
  attachmentStatusText: {
    fontSize: 11,
    marginTop: 2,
    maxWidth: '85%',
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  attachBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  attachBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewBtn: {
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
  previewBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
