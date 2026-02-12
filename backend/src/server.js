import express from 'express'
import { runCheck } from './index.js'

const app = express()

app.get('/api', (req, res) => {
    res.json({ data: ['hello world'] })
})

app.get('/api/scan', async (req, res) => {
    try {
        // call the runCheck function in the root index.js
        const results = await runCheck()
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.json(results)
    } catch (err) {
        console.error('Error running check:', err)
        res.status(500).json({ error: 'Failed to run check' })
    }
})

const PORT = process.env.PORT || 5005
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})