'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Switch,
  FormControlLabel,
  TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UserDialog from '@/components/UserDialog';
import { toast } from 'react-toastify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  name?: string;
  description?: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  user?: {
    email?: string | null;
    name?: string | null;
  } | null;
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [companies, setCompanies] = useState<{id:string;name:string}[]>([]);
  const [compLoading, setCompLoading] = useState<boolean>(false);
  const [compError, setCompError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  // State for System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // State for Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState(0);
  const [auditRowsPerPage, setAuditRowsPerPage] = useState(20);
  const [auditTotalLogs, setAuditTotalLogs] = useState(0);

  // State for Audit Log Filters
  const [auditFilterUser, setAuditFilterUser] = useState('');
  const [auditFilterAction, setAuditFilterAction] = useState('');
  const [auditFilterDateStart, setAuditFilterDateStart] = useState('');
  const [auditFilterDateEnd, setAuditFilterDateEnd] = useState('');

  // Helper to fetch users
  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject('Failed to fetch users'))
      .then((data: User[]) => {
        // Default active to true if not provided
        const usersWithStatus = data.map(u => ({ ...u, active: u.active ?? true }));
        setUsers(usersWithStatus);
        setErrorMsg(null);
      })
      .catch((err) => setErrorMsg(String(err)))
      .finally(() => setLoading(false));
  };

  // Helper to fetch companies for dropdown
  const fetchCompanies = () => {
    setCompLoading(true);
    fetch('/api/admin/companies', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : Promise.reject('Failed to fetch companies'))
      .then((data: any[]) => { setCompanies(data.map(c => ({ id: c.id, name: c.name }))); setCompError(null); })
      .catch((err) => setCompError(String(err)))
      .finally(() => setCompLoading(false));
  };

  // Helper to fetch system settings
  const fetchSystemSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch('/api/admin/system-settings', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch system settings');
      }
      const data: SystemSetting[] = await response.json();
      setSystemSettings(data);
      setSettingsError(null);
    } catch (err) {
      setSettingsError(String(err));
      toast.error(String(err));
    } finally {
      setSettingsLoading(false);
    }
  };
  
  // Helper to update a single system setting
  const updateSystemSetting = async (key: string, value: string, name?: string, description?: string) => {
    setSettingsLoading(true);
    try {
      const response = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        credentials: 'include',
        body: JSON.stringify({ key, value, name, description }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update system setting');
      }
      // Refresh settings after update
      await fetchSystemSettings(); 
      toast.success(`${name || key} setting updated successfully.`);
    } catch (err) {
      setSettingsError(String(err));
      toast.error(`Failed to update setting: ${String(err)}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Helper to fetch audit logs
  const fetchAuditLogs = async (page = 0, rowsPerPage = 20) => {
    setAuditLoading(true);
    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage),
    });
    if (auditFilterUser) params.append('userId', auditFilterUser);
    if (auditFilterAction) params.append('action', auditFilterAction);
    if (auditFilterDateStart) params.append('startDate', auditFilterDateStart);
    if (auditFilterDateEnd) params.append('endDate', auditFilterDateEnd);

    try {
      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`, { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch audit logs');
      }
      const data = await response.json();
      setAuditLogs(data.logs || []);
      setAuditTotalLogs(data.totalLogs || 0);
      setAuditPage(data.currentPage - 1);
      setAuditError(null);
    } catch (err) {
      setAuditError(String(err));
      toast.error(`Failed to fetch audit logs: ${String(err)}`);
      setAuditLogs([]);
      setAuditTotalLogs(0);
    } finally {
      setAuditLoading(false);
    }
  };
  
  const handleApplyAuditFilters = () => {
    setAuditPage(0);
    fetchAuditLogs(0, auditRowsPerPage);
  };
  
  const handleClearAuditFilters = () => {
    setAuditFilterUser('');
    setAuditFilterAction('');
    setAuditFilterDateStart('');
    setAuditFilterDateEnd('');
    setAuditPage(0);
    const params = new URLSearchParams({
        page: String(1), 
        limit: String(auditRowsPerPage),
    });
    fetch(`/api/admin/audit-logs?${params.toString()}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            setAuditLogs(data.logs || []);
            setAuditTotalLogs(data.totalLogs || 0);
            setAuditPage(data.currentPage -1);
        }).catch(err => toast.error('Failed to reload logs'));
  };

  const handleChangeAuditPage = (event: unknown, newPage: number) => {
    setAuditPage(newPage);
    fetchAuditLogs(newPage, auditRowsPerPage);
  };

  const handleChangeAuditRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setAuditRowsPerPage(newRowsPerPage);
    setAuditPage(0);
    fetchAuditLogs(0, newRowsPerPage);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchUsers();
      fetchCompanies();
    } else if (tabValue === 1) {
      fetchSystemSettings();
    } else if (tabValue === 2) {
      fetchAuditLogs(auditPage, auditRowsPerPage);
    }
  }, [tabValue]);
  
  // Get a specific setting value, defaulting to a string if not found or if value is unexpected
  const getSettingValue = (key: string, defaultValue: string = 'false'): string => {
    const setting = systemSettings.find(s => s.key === key);
    return setting ? String(setting.value) : defaultValue;
  };

  const assessmentFreezeEnabled = getSettingValue('assessment_freeze_enabled', 'false') === 'true';
  const twoFactorAuthEnabled = getSettingValue('security_2fa_enabled', 'false') === 'true';
  const sessionTimeoutMinutes = getSettingValue('security_session_timeout_minutes', '30'); // Default to 30 minutes
  const companyRequiresAdminApproval = getSettingValue('entity_creation_company_requires_admin_approval', 'false') === 'true';
  const assessmentPeriodStartDate = getSettingValue('assessment_period_start_date', ''); // Store as YYYY-MM-DD
  const assessmentPeriodEndDate = getSettingValue('assessment_period_end_date', '');   // Store as YYYY-MM-DD

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="User Management" />
          <Tab label="System Settings" />
          <Tab label="Audit Logs" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => { setEditingUser(undefined); setDialogOpen(true); }}
            >
              Add User
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : errorMsg ? (
            <Alert severity="error">{errorMsg}</Alert>
          ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'ADMIN' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.active ? 'Active' : 'Inactive'}
                        color={user.active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => { setEditingUser(user); setDialogOpen(true); }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (confirm('Delete this user?')) {
                            fetch(`/api/admin/users/${user.id}`, { method: 'DELETE', credentials: 'include' })
                              .then((res) => res.ok ? fetchUsers() : Promise.reject('Failed to delete'))
                              .catch(() => alert('Delete failed'));
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
          <UserDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSuccess={() => fetchUsers()}
            user={editingUser}
            companies={companies}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>System Settings</Typography>
          {settingsLoading && <CircularProgress sx={{ mb: 2 }} />}
          {settingsError && <Alert severity="error" sx={{ mb: 2 }}>{settingsError}</Alert>}
          
          <Box sx={{ maxWidth: 600, mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Access Control</Typography>
            <Box sx={{ mb: 2 }}>
              <Button variant="outlined" sx={{ mr: 2 }} disabled>Manage Roles & Permissions</Button>
              <Button variant="outlined" disabled>Feature Toggles</Button>
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Assessment Controls</Typography>
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={assessmentFreezeEnabled}
                    onChange={(e) => 
                        updateSystemSetting(
                            'assessment_freeze_enabled', 
                            String(e.target.checked),
                            'Assessment Freeze',
                            'Prevents new assessments from being started or existing ones from being submitted.'
                        )
                    }
                    disabled={settingsLoading}
                  />
                }
                label="Freeze All Assessments"
              />
              {/* Assessment Period Dates */}
              <TextField
                label="Assessment Period Start Date"
                type="date"
                variant="outlined"
                size="small"
                value={assessmentPeriodStartDate}
                onChange={(e) => 
                    updateSystemSetting(
                        'assessment_period_start_date',
                        e.target.value, 
                        'Assessment Period Start Date',
                        'The date when assessments can start.'
                    )
                }
                disabled={settingsLoading}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mt: 2, mr: 2, width: 'fit-content' }}
              />
              <TextField
                label="Assessment Period End Date"
                type="date"
                variant="outlined"
                size="small"
                value={assessmentPeriodEndDate}
                onChange={(e) => 
                    updateSystemSetting(
                        'assessment_period_end_date',
                        e.target.value,
                        'Assessment Period End Date',
                        'The date when assessments must be completed.'
                    )
                }
                disabled={settingsLoading}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mt: 2, width: 'fit-content' }}
              />
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Entity Creation</Typography>
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={companyRequiresAdminApproval}
                    onChange={(e) => 
                        updateSystemSetting(
                            'entity_creation_company_requires_admin_approval',
                            String(e.target.checked),
                            'Require Admin Approval for New Companies',
                            'If enabled, new companies/departments will require admin approval before becoming active.'
                        )
                    }
                    disabled={settingsLoading}
                  />
                }
                label="Require Admin Approval for New Companies"
              />
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Security</Typography>
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={twoFactorAuthEnabled}
                    onChange={(e) => 
                        updateSystemSetting(
                            'security_2fa_enabled', 
                            String(e.target.checked),
                            'Enable 2FA',
                            'Enable Two-Factor Authentication for all users.'
                        )
                    }
                    disabled={settingsLoading}
                  />
                }
                label="Enable 2FA"
              />
              {/* Session Timeout Input */}
              <TextField
                label="Session Timeout (minutes)"
                type="number"
                variant="outlined"
                size="small"
                value={sessionTimeoutMinutes}
                onChange={(e) => 
                    updateSystemSetting(
                        'security_session_timeout_minutes',
                        e.target.value,
                        'Session Timeout (minutes)',
                        'Set the session timeout duration in minutes.'
                    )
                }
                onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val) || val <= 0) {
                         updateSystemSetting(
                            'security_session_timeout_minutes',
                            '30',
                            'Session Timeout (minutes)',
                            'Set the session timeout duration in minutes.'
                        );
                    } else {
                        updateSystemSetting(
                            'security_session_timeout_minutes',
                            String(val),
                            'Session Timeout (minutes)',
                            'Set the session timeout duration in minutes.'
                        );
                    }
                }}
                disabled={settingsLoading}
                sx={{ mt: 2, width: '100%', maxWidth: '250px' }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              (Settings are partially functional. Other controls are for demonstration.)
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Audit Logs</Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField 
                label="User Email/ID" 
                size="small" 
                sx={{ width: { xs: '100%', sm: 180 } }} 
                value={auditFilterUser}
                onChange={(e) => setAuditFilterUser(e.target.value)}
            />
            <TextField 
                label="Action" 
                size="small" 
                sx={{ width: { xs: '100%', sm: 180 } }} 
                value={auditFilterAction}
                onChange={(e) => setAuditFilterAction(e.target.value)}
            />
            <TextField 
                label="Start Date" 
                type="date"
                size="small" 
                sx={{ width: { xs: '100%', sm: 180 } }} 
                value={auditFilterDateStart}
                onChange={(e) => setAuditFilterDateStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
            />
            <TextField 
                label="End Date" 
                type="date"
                size="small" 
                sx={{ width: { xs: '100%', sm: 180 } }} 
                value={auditFilterDateEnd}
                onChange={(e) => setAuditFilterDateEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
            />
            <Button variant="outlined" onClick={handleApplyAuditFilters} disabled={auditLoading}>Filter</Button>
            <Button variant="text" onClick={handleClearAuditFilters} disabled={auditLoading}>Clear</Button>
          </Box>

          {auditLoading && <CircularProgress sx={{ mb: 2 }} />}
          {auditError && <Alert severity="error" sx={{ mb: 2 }}>{auditError}</Alert>}
          
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity Type</TableCell>
                  <TableCell>Entity ID</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.length === 0 && !auditLoading ? (
                    <TableRow><TableCell colSpan={7} align="center">No audit logs found.</TableCell></TableRow>
                ) : (
                    auditLogs.map((log) => (
                    <TableRow key={log.id} hover>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.user?.name || log.userEmail || log.userId || 'System'}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.entityType || '-'}</TableCell>
                        <TableCell>{log.entityId || '-'}</TableCell>
                        <TableCell>
                        {log.details && typeof log.details === 'object' ? (
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.75rem', maxHeight: '100px', overflowY: 'auto', backgroundColor: '#f5f5f5', padding: '4px', borderRadius: '4px' }}>
                            {JSON.stringify(log.details, null, 2)}
                            </pre>
                        ) : (
                            String(log.details || '-')
                        )}
                        </TableCell>
                        <TableCell>{log.ipAddress || '-'}</TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={auditTotalLogs}
            rowsPerPage={auditRowsPerPage}
            page={auditPage}
            onPageChange={handleChangeAuditPage}
            onRowsPerPageChange={handleChangeAuditRowsPerPage}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            (Audit log functionality is now connected to the backend.)
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
}
