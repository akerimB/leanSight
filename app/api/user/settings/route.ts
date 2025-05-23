import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const userSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  darkMode: z.boolean().optional(),
  language: z.string().min(2).max(10).optional(), // e.g., "en", "es-MX"
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userSettings = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailNotifications: true,
        darkMode: true,
        language: true,
      },
    });

    if (!userSettings) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ message: 'Error fetching user settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = userSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, any> = {};
    if (validation.data.emailNotifications !== undefined) {
      dataToUpdate.emailNotifications = validation.data.emailNotifications;
    }
    if (validation.data.darkMode !== undefined) {
      dataToUpdate.darkMode = validation.data.darkMode;
    }
    if (validation.data.language !== undefined) {
      dataToUpdate.language = validation.data.language;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: 'No settings provided to update' }, { status: 400 });
    }

    const updatedUserSettings = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: {
        emailNotifications: true,
        darkMode: true,
        language: true,
      },
    });

    return NextResponse.json(updatedUserSettings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    // Could add specific error handling for Prisma client errors if needed
    return NextResponse.json({ message: 'Error updating user settings' }, { status: 500 });
  }
} 