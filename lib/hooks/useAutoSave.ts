import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

type AutoSaveOptions = {
  onSave: (data: any) => Promise<any>;
  debounceMs?: number;
  successMessage?: string;
  errorMessage?: string;
  enabled?: boolean;
};

/**
 * Custom hook for auto-saving form data with debounce
 * @param initialData Initial form data
 * @param options Configuration options
 * @returns Object with form data, setter, saving status, and manual save function
 */
export function useAutoSave<T>(
  initialData: T,
  {
    onSave,
    debounceMs = 1000,
    successMessage = 'Changes saved',
    errorMessage = 'Failed to save changes',
    enabled = true,
  }: AutoSaveOptions
) {
  const [data, setData] = useState<T>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<T>(initialData);
  
  // Track if data has changed since last save
  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(lastSavedData);
  
  // Store timeout reference
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Function to perform the actual save
  const saveData = useCallback(async () => {
    if (!hasUnsavedChanges || !enabled) return;
    
    try {
      setIsSaving(true);
      await onSave(data);
      setLastSavedData(data);
      toast.success(successMessage);
    } catch (error) {
      console.error('Auto-save error:', error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [data, hasUnsavedChanges, onSave, successMessage, errorMessage, enabled]);

  // Set up debounced auto-save
  useEffect(() => {
    if (hasUnsavedChanges && enabled) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout
      saveTimeoutRef.current = setTimeout(saveData, debounceMs);
    }
  }, [data, hasUnsavedChanges, saveData, debounceMs, enabled]);

  // Function for manual save
  const save = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await saveData();
  }, [saveData]);

  return {
    data,
    setData,
    isSaving,
    hasUnsavedChanges,
    save,
  };
} 