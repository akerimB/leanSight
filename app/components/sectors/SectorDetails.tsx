'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PlusCircle, ImportIcon, CheckSquare, Square } from 'lucide-react';

// Define the structure for a single dimension (fetched for dropdown)
interface Dimension {
  id: string;
  name: string;
}

// Define the structure for a single descriptor
interface Descriptor {
  id: string;
  dimensionId: string;
  level: number;
  description: string;
  dimension?: Dimension; // Dimension details might be included from initial fetch
}

// Define the structure for the sector prop
interface Sector {
  id: string;
  name: string;
  description?: string | null;
  descriptors: Descriptor[];
}

interface SectorDetailsProps {
  sector: Sector;
}

const SectorDetails: React.FC<SectorDetailsProps> = ({ sector: initialSector }) => {
  const [sector, setSector] = useState<Sector>(initialSector);
  const [editingSector, setEditingSector] = useState(false);
  const [name, setName] = useState(initialSector.name);
  const [description, setDescription] = useState(initialSector.description || '');
  const [sectorUpdateLoading, setSectorUpdateLoading] = useState(false);
  const router = useRouter();

  // State for new descriptor form
  const [availableDimensions, setAvailableDimensions] = useState<Dimension[]>([]);
  const [selectedDimensionId, setSelectedDimensionId] = useState('');
  const [newDescriptorLevel, setNewDescriptorLevel] = useState<number>(1);
  const [newDescriptorDescription, setNewDescriptorDescription] = useState('');
  const [addDescriptorLoading, setAddDescriptorLoading] = useState(false);

  // State for importing descriptors from another sector
  const [showImportSectorModal, setShowImportSectorModal] = useState(false);
  const [otherSectors, setOtherSectors] = useState<Sector[]>([]);
  const [loadingOtherSectors, setLoadingOtherSectors] = useState(false);
  const [selectedSectorToImportFrom, setSelectedSectorToImportFrom] = useState<Sector | null>(null);
  const [descriptorsOfSelectedSector, setDescriptorsOfSelectedSector] = useState<Descriptor[]>([]);
  const [loadingDescriptorsOfSelectedSector, setLoadingDescriptorsOfSelectedSector] = useState(false);
  const [selectedDescriptorIdsToImport, setSelectedDescriptorIdsToImport] = useState<Set<string>>(new Set());
  const [importingDescriptorsLoading, setImportingDescriptorsLoading] = useState(false);

  useEffect(() => {
    setSector(initialSector);
    setName(initialSector.name);
    setDescription(initialSector.description || '');
  }, [initialSector]);

  // Fetch available dimensions for the new descriptor form
  useEffect(() => {
    const fetchDimensions = async () => {
      try {
        const response = await fetch('/api/dimensions');
        if (!response.ok) {
          throw new Error('Failed to fetch dimensions');
        }
        const data = await response.json();
        setAvailableDimensions(data);
      } catch (error) {
        toast.error('Failed to load dimensions for form.');
      }
    };
    fetchDimensions();
  }, []);

  const handleSectorUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSectorUpdateLoading(true);
    try {
      const response = await fetch(`/api/sectors/${sector.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update sector');
      }
      const updatedSectorData = await response.json();
      setSector(updatedSectorData);
      setName(updatedSectorData.name);
      setDescription(updatedSectorData.description || '');
      toast.success('Sector updated successfully');
      setEditingSector(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update sector');
    } finally {
      setSectorUpdateLoading(false);
    }
  };

  const handleAddDescriptor = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDimensionId) {
      toast.error('Please select a dimension.');
      return;
    }
    setAddDescriptorLoading(true);
    try {
      const response = await fetch(`/api/sectors/${sector.id}/descriptors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensionId: selectedDimensionId,
          level: newDescriptorLevel,
          description: newDescriptorDescription,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add descriptor');
      }
      toast.success('Descriptor added successfully');
      setSelectedDimensionId('');
      setNewDescriptorLevel(1);
      setNewDescriptorDescription('');
      router.refresh(); // This will re-fetch server props, including the sector with new descriptors
    } catch (error: any) {
      toast.error(error.message || 'Failed to add descriptor');
    } finally {
      setAddDescriptorLoading(false);
    }
  };

  const fetchOtherSectors = async () => {
    setLoadingOtherSectors(true);
    try {
      const response = await fetch(`/api/sectors?excludeId=${initialSector.id}`);
      if(!response.ok) throw new Error ('Failed to fetch other sectors');
      const data = await response.json();
      setOtherSectors(data);
    } catch (error: any) {
      toast.error(error.message || 'Could not load other sectors.');
      setOtherSectors([]);
    }
    setLoadingOtherSectors(false);
  };

  const handleOpenImportFromSector = () => {
    fetchOtherSectors();
    setShowImportSectorModal(true);
    setSelectedSectorToImportFrom(null); // Reset previous selection
    setDescriptorsOfSelectedSector([]);
    setSelectedDescriptorIdsToImport(new Set());
  };

  const handleSelectSectorToImportFrom = async (sectorId: string) => {
    const selected = otherSectors.find(s => s.id === sectorId);
    setSelectedSectorToImportFrom(selected || null);
    if (selected) {
      setLoadingDescriptorsOfSelectedSector(true);
      try {
        // Sector objects from /api/sectors might not have full descriptor details with dimensions
        // So, fetch the specific sector to get full data if needed, or adjust /api/sectors response
        const response = await fetch(`/api/sectors/${selected.id}`); 
        if (!response.ok) throw new Error('Failed to fetch descriptors for selected sector');
        const sectorData = await response.json();
        setDescriptorsOfSelectedSector(sectorData.descriptors || []);
      } catch (error: any) {
        toast.error(error.message || 'Could not load descriptors.');
        setDescriptorsOfSelectedSector([]);
      }
      setLoadingDescriptorsOfSelectedSector(false);
    }
  };

  const toggleDescriptorForImport = (descriptorId: string) => {
    setSelectedDescriptorIdsToImport(prev => {
      const newSet = new Set(prev);
      if (newSet.has(descriptorId)) {
        newSet.delete(descriptorId);
      } else {
        newSet.add(descriptorId);
      }
      return newSet;
    });
  };

  const handleConfirmImportDescriptors = async () => {
    if (selectedDescriptorIdsToImport.size === 0) {
        toast.error("No descriptors selected to import.");
        return;
    }
    setImportingDescriptorsLoading(true);
    try {
        // This API endpoint needs to be created
        const response = await fetch(`/api/sectors/${initialSector.id}/import-descriptors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptorIds: Array.from(selectedDescriptorIdsToImport) })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to import descriptors');
        }
        toast.success('Descriptors imported successfully!');
        setShowImportSectorModal(false);
        router.refresh(); // Refresh data for the current sector page
    } catch (error: any) {
        toast.error(error.message || 'Failed to import descriptors.');
    }
    setImportingDescriptorsLoading(false);
  };

  const renderDescriptorManagement = () => {
    return (
      <div className="mt-8 p-6 border rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Manage Maturity Descriptors</h2>
          <Button variant="outline" onClick={handleOpenImportFromSector}>
            <ImportIcon className="mr-2 h-4 w-4" /> 
            Import from Sector
          </Button>
        </div>
        
        {/* Add New Descriptor Form */}
        <form onSubmit={handleAddDescriptor} className="mb-8 p-4 border rounded-md bg-gray-50 space-y-4">
          <h3 className="text-lg font-medium">Add New Descriptor</h3>
          <div>
            <Label htmlFor="dimension">Dimension</Label>
            <Select value={selectedDimensionId} onValueChange={setSelectedDimensionId}>
              <SelectTrigger id="dimension">
                <SelectValue placeholder="Select a dimension" />
              </SelectTrigger>
              <SelectContent>
                {availableDimensions.map((dim) => (
                  <SelectItem key={dim.id} value={dim.id}>
                    {dim.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="level">Maturity Level (1-5)</Label>
            <Input 
              id="level" 
              type="number" 
              min={1} 
              max={5} 
              value={newDescriptorLevel} 
              onChange={(e) => setNewDescriptorLevel(parseInt(e.target.value, 10))}
              required
            />
          </div>
          <div>
            <Label htmlFor="newDescriptorDescription">Description</Label>
            <Textarea
              id="newDescriptorDescription"
              value={newDescriptorDescription}
              onChange={(e) => setNewDescriptorDescription(e.target.value)}
              placeholder="Enter descriptor description"
              rows={3}
              required
            />
          </div>
          <Button type="submit" disabled={addDescriptorLoading || !selectedDimensionId || !newDescriptorDescription.trim()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {addDescriptorLoading ? 'Adding...' : 'Add Descriptor'}
          </Button>
        </form>

        {/* Existing Descriptors List */}
        <div>
            <h3 className="text-lg font-medium mb-3">Existing Descriptors</h3>
            {sector.descriptors.length > 0 ? (
            <ul className="space-y-3">
                {sector.descriptors.map(desc => (
                <li key={desc.id} className="p-3 border rounded-md shadow-sm bg-white">
                    <p className="font-semibold">Level {desc.level} - {desc.dimension?.name || 'Unknown Dimension'}</p>
                    <p className="text-sm text-gray-700">{desc.description}</p>
                    <div className="mt-2 text-right">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => alert('Edit not implemented')} >Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => alert('Delete not implemented') } >Delete</Button>
                    </div>
                </li>
                ))}
            </ul>
            ) : (
            <p className="text-gray-500 italic">No descriptors defined for this sector yet.</p>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          {!editingSector ? (
            <h1 className="text-3xl font-bold">{sector.name}</h1>
          ) : (
            <h1 className="text-3xl font-bold">Edit Sector</h1>
          )}
          <Button variant="outline" onClick={() => setEditingSector(!editingSector)}>
            {editingSector ? 'Cancel' : 'Edit Sector Info'}
          </Button>
        </div>

        {editingSector ? (
          <form onSubmit={handleSectorUpdate} className="space-y-6 mb-8 p-6 border rounded-lg shadow-sm bg-white">
            <div className="space-y-2">
              <Label htmlFor="sectorName">Sector Name</Label>
              <Input
                id="sectorName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sectorDescription">Description (Optional)</Label>
              <Textarea
                id="sectorDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={sectorUpdateLoading || !name.trim()}>
                {sectorUpdateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mb-6 prose max-w-none p-4 border rounded-lg bg-white shadow-sm">
            {sector.description ? <p>{sector.description}</p> : <p className="italic text-gray-500">No description provided.</p>}
          </div>
        )}
        
        {renderDescriptorManagement()}

        {/* Import from Sector Modal */}
        <Dialog open={showImportSectorModal} onOpenChange={setShowImportSectorModal}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Import Descriptors from Another Sector</DialogTitle>
              <DialogDescription>
                Select a sector to view its descriptors, then choose which ones to import into "{initialSector.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="import-sector-select">Source Sector</Label>
                <Select onValueChange={handleSelectSectorToImportFrom} disabled={loadingOtherSectors}>
                  <SelectTrigger id="import-sector-select">
                    <SelectValue placeholder={loadingOtherSectors ? "Loading sectors..." : "Select a source sector"} />
                  </SelectTrigger>
                  <SelectContent>
                    {otherSectors.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSectorToImportFrom && (
                <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto border p-2 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Available descriptors in "{selectedSectorToImportFrom.name}":</h4>
                  {loadingDescriptorsOfSelectedSector ? <p>Loading descriptors...</p> :
                    descriptorsOfSelectedSector.length > 0 ? (
                      descriptorsOfSelectedSector.map(desc => (
                        <div key={desc.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">L{desc.level} - {desc.dimension?.name}</p>
                            <p className="text-xs text-gray-600">{desc.description}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => toggleDescriptorForImport(desc.id)}>
                            {selectedDescriptorIdsToImport.has(desc.id) ? 
                              <CheckSquare className="h-5 w-5 text-blue-600" /> : 
                              <Square className="h-5 w-5 text-gray-400" />
                            }
                          </Button>
                        </div>
                      ))
                    ) : <p className="text-sm text-gray-500">No descriptors found in this sector.</p>
                  }
                </div>
              )}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
              <Button onClick={handleConfirmImportDescriptors} disabled={importingDescriptorsLoading || selectedDescriptorIdsToImport.size === 0}>
                {importingDescriptorsLoading ? "Importing..." : `Import ${selectedDescriptorIdsToImport.size} Descriptor(s)`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default SectorDetails; 