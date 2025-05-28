'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Chip,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useMediaQuery,
  Badge,
  useTheme
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  AttachFile as FileIcon, 
  Description as NoteIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  PhotoCamera as CameraIcon,
  MoreVert as MoreIcon,
  Label as TagIcon,
  History as HistoryIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { toast } from 'sonner';

interface Evidence {
  id: string;
  fileUrl: string | null;
  fileType: string | null;
  notes: string | null;
  uploadedAt: string;
  uploadedById: string;
  tags?: string[];
  version?: number;
}

interface EvidenceUploadProps {
  assessmentId: string;
  dimensionId: string;
  readOnly?: boolean;
}

// Predefined tag options for evidence categorization
const TAG_OPTIONS = [
  'Documentation',
  'Metrics',
  'Process',
  'Training',
  'Implementation',
  'Results',
  'Planning',
  'Other'
];

export default function EvidenceUpload({ assessmentId, dimensionId, readOnly = false }: EvidenceUploadProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [versionHistoryId, setVersionHistoryId] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<Evidence[]>([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // Fetch existing evidence when component mounts or when a new evidence is uploaded
  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/dimensions/${dimensionId}/evidence`);
      if (!res.ok) {
        throw new Error('Failed to fetch evidence');
      }
      const data = await res.json();
      setEvidence(data);
    } catch (err: any) {
      console.error('Error fetching evidence:', err);
      setError(err.message || 'Failed to load evidence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [assessmentId, dimensionId]);

  // Filter evidence based on search term
  const filteredEvidence = evidence.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const hasMatchingNote = item.notes && item.notes.toLowerCase().includes(searchLower);
    const hasMatchingTag = item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower));
    const matchesFileType = item.fileType && item.fileType.toLowerCase().includes(searchLower);
    
    return !searchTerm || hasMatchingNote || hasMatchingTag || matchesFileType;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(e.target.value);
  };

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    setTags(event.target.value as string[]);
  };

  const generateEvidenceFilename = (file: File): string => {
    // Format: dimensionId_date_originalFilename
    const date = new Date().toISOString().split('T')[0];
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${dimensionId.substring(0, 8)}_${date}_${sanitizedOriginalName}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that either files or notes are provided
    if (files.length === 0 && (!notes || notes.trim() === '')) {
      toast.error('Please upload at least one file or provide some notes.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // If only notes without files, submit as single evidence
      if (files.length === 0) {
        const formData = new FormData();
        formData.append('notes', notes);
        if (tags.length > 0) {
          formData.append('tags', JSON.stringify(tags));
        }

        const res = await fetch(`/api/assessments/${assessmentId}/dimensions/${dimensionId}/evidence`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to upload evidence');
        }
      } else {
        // Upload each file as separate evidence with the same notes
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file, generateEvidenceFilename(file));
          formData.append('notes', notes);
          if (tags.length > 0) {
            formData.append('tags', JSON.stringify(tags));
          }

          const res = await fetch(`/api/assessments/${assessmentId}/dimensions/${dimensionId}/evidence`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to upload evidence');
          }
        }
      }

      // Reset form
      setFiles([]);
      setNotes('');
      setTags([]);
      toast.success('Evidence uploaded successfully');
      
      // Refresh evidence list
      fetchEvidence();
    } catch (err: any) {
      console.error('Error uploading evidence:', err);
      setError(err.message || 'Failed to upload evidence');
      toast.error(err.message || 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEditDialog = (item: Evidence) => {
    setEditingEvidence(item);
    setEditNotes(item.notes || '');
    setEditTags(item.tags || []);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingEvidence(null);
    setEditNotes('');
    setEditTags([]);
  };

  const handleSaveEdit = async () => {
    if (!editingEvidence) return;
    
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/dimensions/${dimensionId}/evidence/${editingEvidence.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: editNotes,
          tags: editTags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update evidence');
      }

      toast.success('Evidence updated successfully');
      handleCloseEditDialog();
      fetchEvidence();
    } catch (error: any) {
      console.error('Error updating evidence:', error);
      toast.error(error.message || 'Failed to update evidence');
    }
  };

  const handleDeleteEvidence = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/dimensions/${dimensionId}/evidence/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete evidence');
      }

      toast.success('Evidence deleted successfully');
      setConfirmDeleteId(null);
      fetchEvidence();
    } catch (error: any) {
      console.error('Error deleting evidence:', error);
      toast.error(error.message || 'Failed to delete evidence');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewVersionHistory = async (id: string) => {
    setVersionHistoryId(id);
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/dimensions/${dimensionId}/evidence/${id}/history`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch version history');
      }
      
      const history = await response.json();
      setVersionHistory(history);
      setHistoryDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching version history:', error);
      toast.error(error.message || 'Failed to fetch version history');
      setVersionHistoryId(null);
    }
  };

  // Function to format a date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // For mobile camera capture
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.setAttribute('accept', 'image/*');
      fileInputRef.current.click();
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Evidence & Supporting Documents
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!readOnly && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle1" gutterBottom>
              Add New Evidence
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                <input
                  type="file"
                  id="evidence-file-input"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  disabled={uploading}
                  multiple
                />
                <label htmlFor="evidence-file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploading}
                  >
                    Select Files
                  </Button>
                </label>
                
                {isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={<CameraIcon />}
                    onClick={handleCameraCapture}
                    disabled={uploading}
                  >
                    Take Photo
                  </Button>
                )}
              </Box>

              {files.length > 0 && (
                <Paper variant="outlined" sx={{ p: 1.5, mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Files ({files.length})
                  </Typography>
                  <List dense>
                    {files.map((file, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <FileIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${Math.round(file.size / 1024)} KB`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
              
              <TextField
                label="Notes or Description"
                multiline
                rows={3}
                value={notes}
                onChange={handleNotesChange}
                fullWidth
                margin="normal"
                disabled={uploading}
                placeholder="Provide context or additional information about this evidence"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="evidence-tags-label">Tags</InputLabel>
                <Select
                  labelId="evidence-tags-label"
                  multiple
                  value={tags}
                  onChange={handleTagChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  disabled={uploading}
                >
                  {TAG_OPTIONS.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={uploading || (files.length === 0 && (!notes || notes.trim() === ''))}
                  startIcon={uploading ? <CircularProgress size={20} /> : undefined}
                >
                  {uploading ? 'Uploading...' : 'Upload Evidence'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Existing Evidence
        </Typography>
        
        {evidence.length > 0 && (
          <TextField
            placeholder="Search evidence..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
        )}
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      ) : filteredEvidence.length > 0 ? (
        <Paper sx={{ mb: 2 }}>
          <List>
            {filteredEvidence.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {item.fileUrl ? <FileIcon /> : <NoteIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {item.fileUrl ? (
                          <Tooltip title="Download file">
                            <a 
                              href={item.fileUrl} 
                              download 
                              style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                            >
                              <Typography variant="subtitle1">File Evidence</Typography>
                              <DownloadIcon fontSize="small" sx={{ ml: 0.5 }} />
                            </a>
                          </Tooltip>
                        ) : (
                          <Typography variant="subtitle1">Text Note</Typography>
                        )}
                        <Chip 
                          label={formatDate(item.uploadedAt)} 
                          variant="outlined" 
                          size="small" 
                        />
                        {item.version && item.version > 1 && (
                          <Tooltip title="Has version history">
                            <Badge badgeContent={item.version} color="secondary" sx={{ ml: 1 }}>
                              <HistoryIcon fontSize="small" />
                            </Badge>
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {item.notes || '(No notes provided)'}
                        </Typography>
                        
                        {item.tags && item.tags.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {item.tags.map(tag => (
                              <Chip 
                                key={tag} 
                                label={tag}
                                size="small"
                                variant="outlined"
                                icon={<TagIcon fontSize="small" />}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  
                  {!readOnly && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={() => handleOpenEditDialog(item)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {item.version && item.version > 1 && (
                        <Tooltip title="View version history">
                          <IconButton 
                            onClick={() => handleViewVersionHistory(item.id)}
                            size="small"
                            color="primary"
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => setConfirmDeleteId(item.id)}
                          size="small"
                          color="error"
                          disabled={!!deletingId}
                        >
                          {deletingId === item.id ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </ListItem>
                {index < filteredEvidence.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {searchTerm ? 'No matching evidence found.' : 'No evidence has been added yet.'}
          </Typography>
          {!readOnly && !searchTerm && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Use the form above to add supporting documents or notes.
            </Typography>
          )}
        </Paper>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Evidence</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            multiline
            rows={4}
            fullWidth
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="edit-evidence-tags-label">Tags</InputLabel>
            <Select
              labelId="edit-evidence-tags-label"
              multiple
              value={editTags}
              onChange={(e) => setEditTags(e.target.value as string[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {TAG_OPTIONS.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this evidence? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} disabled={!!deletingId}>
            Cancel
          </Button>
          <Button 
            onClick={() => confirmDeleteId && handleDeleteEvidence(confirmDeleteId)} 
            color="error" 
            variant="contained"
            disabled={!!deletingId}
          >
            {deletingId ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => {
          setHistoryDialogOpen(false);
          setVersionHistoryId(null);
          setVersionHistory([]);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          {versionHistory.length > 0 ? (
            <List>
              {versionHistory.map((version, index) => (
                <React.Fragment key={version.id || index}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.main', color: 'white' }}>
                        {versionHistory.length - index}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {index === 0 ? 'Current Version' : `Previous Version`}
                          </Typography>
                          <Chip 
                            label={formatDate(version.uploadedAt)} 
                            variant="outlined" 
                            size="small" 
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {version.notes || '(No notes provided)'}
                          </Typography>
                          
                          {version.tags && version.tags.length > 0 && (
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {version.tags.map(tag => (
                                <Chip 
                                  key={tag} 
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    
                    {version.fileUrl && (
                      <Box>
                        <Tooltip title="Download file">
                          <IconButton href={version.fileUrl} download>
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </ListItem>
                  {index < versionHistory.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center">No version history available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setHistoryDialogOpen(false);
            setVersionHistoryId(null);
            setVersionHistory([]);
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 