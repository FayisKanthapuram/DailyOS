import { useThemeStore, type Theme } from '@/stores/theme.store';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

const themes: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun size={14} />, label: 'Light' },
  { value: 'dark', icon: <Moon size={14} />, label: 'Dark' },
  { value: 'system', icon: <Monitor size={14} />, label: 'System' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-[hsl(var(--background-secondary))] p-1">
      {themes.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className="relative flex items-center justify-center rounded-md px-2.5 py-1.5 text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          {theme === value && (
            <motion.div
              layoutId="theme-toggle-active"
              className="absolute inset-0 rounded-md bg-[hsl(var(--background))] shadow-sm"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{icon}</span>
        </button>
      ))}
    </div>
  );
}
