'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';

interface CompanyOption {
  id: string;
  name: string;
}

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
  active: boolean;
}

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User;
  companies: CompanyOption[];
}

export default function UserDialog({ open, onClose, onSuccess, user, companies }: UserDialogProps) {
  const isEdit = Boolean(user);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'EXPERT');
  const [companyId, setCompanyId] = useState<string>(user?.companyId || '');
  const [active, setActive] = useState<boolean>(user?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setCompanyId(user.companyId || '');
      setActive(user.active);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('EXPERT');
      setCompanyId('');
      setActive(true);
    }
    setError('');
  }, [user, open]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/users/${user!.id}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';
      const payload: any = { name, email, role, companyId: companyId || null, active };
      if (!isEdit) payload.password = password;
      if (isEdit && password) payload.password = password;
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label={isEdit ? 'New Password (leave blank to keep)' : 'Password'}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="EXPERT">Expert</MenuItem>
            <MenuItem value="VIEWER">Viewer</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Company</InputLabel>
          <Select
            value={companyId}
            label="Company"
            onChange={(e) => setCompanyId(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {companies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Switch checked={active} onChange={(_, v) => setActive(v)} />}
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !name || !email || (!isEdit && !password)}
        >
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 