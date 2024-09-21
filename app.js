const express = require('express');
const routes = require('./src/routes');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
app.use(
  express.json({
    limit: '5mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);
const port = process.env.PORT;
app.use(cors());
// app.use(bodyParser.json());
app.use('/back', routes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
