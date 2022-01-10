import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import {
	AuthenticationDetails,
	CognitoUser,
	CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { Request, Response } from 'express';

const cognitoIdp = new CognitoIdentityProvider({ region: 'ap-south-1' });

const poolData = {
	UserPoolId: process.env.USERPOOL_ID || 'userpool',
	ClientId: process.env.CLIENT_ID || 'client',
};
const userPool = new CognitoUserPool(poolData);

const getUser = (AccessToken: string) => {
	return cognitoIdp.getUser({ AccessToken }, (err: Error, res: any) => {
		if (err) {
			return { stausCode: err };
		} else return res.UserAttributes;
	});
};

const signUp = (req: Request, res: Response) => {
	const {
		body: { email, username, name, phoneNumber, password },
	} = req;
	if (!email && !phoneNumber) {
		res.status(400).send('Bad Request');
	}
	const params = {
		ClientId: process.env.CLIENT_ID /* required */,
		Username: username /* required */,
		Password: password,
		UserAttributes: [
			{
				Name: 'name' /* required */,
				Value: name,
			},
		],
	};
	if (email)
		params.UserAttributes.push({
			Name: 'email' /* required */,
			Value: email,
		});
	if (phoneNumber)
		params.UserAttributes.push({
			Name: 'phone_number' /* required */,
			Value: phoneNumber,
		});
	cognitoIdp.signUp(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: 'User Creation Failed' });
		}
		res.send({ message: 'User Created Successfully', result });
	});
};

const confirmSignUp = (req: Request, res: Response) => {
	const {
		body: { code, username },
	} = req;
	if (!code || !username) {
		res.status(400).send('Bad Request');
	}
	const params = {
		ClientId: process.env.CLIENT_ID /* required */,
		ConfirmationCode: code /* required */,
		Username: username /* required */,
	};
	cognitoIdp.confirmSignUp(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: 'Failed to Confirm Sign Up' });
		}
		res.send({ message: 'User Confirmed Successfully', result });
	});
};

const resendVerficationCode = (req: Request, res: Response) => {
	const {
		body: { username },
	} = req;
	if (!username) {
		res.status(400).send('Bad Request');
	}
	const params = {
		ClientId: process.env.CLIENT_ID /* required */,
		Username: username /* required */,
	};
	cognitoIdp.resendConfirmationCode(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: 'Failed to Send Code' });
		}
		res.send({ message: 'Code Sent Successfully', result });
	});
};

const addPhone = (req: Request, res: Response) => {
	const {
		body: { phoneNumber, username },
	} = req;
	if (!phoneNumber || !username) {
		res.status(400).send('Bad Request');
	}
	const params = {
		UserAttributes: [
			{
				Name: 'phone_number',
				Value: phoneNumber,
			},
		],
		UserPoolId: process.env.USERPOOL_ID,
		Username: username,
	};
	cognitoIdp.adminUpdateUserAttributes(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: 'Failed to Add Phone No' });
		}
		res.send({ message: 'OTP Sent to Phone Number', result });
	});
};

const verifyCode = (req: Request, res: Response) => {
	const {
		body: { code, type },
		headers: { authorization },
	} = req;
	if (!code || !authorization || !type) {
		res.status(400).send('Bad Request');
	}
	const params = {
		AccessToken: authorization /* required */,
		AttributeName: type /* required */,
		Code: code /* required */,
	};
	cognitoIdp.verifyUserAttribute(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: `Couldn't Verify ${type}` });
		}
		res.send({ message: `${type} verified Successfully`, result });
	});
};

const signIn = (req: Request, res: Response) => {
	const {
		body: { username, password },
	} = req;
	if (!username || !password) {
		res.status(400).send('Bad Request');
	}
	const authDetails = new AuthenticationDetails({
		Username: username,
		Password: password,
	});
	const cognitoUser = new CognitoUser({
		Username: username,
		Pool: userPool,
	});
	cognitoUser.authenticateUser(authDetails, {
		onSuccess: (result) => {
			const auth = {
				profile: result.getIdToken().payload,
				accessToken: result.getAccessToken().getJwtToken(),
				refreshToken: result.getRefreshToken().getToken(),
			};
			res.send(auth);
		},
		onFailure: (err) => res.status(401).send({ message: 'Unauthorized' }),
	});
};

const forgotPassword = (req: Request, res: Response) => {
	const {
		body: { username },
	} = req;
	if (!username) {
		res.status(400).send('Bad Request');
	}
	const params = {
		ClientId: process.env.CLIENT_ID /* required */,
		Username: username /* required */,
	};
	cognitoIdp.forgotPassword(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: 'Internal Server Error' });
		}
		res.send({ message: 'Sent Reset Code to Email Successfully', result });
	});
};

const confirmForgotPassword = (req: Request, res: Response) => {
	const {
		body: { username },
	} = req;
	if (!username) {
		res.status(400).send('Bad Request');
	}
	const params = {
		ClientId: process.env.CLIENT_ID /* required */,
		Username: username /* required */,
	};
	cognitoIdp.resendConfirmationCode(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: 'Failed to Update Password' });
		}
		res.send({ message: 'Password Updated Successfully', result });
	});
};

const emailVerificationCode = (req: Request, res: Response) => {
	const {
		headers: { authorization },
	} = req;
	if (!authorization) {
		res.status(400).send('Bad Request');
	}
	const params = {
		AccessToken: authorization /* required */,
		AttributeName: 'EMAIL' /* required */,
	};
	cognitoIdp.getUserAttributeVerificationCode(
		params,
		(err: any, result: any) => {
			if (err) {
				console.log(err);
				res.status(503).send({ message: 'Failed to Send Code' });
			}
			res.send({ message: 'Code Sent Successfully', result });
		}
	);
};

const changePassword = (req: Request, res: Response) => {
	const {
		body: { newPassword, oldPassword },
		headers: { authorization },
	} = req;
	const params = {
		AccessToken: authorization /* required */,
		PreviousPassword: oldPassword /* required */,
		ProposedPassword: newPassword /* required */,
	};
	cognitoIdp.changePassword(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: 'Failed to Update Password' });
		}
		res.send({ message: 'Password Updated Successfully', result });
	});
};

export {
	signUp,
	addPhone,
	signIn,
	forgotPassword,
	confirmForgotPassword,
	changePassword,
	confirmSignUp,
	resendVerficationCode,
	getUser,
	emailVerificationCode,
	verifyCode,
};
