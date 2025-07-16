const express = require('express');
const betRoutes = require('./routes/bet');
const { swaggerUi, swaggerDocs } = require("./loaders/swagger");
const cors = require('cors');
const app = express();
const PORT = 3002;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/', betRoutes);

// app.use((err, req, res) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
