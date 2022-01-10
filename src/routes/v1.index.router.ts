import express from 'express';
const router = express.Router();

import user from './user.router';

router.use('/user', user);

router.use('/test', (req, res) => {
	res.send({ message: 'It Works' });
});

router.use('/', (req, res) => {
	res.send({ message: 'Inside Index Routes' });
});

export default router;
