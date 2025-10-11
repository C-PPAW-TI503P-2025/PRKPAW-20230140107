const express = require('express');
const cors = require('cors');

const app = express();

// aktifkan cors
app.use(cors());

// test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend jalan!' });
});

// listen port 5000
app.listen(5001, () => {
  console.log('✅ Server running on http://localhost:5001');
});
