// backend/src/swagger.ts
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Calendar Task API',
    version: '1.0.0',
    description: 'REST API for calendar task management',
  },
  servers: [{ url: '/api' }],
  paths: {
    '/tasks': {
      get: {
        summary: 'Get tasks for a month',
        tags: ['Tasks'],
        parameters: [
          {
            in: 'query',
            name: 'month',
            required: true,
            schema: { type: 'string', example: '2026-03' },
            description: 'Month in YYYY-MM format',
          },
        ],
        responses: {
          200: {
            description: 'Array of tasks',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
              },
            },
          },
          400: { description: 'Invalid month format' },
        },
      },
      post: {
        summary: 'Create a task',
        tags: ['Tasks'],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateTask' } },
          },
        },
        responses: {
          201: {
            description: 'Created task',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Task' } },
            },
          },
          400: { description: 'Validation error' },
          409: { description: 'Duplicate (unique constraint violation)' },
        },
      },
    },
    '/tasks/{id}': {
      patch: {
        summary: 'Update a task (partial)',
        tags: ['Tasks'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateTask' } },
          },
        },
        responses: {
          200: {
            description: 'Updated task',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Task' } },
            },
          },
          400: { description: 'Validation error' },
          404: { description: 'Task not found' },
        },
      },
      delete: {
        summary: 'Delete a task',
        tags: ['Tasks'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Deleted successfully' },
          404: { description: 'Task not found' },
        },
      },
    },
    '/tasks/reorder': {
      put: {
        summary: 'Bulk reorder tasks (drag & drop)',
        tags: ['Tasks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/ReorderItem' },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reorder successful' },
          400: { description: 'Validation error' },
        },
      },
    },
  },
  components: {
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmmgwp99q000028es2vwoaw80' },
          title: { type: 'string', example: 'Team meeting' },
          date: { type: 'string', example: '2026-03-07' },
          order: { type: 'integer', example: 0 },
          labels: {
            type: 'array',
            items: { type: 'string' },
            example: ['work', 'urgent'],
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            nullable: true,
          },
          description: { type: 'string', nullable: true },
          userId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTask: {
        type: 'object',
        required: ['title', 'date', 'order'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255, example: 'New task' },
          date: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            example: '2026-03-07',
          },
          order: { type: 'integer', minimum: 0, example: 0 },
          labels: { type: 'array', items: { type: 'string' } },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          description: { type: 'string', maxLength: 1000 },
        },
      },
      UpdateTask: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          order: { type: 'integer', minimum: 0 },
          labels: { type: 'array', items: { type: 'string' } },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            nullable: true,
          },
          description: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      ReorderItem: {
        type: 'object',
        required: ['id', 'date', 'order'],
        properties: {
          id: { type: 'string' },
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          order: { type: 'integer', minimum: 0 },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
