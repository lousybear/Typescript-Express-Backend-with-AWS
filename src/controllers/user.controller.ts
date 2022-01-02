import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import {
	AuthenticationDetails,
	CognitoUser,
	CognitoUserPool,
	CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { Request, Response } from 'express';

const cognitoIdp = new CognitoIdentityProvider({ region: 'ap-south-1' });

const poolData = {
	UserPoolId: process.env.USERPOOL_ID || 'userpool',
	ClientId: process.env.CLIENT_ID || 'client',
};
const userPool = new CognitoUserPool(poolData);

const signUp = (req: Request, res: Response) => {
	const {
		body: { email, username, name, phoneNumber, password },
	} = req;
	if (!email || !name || !phoneNumber) {
		res.status(400).send('Bad Request');
	}
	const params = {
		ClientId: process.env.CLIENT_ID /* required */,
		Username: username /* required */,
		Password: password,
		UserAttributes: [
			{
				Name: 'email' /* required */,
				Value: email,
			},
			{
				Name: 'phone_number' /* required */,
				Value: phoneNumber,
			},
			{
				Name: 'name' /* required */,
				Value: name,
			},
		],
	};
	cognitoIdp.signUp(params, (err: any, result: any) => {
		if (err) {
			console.log(err);
			res.status(503).send({ message: 'User Creation Failed' });
		}
		res.send({ message: 'User Created Successfully', result });
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
export { signUp, signIn };
