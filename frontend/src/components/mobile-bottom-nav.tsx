'use client';

import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Calendar, Plus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileBottomNavProps {
  onOpenCreateTask: () => void;
  isSheetOpen?: boolean;
}

export function MobileBottomNav({ onOpenCreateTask, isSheetOpen = false }: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t border-[hsl(var(--border))] bg-[hsl(var(--background)/0.92)] px-2 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile Navigation"
    >
      {/* Dashboard, Tasks, Calendar links */}
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors',
              isActive
                ? 'text-[hsl(var(--primary))] font-semibold'
                : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground-secondary))]',
            )}
          >
            <item.icon size={20} className={cn('mb-0.5', isActive && 'scale-110')} />
            <span>{item.name}</span>
          </Link>
        );
      })}

      {/* Floating Action Button (FAB) for Task Creation */}
      <AnimatePresence>
        {!isSheetOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
            className="relative flex justify-center px-1"
          >
            <button
              onClick={onOpenCreateTask}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.3)] transition-transform active:scale-95"
              aria-label="Create new task"
            >
              <Plus size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile / Account Dropdown */}
      <div className="flex flex-1 flex-col items-center justify-center py-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex flex-col items-center justify-center text-[11px] font-medium text-[hsl(var(--foreground-muted))] outline-none"
              aria-label="User Profile Menu"
            >
              <Avatar className="h-6 w-6 border border-[hsl(var(--border))]">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user.name || 'User'} />}
                <AvatarFallback className="bg-[hsl(var(--primary)/0.15)] text-[10px] font-bold text-[hsl(var(--primary))]">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="mt-0.5">Profile</span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-[hsl(var(--foreground-muted))]">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
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
    </nav>
  );
}
