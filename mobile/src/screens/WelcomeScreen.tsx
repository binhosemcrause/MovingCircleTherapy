import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../utils/theme';
import Button from '../components/Button';

interface Props {
  onGetStarted: () => void;
}

// welcome-logo.png is 942x960.
const LOGO_WIDTH = 190;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 960) / 942);

const WelcomeScreen = ({ onGetStarted }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.logoArea}>
        <Image
          source={require('../../assets/welcome-logo.png')}
          style={styles.logoMark}
          resizeMode="contain"
          accessible={false}
        />
        <Text style={styles.brandName}>moving circle</Text>
        <Text style={styles.brandSuffix}>THERAPY</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          Welcome
        </Text>
        <Text style={styles.subtitle}>Your journey to holistic wellbeing through movement.</Text>
        <Button label="Get Started" variant="accent" icon="arrow-forward" onPress={onGetStarted} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dominant1,
    paddingHorizontal: spacing.lg,
  },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMark: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    marginBottom: spacing.md,
  },
  brandName: {
    ...typography.itemTitle,
    color: colors.accentDark,
  },
  brandSuffix: {
    ...typography.label,
    fontSize: 13,
    color: colors.accentDark,
    letterSpacing: 2,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h0,
    color: colors.charcoal,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.paragraph,
    color: colors.charcoal,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: 300,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});

export default WelcomeScreen;
