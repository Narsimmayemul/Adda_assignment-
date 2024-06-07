const express = require('express');
const app = express();
app.use(express.json());
const port = 3000;

const facilities = {
    'Clubhouse': {
        slots: [
            { start: '10:00', end: '16:00', rate: 100 },
            { start: '16:00', end: '22:00', rate: 500 },
        ]
    },
    'Tennis Court': {
        slots: [
            { start: '00:00', end: '24:00', rate: 50 },
        ]
    }
};

const bookings = {};

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const bookingCost = (facility, start, end) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    let cost = 0;

    facilities[facility].slots.forEach(slot => {
        const slotStart = timeToMinutes(slot.start);
        const slotEnd = timeToMinutes(slot.end);
        if (endMinutes <= slotStart || startMinutes >= slotEnd) {
            return;
        }
        const effectiveStart = Math.max(startMinutes, slotStart);
        const effectiveEnd = Math.min(endMinutes, slotEnd);
        cost += ((effectiveEnd - effectiveStart) / 60) * slot.rate;
    });
    return cost;
};

app.get('/', (req, res) => {
    res.send('For booking you need to visit "/book"');
});

app.get('/list', (req, res) => {
    res.send(bookings);
});

app.post('/book', (req, res) => {
    const { facility, date, start, end } = req.body;

    if (!facility || !date || !start || !end) {
        return res.status(400).send('Missing parameters');
    }

    const bookingKey = `${facility}-${date}-${start}-${end}`;

    if (bookings[bookingKey]) {
        return res.status(400).send('Booking Failed, Already Booked');
    }

    const cost = bookingCost(facility, start, end);
    const bookingDetails = { ...req.body, cost };

    bookings[bookingKey] = bookingDetails;

    res.send(`Booked, Rs. ${cost}`);
});

app.listen(port, () => {
    console.log(`Facility booking app listening at port ${port}`);
});
