import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2, Calendar, Plus, Sparkles, Activity } from 'lucide-react-native';
import { useAuth } from '../../src/hooks/use-auth';
import { Card } from '../../src/components/ui/card';
import { colors, spacing, borderRadius } from '../../src/lib/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const userName = user?.name || user?.email?.split('@')[0] || 'Planner';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Good day,</Text>
            <Text style={styles.nameText}>{userName} 👋</Text>
          </View>
          <View style={styles.statusBadge}>
            <Activity size={12} color={colors.success} />
            <Text style={styles.statusText}>API Connected</Text>
          </View>
        </View>

        {/* Welcome Card */}
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <Sparkles size={20} color={colors.primary} />
            <Text style={styles.welcomeTitle}>DailyOS Mobile Foundation</Text>
          </View>
          <Text style={styles.welcomeDescription}>
            Connected to deployed NestJS backend. Native authentication, secure token storage, and Tab navigation are initialized.
          </Text>
        </Card>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statIconBadge}>
              <CheckCircle2 size={18} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>0 / 0</Text>
            <Text style={styles.statLabel}>Today's Habits</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: colors.warningMuted }]}>
              <Calendar size={18} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Pending Tasks</Text>
          </Card>
        </View>

        {/* Action Shortcuts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Shortcuts</Text>
        </View>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.7}
          onPress={() => router.push('/(app)/tasks')}
        >
          <View style={styles.actionLeft}>
            <View style={styles.actionIconBadge}>
              <Plus size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.actionTitle}>Tasks & Habits</Text>
              <Text style={styles.actionSubtitle}>View and manage your scheduled routines</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.7}
          onPress={() => router.push('/(app)/calendar')}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Calendar size={20} color="#6366f1" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Calendar Planner</Text>
              <Text style={styles.actionSubtitle}>Explore day, week, and month agenda</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successMuted,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  welcomeCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  welcomeDescription: {
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
});
