// schemas.ts
import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Please enter a password'),
});

// Forgot Password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Password Reset Scheme
export const passwordResetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Sign-up schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(20, 'Name must be no more than 20 characters')
      .regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/, 'Name can only contain letters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
