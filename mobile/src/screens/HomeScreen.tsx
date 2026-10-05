import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { colors, circleColors, circleTextColors, fonts } from '../utils/theme';
import { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

interface CircleItem {
  id: number;
  label: string;
  color: string;
  textColor: string;
  // Position and size as a fraction of the design canvas, keyed to a
  // 656-wide reference so the cluster scales to any screen width while
  // staying circular.
  left: number;
  top: number;
  diameter: number;
}

const DESIGN_WIDTH = 656;
const DESIGN_HEIGHT = 1258;

const circles: CircleItem[] = [
  { id: 1, label: 'resources', color: circleColors.orange, textColor: circleTextColors.orange, left: 285, top: 127, diameter: 375 },
  { id: 2, label: 'my journey', color: circleColors.purple, textColor: circleTextColors.purple, left: -15, top: 278, diameter: 290 },
  { id: 3, label: 'moving within', color: circleColors.yellow, textColor: circleTextColors.yellow, left: 207, top: 505, diameter: 305 },
  { id: 4, label: 'creative circle', color: circleColors.blue, textColor: circleTextColors.blue, left: -75, top: 636, diameter: 340 },
  { id: 5, label: 'therapy for all', color: circleColors.green, textColor: circleTextColors.green, left: 203, top: 785, diameter: 460 },
];

const HomeScreen = (_props: Props) => {
  const { width } = useWindowDimensions();
  const scale = width / DESIGN_WIDTH;

  const handlePress = (item: CircleItem) => {
    console.log(`Navigating to ${item.label}`);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.canvas, { width, height: DESIGN_HEIGHT * scale }]}>
        <View style={[styles.titleContainer, { left: 32 * scale, top: 98 * scale }]}>
          <Text style={[styles.titleLine, { fontSize: 28 * scale }]}>moving circle</Text>
          <Text style={[styles.titleLineBold, { fontSize: 28 * scale }]}>THERAPY</Text>
        </View>

        {circles.map((item) => {
          const size = item.diameter * scale;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.circle,
                {
                  left: item.left * scale,
                  top: item.top * scale,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: item.color,
                },
              ]}
              onPress={() => handlePress(item)}
            >
              <Text style={[styles.circleLabel, { fontSize: 24 * scale, color: item.textColor }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  canvas: {
    position: 'relative',
  },
  titleContainer: {
    position: 'absolute',
  },
  titleLine: {
    fontFamily: fonts.josefinSans.regular,
    color: colors.accent,
  },
  titleLineBold: {
    fontFamily: fonts.josefinSans.bold,
    color: colors.accent,
  },
  circle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  circleLabel: {
    fontFamily: fonts.josefinSans.bold,
    textAlign: 'center',
  },
});

export default HomeScreen;
