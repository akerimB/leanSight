'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Sector {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const response = await fetch('/api/sectors');
      if (!response.ok) {
        throw new Error('Failed to fetch sectors');
      }
      const data = await response.json();
      setSectors(data);
    } catch (error) {
      toast.error('Failed to load sectors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSector = () => {
    router.push('/sectors/new');
  };

  const handleEditSector = (sectorId: string) => {
    router.push(`/sectors/${sectorId}`);
  };

  if (loading) {
    return <div className="container mx-auto py-10 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sectors</h1>
        <Button onClick={handleCreateSector}>
          <Plus className="mr-2 h-4 w-4" />
          New Sector
        </Button>
      </div>

      {sectors.length === 0 ? (
        <div className="text-center py-10 border rounded-md">
          <p className="text-lg text-gray-500">No sectors found.</p>
          <p className="text-sm text-gray-400 mb-4">Create one to get started.</p>
          <Button onClick={handleCreateSector}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Sector
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell>{sector.name}</TableCell>
                  <TableCell>{new Date(sector.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(sector.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleEditSector(sector.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 