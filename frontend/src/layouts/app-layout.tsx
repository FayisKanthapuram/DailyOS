import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Timer,
  Settings,
  ChevronLeft,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Statistics', href: '/statistics', icon: BarChart3, disabled: true },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer, disabled: true },
];

const bottomNav = [{ name: 'Settings', href: '/settings', icon: Settings, disabled: true }];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

function Sidebar() {
  const { isOpen, isCollapsed, close, toggleCollapse } = useSidebarStore();
  const isMobile = useIsMobile();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <span className="text-sm font-bold text-[hsl(var(--primary-foreground))]">D</span>
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tight text-[hsl(var(--sidebar-foreground))]">
              DailyOS
            </span>
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[hsl(var(--foreground-muted))] transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
          >
            <ChevronLeft
              size={16}
              className={cn('transition-transform duration-200', isCollapsed && 'rotate-180')}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.disabled ? '#' : item.href}
              onClick={(e) => {
                if (item.disabled) e.preventDefault();
                if (isMobile) close();
              }}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                  : 'text-[hsl(var(--foreground-secondary))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]',
                item.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <item.icon size={18} />
              {!isCollapsed && <span>{item.name}</span>}
              {!isCollapsed && item.disabled && (
                <span className="ml-auto rounded bg-[hsl(var(--background-tertiary))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--foreground-muted))]">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="space-y-1 border-t border-[hsl(var(--sidebar-border))] px-3 py-3">
        {bottomNav.map((item) => (
          <Link
            key={item.name}
            to={item.disabled ? '#' : item.href}
            onClick={(e) => {
              if (item.disabled) e.preventDefault();
            }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--foreground-secondary))] transition-colors hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]',
              item.disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            <item.icon size={18} />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>
    </div>
  );

  // Mobile: drawer overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))]"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: fixed sidebar
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
      className="fixed inset-y-0 left-0 z-30 hidden border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] md:block"
    >
      {sidebarContent}
    </motion.aside>
  );
}

function Navbar() {
  const { toggle } = useSidebarStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--foreground-secondary))] transition-colors hover:bg-[hsl(var(--background-secondary))]"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none ring-offset-[hsl(var(--background))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]">
              <Avatar className="h-8 w-8 cursor-pointer">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user.name || 'User'} />}
                <AvatarFallback className="bg-[hsl(var(--primary)/0.15)] text-xs font-semibold text-[hsl(var(--primary))]">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-[hsl(var(--foreground-muted))]">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/**
 * AppLayout — wraps all authenticated/dashboard pages.
 * Responsive sidebar + top navbar + main content area.
 */
export function AppLayout() {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: window.innerWidth >= 768 ? (isCollapsed ? 72 : 260) : 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
        className="flex min-h-screen flex-col"
      >
        <Navbar />
        <main className="flex-1 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
