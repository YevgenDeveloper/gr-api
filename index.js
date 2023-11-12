const express = require('express');
const {ApolloServer, gql} = require('apollo-server-express');
const jwtcheck = require('./src/jwtcheck');
const resolvers = require('./src/resolvers');
const models = require('./src/models');
const fileUpload = require('./src/fileUpload');
const soundcloud = require('./src/soundcloud');
const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }
  type User {
    id: String
    username: String
    role: String
  }
  type Stream {
    up: Boolean
    embed: String
    link: String
  }
  type Show {
    id: String
    name: String
    starts_at: String
    ends_at: String
    redundancy: Int
    dj: String
    genres: [String]
    added_by: User
  }
  type GoogleCalendarShows {
    id: String
    name: String
    starts_at: String
    ends_at: String
    redundancy: Int
    dj: String
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
    image: String
    added_by: User
  }
  type Resident {
    id: String
    name: String
    description: String
    facebook: String
    instagram: String
    raco: String
    soundcloud: String
    bandcamp: String
    website: String
    image: String
    added_by: User
  }
  type Tag {
    url: String
    name: String
    key: String
  }
  type Pic_Mix {
    medium: String
    large: String
    medium_mobile: String
  }
  type Mix {
    tags: [Tag]
    play_count: Int
    key: String
    slug: String
    pictures: Pic_Mix
  }
  type Mixes {
    mixes: [Mix]
    next: String
  }
  type Query {
    User(id: String): User
    Users: [User]
    Shows(start: String!): [Show]
    GoogleCalendarShows(start: String!, end: String): [GoogleCalendarShows]
    today_shows(start: String!): [Show]
    Events: [Event]
    Event(id: String): Event
    Residents: [Resident]
    Resident(name: String): Resident
    Stream: Stream
    Mixes: Mixes
    PrintShows: Boolean
    PrintEvents: Boolean
  }
  type Mutation {
    login(name: String!, password: String!): String
    register(
      name: String!
      password: String!
      role: String!
      who: String!
      whopass: String!
    ): String
    add_show(
      name: String!
      dj: String
      starts_at: String!
      ends_at: String!
      redundancy: Int!
      genres: [String]
    ): String
    del_show(id: String!): String
    modify_show(
      id: String!
      name: String!
      dj: String
      starts_at: String!
      ends_at: String!
      redundancy: Int!
      genres: [String]
    ): String
    add_event(
      name: String!
      description: String
      starts_at: String!
      ends_at: String!
      genres: [String]
      facebook: String
    ): String
    modify_event(
      id: String!
      name: String!
      description: String
      starts_at: String!
      ends_at: String!
      genres: [String]
      facebook: String
    ): String
    add_resident(
      name: String!
      description: String
      facebook: String
      instagram: String
      raco: String
      soundcloud: String
      bandcamp: String
      website: String
    ): String
    modify_resident(
      id: String!
      name: String!
      description: String
      facebook: String
      instagram: String
      raco: String
      soundcloud: String
      bandcamp: String
      website: String
    ): String
    delete_event(id: String!): String
    delete_resident(id: String!): String
    print_events(state: Boolean!): Boolean
    print_shows(state: Boolean!): Boolean
  }
`;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: process.env.NODE_ENV != 'production',
  context: async ({req}) => {
    return jwtcheck({req});
  },
});
const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE, GET');
    return res.status(200).json({});
  } else {
    res.header('Cache-Control', `public, max-age=${3600 * 24}`);
  }
  next();
});
app.use('/upload', fileUpload);
app.use('/sounds', soundcloud);
server.applyMiddleware({app});
app.listen({port: 4000}, () =>
  console.log(`Server ready at http:
);
