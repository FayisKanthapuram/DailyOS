import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h1 className="text-7xl font-bold text-[hsl(var(--primary))]">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-[hsl(var(--foreground))]">Page not found</h2>
        <p className="mt-2 text-sm text-[hsl(var(--foreground-secondary))]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:opacity-90"
        >
          <Home size={16} />
          Go home
        </Link>
      </motion.div>
    </div>
  );
}
