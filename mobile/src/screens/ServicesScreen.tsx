import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Service {
  id: number;
  title: string;
  description: string;
  duration: string;
  price: string;
  icon: IoniconName;
  features: string[];
}

const ServicesScreen = () => {
  const services: Service[] = [
    {
      id: 1,
      title: 'Individual Therapy',
      description: 'One-on-one sessions tailored to your specific needs and goals.',
      duration: '50-60 minutes',
      price: '$120/session',
      icon: 'person-outline',
      features: ['Personalized treatment plan', 'Flexible scheduling', 'In-person or virtual'],
    },
    {
      id: 2,
      title: 'Couples Therapy',
      description: 'Work together to improve communication and strengthen your relationship.',
      duration: '75-90 minutes',
      price: '$150/session',
      icon: 'people-outline',
      features: ['Conflict resolution', 'Communication skills', 'Relationship building'],
    },
    {
      id: 3,
      title: 'Family Therapy',
      description: 'Address family dynamics and create healthier relationships.',
      duration: '75-90 minutes',
      price: '$150/session',
      icon: 'home-outline',
      features: ['Family dynamics', 'Parenting support', 'Intergenerational issues'],
    },
    {
      id: 4,
      title: 'Group Therapy',
      description: 'Connect with others facing similar challenges in a supportive environment.',
      duration: '90 minutes',
      price: '$60/session',
      icon: 'people-circle-outline',
      features: ['Peer support', 'Shared experiences', 'Cost-effective'],
    },
    {
      id: 5,
      title: 'Anxiety & Depression',
      description: 'Specialized treatment for anxiety disorders and depression.',
      duration: '50-60 minutes',
      price: '$130/session',
      icon: 'heart-outline',
      features: ['CBT techniques', 'Mindfulness practices', 'Coping strategies'],
    },
    {
      id: 6,
      title: 'Trauma Therapy',
      description: 'Safe and supportive treatment for trauma and PTSD.',
      duration: '60-75 minutes',
      price: '$140/session',
      icon: 'shield-outline',
      features: ['EMDR therapy', 'Trauma-informed care', 'Safety planning'],
    },
    {
      id: 7,
      title: 'Child & Adolescent',
      description: 'Age-appropriate therapy for children and teenagers.',
      duration: '45-50 minutes',
      price: '$110/session',
      icon: 'happy-outline',
      features: ['Play therapy', 'School collaboration', 'Parent involvement'],
    },
    {
      id: 8,
      title: 'Substance Abuse',
      description: 'Comprehensive treatment for substance use disorders.',
      duration: '60-75 minutes',
      price: '$140/session',
      icon: 'medical-outline',
      features: ['Recovery support', 'Relapse prevention', 'Family education'],
    },
  ];

  const renderService = (service: Service) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIconContainer}>
          <Ionicons name={service.icon} size={28} color={colors.accent} />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
      </View>

      <View style={styles.serviceDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{service.duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="card-outline" size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{service.price}</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {service.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Session</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Services</Text>
        <Text style={styles.headerSubtitle}>
          Comprehensive mental health services tailored to your needs
        </Text>
      </View>

      <View style={styles.servicesContainer}>
        {services.map(renderService)}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Insurance & Payment</Text>
        <Text style={styles.infoText}>
          We accept most major insurance plans and offer sliding scale fees for those in need.
          Contact us to discuss payment options and insurance coverage.
        </Text>

        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Questions about services?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call-outline" size={20} color={colors.white} />
            <Text style={styles.contactButtonText}>Call Us</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: colors.secondary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: fonts.josefinSans.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  servicesContainer: {
    padding: spacing.lg,
  },
  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.round,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    fontFamily: fonts.garet.medium,
    color: colors.text,
  },
  featuresContainer: {
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: 14,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  bookButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: fonts.garet.bold,
    color: colors.white,
  },
  infoSection: {
    padding: spacing.lg,
    backgroundColor: colors.lightGray,
  },
  infoTitle: {
    fontSize: 20,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: fonts.garet.medium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  contactButton: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  contactButtonText: {
    fontSize: 16,
    fontFamily: fonts.garet.bold,
    color: colors.white,
  },
});

export default ServicesScreen;
