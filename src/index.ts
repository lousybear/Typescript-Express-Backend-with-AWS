import express from 'express';
import { config } from 'dotenv';
import bodyPraser from 'body-parser';
config({ path: `.env/.${process.env.NODE_ENV}.env` });

const router = express.Router();
const app = express();
app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({ extended: false }));

import indexRouter from './routes/index.router';

router.get('/app/test', (req, res) => res.send({ message: 'It Works!' }));
router.use('/app', indexRouter);
app.use('/', router);

app.listen(8080, () => {
	console.log('App Running');
});
