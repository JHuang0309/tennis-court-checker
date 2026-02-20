import express from 'express'
import { runCheck } from './index.js'
import cors from "cors";

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || "*" // only allow frontend in prod
}));

app.get('/api', (req, res) => {
    res.json({ data: ['hello world'] })
})

app.get('/api/scan', async (req, res) => {
    try {
        const dateString = req.query.date;

        if (!dateString) {
            return res.status(400).json({ error: "Missing date parameter" });
        }
        // Convert string to Date object 
        const dateObject = parseLocalDate(dateString);

        if (isNaN(dateObject.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        // call the runCheck function in the root index.js
        const results = await runCheck(dateObject)
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.json(results)
    } catch (err) {
        console.error('Error running scan:', err)
        res.status(500).json({ error: 'Failed to run api/scan' })
    }
});

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const PORT = process.env.PORT || 5005
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});