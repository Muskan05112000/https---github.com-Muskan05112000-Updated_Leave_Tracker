import React from "react";
import { AppBar, Toolbar, Typography, Avatar, Box, IconButton, Badge, Button } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../context/AuthContext';

const TopBar = () => {
  const { user, logout } = useAuth();
  return (
    <AppBar 
      position="fixed" 
      sx={{
        top: 0,
        left: 'var(--sidebar-width, 60px)',
        width: 'calc(100vw - var(--sidebar-width, 60px))',
        bgcolor: 'linear-gradient(135deg, #6a479c99 0%, #4e2a8499 100%)',
        background: 'linear-gradient(135deg, #6a479c99 0%, #4e2a8499 100%)',
        color: '#fff',
        backdropFilter: 'blur(16px) saturate(180%)',
        backgroundBlendMode: 'overlay',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        boxShadow: 2,
        zIndex: 1201,
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)'
      }}
    >
      <Toolbar sx={{ minHeight: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4 }}>
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5, color: '#fff', fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', textAlign: 'center' }}>
          Leave Tracker
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Box sx={{
              fontWeight: 800,
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              fontSize: 18,
              letterSpacing: 0.3,
              color: '#fff',
              background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
              borderRadius: 3,
              px: 3,
              py: 1,
              mr: 2,
              boxShadow: '0 2px 8px 0 #b388ff33',
              textShadow: '0 2px 8px #b388ff22',
              display: 'flex',
              alignItems: 'center',
              minWidth: 0
            }}>
              {user.username}
            </Box>
          )}
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
              color: '#fff',
              fontWeight: 800,
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              fontSize: 18,
              borderRadius: 3,
              px: 3,
              py: 1,
              boxShadow: '0 2px 8px 0 #b388ff33',
              letterSpacing: 0.3,
              textShadow: '0 2px 8px #b388ff22',
              minWidth: 0,
              transition: 'background 0.18s, box-shadow 0.18s, color 0.18s',
              '&:hover': { background: 'linear-gradient(90deg, #b388ff 0%, #7c4dff 100%)', color: '#fff' },
              '&:active': { background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)', color: '#fff' }
            }}
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
