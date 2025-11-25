import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

console.log('Starting minimal test server...');
console.log('PORT:', PORT);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test server running' });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
});
