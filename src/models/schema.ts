import { buildSchema } from 'graphql';

const movieSchema = buildSchema(`
  type Query {
    GetUser (AccessToken: String!) : UserProfile
  }

  type UserProfile {
    sub: String
    name: String
    username: String
    email: String
    phone: String
  }

`);

export default movieSchema;
