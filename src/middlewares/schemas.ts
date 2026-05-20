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

export const getAllStationsSchema = z.object({
  query: z.object({
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).optional()),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).optional())
  })
});

export const searchStationsSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
    page: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).optional()),
    limit: z.preprocess((val) => (val ? parseInt(val as string, 10) : undefined), z.number().int().min(1).optional())
  })
});

export const calculateFareSchema = z.object({
  query: z.object({
    from: z.string().min(1, 'Departure station (from) is required'),
    to: z.string().optional()
  })
});

export const getRouteDetailSchema = z.object({
  query: z.object({
    from: z.string().min(1, 'Departure station (from) is required'),
    to: z.string().min(1, 'Destination station (to) is required')
  })
});

export const getStationScheduleSchema = z.object({
  params: z.object({
    stationId: z.string().min(1, 'Station ID is required'),
  }),
  query: z.object({
    dayType: z.enum(['weekday', 'weekend']).optional(),
    upcomingOnly: z.string().optional(),
  }),
});
