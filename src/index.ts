import express from 'express';
import { config } from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import bodyPraser from 'body-parser';
config({ path: `.env/.${process.env.NODE_ENV}.env` });
import schema from './models/schema';
import resolvers from './resolvers/resolver';

const router = express.Router();
const app = express();
app.use(bodyPraser.json());
app.use(bodyPraser.urlencoded({ extended: false }));

import v1indexRouter from './routes/v1.index.router';

app.use(
	'/graphiql',
	graphqlHTTP({
		schema: schema,
		graphiql: true,
		rootValue: resolvers,
	})
);
router.use('/v1', v1indexRouter);
app.use('/', router);

app.listen(4000, () => {
	console.log('App Running');
});
