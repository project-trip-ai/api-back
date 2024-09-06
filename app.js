import express from 'express';
// import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './src/routes';
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
app.use('/api', routes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
