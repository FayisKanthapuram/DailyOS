import { Outlet } from 'react-router';
import { motion } from 'framer-motion';

/**
 * AuthLayout — wraps Login, Register, Forgot Password pages.
 * Centered card layout with subtle gradient background.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background-secondary))] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[420px]"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}
