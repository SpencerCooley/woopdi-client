'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  InputAdornment,
  Alert,
  TextField
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { organizationsService } from '@/services/api';

// Define organization type matching the backend
interface Organization {
  id: number;
  name: string;
  created_at: string | Date;
  updated_at: string | Date;
  is_solo: boolean;
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizations when component mounts
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        // Fetch only organizations where is_solo is false (regular organizations)
        const orgs = await organizationsService.getOrganizations(false);
        setOrganizations(orgs);
        setFilteredOrganizations(orgs);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
        setError('Failed to load organizations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Filter organizations when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrganizations(organizations);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = organizations.filter(org => 
        org.name.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredOrganizations(filtered);
    }
  }, [searchQuery, organizations]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Organization Name', flex: 1 },
    { 
      field: 'is_solo', 
      headerName: 'Is Solo', 
      width: 100,
      renderCell: (params) => {
        return params.value ? 'Yes' : 'No';
      }
    },
    { 
      field: 'created_at', 
      headerName: 'Created', 
      width: 150,
      // Format ISO date to readable format
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        try {
          // Parse ISO date string and format it
          const date = new Date(params.value);
          if (isNaN(date.getTime())) {
            return 'Invalid Date';
          }
          return date.toLocaleDateString();
        } catch (e) {
          return 'Error';
        }
      }
    },
  ];

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography>Loading organizations...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>

      {/* Search Box */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search organizations by name..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          size="small"
        />
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredOrganizations}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
}
