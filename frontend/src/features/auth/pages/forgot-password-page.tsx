import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/auth.schemas';

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (_data: ForgotPasswordFormValues) => {
    // Forgot password logic will be implemented in Phase 2
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
  };

  return (
    <div>
      {/* Logo */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]">
            <span className="text-base font-bold text-[hsl(var(--primary-foreground))]">D</span>
          </div>
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-[hsl(var(--foreground-secondary))]">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] p-6 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--success)/0.1)]">
            <Mail size={24} className="text-[hsl(var(--success))]" />
          </div>
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Check your email</h2>
          <p className="mt-2 text-sm text-[hsl(var(--foreground-secondary))]">
            If an account with that email exists, we&apos;ve sent you a password reset link.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </motion.div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-muted))]"
                />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-10 pr-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.2)]"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs text-[hsl(var(--destructive))]"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-10 w-full items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Send reset link'}
            </button>
          </form>

          {/* Back to login */}
          <p className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
