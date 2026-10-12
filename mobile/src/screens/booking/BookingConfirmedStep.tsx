import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Calendar from 'expo-calendar';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import Button from '../../components/Button';
import { ApiAppointment } from '../../api/appointments';
import { formatSessionDateTime } from './format';

interface Props {
  appointment: ApiAppointment;
  onReturnHome: () => void;
}

type IoniconName = keyof typeof Ionicons.glyphMap;

const BookingConfirmedStep = ({ appointment, onReturnHome }: Props) => {
  const insets = useSafeAreaInsets();
  const { service, therapist } = appointment;
  const therapistName = therapist ? `${therapist.firstName} ${therapist.lastName}` : null;

  // New bookings start as "pending" until the practice confirms them, so
  // only claim "confirmed" when the API says so.
  const statusLine =
    appointment.status === 'confirmed'
      ? 'Your session is confirmed.'
      : `Your request has been sent${therapist ? ` to ${therapist.firstName}` : ''}.`;

  const handleAddToCalendar = async () => {
    const startDate = new Date(appointment.scheduledAt);
    try {
      // Opens the system "new event" sheet pre-filled, so the user picks the
      // calendar and no calendar permission is needed.
      await Calendar.createEventInCalendarAsync({
        title: therapistName ? `${service.name} with ${therapistName}` : service.name,
        startDate,
        endDate: new Date(startDate.getTime() + service.durationMinutes.max * 60000),
        notes: 'Moving Circle Therapy session',
      });
    } catch {
      Alert.alert('Calendar unavailable', 'Could not open your calendar. Please add the session manually.');
    }
  };

  const renderDetail = (icon: IoniconName, label: string, value: string) => (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={22} color={colors.accentDark} />
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xxl, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.checkHalo}>
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={30} color={colors.white} />
          </View>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Booked!
        </Text>
        <Text style={styles.subtitle}>{statusLine}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle} accessibilityRole="header">
          Session Details
        </Text>
        {therapistName && renderDetail('person-outline', 'Therapist', therapistName)}
        {renderDetail('color-palette-outline', 'Service', service.name)}
        {renderDetail('calendar-outline', 'Date & Time', formatSessionDateTime(appointment.scheduledAt))}
      </View>

      <View style={styles.actions}>
        {Platform.OS !== 'web' && (
          <Button label="Add to Calendar" icon="calendar-outline" onPress={handleAddToCalendar} />
        )}
        <Button label="Return Home" variant="link" onPress={onReturnHome} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dominant1,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  checkHalo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.secondary1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h0,
    color: colors.accentDark,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.paragraph,
    color: colors.charcoal,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.xxl,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.itemTitle,
    color: colors.charcoal,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    ...typography.label,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  detailValue: {
    ...typography.paragraph,
    color: colors.charcoal,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
});

export default BookingConfirmedStep;
