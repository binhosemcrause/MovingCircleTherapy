import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { ApiError } from '../api/client';
import { ApiService, listServices } from '../api/services';

type IoniconName = keyof typeof Ionicons.glyphMap;

const CATEGORY_ICONS: Record<string, IoniconName> = {
  counselling: 'person-outline',
  creative_arts_therapy: 'color-palette-outline',
  therapeutic_workshops: 'people-circle-outline',
  family_therapy: 'home-outline',
  couple_movement_therapy: 'body-outline',
  creative_arts_classes: 'brush-outline',
};

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };

function formatDuration({ min, max }: ApiService['durationMinutes']): string {
  return min === max ? `${min} minutes` : `${min}-${max} minutes`;
}

function formatPrice(price: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return symbol ? `${symbol}${price}/session` : `${price} ${currency}/session`;
}

function formatFormat(format: 'in_person' | 'virtual'): string {
  return format === 'in_person' ? 'In person' : 'Virtual';
}

const ServicesScreen = () => {
  const [services, setServices] = useState<ApiService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listServices();
      setServices(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not load services. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const renderService = (service: ApiService) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceIconContainer}>
          <Ionicons
            name={CATEGORY_ICONS[service.category] ?? 'medical-outline'}
            size={28}
            color={colors.accent}
          />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{service.name}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
      </View>

      <View style={styles.serviceDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{formatDuration(service.durationMinutes)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="card-outline" size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{formatPrice(service.price, service.currency)}</Text>
        </View>
      </View>

      {service.formats.length > 0 && (
        <View style={styles.formatsContainer}>
          {service.formats.map((format) => (
            <View key={format} style={styles.formatBadge}>
              <Text style={styles.formatBadgeText}>{formatFormat(format)}</Text>
            </View>
          ))}
        </View>
      )}

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

  const renderServicesContent = () => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textLight} />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (services.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>No services available right now. Please check back soon.</Text>
        </View>
      );
    }

    return services.map(renderService);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Services</Text>
        <Text style={styles.headerSubtitle}>
          Comprehensive mental health services tailored to your needs
        </Text>
      </View>

      <View style={styles.servicesContainer}>
        {renderServicesContent()}
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
  stateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  stateText: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: fonts.garet.bold,
    color: colors.white,
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
  formatsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  formatBadge: {
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.round,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  formatBadgeText: {
    fontSize: 12,
    fontFamily: fonts.garet.medium,
    color: colors.textLight,
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
