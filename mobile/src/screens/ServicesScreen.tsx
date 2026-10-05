import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { circleColors, circleTextColors, colors, fonts, spacing, borderRadius } from '../utils/theme';
import { ApiError } from '../api/client';
import { ApiService, ApiServiceSummary, getService, listServices } from '../api/services';
import { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Services'>;

// Each service category gets the same pastel + text-color pairing as the
// home screen's circle cluster (circleColors / circleTextColors in
// theme.ts), plus a paler tint — `light` — of the same hue for the
// secondary "Explore" button. Categories without an explicit entry fall
// back to a deterministic pick from the same palette, so a newly added
// category still looks intentional.
const CATEGORY_THEME: Record<string, { background: string; light: string; text: string }> = {
  creative_arts_therapy: { background: circleColors.orange, light: '#F8CDAE', text: circleTextColors.orange },
  counselling: { background: circleColors.green, light: '#CBE0D3', text: circleTextColors.green },
  family_therapy: { background: circleColors.blue, light: '#BFDAEC', text: circleTextColors.blue },
  dance_movement_therapy: { background: circleColors.yellow, light: '#FAEFBB', text: circleTextColors.yellow },
  couple_movement_therapy: { background: circleColors.purple, light: '#E4DEF1', text: circleTextColors.purple },
};

const FALLBACK_THEMES = Object.values(CATEGORY_THEME);

function getCategoryTheme(category: string): { background: string; light: string; text: string } {
  const theme = CATEGORY_THEME[category];
  if (theme) {
    return theme;
  }
  const hash = Array.from(category).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_THEMES[hash % FALLBACK_THEMES.length]!;
}

// Rough card height from the name's word count, used for each card's
// minHeight so the staggered grid doesn't look perfectly uniform.
function estimateCardHeight(name: string): number {
  const words = name.trim().split(/\s+/).length;
  return 130 + Math.min(words, 4) * 30;
}

// Fixed 2-left/3-right split: the right column takes every other item
// starting from the first, so it ends up with the extra one whenever the
// list length is odd (5 services -> 2 left, 3 right).
function splitIntoColumns<T>(items: T[]): [T[], T[]] {
  const left: T[] = [];
  const right: T[] = [];

  items.forEach((item, index) => {
    (index % 2 === 0 ? right : left).push(item);
  });

  return [left, right];
}

const ServicesScreen = ({ navigation }: Props) => {
  // Neither screen tab has a native header (headerShown: false in App.tsx),
  // so the back buttons below have to clear the status bar / notch
  // themselves rather than relying on a navigation header to do it.
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<ApiServiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selecting a card from the list fetches its full details on demand via
  // GET /services/:id, rather than the list endpoint carrying every field.
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ApiService | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

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

  const fetchServiceDetail = useCallback(async (serviceId: string) => {
    setIsDetailLoading(true);
    setDetailError(null);
    try {
      const data = await getService(serviceId);
      setSelectedService(data);
    } catch (err) {
      setDetailError(
        err instanceof ApiError
          ? err.message
          : 'Could not load this service. Please check your connection and try again.',
      );
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const openService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedService(null);
    fetchServiceDetail(serviceId);
  };

  const closeService = () => {
    setSelectedServiceId(null);
    setSelectedService(null);
    setDetailError(null);
  };

  const [leftColumn, rightColumn] = useMemo(() => splitIntoColumns(services), [services]);

  const renderServiceCard = (service: ApiServiceSummary) => {
    const theme = getCategoryTheme(service.category);
    return (
      <TouchableOpacity
        key={service.id}
        style={[
          styles.serviceCard,
          { backgroundColor: theme.background, minHeight: estimateCardHeight(service.name) },
        ]}
        onPress={() => openService(service.id)}
      >
        <Text style={[styles.serviceCardLabel, { color: theme.text }]}>{service.name}</Text>
      </TouchableOpacity>
    );
  };

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

    return (
      <View style={styles.grid}>
        <View style={styles.column}>{leftColumn.map(renderServiceCard)}</View>
        <View style={styles.column}>{rightColumn.map(renderServiceCard)}</View>
      </View>
    );
  };

  const renderDetailContent = () => {
    if (isDetailLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }

    if (detailError) {
      return (
        <View style={styles.stateContainer}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textLight} />
          <Text style={styles.stateText}>{detailError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => selectedServiceId && fetchServiceDetail(selectedServiceId)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!selectedService) {
      return null;
    }

    const theme = getCategoryTheme(selectedService.category);

    return (
      <View style={styles.detailBody}>
        <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedService.name}</Text>
        {/* Every service is offered in all three modalities, so this line is
            fixed copy rather than something read off the API response. */}
        <Text style={styles.detailSubtitle}>Individual · Couples · Family</Text>
        <Text style={styles.detailDescription}>{selectedService.description}</Text>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.background }]}>
          <Text style={[styles.primaryButtonText, { color: theme.text }]}>Book a session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.light }]}>
          <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
            Explore a self guided activity
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (selectedServiceId) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroContainer, { marginTop: insets.top + spacing.md }]}>
          {selectedService?.imageUrl ? (
            <Image source={{ uri: selectedService.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]} />
          )}
          <TouchableOpacity style={styles.backButton} onPress={closeService} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.servicesContainer}>{renderDetailContent()}</View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.listHeader, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={styles.listBackButton}
          onPress={() => navigation.navigate('Home')}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.servicesContainer}>
        {renderServicesContent()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
  },
  listBackButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    width: '100%',
    height: 220,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: colors.lightGray,
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
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
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
    gap: spacing.md,
  },
  serviceCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.md,
  },
  serviceCardLabel: {
    fontSize: 16,
    fontFamily: fonts.josefinSans.bold,
    textAlign: 'center',
  },
  detailBody: {
    paddingTop: spacing.sm,
  },
  detailTitle: {
    fontSize: 22,
    fontFamily: fonts.josefinSans.bold,
  },
  detailSubtitle: {
    fontSize: 14,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  detailDescription: {
    fontSize: 15,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
    lineHeight: 22,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: fonts.garet.bold,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: fonts.garet.medium,
  },
});

export default ServicesScreen;
