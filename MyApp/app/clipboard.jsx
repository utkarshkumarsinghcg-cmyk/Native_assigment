import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function ClipboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { currentSurvey, updateCurrentSurvey } = useSurvey();

  // Local values or fallback placeholders
  const surveyId = currentSurvey.id || 'SURVEY-DRAFT-ACTIVE';
  const contactNumber = currentSurvey.contact?.phoneNumber || '+91 9876543210 (Demo)';
  const currentLocation = currentSurvey.location 
    ? `${currentSurvey.location.latitude.toFixed(6)}, ${currentSurvey.location.longitude.toFixed(6)}` 
    : '23.2156, 72.6369 (Demo)';

  const [notes, setNotes] = useState(currentSurvey.notes || '');

  // Synchronize local notes with global context
  useEffect(() => {
    updateCurrentSurvey({ notes: notes });
  }, [notes, updateCurrentSurvey]);

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard!`);
  };

  const handlePasteNotes = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (!text.trim()) {
        Alert.alert('Empty Clipboard', 'No readable text content found in your clipboard.');
        return;
      }
      setNotes(text);
      Alert.alert('Notes Pasted', 'Text pasted from clipboard into survey notes!');
    } catch (e) {
      console.log('Error pasting text', e);
    }
  };

  const handleClearClipboard = async () => {
    await Clipboard.setStringAsync('');
    setNotes('');
    Alert.alert('Clipboard Cleared', 'System clipboard and local draft notes cleared.');
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
      >
        {/* Copy Tools Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Inspections Clipboard Hub</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Copy critical inspection tokens to link or share in external documents.
          </Text>

          {/* Survey ID */}
          <View style={[styles.clipboardRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Active Survey ID</Text>
              <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{surveyId}</Text>
            </View>
            <Pressable 
              onPress={() => copyToClipboard(surveyId, 'Survey ID')}
              style={({ pressed }) => [styles.copyBtn, { backgroundColor: colors.primary + '15', opacity: pressed ? 0.8 : 1 }]}
            >
              <Ionicons name="copy-outline" size={16} color={colors.primary} />
              <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copy</Text>
            </Pressable>
          </View>

          {/* Contact Number */}
          <View style={[styles.clipboardRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Linked Manager Contact</Text>
              <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{contactNumber}</Text>
            </View>
            <Pressable 
              onPress={() => copyToClipboard(contactNumber, 'Contact Number')}
              style={({ pressed }) => [styles.copyBtn, { backgroundColor: colors.primary + '15', opacity: pressed ? 0.8 : 1 }]}
            >
              <Ionicons name="copy-outline" size={16} color={colors.primary} />
              <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copy</Text>
            </Pressable>
          </View>

          {/* Coordinates */}
          <View style={styles.clipboardRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Linked Coordinates</Text>
              <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{currentLocation}</Text>
            </View>
            <Pressable 
              onPress={() => copyToClipboard(currentLocation, 'GPS Location')}
              style={({ pressed }) => [styles.copyBtn, { backgroundColor: colors.primary + '15', opacity: pressed ? 0.8 : 1 }]}
            >
              <Ionicons name="copy-outline" size={16} color={colors.primary} />
              <Text style={[styles.copyBtnText, { color: colors.primary }]}>Copy</Text>
            </Pressable>
          </View>
        </View>

        {/* Paste Notes Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Survey Draft Notes</Text>
          
          <TextInput
            placeholder="Paste or write detailed field inspection notes here..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={5}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />

          <View style={styles.notesActions}>
            <Pressable 
              onPress={handlePasteNotes}
              style={({ pressed }) => [
                styles.actionBtn, 
                { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <Ionicons name="clipboard-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Paste Notes</Text>
            </Pressable>

            <Pressable 
              onPress={handleClearClipboard}
              style={({ pressed }) => [
                styles.actionBtn, 
                { backgroundColor: '#EF4444', opacity: pressed ? 0.9 : 1 }
              ]}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.actionBtnText}>Clear</Text>
            </Pressable>
          </View>
        </View>

        {/* Action Button Return */}
        <Pressable 
          onPress={() => router.replace('/(tabs)/survey')}
          style={({ pressed }) => [
            styles.returnBtn, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              borderWidth: 1,
              opacity: pressed ? 0.9 : 1
            }
          ]}
        >
          <Text style={[styles.returnBtnText, { color: colors.primary }]}>Return to Survey Form</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 18,
  },
  clipboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '85%',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 1,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  returnBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  returnBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
