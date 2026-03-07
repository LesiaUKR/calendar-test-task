// backend/src/schemas/taskSchemas.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  order: z.number().int().min(0),
  labels: z.array(z.string()).optional().default([]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  description: z.string().max(1000).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
      .optional(),
    order: z.number().int().min(0).optional(),
    labels: z.array(z.string()).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).nullable().optional(),
    description: z.string().max(1000).nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export const reorderSchema = z.array(
  z.object({
    id: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    order: z.number().int().min(0),
  })
);

export const monthQuerySchema = z.string().regex(/^\d{4}-\d{2}$/, 'Must be YYYY-MM');
