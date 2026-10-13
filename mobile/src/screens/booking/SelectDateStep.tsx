import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, MIN_TOUCH } from '../../utils/theme';
import Button from '../../components/Button';
import { ApiError } from '../../api/client';
import { ApiService, listAvailability } from '../../api/services';
import { dayKey, formatDuration, formatTime } from './format';

interface Props {
  service: ApiService;
  // ISO start of the slot picked earlier, when coming back from the next step.
  initialSlot: string | null;
  onBack: () => void;
  onContinue: (slotStart: string, therapistIds: string[]) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const SelectDateStep = ({ service, initialSlot, onBack, onContinue }: Props) => {
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => startOfMonth(initialSlot ? new Date(initialSlot) : new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(initialSlot ? dayKey(new Date(initialSlot)) : null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(initialSlot);
  const [slotsByDay, setSlotsByDay] = useState<Record<string, string[]>>({});
  const [therapistsBySlot, setTherapistsBySlot] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // The API filters by calendar date in the practice's timezone, so ask
      // for a day either side and keep only this month's local days below.
      const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      const slots = await listAvailability(service.id, dayKey(addDays(month, -1)), dayKey(addDays(nextMonth, 1)));

      const now = Date.now();
      const grouped: Record<string, string[]> = {};
      const therapists: Record<string, string[]> = {};
      slots
        .filter((slot) => slot.available && new Date(slot.start).getTime() > now)
        .forEach((slot) => {
          const start = new Date(slot.start);
          if (start.getMonth() !== month.getMonth() || start.getFullYear() !== month.getFullYear()) {
            return;
          }
          (grouped[dayKey(start)] ??= []).push(slot.start);
          therapists[slot.start] = slot.therapistIds;
        });
      setSlotsByDay(grouped);
      setTherapistsBySlot(therapists);
    } catch (err) {
      setSlotsByDay({});
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not load available times. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [month, service.id]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  // Land on the first bookable day so the times list is never empty when
  // the month has availability, and drop a previously picked time that has
  // since been taken.
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (selectedSlot && !Object.values(slotsByDay).some((slots) => slots.includes(selectedSlot))) {
      setSelectedSlot(null);
    }
    const days = Object.keys(slotsByDay).sort();
    if (days.length > 0 && (!selectedDay || !slotsByDay[selectedDay])) {
      setSelectedDay(days[0]!);
      setSelectedSlot(null);
    }
  }, [isLoading, slotsByDay, selectedDay, selectedSlot]);

  const weeks = useMemo(() => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (number | null)[] = [
      ...Array<null>(month.getDay()).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return Array.from({ length: cells.length / 7 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
  }, [month]);

  const isCurrentMonth = month.getTime() === startOfMonth(new Date()).getTime();

  const changeMonth = (delta: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  const selectDay = (key: string) => {
    setSelectedDay(key);
    setSelectedSlot(null);
  };

  const times = selectedDay ? slotsByDay[selectedDay] ?? [] : [];
  const hasAvailability = Object.keys(slotsByDay).length > 0;

  const renderTimes = () => {
    if (isLoading) {
      return <ActivityIndicator color={colors.primaryDark} style={styles.timesState} accessibilityLabel="Loading times" />;
    }
    if (error) {
      return (
        <View style={styles.timesState}>
          <Text style={styles.stateText}>{error}</Text>
          <Button label="Try again" variant="link" onPress={fetchMonth} />
        </View>
      );
    }
    if (!hasAvailability) {
      return (
        <View style={styles.timesState}>
          <Text style={styles.stateText}>No times available this month. Try the next month.</Text>
        </View>
      );
    }

    const selectedDate = new Date(times[0]!);
    return (
      <>
        <Text style={styles.timesTitle} accessibilityRole="header">
          Available times for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
        <View style={styles.timesGrid}>
          {times.map((slot) => {
            const isSelected = slot === selectedSlot;
            return (
              <TouchableOpacity
                key={slot}
                style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                onPress={() => setSelectedSlot(slot)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                  {formatTime(new Date(slot))}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </>
    );
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
        accessibilityRole="button"
        accessibilityLabel="Back to service"
      >
        <Ionicons name="arrow-back" size={24} color={colors.charcoal} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.serviceChip}>
          <Text style={styles.serviceChipText}>{service.name.toUpperCase()}</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Select a Date
        </Text>
        <Text style={styles.subtitle}>
          Choose a time that works best for your {formatDuration(service.durationMinutes)} session.
        </Text>
      </View>

      <View style={styles.calendar}>
        <View style={styles.monthRow}>
          <TouchableOpacity
            style={[styles.monthButton, isCurrentMonth && styles.monthButtonDisabled]}
            onPress={() => changeMonth(-1)}
            disabled={isCurrentMonth}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            accessibilityState={{ disabled: isCurrentMonth }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.charcoal} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth(1)}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <Ionicons name="chevron-forward" size={22} color={colors.charcoal} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((weekday, index) => (
            <Text key={index} style={styles.weekdayLabel}>
              {weekday}
            </Text>
          ))}
        </View>

        {weeks.map((week, row) => (
          <View key={row} style={styles.weekRow}>
            {week.map((day, column) => {
              if (day === null) {
                return <View key={column} style={styles.dayCell} />;
              }
              const date = new Date(month.getFullYear(), month.getMonth(), day);
              const key = dayKey(date);
              const isAvailable = !!slotsByDay[key];
              const isSelected = key === selectedDay && isAvailable;
              return (
                <TouchableOpacity
                  key={column}
                  style={styles.dayCell}
                  onPress={() => selectDay(key)}
                  disabled={!isAvailable}
                  accessibilityRole="button"
                  accessibilityLabel={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  accessibilityState={{ disabled: !isAvailable, selected: isSelected }}
                >
                  <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                    <Text
                      style={[
                        styles.dayText,
                        !isAvailable && styles.dayTextUnavailable,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.times}>{renderTimes()}</View>

      <Button
        label="Continue"
        variant="accent"
        icon="arrow-forward"
        disabled={!selectedSlot}
        onPress={() => selectedSlot && onContinue(selectedSlot, therapistsBySlot[selectedSlot] ?? [])}
        style={styles.continueButton}
      />
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  serviceChip: {
    backgroundColor: colors.accent1,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  serviceChipText: {
    ...typography.label,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: colors.charcoal,
  },
  title: {
    ...typography.h1,
    color: colors.charcoal,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.paragraph,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  calendar: {
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.xxl,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  monthButton: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthButtonDisabled: {
    opacity: 0.3,
  },
  monthLabel: {
    ...typography.itemTitle,
    fontSize: 18,
    lineHeight: 23,
    color: colors.charcoal,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    ...typography.label,
    flex: 1,
    fontSize: 12,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.textMuted,
  },
  dayCell: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleSelected: {
    backgroundColor: colors.accentDark,
  },
  dayText: {
    ...typography.label,
    fontSize: 16,
    color: colors.charcoal,
  },
  dayTextUnavailable: {
    fontFamily: typography.paragraph.fontFamily,
    color: colors.textMuted,
    opacity: 0.45,
  },
  dayTextSelected: {
    color: colors.white,
  },
  times: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    minHeight: 120,
  },
  timesTitle: {
    ...typography.itemTitle,
    fontSize: 18,
    lineHeight: 23,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    minWidth: 100,
    minHeight: MIN_TOUCH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.dominant2,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.round,
  },
  timeChipSelected: {
    backgroundColor: colors.accentTint,
    borderColor: colors.accentDark,
  },
  timeChipText: {
    ...typography.label,
    color: colors.charcoal,
  },
  timeChipTextSelected: {
    color: colors.accentDark,
  },
  timesState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  stateText: {
    ...typography.paragraph,
    color: colors.textMuted,
    textAlign: 'center',
  },
  continueButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});

export default SelectDateStep;
