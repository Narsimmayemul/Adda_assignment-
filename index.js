const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

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
    res.send(`

        <h1>Facility Booking</h1>
        <form action="/book" method="post">
            <label for="facility">Facility:</label>
            <select name="facility" id="facility">
                <option value="Clubhouse">Clubhouse</option>
                <option value="Tennis Court">Tennis Court</option>
            </select><br>
            <label for="date">Date (DD/MM/YYYY):</label>
            <input type="text" id="date" name="date" required><br>
            <label for="start">Start Time (HH:MM):</label>
            <input type="text" id="start" name="start" required><br>
            <label for="end">End Time (HH:MM):</label>
            <input type="text" id="end" name="end" required><br>
            <button type="submit">Book</button>
        </form>

        <p>To get list of bookings you can visit "/list"</p>
    `);
});

app.get('/list', (req, res) => {
    res.json(bookings);
});

app.post('/book', express.urlencoded({ extended: true }), (req, res) => {
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
