import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Box } from '@mui/material';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { loadFromLocalStorage, saveToLocalStorage, removeFromLocalStorage, createFormStorageKey } from '@/lib/utils/storage';
import AutoSaveStatus from './AutoSaveStatus';

interface WithAutoSaveOptions<T> {
  formName: string;
  entityId?: string;
  onSave?: (data: T) => Promise<any>;
  debounceMs?: number;
  localStorageOnly?: boolean;
}

/**
 * Higher-order component that adds auto-save functionality to a form component
 */
export function withAutoSave<P extends { initialData?: any; onSubmit?: (data: any) => Promise<any> }>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAutoSaveOptions<any>
) {
  const WithAutoSaveComponent = (props: P) => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    
    const storageKey = userId ? createFormStorageKey(userId, options.formName, options.entityId) : '';
    const initialData = props.initialData || {};
    
    // Load saved draft from localStorage if it exists
    const savedDraft = userId ? loadFromLocalStorage(storageKey, null) : null;
    
    // Function to save data
    const saveData = async (data: any) => {
      // Save to localStorage
      if (userId) {
        saveToLocalStorage(storageKey, data);
      }
      
      // If we need to save to server and there's an onSave function
      if (!options.localStorageOnly && options.onSave) {
        await options.onSave(data);
      } else if (!options.localStorageOnly && props.onSubmit) {
        await props.onSubmit(data);
      }
    };
    
    // Set up auto-save hook
    const {
      data,
      setData,
      isSaving,
      hasUnsavedChanges,
      save
    } = useAutoSave(
      savedDraft || initialData,
      {
        onSave: saveData,
        debounceMs: options.debounceMs || 2000,
        successMessage: options.localStorageOnly ? 'Draft saved' : 'Changes saved',
        enabled: !!userId,
      }
    );
    
    // Clear localStorage when form is submitted successfully
    const handleSubmit = async (formData: any) => {
      if (props.onSubmit) {
        try {
          await props.onSubmit(formData);
          // Remove draft after successful submission
          if (userId) {
            removeFromLocalStorage(storageKey);
          }
        } catch (error) {
          // Keep draft if submission fails
          console.error('Form submission error:', error);
        }
      }
    };
    
    // Pass all props to wrapped component
    const passThroughProps = {
      ...props,
      data,
      setData,
      initialData: savedDraft || initialData,
      onSubmit: handleSubmit,
      save, // Manual save function
    };
    
    return (
      <Box>
        <WrappedComponent {...passThroughProps as any} />
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <AutoSaveStatus isSaving={isSaving} hasUnsavedChanges={hasUnsavedChanges} />
        </Box>
      </Box>
    );
  };
  
  // Set display name for debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAutoSaveComponent.displayName = `WithAutoSave(${displayName})`;
  
  return WithAutoSaveComponent;
} 