const {ApolloServer, gql} = require('apollo-server');
const jwt = require('jsonwebtoken');
const resolvers = require('./resolvers');
const models = require('./models');
const typeDefs = gql`
  type User {
    id: String
    username: String
    role: String
  }
  type Show {
    id: String
    name: String
    starts_at: String
    ends_at: String
    redundancy: Int
    genres: [String]
    added_by: User
  }
  type Event {
    id: String
    name: String
    description: String
    starts_at: String
    ends_at: String
    genres: [String]
    facebook: String
    added_by: User
  }
  type Query {
    User(id: String): User
    Users: [User]
    Shows: [Show]
    Events: [Event]
    Stream: String
  }
  type Mutation {
    login(name: String!, password: String!): String
    register(name: String!, password: String!, role: String!): String
    add_show(
      name: String!
      starts_at: String!
      ends_at: String!
      redundancy: Int!
      genres: [String]
      color: String!
    ): String
    add_event(
      name: String!
      description: String
      starts_at: String!
      ends_at: String!
      genres: [String]
      facebook: String
    ): String
  }
`;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({req}) => {
    const header = req.headers.authorization || '';
    if (header) {
      const s = header.split(' ');
      if (s.length == 2 && s[0] == 'Bearer') {
        const token = s[1];
        if (!jwt.verify(token, process.env.JWT_SECRET))
          throw new Error('Invalid token');
        const content = jwt.decode(token);
        let user;
        await models.User.fetch(content.uid).then(res => {
          user = res;
        });
        return {
          authenticated: true,
          user,
          headers: req.headers,
        };
      }
    }
    return {authenticated: false, headers: req.headers};
  },
});
server.listen().then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});
