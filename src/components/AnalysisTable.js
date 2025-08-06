import React, { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography } from "@mui/material";

function AnalysisTable({ month, year }) {
  const { employees, leaves } = useContext(AppContext);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Compute total leaves per employee for selected month
  const monthStr = `${year}-${String(month+1).padStart(2, '0')}`;
  const stats = employees.map(emp => {
    const userLeaves = leaves.filter(l => l.employee === emp.name && l.date.startsWith(monthStr));
    return {
      name: emp.name,
      location: emp.location,
      team: emp.team,
      total: userLeaves.length,
      dates: userLeaves.map(l => l.date)
    };
  });

  return (
    <Box mt={2}>
      <TableContainer component={Paper} sx={{ boxShadow: 6, borderRadius: 3, mt: 2, maxWidth: 480, margin: '0 auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #e3f2fd 0%, #fff 100%)' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.2 }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.2 }}>{`Total Leaves in ${format(new Date(year, month), "MMMM")}`}</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((row, idx) => (
              <TableRow
                key={row.name}
                hover
                selected={selectedUser && selectedUser.name === row.name}
                onClick={() => setSelectedUser(row)}
                sx={{
                  cursor: 'pointer',
                  background: selectedUser && selectedUser.name === row.name ? '#bbdefb' : (idx % 2 === 0 ? '#f9f9fb' : '#fff'),
                  transition: 'background 0.2s',
                  '&:hover': {
                    background: '#e3f2fd',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>{row.name}</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>{row.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={3}>
        <Button
          variant="contained"
          size="medium"
          disabled={!selectedUser}
          onClick={() => setDetailsOpen(true)}
          sx={{
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            color: '#fff',
            borderRadius: 20,
            boxShadow: 2,
            fontWeight: 700,
            fontSize: 16,
            px: 3,
            py: 1.2,
            textTransform: 'none',
            letterSpacing: 0.2,
            transition: 'background 0.2s, box-shadow 0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
              boxShadow: 4,
            }
          }}
        >
          View Details
        </Button>
      </Box>
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          User Information
          <Button onClick={() => setDetailsOpen(false)} sx={{ minWidth: 0, p: 0, color: '#666' }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>&times;</span>
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Employee Name</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.name}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Location</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.location}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Team</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{selectedUser.team}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Leave Dates ({format(new Date(year, month), "MMMM yyyy")})</Typography>
              <Box sx={{ mb: 2 }}>
                {(() => {
                  // Find all leave dates for this user in the selected month
                  const monthStr = `${year}-${String(month+1).padStart(2, '0')}`;
                  const userLeaves = leaves.filter(l => l.employee === selectedUser.name && l.date.startsWith(monthStr));
                  if (userLeaves.length === 0) return <Typography variant="body1">None</Typography>;
                  // Group by leave type
                  const leaveTypeMap = {
                    Planned: { color: '#66bb6a', label: '🟩 Planned Leave', dates: [] },
                    Emergency: { color: '#ef5350', label: '🟥 Emergency Leave', dates: [] },
                    Sick: { color: '#fff176', label: '🟨 Sick Leave', dates: [] }
                  };
                  userLeaves.forEach(l => {
                    if (leaveTypeMap[l.type]) {
                      leaveTypeMap[l.type].dates.push(l.date);
                    }
                  });
                  return (
                    <Box>
                      {Object.entries(leaveTypeMap).map(([type, info]) =>
                        info.dates.length > 0 && (
                          <Box key={type} display="flex" alignItems="center" mb={1} sx={{
                            background: '#f5faff',
                            borderRadius: 2,
                            p: '3px 8px',
                            minWidth: 0,
                            width: 'fit-content',
                            fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
                            boxShadow: 1,
                            fontSize: 13,
                            transition: 'box-shadow 0.2s',
                            '&:hover': { boxShadow: 3, background: '#e3f2fd' }
                          }}>
                            <span style={{
                              display: 'inline-block',
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                              background: info.color,
                              marginRight: 8,
                              verticalAlign: 'middle',
                            }}></span>
                            <span style={{
                              fontWeight: 600,
                              fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
                              fontSize: 13,
                              marginRight: 10,
                              verticalAlign: 'middle',
                              whiteSpace: 'nowrap'
                            }}>{info.label.replace(/^🟩 |^🟥 |^🟨 /, '')}</span>
                            <span style={{
                              color: '#222',
                              fontWeight: 400,
                              fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
                              fontSize: 13,
                              marginLeft: 5,
                              verticalAlign: 'middle',
                              wordBreak: 'break-word'
                            }}>
                              {info.dates.map(d => format(new Date(d), 'dd MMM yyyy')).join(', ')}
                            </span>
                          </Box>
                        )
                      )}
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AnalysisTable;
