import React, { useState } from "react";
import * as XLSX from 'xlsx';
import { Box, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from "@mui/material";
import AnalysisCharts from "./AnalysisCharts";
import AnalysisTable from "./AnalysisTable";
import DonutChartOnly from "./DonutChartOnly";

import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";

const Analysis = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelSuccess, setExcelSuccess] = useState(false);
  const { employees = [], leaves = [] } = useContext(AppContext);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [sendMailOpen, setSendMailOpen] = useState(false);
  const [mailTo, setMailTo] = useState("");
  const [mailAppPassword, setMailAppPassword] = useState("");
  const [mailError, setMailError] = useState(false);
  const [mailAppPasswordError, setMailAppPasswordError] = useState(false);
  const [mailSuccess, setMailSuccess] = useState(false);
  const [sendSmsOpen, setSendSmsOpen] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");
  const [smsPhoneError, setSmsPhoneError] = useState(false);
  const [smsSuccess, setSmsSuccess] = useState(false);

  // Email validation and send handler
  const handleSendMail = () => {
    const email = mailTo.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMailError(true);
      return;
    }
    setMailError(false);

    if (!mailAppPassword) {
      setMailAppPasswordError(true);
      return;
    }
    setMailAppPasswordError(false);

    setSendMailOpen(false);
    setMailSuccess(true);

    // --- Prepare data for backend-generated weekly leave table ---
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const payload = {
      to: mailTo,
      user: mailTo,
      appPassword: mailAppPassword,
      subject: 'Leave update for this week',
      employees,
      leaves,
      weekStart: weekStart.toISOString()
    };
    console.log('Send Mail Payload:', payload);
    fetch('http://localhost:4000/api/send-leave-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMailSuccess(true);
        } else {
          setMailError(true);
        }
      })
      .catch(() => setMailError(true));
  };

  // Excel Download Handler
  // Helper to get number of weeks in the selected month
  const getWeeksInMonth = (month, year) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Math.ceil(lastDay / 7);
  };

  const handleDownloadExcel = async () => {
    const currentMonth = month;
    const currentYear = year;
    // Calculate week start and end for selected week
    const weekStartDate = (selectedWeek - 1) * 7 + 1;
    const weekEndDate = Math.min(selectedWeek * 7, new Date(currentYear, currentMonth + 1, 0).getDate());
    const weekStart = new Date(currentYear, currentMonth, weekStartDate);
    const weekDays = [];
    let d = weekStartDate;
    while (d <= weekEndDate) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 1 = Monday, 5 = Friday
        weekDays.push(dateObj);
      }
      d++;
    }
    const payload = {
      employees,
      leaves,
      weekStart: weekStart.toISOString(),
      weekDays: weekDays.map(d => d.toISOString())
    };
    const response = await fetch('http://localhost:4000/api/download-leave-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      alert('Failed to generate Excel file.');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LeaveTracker_Week${selectedWeek}.xlsx`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    setExcelModalOpen(false);
    setExcelSuccess(true);
  };

  return (
    <div style={{ paddingLeft: 10, margin: 0 }}>
      {/* Excel Success Snackbar */}
      <Snackbar
        open={excelSuccess}
        autoHideDuration={2500}
        onClose={() => setExcelSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ fontWeight: 700, fontSize: 16 }}>
          Excel sheet downloaded successfully
        </Alert>
      </Snackbar>
      {/* Excel Week Modal */}
      <Dialog open={excelModalOpen} onClose={() => setExcelModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Select Week</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Select Week"
            value={selectedWeek}
            onChange={e => setSelectedWeek(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
          >
            {Array.from({ length: getWeeksInMonth(month, year) }, (_, i) => (
              <option key={i+1} value={i+1}>{`Week ${i+1}`}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcelModalOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleDownloadExcel} variant="contained">Download</Button>
        </DialogActions>
      </Dialog>
      {/* Top Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={4} px={2}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 38, textAlign: 'left', letterSpacing: 1 }}>Analysis</h2>
        <Box display="flex" columnGap={3} alignItems="center">
          <Button
            variant="contained"
            sx={{
              borderRadius: 99,
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
              color: '#fff',
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: 3,
              fontWeight: 600,
              fontSize: 17,
              transition: 'background 0.2s, box-shadow 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                boxShadow: 6,
              }
            }}
            onClick={() => setSendMailOpen(true)}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 0 24 24" width="22" style={{ marginRight: 6 }}><path d="M0 0h24v24H0z" fill="none"/><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </span>
            Send a Mail
          </Button>

          {/* Send Mail Modal */}
          <Dialog open={sendMailOpen} onClose={() => setSendMailOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
              Send Mail
              <Button onClick={() => setSendMailOpen(false)} sx={{ minWidth: 0, p: 0, color: '#666' }}>
                <span style={{ fontSize: 24, fontWeight: 700 }}>&times;</span>
              </Button>
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                label="Email"
                type="email"
                value={mailTo}
                onChange={e => {
                  setMailTo(e.target.value);
                  setMailError(false);
                }}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="recipient@example.com"
                autoFocus
                error={mailError}
                helperText={mailError ? 'Enter a valid email address' : ''}
              />
              <TextField
                label="App Password"
                type="password"
                value={mailAppPassword}
                onChange={e => {
                  setMailAppPassword(e.target.value);
                  setMailAppPasswordError(false);
                }}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Your Gmail App Password"
                error={mailAppPasswordError}
                helperText={mailAppPasswordError ? 'App Password is required' : ''}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setSendMailOpen(false);
                setMailTo("");
                setMailAppPassword("");
                setMailError(false);
                setMailAppPasswordError(false);
              }} variant="outlined">Cancel</Button>
              <Button
                onClick={handleSendMail}
                variant="contained"
                disabled={!mailTo || mailError || !mailAppPassword || mailAppPasswordError}
                sx={{ fontWeight: 700 }}
              >
                Send
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={mailSuccess}
            autoHideDuration={2500}
            onClose={() => setMailSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ fontWeight: 700, fontSize: 16 }}>
              Mail Sent Successfully
            </Alert>
          </Snackbar>
          <Button
            variant="contained"
            sx={{
              borderRadius: 99,
              background: 'linear-gradient(90deg, #43ea6d 0%, #1de982 100%)',
              color: '#fff',
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: 3,
              fontWeight: 600,
              fontSize: 17,
              transition: 'background 0.2s, box-shadow 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #1fa463 0%, #43ea6d 100%)',
                boxShadow: 6,
              }
            }}
            onClick={() => setSendSmsOpen(true)}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 0 24 24" width="22" style={{ marginRight: 6 }}><path d="M0 0h24v24H0z" fill="none"/><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 14H6v-2h12v2zm0-4H6V8h12v4z"/></svg>
            </span>
            Send a SMS
          </Button>
          {/* Send SMS Modal */}
          <Dialog open={sendSmsOpen} onClose={() => setSendSmsOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
              Send SMS
              <Button onClick={() => setSendSmsOpen(false)} sx={{ minWidth: 0, p: 0, color: '#666' }}>
                <span style={{ fontSize: 24, fontWeight: 700 }}>&times;</span>
              </Button>
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                label="Phone Number"
                type="tel"
                value={smsPhone}
                onChange={e => {
                  setSmsPhone(e.target.value);
                  setSmsPhoneError(false);
                }}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Enter mobile number"
                autoFocus
                error={smsPhoneError}
                helperText={smsPhoneError ? 'Enter a valid phone number' : ''}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setSendSmsOpen(false);
                setSmsPhone("");
                setSmsPhoneError(false);
              }} variant="outlined">Cancel</Button>
              <Button
                onClick={() => {
                  const phone = smsPhone.trim();
                  const phoneRegex = /^\d{10,15}$/;
                  if (!phoneRegex.test(phone)) {
                    setSmsPhoneError(true);
                    return;
                  }
                  setSmsPhoneError(false);
                  setSendSmsOpen(false);
                  setSmsSuccess(false);
                  // Prepare data for backend
                  const today = new Date();
                  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
                  fetch('http://localhost:4000/api/send-leave-sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      phone,
                      employees,
                      leaves,
                      weekStart: weekStart.toISOString()
                    })
                  })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setSmsSuccess(true);
                      } else {
                        setSmsPhoneError(true);
                      }
                    })
                    .catch(() => setSmsPhoneError(true));
                }}
                variant="contained"
                disabled={!smsPhone || smsPhoneError}
                sx={{ fontWeight: 700 }}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={smsSuccess}
            autoHideDuration={2500}
            onClose={() => setSmsSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success" sx={{ fontWeight: 700, fontSize: 16 }}>
              SMS Sent Successfully
            </Alert>
          </Snackbar>
          <Button
            variant="contained"
            sx={{
              borderRadius: 99,
              background: 'linear-gradient(90deg, #43ea6d 0%, #1de982 100%)',
              color: '#fff',
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: 3,
              fontWeight: 600,
              fontSize: 17,
              transition: 'background 0.2s, box-shadow 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #1fa463 0%, #43ea6d 100%)',
                boxShadow: 6,
              }
            }}
            onClick={() => setExcelModalOpen(true) }
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 0 24 24" width="22" style={{ marginRight: 6 }}><path d="M0 0h24v24H0z" fill="none"/><path d="M19 9h-4V3H5v6H3v12h18V9z"/></svg>
            </span>
            Download Excel
          </Button>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Box display={{ xs: 'block', md: 'flex' }} gap={4}>
        {/* Left Column */}
        <Box flex={1} minWidth={320} display="flex" flexDirection="column" gap={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            {/* Donut Chart Only (no line/bar) */}
            <DonutChartOnly month={month} year={year} />
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Employee Table Card */}
            <AnalysisTable month={month} year={year} />
          </Paper>
        </Box>
        {/* Right Column */}
        <Box flex={1} minWidth={320} display="flex" flexDirection="column" gap={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            {/* First Bar Chart Card (monthly leave counts only) */}
            <AnalysisCharts month={month} year={year} type="bar1" />
          </Paper>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Second Bar Chart Card */}
            <AnalysisCharts month={month} year={year} type="bar2" />
          </Paper>
        </Box>
      </Box>
    </div>
  );
};

export default Analysis;
