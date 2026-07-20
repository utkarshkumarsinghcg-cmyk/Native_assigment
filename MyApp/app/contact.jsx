import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, Pressable, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function ContactsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { updateCurrentSurvey } = useSurvey();

  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState('unknown');

  const getContacts = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermission(status === 'granted' ? 'granted' : 'denied');

      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          // Sort alphabetically
          const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
          setContacts(sorted);
          setFilteredContacts(sorted);
        } else {
          setContacts([]);
          setFilteredContacts([]);
        }
      }
    } catch (e) {
      console.log('Error fetching contacts', e);
      Alert.alert('Error', 'Could not access device contacts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getContacts(true);
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    const filtered = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    getContacts();
  };

  const handleContactPress = (contact) => {
    const phoneNumber = contact.phoneNumbers?.[0]?.number || 'No Number';

    Alert.alert(
      contact.name,
      `Choose action for this contact:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy Number',
          onPress: async () => {
            if (phoneNumber === 'No Number') {
              Alert.alert('Unavailable', 'This contact does not have a phone number.');
              return;
            }
            await Clipboard.setStringAsync(phoneNumber);
            Alert.alert('Success', 'Phone number copied to clipboard.');
          },
        },
        {
          text: 'Link to Survey',
          onPress: () => {
            if (phoneNumber === 'No Number') {
              Alert.alert('Warning', 'Cannot link contact without a phone number.');
              return;
            }
            updateCurrentSurvey({
              contact: {
                name: contact.name,
                phoneNumber: phoneNumber,
              },
            });
            Alert.alert(
              'Linked',
              `Linked ${contact.name} to the active survey draft!`,
              [
                {
                  text: 'Return to Survey',
                  onPress: () => router.replace('/(tabs)/survey'),
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Profile avatar initial colors
  const avatarColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const getAvatarBg = (name) => {
    const charCode = name.charCodeAt(0) || 0;
    return avatarColors[charCode % avatarColors.length];
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Contacts...</Text>
      </View>
    );
  }

  if (permission === 'denied') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Ionicons name="people-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 15 }} />
        <Text style={[styles.title, { color: colors.text }]}>Contacts Permission Required</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          Please allow contacts permissions to select and link key site managers to your survey inspections.
        </Text>
        <Pressable 
          onPress={() => getContacts(true)}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.btnText}>Retry Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Box */}
      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.icon} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Search contacts..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={handleSearch}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {search.length > 0 && (
          <Pressable onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Counter label */}
      <View style={styles.counterRow}>
        <Text style={[styles.counterText, { color: colors.textSecondary }]}>
          Found {filteredContacts.length} Contacts
        </Text>
      </View>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={60} color={colors.textSecondary} style={{ marginBottom: 15 }} />
          <Text style={[styles.emptyHeading, { color: colors.text }]}>No Contacts Found</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            {contacts.length === 0 ? 'No contacts detected on this device.' : 'Try a different search keyword.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id || Math.random().toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const phoneNumber = item.phoneNumbers?.[0]?.number || 'No Number';
            const initial = item.name.charAt(0).toUpperCase() || '?';

            return (
              <Pressable
                onPress={() => handleContactPress(item)}
                style={({ pressed }) => [
                  styles.contactCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: getAvatarBg(item.name) }]}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                
                <View style={styles.metaContainer}>
                  <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.contactNumber, { color: colors.textSecondary }]}>
                    {phoneNumber}
                  </Text>
                </View>
                
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
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
    marginTop: 10,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  counterRow: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 1,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  metaContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 13,
  },
});
