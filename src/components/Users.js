import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import UserModal from "./UserModal";
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Dialog, DialogTitle, DialogActions } from "@mui/material";

const Users = () => {
  const { employees, addEmployee, editEmployee, deleteEmployee, loading } = useContext(AppContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  if (loading) return <Box ml={30} mt={10}><CircularProgress /></Box>;

  return (
    <div style={{ marginLeft: 240, padding: 32 }}>
      <div style={{ maxWidth: 700, margin: '0 auto', marginBottom: 32 }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 32, textAlign: 'center' }}>Users Information</h2>
      </div>
      <TableContainer component={Paper} sx={{ maxWidth: 700, margin: '0 auto', boxShadow: 8, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #e3f2fd 0%, #fff 100%)' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.2 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.2 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.2 }}>Team</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp, idx) => (
              <TableRow
                key={emp._id || emp.name}
                onClick={() => setEditUser(emp)}
                hover
                selected={editUser?.name === emp.name}
                sx={{
                  cursor: 'pointer',
                  background: editUser?.name === emp.name ? '#bbdefb' : (idx % 2 === 0 ? '#f9f9fb' : '#fff'),
                  transition: 'background 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    background: '#e3f2fd',
                    boxShadow: 2,
                  },
                  borderRadius: 2,
                }}
              >
                <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>{emp.name}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{emp.location}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{emp.team}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={3} display="flex" justifyContent="center" gap={2}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<span style={{fontWeight:900, fontSize:22}}>+</span>} 
          sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2, px: 3, py: 1.2, boxShadow: 2, textTransform: 'none', letterSpacing: 0.2 }}
          onClick={() => { setEditUser(null); setModalOpen(true); }}>
          Add User
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          startIcon={<span style={{fontWeight:900, fontSize:18}}>✎</span>} 
          sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2, px: 3, py: 1.2, textTransform: 'none', letterSpacing: 0.2, borderWidth: 2 }}
          disabled={!editUser} 
          onClick={() => setModalOpen(true)}>
          Edit User
        </Button>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<span style={{fontWeight:900, fontSize:18}}>🗑️</span>} 
          sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2, px: 3, py: 1.2, textTransform: 'none', letterSpacing: 0.2, borderWidth: 2 }}
          disabled={!editUser} 
          onClick={() => setDeleteUser(editUser)}>
          Delete User
        </Button>
      </Box>
      {/* Floating Add User Button */}
      <Box position="fixed" bottom={40} right={60} zIndex={2000}>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: '50%', minWidth: 56, minHeight: 56, boxShadow: 3, fontSize: 32, p: 0 }}
          onClick={() => { setEditUser(null); setModalOpen(true); }}
        >
          +
        </Button>
      </Box>
      <UserModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null); }}
        initial={editUser}
        onSubmit={async (user) => {
          if (editUser) {
            await editEmployee(editUser.name, user);
          } else {
            await addEmployee(user);
          }
          setModalOpen(false);
          setEditUser(null);
        }}
      />
      <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)}>
        <DialogTitle>Do you want to delete this user?</DialogTitle>
        <DialogActions>
          <Button onClick={async () => {
            await deleteEmployee(deleteUser.name);
            setDeleteUser(null);
          }} variant="contained" color="error">Submit</Button>
          <Button onClick={() => setDeleteUser(null)} variant="outlined">Cancel</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Users;
