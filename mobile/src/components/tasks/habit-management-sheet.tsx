import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { X, RefreshCw, MoreHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../lib/theme';
import type { DailyTaskTemplate } from '../../types/task.types';
import { FrequencyBadge } from './frequency-badge';
import { Button } from '../ui/button';

interface HabitManagementSheetProps {
  visible: boolean;
  onClose: () => void;
  templates: DailyTaskTemplate[];
  isLoading: boolean;
  onDeactivate: (templateId: string) => void;
  onReactivate: (templateId: string) => void;
  onDeletePermanently: (templateId: string) => void;
  onEdit: (template: DailyTaskTemplate) => void;
}

interface TemplateRowProps {
  template: DailyTaskTemplate;
  onDeactivate: (templateId: string) => void;
  onReactivate: (templateId: string) => void;
  onDeletePermanently: (templateId: string) => void;
  onEdit: (template: DailyTaskTemplate) => void;
}

function TemplateRow({
  template,
  onDeactivate,
  onReactivate,
  onDeletePermanently,
  onEdit,
}: TemplateRowProps) {
  const showActions = () => {
    const options: string[] = [];
    const callbacks: (() => void)[] = [];

    options.push('Edit');
    callbacks.push(() => onEdit(template));

    if (template.isActive) {
      options.push('Deactivate');
      callbacks.push(() => onDeactivate(template.id));
    } else {
      options.push('Reactivate');
      callbacks.push(() => onReactivate(template.id));
    }

    options.push('Delete Permanently');
    callbacks.push(() => {
      Alert.alert(
        'Delete Habit',
        `Permanently delete "${template.title}" and all its history? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDeletePermanently(template.id),
          },
        ],
      );
    });

    options.push('Cancel');
    callbacks.push(() => {});

    Alert.alert(template.title, undefined, [
      ...options.slice(0, -1).map((opt, i) => ({
        text: opt,
        style: (opt === 'Delete Permanently' ? 'destructive' : 'default') as 'destructive' | 'default',
        onPress: callbacks[i],
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.templateRow, !template.isActive && styles.templateRowInactive]}>
      <View style={styles.templateIcon}>
        <RefreshCw size={16} color={template.isActive ? colors.primary : colors.subtleForeground} />
      </View>

      <View style={styles.templateContent}>
        <Text
          style={[styles.templateTitle, !template.isActive && styles.templateTitleInactive]}
          numberOfLines={1}
        >
          {template.title}
        </Text>
        <View style={styles.templateMeta}>
          <FrequencyBadge frequency={template.frequency} small />
          <View
            style={[
              styles.statusBadge,
              template.isActive ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                template.isActive ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {template.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={showActions}
        style={styles.menuButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessible
        accessibilityLabel={`Options for ${template.title}`}
      >
        <MoreHorizontal size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}

export function HabitManagementSheet({
  visible,
  onClose,
  templates,
  isLoading,
  onDeactivate,
  onReactivate,
  onDeletePermanently,
  onEdit,
}: HabitManagementSheetProps) {
  const activeTemplates = templates.filter((t) => t.isActive);
  const inactiveTemplates = templates.filter((t) => !t.isActive);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Habits</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible
            accessibilityLabel="Close"
          >
            <X size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading habits...</Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No recurring habits yet</Text>
            <Text style={styles.emptyDesc}>
              Create habits that automatically appear in your daily plan.
            </Text>
          </View>
        ) : (
          <FlatList
            data={[...activeTemplates, ...inactiveTemplates]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              activeTemplates.length > 0 ? (
                <Text style={styles.sectionHeader}>
                  Active ({activeTemplates.length})
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <TemplateRow
                template={item}
                onDeactivate={onDeactivate}
                onReactivate={onReactivate}
                onDeletePermanently={onDeletePermanently}
                onEdit={onEdit}
              />
            )}
            ListFooterComponent={
              inactiveTemplates.length > 0 ? (
                <>
                  <Text style={[styles.sectionHeader, styles.sectionHeaderSpaced]}>
                    Inactive ({inactiveTemplates.length})
                  </Text>
                </>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.foreground,
  },
  closeButton: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sectionHeaderSpaced: {
    marginTop: spacing.lg,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateRowInactive: {
    opacity: 0.6,
  },
  templateIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  templateContent: {
    flex: 1,
    gap: 5,
  },
  templateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  templateTitleInactive: {
    color: colors.mutedForeground,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusInactive: {
    backgroundColor: colors.secondary,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#10b981',
  },
  statusTextInactive: {
    color: colors.mutedForeground,
  },
  menuButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
  },
});
