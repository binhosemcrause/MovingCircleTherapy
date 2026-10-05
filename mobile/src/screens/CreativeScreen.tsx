import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { circleTextColors, colors, fonts, spacing, borderRadius } from '../utils/theme';
import { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Creative'>;
type IoniconName = keyof typeof Ionicons.glyphMap;

interface Activity {
  id: string;
  title: string;
  description: string;
  meta: string;
  icon: IoniconName;
  background: string;
  accent: string;
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
    background: '#FBE2DB',
    accent: circleTextColors.orange,
  },
  {
    id: 'scribble',
    title: '60 Second Scribble',
    description: 'Quick release, no judgment.',
    meta: '60 sec · Playful release',
    icon: 'create-outline',
    background: '#E7E1F6',
    accent: circleTextColors.purple,
  },
  {
    id: 'somatic',
    title: 'Somatic Exercise',
    description: 'Find authentic power through gentle motion.',
    meta: '2-4 min · Gentle motion',
    icon: 'infinite-outline',
    background: '#FBF0D7',
    accent: circleTextColors.yellow,
  },
];

const CreativeScreen = ({ navigation }: Props) => {
  // No native header (headerShown: false in App.tsx), so content has to
  // clear the status bar / notch itself.
  const insets = useSafeAreaInsets();

  const handleActivityPress = (activity: Activity) => {
    Alert.alert('Coming soon', `${activity.title} isn't available yet.`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={circleTextColors.orange} />
        </TouchableOpacity>
      </View>

      <View style={styles.introContainer}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text style={styles.eyebrowText}>Creative Expression</Text>
        </View>
        <Text style={styles.heading}>How can we meet you where you are?</Text>
        <Text style={styles.subheading}>
          You don't need to know what you need right now. Just notice what feels possible.
        </Text>
      </View>

      <View style={styles.activitiesContainer}>
        {ACTIVITIES.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            style={[styles.activityCard, { backgroundColor: activity.background }]}
            onPress={() => handleActivityPress(activity)}
          >
            <View style={styles.activityIconBadge}>
              <Ionicons name={activity.icon} size={26} color={activity.accent} />
            </View>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            <View style={styles.activityMetaPill}>
              <View style={[styles.activityMetaDot, { backgroundColor: activity.accent }]} />
              <Text style={[styles.activityMetaText, { color: activity.accent }]}>{activity.meta}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  introContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: circleTextColors.orange,
  },
  eyebrowText: {
    fontSize: 13,
    fontFamily: fonts.garet.bold,
    color: circleTextColors.orange,
    letterSpacing: 0.3,
  },
  heading: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fonts.josefinSans.bold,
    color: circleTextColors.orange,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    textAlign: 'center',
  },
  activitiesContainer: {
    paddingHorizontal: spacing.lg,
  },
  activityCard: {
    alignItems: 'center',
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  activityIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  activityTitle: {
    fontSize: 18,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  activityDescription: {
    fontSize: 13,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  activityMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  activityMetaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activityMetaText: {
    fontSize: 12,
    fontFamily: fonts.garet.medium,
  },
});

export default CreativeScreen;
