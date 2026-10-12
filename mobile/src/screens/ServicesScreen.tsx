import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, tones, Tone, typography, spacing, borderRadius, MIN_TOUCH } from '../utils/theme';
import Button from '../components/Button';
import { ApiError } from '../api/client';
import { ApiService, ApiServiceSummary, getService, listServices } from '../api/services';
import { getAccessToken } from '../api/session';
import { RootTabParamList } from '../navigation/types';
import BookingFlow from './booking/BookingFlow';

type Props = BottomTabScreenProps<RootTabParamList, 'Services'>;

// Each service category gets one of the palette tones (see theme.ts).
// Categories without an explicit entry fall back to a deterministic pick
// from the same set, so a newly added category still looks intentional.
const CATEGORY_TONE: Record<string, Tone> = {
  creative_arts_therapy: tones.accent,
  counselling: tones.primary,
  family_therapy: tones.primarySoft,
  dance_movement_therapy: tones.secondarySoft,
  couple_movement_therapy: tones.secondary,
};

const FALLBACK_TONES = Object.values(CATEGORY_TONE);

function getCategoryTone(category: string): Tone {
  const tone = CATEGORY_TONE[category];
  if (tone) {
    return tone;
  }
  const hash = Array.from(category).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_TONES[hash % FALLBACK_TONES.length]!;
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

  const [isBooking, setIsBooking] = useState(false);

  // Booking needs an account, so ask before the user picks a time rather
  // than failing at the last step.
  const startBooking = () => {
    if (getAccessToken()) {
      setIsBooking(true);
      return;
    }
    Alert.alert('Log in to book', 'Log in or create an account to book a session.', [
      { text: 'Not now', style: 'cancel' },
      { text: 'Log in', onPress: () => navigation.navigate('Profile') },
    ]);
  };

  const openService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedService(null);
    fetchServiceDetail(serviceId);
  };

  const closeService = () => {
    setSelectedServiceId(null);
    setSelectedService(null);
    setDetailError(null);
    setIsBooking(false);
  };

  const [leftColumn, rightColumn] = useMemo(() => splitIntoColumns(services), [services]);


  const renderServiceCard = (service: ApiServiceSummary) => {
    const tone = getCategoryTone(service.category);
    return (
      <TouchableOpacity
        key={service.id}
        style={[
          styles.serviceCard,
          { backgroundColor: tone.background, minHeight: estimateCardHeight(service.name) },
        ]}
        activeOpacity={0.8}
        onPress={() => openService(service.id)}
        accessibilityRole="button"
        accessibilityLabel={service.name}
      >
        <Text style={[styles.serviceCardLabel, { color: tone.text }]}>{service.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderErrorState = (message: string, onRetry: () => void) => (
    <View style={styles.stateContainer}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={styles.stateText}>{message}</Text>
      <Button label="Try again" variant="secondary" onPress={onRetry} />
    </View>
  );

  const renderLoadingState = (label: string) => (
    <View style={styles.stateContainer} accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primaryDark} />
    </View>
  );

  const renderServicesContent = () => {
    if (isLoading) {
      return renderLoadingState('Loading services');
    }

    if (error) {
      return renderErrorState(error, fetchServices);
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
      return renderLoadingState('Loading service');
    }

    if (detailError) {
      return renderErrorState(detailError, () => selectedServiceId && fetchServiceDetail(selectedServiceId));
    }

    if (!selectedService) {
      return null;
    }

    return (
      <View style={styles.detailBody}>
        <Text style={styles.detailTitle} accessibilityRole="header">
          {selectedService.name}
        </Text>
        {/* Every service is offered in all three modalities, so this line is
            fixed copy rather than something read off the API response. */}
        <Text style={styles.detailSubtitle}>Individual · Couples · Family</Text>
        <Text style={styles.detailDescription}>{selectedService.description}</Text>

        <Button
          label="Book a session"
          onPress={startBooking}
          style={styles.detailPrimaryAction}
        />
        <Button
          label="Explore a self guided activity"
          variant="secondary"
          onPress={() => navigation.navigate('Creative')}
        />
      </View>
    );
  };

  if (isBooking && selectedService) {
    return (
      <BookingFlow
        service={selectedService}
        onCancel={() => setIsBooking(false)}
        onReturnHome={() => {
          closeService();
          navigation.navigate('Home');
        }}
      />
    );
  }

  if (selectedServiceId) {
    const tone = selectedService ? getCategoryTone(selectedService.category) : null;
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroContainer, { marginTop: insets.top }]}>
          {selectedService?.imageUrl ? (
            <Image source={{ uri: selectedService.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: tone?.background ?? colors.dominant2 }]} />
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={closeService}
            accessibilityRole="button"
            accessibilityLabel="Back to services"
          >
            <Ionicons name="arrow-back" size={22} color={colors.charcoal} />
          </TouchableOpacity>
        </View>

        <View style={styles.servicesContainer}>{renderDetailContent()}</View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.listHeader, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.screenTitle} accessibilityRole="header">
          Services
        </Text>
        <Text style={styles.screenSubtitle}>Choose a therapy to learn more or book a session.</Text>
      </View>

      <View style={styles.servicesContainer}>{renderServicesContent()}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dominant1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
  },
  screenTitle: {
    ...typography.h1,
    color: colors.charcoal,
  },
  screenSubtitle: {
    ...typography.paragraph,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  heroContainer: {
    width: '100%',
    height: 220,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    borderRadius: MIN_TOUCH / 2,
    backgroundColor: colors.dominant1,
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
    ...typography.paragraph,
    color: colors.textMuted,
    textAlign: 'center',
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
    padding: spacing.md,
  },
  // One step under itemTitle so single long words ("Counselling") still
  // fit a half-width card on small phones.
  serviceCardLabel: {
    ...typography.itemTitle,
    fontSize: 18,
    lineHeight: 23,
    textAlign: 'center',
  },
  detailBody: {
    paddingTop: spacing.sm,
  },
  detailTitle: {
    ...typography.h2,
    color: colors.charcoal,
  },
  detailSubtitle: {
    ...typography.label,
    color: colors.secondaryDark,
    marginTop: spacing.sm,
  },
  detailDescription: {
    ...typography.paragraph,
    color: colors.charcoal,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  detailPrimaryAction: {
    marginBottom: spacing.md,
  },
});

export default ServicesScreen;
