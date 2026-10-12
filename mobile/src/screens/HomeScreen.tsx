import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, LayoutChangeEvent } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, tones, Tone, typography, DESIGN_WIDTH } from '../utils/theme';
import { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

interface CircleItem {
  id: number;
  label: string;
  tone: Tone;
  // Tab this circle opens; circles without one have no destination yet.
  target?: keyof RootTabParamList;
  // Position and size on the DESIGN_WIDTH-wide design canvas, so the
  // cluster scales to any screen while staying circular.
  left: number;
  top: number;
  diameter: number;
}

const DESIGN_HEIGHT = 1258;

const circles: CircleItem[] = [
  { id: 1, label: 'resources', tone: tones.accent, left: 285, top: 127, diameter: 375 },
  { id: 2, label: 'my journey', tone: tones.secondarySoft, target: 'Profile', left: -15, top: 278, diameter: 290 },
  { id: 3, label: 'moving within', tone: tones.primarySoft, left: 207, top: 505, diameter: 305 },
  { id: 4, label: 'creative\ncircle', tone: tones.secondary, target: 'Creative', left: -75, top: 636, diameter: 340 },
  { id: 5, label: 'therapy for all', tone: tones.primary, target: 'Services', left: 203, top: 785, diameter: 460 },
];

const HomeScreen = ({ navigation }: Props) => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  // Fit the canvas to whichever dimension is tighter so the bottom circle
  // isn't cut off by the tab bar on short screens.
  const scale = size ? Math.min(size.width / DESIGN_WIDTH, size.height / DESIGN_HEIGHT) : 0;

  const handlePress = (item: CircleItem) => {
    if (item.target) {
      navigation.navigate(item.target);
      return;
    }
    Alert.alert('Coming soon', `"${item.label}" isn't available yet.`);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {size && (
        <View style={{ width: DESIGN_WIDTH * scale, height: DESIGN_HEIGHT * scale }}>
          <View style={[styles.titleContainer, { left: 32 * scale, top: 98 * scale }]} accessibilityRole="header">
            <Text style={[styles.titleLine, { fontSize: 36 * scale, lineHeight: 42 * scale }]}>moving circle</Text>
            <Text style={[styles.titleLine, { fontSize: 36 * scale, lineHeight: 42 * scale }]}>THERAPY</Text>
          </View>

          {circles.map((item) => {
            const diameter = item.diameter * scale;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.circle,
                  {
                    left: item.left * scale,
                    top: item.top * scale,
                    width: diameter,
                    height: diameter,
                    borderRadius: diameter / 2,
                    backgroundColor: item.tone.background,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handlePress(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label.replace('\n', ' ')}
              >
                <Text
                  style={[
                    styles.circleLabel,
                    { fontSize: 36 * scale, lineHeight: 44 * scale, color: item.tone.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.dominant1,
  },
  titleContainer: {
    position: 'absolute',
  },
  titleLine: {
    fontFamily: typography.h2.fontFamily,
    color: colors.accentDark,
  },
  circle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  circleLabel: {
    fontFamily: typography.itemTitle.fontFamily,
    textAlign: 'center',
  },
});

export default HomeScreen;
