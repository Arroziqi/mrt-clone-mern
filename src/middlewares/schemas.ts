import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email format'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    pin: z.string().min(6, 'PIN must be at least 6 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    phoneNumber: z.string().min(1, 'Phone number is required'),
    pin: z.string().min(1, 'PIN is required')
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    age: z.number().int().positive().optional()
  })
});
