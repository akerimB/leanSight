import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/auditLogService';

// GET all system settings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const settings = await prisma.systemSetting.findMany();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json({ message: 'Error fetching system settings', error: error.message || String(error) }, { status: 500 });
  }
}

// POST to update/create system settings
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id || !session.user.email) {
    console.error('Session or user details missing for system setting update:', session);
    return NextResponse.json({ message: 'Forbidden: User details missing in session.' }, { status: 403 });
  }
  if (session.user.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
  }

  let requestBody;
  try {
    requestBody = await request.json();
    console.log('System settings update request body:', JSON.stringify(requestBody, null, 2));
  } catch (e: any) {
    console.error('Error parsing system settings request JSON:', e);
    return NextResponse.json({ message: 'Invalid JSON payload', error: e.message || String(e) }, { status: 400 });
  }

  try {
    let updatedSettingsResult: any;

    if (Array.isArray(requestBody)) {
      const updatedSettings = [];
      for (const settingData of requestBody) {
        const { key, value, name, description } = settingData;
        if (!key || value === undefined) {
          console.warn('Skipping invalid setting data in array:', settingData);
          continue;
        }
        
        console.log(`Attempting to upsert system setting (array): ${key}`);
        const setting = await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value), name, description },
          create: { key, value: String(value), name, description },
        });
        console.log(`Successfully upserted system setting (array): ${key}`);
        updatedSettings.push(setting);

        console.log(`Attempting to create audit log for system setting (array): ${key}`);
        await createAuditLog({
          userId: session.user.id,
          userEmail: session.user.email,
          action: AUDIT_ACTIONS.SYSTEM_SETTING_UPDATED,
          entityType: 'SystemSetting',
          entityId: setting.id,
          details: { key, newValue: String(value), name, description },
        });
        console.log(`Successfully created audit log for system setting (array): ${key}`);
      }
      updatedSettingsResult = updatedSettings;
    } else {
      const { key, value, name, description } = requestBody;
      if (!key || value === undefined) {
        return NextResponse.json({ message: 'Invalid setting data. "key" and "value" are required.' }, { status: 400 });
      }

      console.log(`Attempting to upsert system setting (single): ${key}`);
      const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value), name, description },
        create: { key, value: String(value), name, description },
      });
      console.log(`Successfully upserted system setting (single): ${key}`);
      updatedSettingsResult = setting;

      console.log(`Attempting to create audit log for system setting (single): ${key}`);
      await createAuditLog({
        userId: session.user.id,
        userEmail: session.user.email,
        action: AUDIT_ACTIONS.SYSTEM_SETTING_UPDATED,
        entityType: 'SystemSetting',
        entityId: setting.id,
        details: { key, newValue: String(value), name, description },
      });
      console.log(`Successfully created audit log for system setting (single): ${key}`);
    }
    return NextResponse.json(updatedSettingsResult);

  } catch (error: any) {
    console.error('Error processing system settings update:', error);
    console.error('Failed request body was:', JSON.stringify(requestBody, null, 2));
    return NextResponse.json({ message: 'Error updating system settings', error: error.message || String(error) }, { status: 500 });
  }
} 