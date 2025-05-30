import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { broadcastUpdate } from '@/lib/broadcastUpdate';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data, targetCompanyId, targetDepartmentId, adminOnly } = body;

    // Create filter function based on target criteria
    const filter = (client: any) => {
      // Admin-only updates
      if (adminOnly && client.role !== 'ADMIN') {
        return false;
      }

      // Company-specific updates
      if (targetCompanyId && client.companyId !== targetCompanyId) {
        return false;
      }

      // Department-specific updates (if specified)
      if (targetDepartmentId) {
        // For department-specific updates, we'd need to check if the user belongs to that department
        // For now, we'll just send to users of the same company
        return client.companyId === targetCompanyId;
      }

      return true;
    };

    // Broadcast the update
    broadcastUpdate({
      type,
      data,
      sender: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    }, filter);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json({ error: 'Failed to broadcast update' }, { status: 500 });
  }
} 