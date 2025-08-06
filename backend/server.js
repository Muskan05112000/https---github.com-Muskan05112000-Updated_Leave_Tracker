const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 4000;

// Log all requests and bodies for debugging
app.use((req, res, next) => {
  console.log('Request:', req.method, req.url, req.headers['content-type'], req.body);
  next();
});
const { sendWeeklyLeaveMail } = require('./sendMail');

app.use(cors());
app.use(express.json());

// --- MongoDB Atlas Connection ---
const MONGO_URI = 'mongodb+srv://Admin:Admin@cluster0.ge3ezsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Schemas ---
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: String,
  team: String
});
const Employee = mongoose.model('Employee', employeeSchema);

const holidaySchema = new mongoose.Schema({
  occasion: String,
  date: String, // ISO format
  locations: [String],
  national: Boolean
});
const Holiday = mongoose.model('Holiday', holidaySchema);

const leaveSchema = new mongoose.Schema({
  date: String, // ISO format
  employee: String, // employee name
  type: { type: String, enum: ['Planned', 'Emergency', 'Sick'] },
});
const Leave = mongoose.model('Leave', leaveSchema);

// --- Employees ---
app.get('/api/employees', async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

app.post('/api/employees', async (req, res) => {
  try {
    const newEmp = new Employee(req.body);
    await newEmp.save();
    res.status(201).json(newEmp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Send Leave Email ---
const { format, addDays, isSameDay } = require('date-fns');
// const { sendWeeklyLeaveSMS } = require('./sendSms'); // WhatsApp/SMS integration disabled
const { generateLeaveTrackerExcel } = require('./generateExcel');

app.post('/api/download-leave-excel', async (req, res) => {
  const { employees, leaves, weekStart, weekDays } = req.body;
  if (!employees || !leaves || !weekStart) {
    return res.status(400).json({ error: 'Missing employees, leaves, or weekStart' });
  }
  try {
    console.log('Download Excel payload:', req.body);
    const { fileName, filePath } = await generateLeaveTrackerExcel({ employees, leaves, weekStart, weekDays });
    res.download(filePath, fileName, err => {
      if (err) {
        res.status(500).json({ error: 'Failed to download file' });
      } else {
        // Optionally delete file after sending
        setTimeout(() => { try { require('fs').unlinkSync(filePath); } catch(e){} }, 2000);
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.post('/api/send-leave-sms', async (req, res) => {
//   const { phone, employees, leaves, weekStart } = req.body;
//   if (!phone || !employees || !leaves || !weekStart) {
//     return res.status(400).json({ error: 'Missing phone, employees, leaves, or weekStart' });
//   }
//   try {
//     await sendWeeklyLeaveSMS({ phone, employees, leaves, weekStart });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.post('/api/send-leave-email', async (req, res) => {
  console.log('Received send-leave-email body:', req.body);
  const { to, subject, employees, leaves, weekStart, user, appPassword } = req.body;
  if (!to || !subject || !employees || !leaves || !weekStart) {
    return res.status(400).json({ error: 'Missing to, subject, employees, leaves, or weekStart' });
  }
  try {
    // Build week days (Mon-Fri)
    const weekDays = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 5; i++) {
      weekDays.push(addDays(start, i));
    }
    // Build HTML table
    let html = `<h3>Leave update for this week</h3><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;min-width:400px;text-align:center;">
      <thead><tr><th>Employee Name</th>`;
    html += weekDays.map(d => `<th>${format(d, "dd MMM")}</th>`).join("");
    html += `</tr></thead><tbody>`;
    employees.forEach(emp => {
      html += `<tr><td style='font-weight:600'>${emp.name}</td>`;
      weekDays.forEach(day => {
        const leave = leaves.find(l => l.employee === emp.name && isSameDay(new Date(l.date), day));
        let code = "";
        if (leave) {
          if (leave.type === "Planned") code = "PL";
          else if (leave.type === "Emergency") code = "EL";
          else if (leave.type === "Sick") code = "SL";
        }
        html += `<td>${code}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;
    // Support dynamic user/appPassword from frontend
    const user = req.body.user || req.body.mailTo || to;
    const appPassword = req.body.appPassword;
    await sendWeeklyLeaveMail({ to, subject, html, user, appPassword });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:name', async (req, res) => {
  try {
    const updated = await Employee.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/employees/:name', async (req, res) => {
  await Employee.deleteOne({ name: req.params.name });
  res.status(204).end();
});

// --- Holidays ---
app.get('/api/holidays', async (req, res) => {
  const holidays = await Holiday.find();
  res.json(holidays);
});

// --- Leaves ---
app.get('/api/leaves', async (req, res) => {
  const leaves = await Leave.find();
  res.json(leaves);
});

app.post('/api/leaves', async (req, res) => {
  try {
    const newLeave = new Leave(req.body);
    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/leaves/:id', async (req, res) => {
  try {
    const updated = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/leaves/:id', async (req, res) => {
  await Leave.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
