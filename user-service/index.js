const express = require('express');
const dotenv = require('dotenv');
const client = require('prom-client');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/favorite');
const { swaggerUi, swaggerDocs } = require("./loaders/swagger");
const cors = require('cors');

dotenv.config();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error.message);
  }
});
// app.use((err, req, res) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
