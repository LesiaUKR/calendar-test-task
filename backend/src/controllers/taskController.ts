import { Request, Response } from 'express';

import prisma from '../lib/prisma';
import { monthQuerySchema } from '../schemas/taskSchemas';
import HttpError from '../utils/HttpError';

const GUEST_USER_ID = 'guest-user-id';

export const getTasks = async (req: Request, res: Response) => {
  const month = req.query.month as string | undefined;
  const where: { userId: string; date?: { startsWith: string } } = {
    userId: GUEST_USER_ID,
  };

  if (month) {
    const result = monthQuerySchema.safeParse(month);
    if (!result.success) {
      throw new HttpError(400, 'month must be in YYYY-MM format');
    }
    where.date = { startsWith: `${month}-` };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ date: 'asc' }, { order: 'asc' }],
  });

  res.json(tasks);
};

export const createTask = async (req: Request, res: Response) => {
  const task = await prisma.task.create({
    data: { ...req.body, userId: GUEST_USER_ID },
  });

  res.status(201).json(task);
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== GUEST_USER_ID) {
    throw new HttpError(404, 'Task not found');
  }

  const task = await prisma.task.update({
    where: { id },
    data: req.body,
  });

  res.json(task);
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== GUEST_USER_ID) {
    throw new HttpError(404, 'Task not found');
  }

  await prisma.task.delete({ where: { id } });

  res.status(204).send();
};

export const reorderTasks = async (req: Request, res: Response) => {
  const items = req.body;

  await prisma.$transaction(
    items.map((item: { id: string; date: string; order: number }) =>
      prisma.task.update({
        where: { id: item.id },
        data: { date: item.date, order: item.order },
      })
    )
  );

  res.json({ success: true });
};
