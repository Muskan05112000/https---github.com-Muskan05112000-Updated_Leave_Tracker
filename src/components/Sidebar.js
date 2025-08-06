import React from "react";
import { NavLink } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const Sidebar = () => (
  <Box sx={{
    width: 220,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bgcolor: '#505050',
    background: '#505050',
    borderRight: 'none',
    boxShadow: 4,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    pt: 2,
    fontFamily: 'Segoe UI, Roboto, Arial, sans-serif'
  }}>
    <List>
      <NavLink to="/" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#1976d2' : '#fff' })} end>
        <ListItemButton sx={{
          borderRadius: 3,
          mb: 1.5,
          px: 2.5,
          py: 1.5,
          background: ({ isActive }) => isActive ? '#fff' : 'transparent',
          color: ({ isActive }) => isActive ? '#1976d2' : '#fff',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.3,
          transition: 'background 0.2s, color 0.2s',
          '&:hover': {
            background: '#e3f2fd',
            color: '#1976d2',
            boxShadow: 2,
          }
        }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><CalendarMonthIcon fontSize="medium" /></ListItemIcon>
          <ListItemText primary={<span style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 18 }}>Apply Leave</span>} />
        </ListItemButton>
      </NavLink>
      <NavLink to="/users" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#1976d2' : '#fff' })}>
        <ListItemButton sx={{
          borderRadius: 3,
          mb: 1.5,
          px: 2.5,
          py: 1.5,
          background: ({ isActive }) => isActive ? '#fff' : 'transparent',
          color: ({ isActive }) => isActive ? '#1976d2' : '#fff',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.3,
          transition: 'background 0.2s, color 0.2s',
          '&:hover': {
            background: '#e3f2fd',
            color: '#1976d2',
            boxShadow: 2,
          }
        }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><GroupIcon fontSize="medium" /></ListItemIcon>
          <ListItemText primary={<span style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 18 }}>Users</span>} />
        </ListItemButton>
      </NavLink>
      <NavLink to="/analysis" style={({ isActive }) => ({ textDecoration: 'none', color: isActive ? '#1976d2' : '#fff' })}>
        <ListItemButton sx={{
          borderRadius: 3,
          mb: 1.5,
          px: 2.5,
          py: 1.5,
          background: ({ isActive }) => isActive ? '#fff' : 'transparent',
          color: ({ isActive }) => isActive ? '#1976d2' : '#fff',
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 0.3,
          transition: 'background 0.2s, color 0.2s',
          '&:hover': {
            background: '#e3f2fd',
            color: '#1976d2',
            boxShadow: 2,
          }
        }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><AnalyticsIcon fontSize="medium" /></ListItemIcon>
          <ListItemText primary={<span style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 18 }}>Analysis</span>} />
        </ListItemButton>
      </NavLink>
    </List>
  </Box>
);

export default Sidebar;
