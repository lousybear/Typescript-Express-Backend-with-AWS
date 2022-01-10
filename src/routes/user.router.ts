import express from 'express';
const router = express.Router();
import {
	signIn,
	signUp,
	forgotPassword,
	confirmForgotPassword,
	changePassword,
	confirmSignUp,
	resendVerficationCode,
	emailVerificationCode,
	addPhone,
	verifyCode,
} from '../controllers/user.controller';

router.post('/signUp', signUp);
router.post('/confirmSignUp', confirmSignUp);
router.post('/signIn', signIn);
router.post('/forgotPassword', forgotPassword);
router.post('/confirmForgotPassword', confirmForgotPassword);
router.post('/changePassword', changePassword);
router.post('/resendVerficationCode', resendVerficationCode);
router.post('/emailVerificationCode', emailVerificationCode);
router.post('/addPhone', addPhone);
router.post('/verifyCode', verifyCode);

router.use('/', (req, res) => res.json({ Message: 'Inside User Routes' }));

export default router;
