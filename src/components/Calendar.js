import React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { IconButton, Typography } from "@mui/material";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({
  month,
  year,
  holidays,
  leaves,
  onDateClick,
  selectedDates,
  regionalLocations,
  disableNational,
  onMonthYearChange
}) {
  const currentMonth = new Date(year, month);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(endOfMonth(monthStart));

  // Always show 6 rows (6*7=42 days)
  // Build a 2D array: rows[week][col] for per-row height logic
  let rows = [];
  let day = startDate;
  for (let week = 0; week < 6; week++) {
    let weekCells = [];
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "yyyy-MM-dd");
      const holiday = holidays.find(h => h.date === formattedDate);
      const isNational = holiday && holiday.national;
      // Regional: not national, has locations array, and at least one location
      const isRegional = holiday && !isNational && Array.isArray(holiday.locations) && holiday.locations.length > 0;
      const dayLeaves = leaves.filter(l => l.date === formattedDate);
      const isSelected = selectedDates.includes(formattedDate);
      const isInCurrentMonth = day.getMonth() === month;
      weekCells.push({
        key: formattedDate,
        isSelected,
        isNational,
        isRegional,
        holiday,
        dayLeaves,
        dayObj: new Date(day),
        isInCurrentMonth
      });
      day = addDays(day, 1);
    }
    rows.push(weekCells);
  }

  // Render cells as perfect squares, with internal scroll if overflow
  const gridCells = [];
  for (let week = 0; week < 6; week++) {
    for (let col = 0; col < 7; col++) {
      const cell = rows[week][col];
      gridCells.push(
        cell.isInCurrentMonth ? (
          <div
            key={cell.key}
            className={`calendar-cell${cell.isSelected ? ' selected' : ''}${cell.isNational ? ' national' : ''}`}
            style={{
              background: cell.isNational ? '#fff176' : cell.isRegional ? '#64b5f6' : '#fff',
              border: cell.isSelected ? '2px solid #1976d2' : '1px solid #ececec',
              opacity: cell.isNational ? 0.5 : 1,
              cursor: 'pointer',
              borderRadius: 6,
              boxShadow: '0 1px 3px 0 rgba(60,60,60,0.06)',
              fontFamily: 'Roboto, Inter, Arial, sans-serif',
              padding: 7,
              display: 'flex',
              flexDirection: 'column',
              alignItems: cell.isRegional ? 'center' : 'flex-start',
              justifyContent: cell.isRegional ? 'center' : 'flex-start',
              minWidth: 0,
              minHeight: 0,
              transition: 'border 0.2s, box-shadow 0.2s',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              width: '100%',
              aspectRatio: '1/1',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxHeight: '100%',
            }}
            onClick={e => {
              // Only open modal if clicking on blank space (not a leave entry)
              if (e.target === e.currentTarget) {
                onDateClick(cell.key, cell.isNational);
              }
            }}
          >
            <span style={{
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 2,
              alignSelf: 'flex-end',
              textAlign: 'right',
              width: '100%',
              display: 'block',
              paddingRight: 2
            }}>{format(cell.dayObj, "d")}</span>
            {/* Regional Holiday block (left-aligned, stacked, small, white) */}
            {cell.isRegional && cell.holiday && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                width: '100%',
                marginBottom: 4,
                marginTop: 2,
                color: '#fff',
                fontSize: 10,
                fontWeight: 600,
                lineHeight: 1.2,
                textAlign: 'left',
                letterSpacing: 0.2,
                padding: 0,
                overflow: 'hidden',
                whiteSpace: 'normal',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700 }}>Regional Holiday</span>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{cell.holiday.occasion}</span>
                <span style={{ fontSize: 10, fontWeight: 400 }}>{Array.isArray(cell.holiday.locations) ? cell.holiday.locations.join(', ') : cell.holiday.locations}</span>
              </div>
            )}
            {/* National Holiday (smaller, left-aligned) */}
            {cell.isNational && cell.holiday && (
              <span style={{ fontWeight: 600, color: '#888', marginBottom: 2, fontSize: 10, lineHeight: 1.2 }}>
                National Holiday<br/>{cell.holiday.occasion}
              </span>
            )}
            {/* Leave entries (appear below holiday info, with spacing) */}
            {cell.dayLeaves.map((leave, idx) => (
              <span
                key={idx}
                style={{
                  marginTop: 3,
                  background: leave.type === 'Planned' ? '#a5d6a7' : leave.type === 'Emergency' ? '#ef9a9a' : '#fff59d',
                  color: '#222',
                  borderRadius: 3,
                  padding: '1px 4px',
                  fontSize: 12,
                  fontWeight: 500,
                  display: 'block',
                  boxSizing: 'border-box',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  cursor: 'pointer',
                }}
                onClick={e => {
                  e.stopPropagation();
                  if (typeof onLeaveClick === 'function') {
                    onLeaveClick(cell.key, leave);
                  }
                }}
              >
                {leave.employee} ({leave.type})
              </span>
            ))}
          </div>
        ) : (
          <div key={cell.key} style={{ background: 'transparent', border: 'none', width: '100%', aspectRatio: '1/1', minHeight: 0, minWidth: 0, boxSizing: 'border-box', pointerEvents: 'none' }} />
        )
      );
    }
  }

  return (
    <div
      style={{
        width: 'calc(100vw - 220px - 24px)', // Sidebar is 220px, 24px left margin
        maxWidth: '100%',
        marginLeft: 24, // Consistent left margin from sidebar
        marginRight: 0,
        fontFamily: 'Roboto, Inter, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        fontFamily: 'Roboto, Inter, Arial, sans-serif',
        padding: 0,
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 18,
        marginTop: 0,
        minHeight: 48
      }}>
        <IconButton onClick={() => onMonthYearChange(subMonths(currentMonth, 1))}><ArrowBackIosNewIcon /></IconButton>
        <Typography variant="h6" sx={{ mx: 2, fontFamily: 'Roboto, Inter, Arial, sans-serif', fontWeight: 700, fontSize: 24 }}>{format(currentMonth, "MMMM yyyy")}</Typography>
        <IconButton onClick={() => onMonthYearChange(addMonths(currentMonth, 1))}><ArrowForwardIosIcon /></IconButton>
      </div>
      <div
        className="calendar-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, var(--cell-width, 1fr))',
          gridTemplateRows: 'repeat(7, auto)', // 1 for header, 6 for weeks
          gap: 16,
          width: '100%',
          maxWidth: '100%',
          background: 'transparent',
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden',
          '--cell-width': 'calc((100vw - 220px - 24px - 96px) / 7)', // 96px is for 6 gaps of 16px
          minWidth: 0,
        }}
      >
        {weekDays.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 16,
              fontFamily: 'Roboto, Inter, Arial, sans-serif',
              padding: 0,
              margin: 0,
              background: 'transparent',
              borderRadius: 6,
              minHeight: 0,
              minWidth: 0,
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {day}
          </div>
        ))}
        {gridCells}
      </div>
    </div>
  );
}

export default Calendar;
