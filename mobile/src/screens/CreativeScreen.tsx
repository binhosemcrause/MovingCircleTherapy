import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, tones, Tone, typography, spacing, borderRadius } from '../utils/theme';
import { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Creative'>;
type IoniconName = keyof typeof Ionicons.glyphMap;

interface Activity {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: IoniconName;
  tone: Tone;
}

// Fixed app content, not API-backed — these are the guided exercises
// themselves, not records about a user, so there's no backend model for
// them yet. Each is a placeholder destination (see handleActivityPress)
// until the actual exercises are built.
const ACTIVITIES: Activity[] = [
  {
    id: 'emotion-wheel',
    title: 'Emotion Wheel',
    description: 'Map your feelings with color.',
    meta: '3-5 min · Low energy',
    icon: 'color-palette-outline',
    tone: tones.accent,
  },
  {
    id: 'scribble',
    title: '60 Second Scribble',
    description: 'Quick release, no judgment.',
    meta: '60 sec · Playful release',
    icon: 'create-outline',
    tone: tones.secondarySoft,
  },
  {
    id: 'somatic',
    title: 'Somatic Exercise',
    description: 'Find authentic power through gentle motion.',
    meta: '2-4 min · Gentle motion',
    icon: 'infinite-outline',
    tone: tones.primarySoft,
  },
];

const CreativeScreen = (_props: Props) => {
  // No native header (headerShown: false in App.tsx), so content has to
  // clear the status bar / notch itself.
  const insets = useSafeAreaInsets();

  const handleActivityPress = (activity: Activity) => {
    Alert.alert('Coming soon', `${activity.title} isn't available yet.`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.introContainer}>
        <Text style={styles.eyebrowText}>CREATIVE EXPRESSION</Text>
        <Text style={styles.heading} accessibilityRole="header">
          How can we meet you where you are?
        </Text>
        <Text style={styles.subheading}>
          You don't need to know what you need right now. Just notice what feels possible.
        </Text>
      </View>

      <View style={styles.activitiesContainer}>
        {ACTIVITIES.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={styles.activityCard}
            activeOpacity={0.8}
            onPress={() => handleActivityPress(activity)}
            accessibilityRole="button"
            accessibilityLabel={`${activity.title}. ${activity.description} ${activity.meta}`}
          >
            <View style={[styles.activityIconBadge, { backgroundColor: activity.tone.background }]}>
              <Ionicons name={activity.icon} size={26} color={activity.tone.text} />
            </View>
            <View style={styles.activityBody}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityMetaText}>{activity.meta}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dominant1,
  },
  introContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  eyebrowText: {
    ...typography.label,
    fontSize: 13,
    color: colors.accentDark,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.h1,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  subheading: {
    ...typography.paragraph,
    color: colors.textMuted,
  },
  activitiesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
  },
  activityIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    ...typography.itemTitle,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  activityDescription: {
    ...typography.paragraph,
    fontSize: 16,
    lineHeight: 22,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  activityMetaText: {
    ...typography.label,
    fontSize: 13,
    color: colors.textMuted,
  },
});

export default CreativeScreen;
