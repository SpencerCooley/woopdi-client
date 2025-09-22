'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useApp } from '../../../context/app-context';
import {OrganizationUser, membershipService}  from '@/services/api';

export default function OrganizationUserManagement() {
  const { memberships, selectedOrganization, user: loggedInUser } = useApp();
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<OrganizationUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Find the membership for the currently selected organization
  const currentMembership = memberships.find(
    membership => membership.organization_id === selectedOrganization?.organization_id
  );

  // Determine if user has admin privileges for the currently selected organization
  // The organizational role is stored in the membership data as "MEMBER", "ADMIN" or "MODERATOR"
  const isOrgAdmin = currentMembership?.role === 'ADMIN';
  const isOrgModerator = currentMembership?.role === 'MODERATOR';
  const isOrgAdminOrModerator = isOrgAdmin || isOrgModerator;



  // Fetch users when organization changes
  useEffect(() => {
    if (selectedOrganization) {
      fetchUsers();
    }
  }, [selectedOrganization]);

  const fetchUsers = async () => {
    if (!selectedOrganization) return;
    
    try {
      setLoading(true);
      const fetchedUsers = await membershipService.getUsersInOrganization(selectedOrganization.organization_id);
      // Filter out the currently logged-in user
      const filteredUsers = fetchedUsers.filter(user => user.user_id !== loggedInUser?.id);
      setUsers(filteredUsers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!selectedOrganization || !inviteEmail) return;
    
    try {
      await membershipService.inviteUser({
        email: inviteEmail,
        organization_id: selectedOrganization.organization_id
      });
      
      setInviteEmail('');
      setOpenInviteModal(false);
      setSuccess('Invitation sent successfully!');
      fetchUsers(); // Refresh the user list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to send invitation');
      console.error(err);
    }
  };

  const handleRemoveUser = async () => {
    if (!userToDelete || !selectedOrganization) return;
    
    try {
      await membershipService.removeUserFromOrganization(
        selectedOrganization.organization_id,
        userToDelete.user_id
      );
      
      setOpenDeleteDialog(false);
      setSuccess('User removed successfully!');
      fetchUsers(); // Refresh the user list
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to remove user');
      console.error(err);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!selectedOrganization) return;
    
    try {
      const updatedUser = await membershipService.updateUserRole(
        selectedOrganization.organization_id,
        userId,
        newRole as 'ADMIN' | 'MODERATOR' | 'MEMBER'
      );
      
      // Update the user in the local state
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSuccess('Role updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update role');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          Organization Members
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenInviteModal(true)}
        >
          Invite User
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {users.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  color: 'text.secondary'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No users in your organization yet
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Start building your team by inviting the first member to your organization.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Invite User" to send an invitation and get started!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #ddd' }}>
                      <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '12px' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{user.user_email}</td>
                        <td style={{ padding: '12px' }}>
                          <FormControl fullWidth size="small">
                            {isOrgModerator && (user.role === 'ADMIN' || user.role === 'MODERATOR') ? (
                              <Chip
                                label={user.role === 'ADMIN' ? 'Administrator' : 'Moderator'}
                                size="small"
                                variant="outlined"
                                // Optional: add styling to match the height of your Select
                                sx={{ height: '40px', justifyContent: 'flex-start', paddingLeft: 1 }}
                              />
                            ) : (
                              <Select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                onClick={(e) => {
                                  // Prevent the click from propagating to the row
                                  e.stopPropagation();
                                }}
                              >
                                <MenuItem value="MEMBER">Member</MenuItem>
                                <MenuItem value="MODERATOR">Moderator</MenuItem>
                                {isOrgAdmin && <MenuItem value="ADMIN">Administrator</MenuItem>}
                              </Select>
                            )}
                          </FormControl>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setUserToDelete(user);
                              setOpenDeleteDialog(true);
                            }}
                            disabled={user.user_id === loggedInUser?.id}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Invite User Modal */}
      <Modal
        open={openInviteModal}
        onClose={() => setOpenInviteModal(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Invite User
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            margin="normal"
            variant="outlined"
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setOpenInviteModal(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleInviteUser}
              disabled={!inviteEmail}
            >
              Send Invitation
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Remove User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {userToDelete?.user_email} from this organization?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleRemoveUser}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
