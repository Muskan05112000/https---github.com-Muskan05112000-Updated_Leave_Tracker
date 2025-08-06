import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import Calendar from "./Calendar";
import LeaveModal from "./LeaveModal";
import { Box, CircularProgress, Button } from "@mui/material";
import { format } from "date-fns";

const userLocation = "Chennai"; // For demo, can be made dynamic

const ApplyLeave = () => {
  const { holidays, leaves, addLeave, editLeave, revokeLeave, loading } = useContext(AppContext);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDates, setSelectedDates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  // Get leaves for current month
  const monthStr = `${year}-${String(month+1).padStart(2, '0')}`;
  const monthLeaves = leaves.filter(l => l.date.startsWith(monthStr));

  const handleDateClick = (date, isNational) => {
    // Allow modal for national holidays too
    const leavesForDate = leaves.filter(l => l.date === date);
    setEditingLeave(null); // Always open in apply mode for date cell click
    setSelectedDates([date]);
    setLeavesForDate(leavesForDate);
    setModalOpen(true);
  };



  // Add state for leavesForDate
  const [leavesForDate, setLeavesForDate] = useState([]);

  const handleMonthYearChange = (date) => {
    setMonth(date.getMonth());
    setYear(date.getFullYear());
    setSelectedDates([]);
  };

  const handleModalSubmit = async ({ employee, type }) => {
    for (let date of selectedDates) {
      // Check if leave exists
      const existing = leaves.find(l => l.date === date && l.employee === employee);
      if (existing) {
        alert('Employee already applied leave. If you want to edit the information select the applied leave in Select Leave dropdown');
        return;
      }
    }
    for (let date of selectedDates) {
      await addLeave({ date, employee, type });
    }
    setModalOpen(false);
    setSelectedDates([]);
    setEditingLeave(null);
    setTimeout(() => { alert('Leave Applied Successfully'); }, 100);
  };

  // For demo: only allow Chennai regional holidays
  const regionalLocations = [userLocation];

  if (loading) return <Box ml={30} mt={10}><CircularProgress /></Box>;

  return (
    <div style={{ minHeight: '100vh', background: '#fafbfc', padding: 0, overflowX: 'auto', whiteSpace: 'nowrap' }}>
      {/* Sidebar is assumed to be rendered outside this component at width 220px */}
      <div style={{ display: 'inline-block', minWidth: 700, paddingRight: 24 }}>
        <div style={{ width: '100%', paddingTop: 24, paddingBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 32, textAlign: 'center' }}>Apply Leave</h2>
        </div>
        <div style={{ display: 'inline-block' }}>
          <Calendar
            month={month}
            year={year}
            holidays={holidays}
            leaves={monthLeaves}
            onDateClick={handleDateClick}
            onLeaveClick={(date, leave) => {
              setEditingLeave(leave);
              setSelectedDates([date]);
              setModalOpen(true);
            }}
            selectedDates={selectedDates}
            regionalLocations={regionalLocations}
            disableNational={true}
            onMonthYearChange={handleMonthYearChange}
          />
        </div>
      </div>
      <LeaveModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedDates([]); setEditingLeave(null); setLeavesForDate([]); }}
        selectedDates={selectedDates}
        editingLeave={editingLeave}
        leavesForDate={leavesForDate}
        onSubmit={handleModalSubmit}
        onEdit={async (leave) => {
          // Always update the leave entry by its _id with new employee/type
          if (leave._id) {
            await editLeave(leave._id, { ...leave, employee: leave.employee, type: leave.type });
            setModalOpen(false);
            setSelectedDates([]);
            setEditingLeave(null);
            setLeavesForDate([]);
            alert('Leave details updated successfully');
          } else {
            alert('Input information is not available');
          }
        }}
        onRevoke={async ({ employee, type }) => {
          let revoked = false;
          for (let date of selectedDates) {
            const existing = leaves.find(l => l.date === date && l.employee === employee && l.type === type);
            if (existing) {
              await revokeLeave(existing._id);
              revoked = true;
            }
          }
          setModalOpen(false);
          setSelectedDates([]);
          setEditingLeave(null);
          setLeavesForDate([]);
          if (revoked) {
            alert('Leave revoked successfully');
          } else {
            alert('Input information is not available');
          }
        }}
      />
    </div>
  );
};

export default ApplyLeave;
