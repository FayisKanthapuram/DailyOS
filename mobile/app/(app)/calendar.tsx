import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../src/components/ui/empty-state';
import { colors, spacing } from '../../src/lib/theme';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Interactive day, week, and month view</Text>
      </View>

      <View style={styles.content}>
        <EmptyState
          title="Mobile Calendar Module"
          description="Native calendar agenda and date strip views will be implemented in Mobile Phase 2."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
});
