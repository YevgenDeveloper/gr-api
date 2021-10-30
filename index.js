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
  type Query {
    User(id: String): User
    Users: [User]
  }
  type Mutation {
    login(name: String!, password: String!): String
    register(name: String!, password: String!, role: Int!): String
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
