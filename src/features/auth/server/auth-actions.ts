'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth/session';
import { ExperienceLevel } from '@prisma/client';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function registerUser(formData: {
  email: string;
  password: string;
  name?: string;
  experienceLevel?: ExperienceLevel;
}) {
  try {
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const name = formData.name?.trim() || null;
    const experienceLevel = formData.experienceLevel || 'BEGINNER';

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Por favor ingresá un correo electrónico válido.' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        profile: {
          create: {
            experienceLevel,
            goal: 'HYPERTROPHY',
            preferredDays: experienceLevel === 'BEGINNER' ? 3 : 4,
          },
        },
      },
      include: { profile: true },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: 'Ocurrió un error durante el registro.' };
  }
}

export async function loginUser(formData: { email: string; password: string }) {
  try {
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      return { success: false, error: 'El correo y la contraseña son requeridos.' };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: 'Correo o contraseña incorrectos.' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Correo o contraseña incorrectos.' };
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name ?? undefined,
    });

    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: 'Ocurrió un error al iniciar sesión.' };
  }
}

export async function logoutUser() {
  await clearSessionCookie();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function getCurrentUserProfile() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        _count: {
          select: {
            routines: { where: { isArchived: false } },
            workoutLogs: true,
            personalRecords: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
}
