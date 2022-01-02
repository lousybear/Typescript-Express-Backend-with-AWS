import express from 'express';
const app = express();
const router = express.Router();
import { signIn, signUp } from '../controllers/user.controller';

router.post('/signUp', signUp);
router.post('/signIn', signIn);
router.get('/getProfile');

app.use('/', router);

export default router;
