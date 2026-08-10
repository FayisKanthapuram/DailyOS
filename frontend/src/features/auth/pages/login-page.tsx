import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schemas';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setApiError(null);
      await login(data);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        errorObj.response?.data?.message ||
        errorObj.message ||
        'Failed to sign in. Please check your credentials.';
      setApiError(typeof message === 'string' ? message : 'Invalid credentials');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
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
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[hsl(var(--foreground-secondary))]">
          Sign in to your DailyOS account
        </p>
      </div>

      {/* Api Error Banner */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{apiError}</span>
        </motion.div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--accent))]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[hsl(var(--border))]" />
        <span className="text-xs text-[hsl(var(--foreground-muted))]">or</span>
        <div className="h-px flex-1 bg-[hsl(var(--border))]" />
      </div>

      {/* Form */}
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

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-muted))]"
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground-muted))] focus:border-[hsl(var(--ring))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)/0.2)]"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground-secondary))]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs text-[hsl(var(--destructive))]"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {isLoggingIn ? <Loader2 size={18} className="animate-spin" /> : 'Sign in'}
        </button>
      </form>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-[hsl(var(--foreground-secondary))]">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-[hsl(var(--primary))] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
