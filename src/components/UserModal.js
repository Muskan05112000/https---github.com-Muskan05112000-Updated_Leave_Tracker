import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from "@mui/material";

function UserModal({ open, onClose, onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [team, setTeam] = useState(initial?.team || "");

  useEffect(() => {
    setName(initial?.name || "");
    setLocation(initial?.location || "");
    setTeam(initial?.team || "");
  }, [initial]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initial ? "Edit User" : "Add User"}</DialogTitle>
      <DialogContent>
        <Box sx={{ minWidth: 250, mt: 1 }}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Team" value={team} onChange={e => setTeam(e.target.value)} fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onSubmit({ name, location, team })} variant="contained">Submit</Button>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserModal;
