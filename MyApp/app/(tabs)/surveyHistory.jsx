import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, Pressable, Alert, Modal, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSurvey } from '@/context/SurveyContext';

export default function SurveyHistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { surveys, deleteSurvey } = useSurvey();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  // Track search focus
  const [searchFocused, setSearchFocused] = useState(false);

  // State to store filtered results calculated by useEffect
  const [filteredSurveys, setFilteredSurveys] = useState([]);

  // useEffect triggers when search text, priority filter, or surveys list changes
  useEffect(() => {
    const filtered = surveys.filter((item) => {
      const matchesSearch =
        item.siteName.toLowerCase().includes(search.toLowerCase()) ||
        item.clientName.toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === 'All' || item.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
    setFilteredSurveys(filtered);
  }, [search, priorityFilter, surveys]);

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

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Survey Record',
      'Are you sure you want to permanently delete this survey? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSurvey(id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input */}
      <View style={[
        styles.searchBox, 
        { 
          backgroundColor: colors.surface, 
          borderColor: searchFocused ? colors.primary : colors.border,
          elevation: searchFocused ? 3 : 0,
          shadowColor: colors.primary,
          shadowOpacity: searchFocused ? 0.08 : 0,
          shadowRadius: 5,
        }
      ]}>
        <Ionicons name="search" size={20} color={searchFocused ? colors.primary : colors.icon} style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Search site or client name..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Priority Filters */}
      <View style={styles.filterRow}>
        {['All', 'High', 'Medium', 'Low'].map((p) => {
          const isActive = priorityFilter === p;
          let filterColor = colors.primary;
          if (p === 'High') filterColor = colors.highPriority;
          if (p === 'Medium') filterColor = colors.mediumPriority;
          if (p === 'Low') filterColor = colors.lowPriority;

          return (
            <Pressable
              key={p}
              onPress={() => setPriorityFilter(p)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? filterColor : colors.surface,
                  borderColor: isActive ? filterColor : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  {
                    color: isActive ? '#FFFFFF' : colors.text,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Surveys List */}
      {filteredSurveys.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="documents-outline" size={60} color={colors.textSecondary} style={{ marginBottom: 15 }} />
          <Text style={[styles.emptyHeading, { color: colors.text }]}>No Surveys Found</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            {surveys.length === 0 
              ? 'Try drafting a survey in the Form tab and submitting it.' 
              : 'Try matching other search query or priority filters.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSurveys}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status || 'Completed');

            return (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Left Color Stripe */}
                <View style={[styles.colorStripe, { backgroundColor: getPriorityColor(item.priority) }]} />
                
                <Pressable
                  onPress={() => setSelectedSurvey(item)}
                  style={styles.cardContent}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.siteName, { color: colors.text }]} numberOfLines={1}>
                      {item.siteName}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                        {item.status || 'Completed'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.clientName, { color: colors.textSecondary }]} numberOfLines={1}>
                    Client: {item.clientName}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        {item.date} • {item.time || '09:00 AM'}
                      </Text>
                    </View>
                    
                    {/* Indicators showing what assets are inside */}
                    <View style={styles.assetsIndicatorRow}>
                      {item.photo && <Ionicons name="image" size={12} color={colors.secondary} style={styles.assetIndicatorIcon} />}
                      {item.location && <Ionicons name="location" size={12} color={colors.secondary} style={styles.assetIndicatorIcon} />}
                      {item.contact && <Ionicons name="people" size={12} color={colors.secondary} style={styles.assetIndicatorIcon} />}
                      {item.notes && <Ionicons name="clipboard" size={12} color={colors.secondary} style={styles.assetIndicatorIcon} />}
                    </View>
                  </View>
                </Pressable>

                {/* Action buttons */}
                <View style={[styles.cardActions, { borderLeftColor: colors.border }]}>
                  <Pressable
                    onPress={() => setSelectedSurvey(item)}
                    style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons name="eye-outline" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDelete(item.id)}
                    style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 110 }}
        />
      )}

      {/* Survey Detail Modal */}
      <Modal
        visible={selectedSurvey !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedSurvey(null)}
      >
        {selectedSurvey && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Inspection Report</Text>
                  <Text style={[styles.modalSub, { color: colors.textSecondary }]}>{selectedSurvey.id}</Text>
                </View>
                <Pressable 
                  onPress={() => setSelectedSurvey(null)}
                  style={[styles.closeBtn, { backgroundColor: colors.border }]}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Photo Preview if available */}
                {selectedSurvey.photo ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: selectedSurvey.photo }} style={styles.modalImage} />
                    {selectedSurvey.captureTime && (
                      <View style={styles.timeTag}>
                        <Text style={styles.timeTagText}>{selectedSurvey.captureTime}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={[styles.noImageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.noImageText, { color: colors.textSecondary }]}>No Inspection Photo attached</Text>
                  </View>
                )}

                {/* Core inspection card */}
                <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.modalCardHeader}>
                    <Text style={[styles.modalCardHeadline, { color: colors.text }]}>{selectedSurvey.siteName}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedSurvey.priority) + '15' }]}>
                      <Text style={[styles.priorityText, { color: getPriorityColor(selectedSurvey.priority) }]}>
                        {selectedSurvey.priority} Priority
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalCardDivider} />
                  
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Client</Text>
                  <Text style={[styles.modalValue, { color: colors.text, marginBottom: 12, fontWeight: '700' }]}>{selectedSurvey.clientName}</Text>
                  
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Inspection Summary</Text>
                  <Text style={[styles.modalValue, { color: colors.text, lineHeight: 22 }]}>{selectedSurvey.description}</Text>
                  
                  <View style={styles.modalCardDivider} />
                  
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Report Submission Date</Text>
                  <Text style={[styles.modalValue, { color: colors.text, fontWeight: '600' }]}>{selectedSurvey.date} • {selectedSurvey.time || '09:00 AM'}</Text>
                </View>

                {/* GPS Location Details Card */}
                {selectedSurvey.location && (
                  <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.modalCardHeader}>
                      <Ionicons name="location" size={20} color="#10B981" />
                      <Text style={[styles.modalCardHeadline, { color: colors.text, marginLeft: 8 }]}>GPS Coordinates</Text>
                    </View>
                    <View style={styles.modalCardDivider} />
                    <View style={styles.statsGrid}>
                      <View style={styles.statCol}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Latitude</Text>
                        <Text style={[styles.modalValue, { color: colors.text, fontWeight: '700' }]}>{selectedSurvey.location.latitude.toFixed(6)}</Text>
                      </View>
                      <View style={styles.statCol}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Longitude</Text>
                        <Text style={[styles.modalValue, { color: colors.text, fontWeight: '700' }]}>{selectedSurvey.location.longitude.toFixed(6)}</Text>
                      </View>
                    </View>
                    {selectedSurvey.location.accuracy !== undefined && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>GPS Accuracy</Text>
                        <Text style={[styles.modalValue, { color: colors.text }]}>± {selectedSurvey.location.accuracy.toFixed(1)} meters</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Contact Card */}
                {selectedSurvey.contact && (
                  <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.modalCardHeader}>
                      <Ionicons name="people" size={20} color="#F59E0B" />
                      <Text style={[styles.modalCardHeadline, { color: colors.text, marginLeft: 8 }]}>Site Contact</Text>
                    </View>
                    <View style={styles.modalCardDivider} />
                    <View style={styles.contactContainer}>
                      <View style={[styles.contactAvatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.contactAvatarText}>
                          {selectedSurvey.contact.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.modalValue, { color: colors.text, fontWeight: 'bold' }]}>{selectedSurvey.contact.name}</Text>
                        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 2 }]}>{selectedSurvey.contact.phoneNumber}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Clipboard Notes Card */}
                {selectedSurvey.notes ? (
                  <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.modalCardHeader}>
                      <Ionicons name="clipboard" size={20} color="#8B5CF6" />
                      <Text style={[styles.modalCardHeadline, { color: colors.text, marginLeft: 8 }]}>Clipboard Notes</Text>
                    </View>
                    <View style={styles.modalCardDivider} />
                    <Text style={[styles.modalValue, { color: colors.text, fontStyle: 'italic', lineHeight: 20 }]}>
                      &ldquo;{selectedSurvey.notes}&rdquo;
                    </Text>
                  </View>
                ) : null}

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 13,
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
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  colorStripe: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  siteName: {
    fontSize: 15.5,
    fontWeight: '700',
    maxWidth: '65%',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  clientName: {
    fontSize: 13,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
  },
  assetsIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIndicatorIcon: {
    marginLeft: 6,
  },
  cardActions: {
    width: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderLeftWidth: 1,
    paddingVertical: 10,
  },
  actionButton: {
    padding: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  timeTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  timeTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  noImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noImageText: {
    fontSize: 12,
    marginTop: 8,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 15,
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCardHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCardDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  contactContainer: {
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
});
