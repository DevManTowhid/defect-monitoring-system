const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow React to talk to Express

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } 
});

const upload = multer({ storage: multer.memoryStorage() });
const FASTAPI_URL = 'http://localhost:8000/predict';

app.post('/api/camera-feed', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No image uploaded.');

        const formData = new FormData();
        formData.append('file', req.file.buffer, req.file.originalname);

        const pythonResponse = await axios.post(FASTAPI_URL, formData, {
            headers: { ...formData.getHeaders() },
        });

        const inferenceData = pythonResponse.data;

        if (inferenceData.has_defect) {
            console.log(`[ALERT] Defect in ${inferenceData.filename}`);
            // Broadcast to the React frontend instantly
            io.emit('defect-alert', inferenceData);
        }

        res.status(200).json({ status: 'Processed' });

    } catch (error) {
        console.error('Inference Engine Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Node Gateway running on http://localhost:${PORT}`);
});