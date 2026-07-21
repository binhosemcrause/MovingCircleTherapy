import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

type IoniconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  id: number;
  title: string;
  subtitle: string;
  icon: IoniconName;
  description: string;
  color: string;
}

const HomeScreen = ({ navigation }: Props) => {
  const menuItems: MenuItem[] = [
    {
      id: 1,
      title: 'Therapy for All',
      subtitle: 'Comprehensive mental health support',
      icon: 'heart-outline',
      description: 'Access to individual therapy, group sessions, and specialized programs for all ages and backgrounds.',
      color: colors.accent,
    },
    {
      id: 2,
      title: 'Resources',
      subtitle: 'Educational materials and tools',
      icon: 'library-outline',
      description: 'Self-help resources, articles, worksheets, and tools to support your mental health journey.',
      color: colors.secondary,
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: item.color }]}
      onPress={() => {
        console.log(`Navigating to ${item.title}`);
      }}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <Ionicons name={item.icon} size={32} color={colors.white} />
          <View style={styles.menuItemText}>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <Text style={styles.menuItemDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Moving Circle Therapy</Text>
          <Text style={styles.heroSubtitle}>
            Your journey to mental wellness starts here
          </Text>
          <Text style={styles.heroDescription}>
            We provide compassionate, evidence-based therapy services to support your mental health and well-being.
          </Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>What can we help you with?</Text>
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Book')}
          >
            <Ionicons name="calendar" size={24} color={colors.accent} />
            <Text style={styles.quickActionText}>Book Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Services')}
          >
            <Ionicons name="medical" size={24} color={colors.accent} />
            <Text style={styles.quickActionText}>View Services</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color={colors.secondary} />
            <Text style={styles.contactText}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={colors.secondary} />
            <Text style={styles.contactText}>info@movingcircletherapy.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color={colors.secondary} />
            <Text style={styles.contactText}>123 Therapy Street, Wellness City</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  heroSection: {
    backgroundColor: colors.secondary,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: fonts.josefinSans.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: fonts.garet.medium,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroDescription: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  menuSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  menuContainer: {
    gap: spacing.md,
  },
  menuItem: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  menuItemContent: {
    gap: spacing.md,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 20,
    fontFamily: fonts.josefinSans.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  menuItemSubtitle: {
    fontSize: 16,
    fontFamily: fonts.garet.medium,
    color: colors.white,
    opacity: 0.9,
  },
  menuItemDescription: {
    fontSize: 14,
    fontFamily: fonts.arimo.regular,
    color: colors.white,
    lineHeight: 20,
  },
  quickActionsSection: {
    padding: spacing.lg,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: fonts.garet.medium,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  contactSection: {
    padding: spacing.lg,
    backgroundColor: colors.lightGray,
    marginTop: spacing.lg,
  },
  contactInfo: {
    gap: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactText: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
});

export default HomeScreen;
