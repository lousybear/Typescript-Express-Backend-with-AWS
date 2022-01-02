import express from 'express';
const app = express();
const router = express.Router();

import user from './user.router';

router.use('/user', user);

app.use('/', router);

export default router;
