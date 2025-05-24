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
import { PlusCircle, ImportIcon, CheckSquare, Square, Download } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

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
  _count?: { // Added to match API response for list view
    descriptors?: number;
    companies?: number;
  };
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

  // Add new state for editing descriptors
  const [editingDescriptor, setEditingDescriptor] = useState<Descriptor | null>(null);
  const [editDescriptorLevel, setEditDescriptorLevel] = useState<number>(1);
  const [editDescriptorDescription, setEditDescriptorDescription] = useState('');
  const [editDescriptorLoading, setEditDescriptorLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setSector(initialSector);
    setName(initialSector.name);
    setDescription(initialSector.description || '');
    // console.log('[SectorDetails] useEffect [initialSector] - initial otherSectors state:', otherSectors); // Keep for now or remove if too noisy
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
    console.log('****************************************');
    console.log('*** fetchOtherSectors: STARTED ***');
    console.log('****************************************');
    setLoadingOtherSectors(true);
    // console.log('[SectorDetails] Fetching other sectors...'); // DEBUG - Replaced by prominent log

    let rawResponseText = null; // For logging
    try {
      const response = await fetch(`/api/sectors?excludeId=${initialSector.id}`);
      
      rawResponseText = await response.text(); // Get raw text first
      console.log('*** fetchOtherSectors: RAW RESPONSE TEXT ***', rawResponseText);

      if(!response.ok) {
        console.error('*** fetchOtherSectors: API RESPONSE NOT OK ***', { status: response.status, statusText: response.statusText, body: rawResponseText });
        throw new Error (`Failed to fetch other sectors. Status: ${response.status}. Body: ${rawResponseText}`);
      }
      
      const data = JSON.parse(rawResponseText); // Parse the text we logged
      console.log('*** fetchOtherSectors: PARSED DATA ***', data);
      setOtherSectors(data);
      setLoadingOtherSectors(false); // Set loading to false immediately after data
      console.log('*** fetchOtherSectors: States SET (otherSectors, loadingOtherSectors=false) ***');
    } catch (error: any) {
      console.error('*** fetchOtherSectors: ERROR CAUGHT ***', error);
      toast.error(error.message || 'Could not load other sectors.');
      setOtherSectors([]);
      setLoadingOtherSectors(false);
    } finally {
      console.log('****************************************');
      console.log('*** fetchOtherSectors: FINALLY BLOCK ***');
      console.log('****************************************');
    }
  };

  const handleOpenImportFromSector = () => {
    console.log('@@@@ [SectorDetails] handleOpenImportFromSector CALLED @@@@'); // MODIFIED PROMINENT LOG
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

  const handleDownloadSampleJson = () => {
    window.open(`/api/sectors/${sector.id}/download`, '_blank');
  };

  const handleEditDescriptor = async () => {
    if (!editingDescriptor) return;
    setEditDescriptorLoading(true);
    try {
      const response = await fetch(`/api/descriptors/${editingDescriptor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: editDescriptorLevel,
          description: editDescriptorDescription,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update descriptor');
      }
      toast.success('Descriptor updated successfully');
      setEditingDescriptor(null);
      router.refresh(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update descriptor');
    } finally {
      setEditDescriptorLoading(false);
    }
  };

  const handleDeleteDescriptor = async (descriptorId: string) => {
    if (!confirm('Are you sure you want to delete this descriptor?')) return;
    try {
      const response = await fetch(`/api/descriptors/${descriptorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete descriptor');
      }
      toast.success('Descriptor deleted successfully');
      router.refresh(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete descriptor');
    }
  };

  const openEditDialog = (descriptor: Descriptor) => {
    setEditingDescriptor(descriptor);
    setEditDescriptorLevel(descriptor.level);
    setEditDescriptorDescription(descriptor.description);
  };

  const handleDeleteSector = async () => {
    try {
      const response = await fetch(`/api/sectors/${sector.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete sector');
      }
      toast.success('Sector deleted successfully');
      router.push('/sectors');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete sector');
    }
  };

  const renderDescriptorManagement = () => {
    console.log('%%%% [SectorDetails] RENDER DESCRIPTOR MANAGEMENT CALLED %%%%'); // NEW PROMINENT LOG

    // Group descriptors by dimension and extract weights
    const dimensionsMap = sector.descriptors.reduce((acc, desc) => {
      const dimName = desc.dimension?.name || 'Unknown Dimension';
      if (!acc[dimName]) {
        acc[dimName] = { descriptors: [], id: desc.dimension?.id || dimName };
      }
      acc[dimName].descriptors.push(desc);
      return acc;
    }, {} as Record<string, { id: string, descriptors: Descriptor[] }>);

    const dimensionsArray = Object.entries(dimensionsMap).map(([name, data]) => ({ ...data, name }));

    // DEBUG: Log disabled states for the import button
    console.log('[SectorDetails] renderDescriptorManagement - Button Disabled States:', {
      importingDescriptorsLoading,
      isDisabled: importingDescriptorsLoading
    });

    return (
      <div className="mt-10">
        {/* Header with Actions */}
        <Card className="mb-10 shadow-lg dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-3 md:space-y-0 py-6 px-7">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Manage Maturity Descriptors</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Add, edit, or import descriptors for this sector.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button 
                variant="outline" 
                onClick={handleDownloadSampleJson} 
                className="bg-white dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Maturity Levels
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Forms (col-span-1) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Add New Descriptor Form */}
            <Card className="shadow-lg rounded-xl dark:border-slate-700 dark:bg-slate-800">
              <CardHeader className="border-b dark:border-slate-700 pb-4 pt-5 px-6">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">Add New Descriptor</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddDescriptor} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="dimension" className="text-sm font-medium text-slate-700 dark:text-slate-300">Dimension</Label>
                    <Select value={selectedDimensionId} onValueChange={setSelectedDimensionId}>
                      <SelectTrigger id="dimension" className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 shadow-sm">
                        <SelectValue placeholder="Select a dimension" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-slate-200 border-slate-700 shadow-lg">
                        {availableDimensions.map((dim) => (
                          <SelectItem key={dim.id} value={dim.id} className="dark:hover:bg-slate-700 focus:dark:bg-slate-700">
                            {dim.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="level" className="text-sm font-medium text-slate-700 dark:text-slate-300">Maturity Level</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Level {newDescriptorLevel}</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {newDescriptorLevel === 1 && 'Initial'}
                          {newDescriptorLevel === 2 && 'Developing'}
                          {newDescriptorLevel === 3 && 'Defined'}
                          {newDescriptorLevel === 4 && 'Managed'}
                          {newDescriptorLevel === 5 && 'Optimizing'}
                        </span>
                      </div>
                      <Input 
                        id="level" 
                        type="range" 
                        min={1} 
                        max={5} 
                        value={newDescriptorLevel} 
                        onChange={(e) => setNewDescriptorLevel(parseInt(e.target.value, 10))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Initial</span>
                        <span>Developing</span>
                        <span>Defined</span>
                        <span>Managed</span>
                        <span>Optimizing</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="newDescriptorDescription" className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                    <Textarea
                      id="newDescriptorDescription"
                      value={newDescriptorDescription}
                      onChange={(e) => setNewDescriptorDescription(e.target.value)}
                      placeholder="Enter descriptor description (be specific and clear)"
                      rows={5}
                      required
                      className="w-full resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 shadow-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full transition-colors duration-150 ease-in-out bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg"
                    disabled={addDescriptorLoading || !selectedDimensionId || !newDescriptorDescription.trim()}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    {addDescriptorLoading ? 'Adding...' : 'Add Descriptor'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Existing Descriptors (col-span-2) */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-xl dark:border-slate-700 dark:bg-slate-800">
              <CardHeader className="border-b dark:border-slate-700 pb-5 pt-6 px-7">
                <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Current Maturity Descriptors</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {dimensionsArray.length > 0 ? (
                  <div className="space-y-8">
                    {dimensionsArray.map(dim => (
                      <Card key={dim.id} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-5 border-b dark:border-slate-600">
                          <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">{dim.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5 bg-white dark:bg-slate-800/30">
                          {dim.descriptors
                            .sort((a, b) => a.level - b.level)
                            .map(desc => (
                              <div key={desc.id} className="p-5 border border-slate-200/80 dark:border-slate-700/60 rounded-lg bg-slate-50/70 dark:bg-slate-700/30 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex justify-between items-center mb-3.5">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-slate-400 mr-2" />
                                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {desc.level === 1 && 'Initial'}
                                        {desc.level === 2 && 'Developing'}
                                        {desc.level === 3 && 'Defined'}
                                        {desc.level === 4 && 'Managed'}
                                        {desc.level === 5 && 'Optimizing'}
                                      </span>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Level {desc.level}</span>
                                  </div>
                                  <div className="flex gap-2.5">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(desc)} className="text-slate-700 border-slate-300 hover:bg-slate-100 dark:text-slate-300 dark:border-slate-600 hover:dark:bg-slate-600 transition-colors shadow-sm text-xs px-3 py-1.5 h-auto">
                                      Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteDescriptor(desc.id)} className="transition-colors shadow-sm text-xs px-3 py-1.5 h-auto">
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed tracking-normal indent-1">
                                  {desc.description}
                                </p>
                              </div>
                            ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <svg className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 opacity-75" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">No Descriptors Defined</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use the forms on the left to add new maturity descriptors or import them.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={sectorUpdateLoading || !name.trim()}>
                {sectorUpdateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete Sector
              </Button>
            </div>
          </form>
        ) : (
          <div className="mb-6 prose max-w-none p-4 border rounded-lg bg-white shadow-sm">
            {sector.description ? <p>{sector.description}</p> : <p className="italic text-gray-500">No description provided.</p>}
          </div>
        )}
        
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p>Are you sure you want to delete this sector? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteSector}>Delete</Button>
              </div>
            </div>
          </div>
        )}

        {renderDescriptorManagement()}

        {/* Import from Sector Modal */}
        <Dialog open={showImportSectorModal} onOpenChange={setShowImportSectorModal}>
          <DialogContent className="sm:max-w-[525px] p-6 min-h-[400px] flex flex-col">
            <DialogHeader>
              <DialogTitle>Import Descriptors from Another Sector</DialogTitle>
              <DialogDescription>
                Select a sector to import its maturity level descriptors. You can then choose which specific descriptors to add to the current sector ('{initialSector.name}').
              </DialogDescription>
            </DialogHeader>
            
            <div 
              className="flex-grow overflow-y-auto py-4" 
              key={`loading-${loadingOtherSectors}-count-${otherSectors.length}`}
            >
              {
                (() => {
                  console.log('[DialogContent] Rendering: loadingOtherSectors =', loadingOtherSectors, '| otherSectors.length =', otherSectors.length);
                  if (loadingOtherSectors) {
                    console.log('[DialogContent] Showing: Loading message');
                    return (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-lg text-slate-600 dark:text-slate-300">Loading other sectors...</p>
                      </div>
                    );
                  } else if (otherSectors.length === 0) {
                    console.log('[DialogContent] Showing: No other sectors message');
                    return (
                      <div className="flex justify-center items-center h-full">
                        <p className="text-lg text-slate-600 dark:text-slate-300">No other sectors available to import from.</p>
                      </div>
                    );
                  } else {
                    console.log('[DialogContent] Rendering path for ACTUAL LIST: loadingOtherSectors=', loadingOtherSectors, 'otherSectors.length=', otherSectors.length);
                    return (
                      <div className="grid gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="import-sector-select">Select Sector</Label>
                          <Select onValueChange={handleSelectSectorToImportFrom} value={selectedSectorToImportFrom?.id || ''}>
                            <SelectTrigger id="import-sector-select">
                              <SelectValue placeholder="Choose a sector..." />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                (() => {
                                  console.log('[DialogContent] Mapping otherSectors:', otherSectors);
                                  return otherSectors.map((s) => {
                                    console.log('[DialogContent] Mapping sector item:', s);
                                    return (
                                      <SelectItem key={s.id} value={s.id}>{s.name} ({s._count?.descriptors || 0} descriptors)</SelectItem>
                                    );
                                  });
                                })()
                              }
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedSectorToImportFrom && (
                          <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto border p-3 rounded-md bg-slate-50 dark:bg-slate-800">
                            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Available descriptors in "{selectedSectorToImportFrom.name}":</h4>
                            {loadingDescriptorsOfSelectedSector ? (
                              <p className="text-sm text-slate-500 dark:text-slate-400">Loading descriptors...</p>
                            ) : descriptorsOfSelectedSector.length > 0 ? (
                              descriptorsOfSelectedSector.map(desc => (
                                <div key={desc.id} className="flex items-center justify-between p-2.5 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md transition-colors">
                                  <div>
                                    <p className="font-medium text-sm text-slate-800 dark:text-slate-200">L{desc.level} - {desc.dimension?.name || 'General'}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 break-words">{desc.description}</p>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => toggleDescriptorForImport(desc.id)} className="ml-2 shrink-0">
                                    {selectedDescriptorIdsToImport.has(desc.id) ? 
                                      <CheckSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> : 
                                      <Square className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                    }
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400">No descriptors found in this sector.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                })()
              }
            </div>

            <DialogFooter className="mt-auto">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleConfirmImportDescriptors} 
                disabled={importingDescriptorsLoading || selectedDescriptorIdsToImport.size === 0 || !selectedSectorToImportFrom}
              >
                {importingDescriptorsLoading ? 'Importing...' : `Import Selected (${selectedDescriptorIdsToImport.size})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Edit Descriptor Dialog */}
        <Dialog open={!!editingDescriptor} onOpenChange={() => setEditingDescriptor(null)}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Edit Maturity Descriptor</DialogTitle>
              <DialogDescription>
                Update the level and description for this maturity descriptor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-level">Maturity Level (1-5)</Label>
                <Input
                  id="edit-level"
                  type="number"
                  min={1}
                  max={5}
                  value={editDescriptorLevel}
                  onChange={(e) => setEditDescriptorLevel(parseInt(e.target.value, 10))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescriptorDescription}
                  onChange={(e) => setEditDescriptorDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleEditDescriptor} 
                disabled={editDescriptorLoading || !editDescriptorDescription.trim()}
              >
                {editDescriptorLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default SectorDetails; 