const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/calendar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const patientSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: String,
  sex: String,
  age: Number,
  appointments: [
    {
      date: String,
      slots: [
        {
          id: { type: Number, required: true },
          time: String,
          physician_id: Number,
          patient_id: Number,
          consultationType: Number,
          details: String,
          durationSlots: Number,
          paid: Boolean,
        },
      ],
    },
  ],
});

const physicianSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: String,
  availableForThePeriods: [
    {
      startDate: String,
      endDate: String,
    },
  ],
  workingDaysOfTheWeek: [Boolean],
  workingHours: [
    {
      start: String,
      end: String,
    },
  ],
  absences: [String],
  manualAvailability: [
    {
      date: String,
      slots: [String],
    },
  ],
  appointments: [
    {
      date: String,
      slots: [
        {
          id: { type: Number, required: true },
          time: String,
          physician_id: Number,
          patient_id: Number,
          consultationType: Number,
          details: String,
          durationSlots: Number,
          paid: Boolean,
        },
      ],
    },
  ],
});

const appointmentSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  slots: [
    {
      id: { type: Number, unique: true, required: true },
      time: String,
      physician_id: Number,
      patient_id: Number,
      consultationType: Number,
      details: String,
      durationSlots: Number,
      paid: Boolean,
    },
  ],
});

const Patient = mongoose.model('Patient', patientSchema);
const Physician = mongoose.model('Physician', physicianSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

app.get('/', (req, res) => {
  res.send('Welcome to the REST API');
});

app.get('/patients', async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

app.post('/patients', async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.json(patient);
});

app.put('/patients/:id', async (req, res) => {
  const patient = await Patient.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(patient);
});

app.delete('/patients/:id', async (req, res) => {
  await Patient.findOneAndDelete({ id: req.params.id });
  res.json({ message: 'Patient deleted' });
});

app.get('/physicians', async (req, res) => {
  const physicians = await Physician.find();
  res.json(physicians);
});

app.post('/physicians', async (req, res) => {
  const physician = new Physician(req.body);
  await physician.save();
  res.json(physician);
});

app.put('/physicians/:id', async (req, res) => {
  const physician = await Physician.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(physician);
});

app.delete('/physicians/:id', async (req, res) => {
  await Physician.findOneAndDelete({ id: req.params.id });
  res.json({ message: 'Physician deleted' });
});

app.get('/appointments', async (req, res) => {
  const appointments = await Appointment.find();
  res.json(appointments);
});

app.get('/appointments/:date', async (req, res) => {
  const date = new Date(req.params.date);
  const appointments = await Appointment.findOne({ date });
  res.json(appointments);
});

app.post('/appointments', async (req, res) => {
  const { date, slot } = req.body;
  let appointmentDate = await Appointment.findOne({ date: new Date(date) });

  if (!appointmentDate) {
    appointmentDate = new Appointment({ date: new Date(date), slots: [slot] });
  } else {
    appointmentDate.slots.push(slot);
  }
  await appointmentDate.save();
  res.json(appointmentDate);
});

app.put('/appointments/:date/:id', async (req, res) => {
  const { date, id } = req.params;
  const appointmentDate = await Appointment.findOne({ date: new Date(date) });
  if (!appointmentDate) {
    return res.status(404).json({ message: 'Appointment date not found' });
  }
  const slotIndex = appointmentDate.slots.findIndex(slot => slot.id === parseInt(id));
  if (slotIndex === -1) {
    return res.status(404).json({ message: 'Appointment slot not found' });
  }
  appointmentDate.slots[slotIndex] = req.body;
  await appointmentDate.save();
  res.json(appointmentDate);
});

app.delete('/appointments/:date/:id', async (req, res) => {
  const { date, id } = req.params;
  const appointmentDate = await Appointment.findOne({ date: new Date(date) });
  if (!appointmentDate) {
    return res.status(404).json({ message: 'Appointment date not found' });
  }
  const slotIndex = appointmentDate.slots.findIndex(slot => slot.id === parseInt(id));
  if (slotIndex === -1) {
    return res.status(404).json({ message: 'Appointment slot not found' });
  }
  appointmentDate.slots.splice(slotIndex, 1);
  if (appointmentDate.slots.length === 0) {
    await Appointment.deleteOne({ date: new Date(date) });
    return res.json({ message: 'Appointment date deleted' });
  } else {
    await appointmentDate.save();
    return res.json({ message: 'Appointment slot deleted' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
