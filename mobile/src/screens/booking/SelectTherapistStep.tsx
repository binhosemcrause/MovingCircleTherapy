import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, tones, typography, spacing, borderRadius, MIN_TOUCH } from '../../utils/theme';
import Button from '../../components/Button';
import { ApiError } from '../../api/client';
import { ApiAppointment, bookAppointment } from '../../api/appointments';
import { ApiService } from '../../api/services';
import { ApiTherapist, listTherapists } from '../../api/therapists';
import { formatSessionDateTime } from './format';

interface Props {
  service: ApiService;
  slotStart: string;
  // Only these therapists are free for the chosen service and time.
  therapistIds: string[];
  onBack: () => void;
  onBooked: (appointment: ApiAppointment) => void;
}

// Each card takes the next tone, so neighbouring therapists are easy to
// tell apart at a glance.
const CARD_TONES = [tones.accent, tones.primarySoft, tones.secondarySoft];

function describeError(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

const SelectTherapistStep = ({ service, slotStart, therapistIds, onBack, onBooked }: Props) => {
  const insets = useSafeAreaInsets();
  const [therapists, setTherapists] = useState<ApiTherapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingTherapistId, setBookingTherapistId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const fetchTherapists = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const all = await listTherapists();
      setTherapists(all.filter((therapist) => therapistIds.includes(therapist.id)));
    } catch (err) {
      setLoadError(describeError(err, 'Could not load therapists. Please check your connection and try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [therapistIds]);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  const handleSelect = async (therapist: ApiTherapist) => {
    setBookingTherapistId(therapist.id);
    setBookingError(null);
    try {
      const appointment = await bookAppointment({
        serviceId: service.id,
        therapistId: therapist.id,
        scheduledAt: slotStart,
      });
      onBooked(appointment);
    } catch (err) {
      setBookingError(describeError(err, 'Could not book your session. Please check your connection and try again.'));
    } finally {
      setBookingTherapistId(null);
    }
  };

  const renderTherapist = (therapist: ApiTherapist, index: number) => {
    const tone = CARD_TONES[index % CARD_TONES.length]!;
    return (
      <View key={therapist.id} style={styles.card}>
        {therapist.photoUrl ? (
          <Image source={{ uri: therapist.photoUrl }} style={styles.photo} accessible={false} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder, { backgroundColor: tone.background }]}>
            <Text style={[styles.photoInitials, { color: tone.text }]}>
              {therapist.firstName[0]}
              {therapist.lastName[0]}
            </Text>
          </View>
        )}
        <Text style={styles.name}>
          {therapist.firstName} {therapist.lastName}
        </Text>
        <Text style={styles.role}>{therapist.title}</Text>
        <Text style={styles.bio}>{therapist.bio}</Text>
        {therapist.specialties.length > 0 && (
          <View style={styles.tags}>
            {therapist.specialties.map((specialty) => (
              <View key={specialty} style={styles.tag}>
                <Text style={styles.tagText}>{specialty}</Text>
              </View>
            ))}
          </View>
        )}
        <Button
          label={`Select ${therapist.firstName}`}
          tone={tone}
          loading={bookingTherapistId === therapist.id}
          disabled={bookingTherapistId !== null}
          onPress={() => handleSelect(therapist)}
          style={styles.selectButton}
        />
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.primaryDark} style={styles.state} accessibilityLabel="Loading therapists" />;
    }
    if (loadError) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateText}>{loadError}</Text>
          <Button label="Try again" variant="secondary" onPress={fetchTherapists} />
        </View>
      );
    }
    if (therapists.length === 0) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateText}>No therapists are available at this time. Please go back and pick another.</Text>
        </View>
      );
    }
    return therapists.map(renderTherapist);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        disabled={bookingTherapistId !== null}
        accessibilityRole="button"
        accessibilityLabel="Back to date selection"
      >
        <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Select a Therapist
        </Text>
        <Text style={styles.subtitle}>
          Find a guide who resonates with your journey. Selecting a therapist books your session.
        </Text>
        <View style={styles.summary}>
          <Ionicons name="calendar-outline" size={18} color={colors.accentDark} />
          <Text style={styles.summaryText}>
            {service.name} · {formatSessionDateTime(slotStart)}
          </Text>
        </View>
      </View>

      {bookingError && (
        <View style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={20} color={colors.accentDark} />
          <Text style={styles.errorText}>{bookingError}</Text>
        </View>
      )}

      <View style={styles.list}>{renderContent()}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dominant1,
  },
  backButton: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.charcoal,
  },
  subtitle: {
    ...typography.paragraph,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryText: {
    ...typography.label,
    flex: 1,
    color: colors.accentDark,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.label,
    flex: 1,
    color: colors.accentDark,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
  },
  photo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginBottom: spacing.md,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitials: {
    ...typography.h2,
  },
  name: {
    ...typography.itemTitle,
    color: colors.charcoal,
    textAlign: 'center',
  },
  role: {
    ...typography.label,
    color: colors.secondaryDark,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  bio: {
    ...typography.paragraph,
    fontSize: 16,
    lineHeight: 22,
    color: colors.charcoal,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    ...typography.label,
    fontSize: 13,
    color: colors.charcoal,
  },
  selectButton: {
    alignSelf: 'stretch',
    minHeight: 54,
    marginTop: spacing.lg,
  },
  state: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  stateText: {
    ...typography.paragraph,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default SelectTherapistStep;
