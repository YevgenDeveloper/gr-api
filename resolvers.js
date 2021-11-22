const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const models = require('./models');
const ytkey = require('./ytapi.json');
const secret = process.env.JWT_SECRET;
module.exports = {
  Query: {
    User: (_, {id}) =>
      models.User.fetch(id)
        .then(res => {
          return res;
        })
        .catch(err => {
          throw new Error(err.error);
        }),
    Users: async (_, {}, {dataSources, authenticated, user, headers}) => {
      if (authenticated && user.role == 'admin') return models.User.users();
    },
    Shows: (_, {}) => {
      return models.Show.fetch();
    },
    Events: (_, {}) => {
      return models.Event.fetch();
    },
    Stream: async (_, {}) => {
      return await axios
        .get(ytkey.live)
        .then(res => {
          return {
            up: true,
            embed: `https:
              res.data.items[0].id.videoId
            }`,
            link: `https:
              res.data.items[0].id.videoId
            }`,
          };
        })
        .catch(() => {
          return {up: false, embed: '', link: ''};
        });
    },
  },
  Mutation: {
    login: async (_, {name, password}) => {
      try {
        const user = await models.User.login(name, password);
        return jwt.sign({uid: user.id, role: user.role}, secret, {
          expiresIn: '2h',
        });
      } catch (e) {
        throw new Error('Bad credentials');
      }
    },
    register: async (
      _,
      {name, password, role, who, whopass},
      {dataSources, authenticated, user, headers},
    ) => {
      const hash = bcrypt.hashSync(password, 8);
      try {
        const uid = await models.User.register(name, hash, role, who, whopass);
        return `User ${name} was successfully added to database!`;
      } catch (e) {
        console.log(e);
        throw new Error(e);
      }
    },
    add_show: async (
      _,
      {name, starts_at, ends_at, redundancy, genres, color},
      {dataSources, authenticated, user, headers},
    ) => {
      if (authenticated) {
        const id = models.Show.post(
          name,
          starts_at,
          ends_at,
          genres,
          redundancy,
          color,
          user.id,
        );
        return id;
      }
      return null;
    },
  },
};
