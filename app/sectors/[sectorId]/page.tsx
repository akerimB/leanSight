'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SectorDetails from '../../components/sectors/SectorDetails';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Dimension {
  id: string;
  name: string;
}

interface Descriptor {
  id: string;
  dimensionId: string;
  level: number;
  description: string;
}

interface DescriptorGroup {
  dimensionId: string;
  dimensionName: string;
  descriptors: Descriptor[];
}

interface PageProps {
  params: Promise<{ sectorId: string }>;
}

export default async function SectorPage({ params }: PageProps) {
  const { sectorId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    notFound();
  }

  const sector = await prisma.sector.findUnique({
    where: { id: sectorId },
    include: {
      descriptors: {
        include: {
          dimension: true,
        },
      },
    },
  });

  if (!sector) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SectorDetails sector={sector} />
    </Suspense>
  );
} 