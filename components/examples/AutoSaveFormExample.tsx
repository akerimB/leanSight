'use client';

import React, { useState } from 'react';
import { TextField, Button, Box, Paper, Typography, Divider, Grid, Chip } from '@mui/material';
import { withAutoSave } from '@/components/withAutoSave';
import { toast } from 'sonner';

interface FormData {
  title: string;
  description: string;
  tags: string[];
}

interface AutoSaveFormProps {
  initialData?: FormData;
  onSubmit?: (data: FormData) => Promise<void>;
  data?: FormData;
  setData?: (data: FormData) => void;
  save?: () => Promise<void>;
}

// Base form component
function AutoSaveFormBase({ initialData, onSubmit, data, setData, save }: AutoSaveFormProps) {
  const [newTag, setNewTag] = useState('');
  
  // Default empty form data
  const formData = data || {
    title: '',
    description: '',
    tags: [],
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData?.({
      ...formData,
      [name]: value,
    });
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setData?.({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setData?.({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit?.(formData);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit form. Please try again.');
      console.error('Form submission error:', error);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Auto-Save Form Example
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This form automatically saves your changes as you type. Try refreshing the page to see your data persist.
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            variant="outlined"
          />
          
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  label="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  variant="outlined"
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  variant="outlined"
                />
              ))}
              {formData.tags.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tags added yet.
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              type="button" 
              onClick={() => save?.()}
              variant="outlined"
            >
              Save Now
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={!formData.title.trim()}
            >
              Submit Form
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
}

// Wrap the form with auto-save functionality
export const AutoSaveForm = withAutoSave(AutoSaveFormBase, {
  formName: 'example-form',
  localStorageOnly: true, // Only save to localStorage, not to server
  debounceMs: 1000, // Save after 1 second of inactivity
});

// Create a simulated server-saving version
export const ServerAutoSaveForm = withAutoSave(AutoSaveFormBase, {
  formName: 'server-example-form',
  debounceMs: 2000,
  onSave: async (data) => {
    // Simulate server save
    console.log('Saving to server:', data);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
}); 