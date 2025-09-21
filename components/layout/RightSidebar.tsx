'use client';

import {
  Drawer,
  Box,
  Typography,
  useTheme,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 320;

export default function RightSidebar({ open, onClose }: RightSidebarProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          backgroundColor: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 2 }}>
        {/* Right sidebar content goes here */}
        <Typography>Right Sidebar Content</Typography>
      </Box>
    </Drawer>
  );
} 