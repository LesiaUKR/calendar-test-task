import 'dotenv/config';

import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const guest = await prisma.user.upsert({
    where: { id: 'guest-user-id' },
    update: {},
    create: {
      id: 'guest-user-id',
      email: 'guest@calendar.local',
      passwordHash: 'no-auth',
    },
  });

  console.log('Seeded guest user:', guest.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
