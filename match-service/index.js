const express = require('express');
const client = require('prom-client');
const { swaggerUi, swaggerDocs } = require("./loaders/swagger");
const matchsRoutes = require('./routes/matchs');
const cors = require('cors');

const app = express();
const PORT = 3000;
app.use(cors());

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/matchs', matchsRoutes);

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
