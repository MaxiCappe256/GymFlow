import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function getCurrentUserId(requireAuth = true): Promise<string> {
  const session = await getSession();

  if (session?.userId) {
    return session.userId;
  }

  if (requireAuth) {
    // If not authenticated in production flow, redirect to login
    redirect('/login');
  }

  // Fallback for initial demo seed / tests
  const defaultUser = await prisma.user.upsert({
    where: { email: 'athlete@gymflow.local' },
    update: {},
    create: {
      email: 'athlete@gymflow.local',
      name: 'GymFlow Athlete',
      profile: {
        create: {
          experienceLevel: 'ADVANCED',
          goal: 'HYPERTROPHY',
          preferredDays: 4,
          theme: 'dark',
        },
      },
    },
  });

  return defaultUser.id;
}

export async function getCurrentUser(requireAuth = true) {
  const userId = await getCurrentUserId(requireAuth);
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
}
