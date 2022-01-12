const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const models = require('./models');
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
    today_shows: (_, {start}) => {
      const s = new Date(start);
      if (s === 'Invalid Date' || isNaN(s)) {
        throw new Error('Please enter valid dates');
      }
      return models.Show.getday({start});
    },
    Shows: (_, {start}) => {
      const s = new Date(start);
      if (s === 'Invalid Date' || isNaN(s)) {
        throw new Error('Please enter valid dates');
      }
      return models.Show.fetch({start});
    },
    Events: (_, {}) => {
      return models.Event.fetch();
    },
    Event: (_, {id}) => {
      return models.Event.getone({id});
    },
    Stream: async (_, {}) => {
      return await axios
        .get(
          `https:
            process.env.YT_CHANNEL
          }&eventType=live&type=video&key=${process.env.GOOGLE_KEY}`,
        )
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
    Mixes: async (_, {}) => {
      return await axios
        .get(`https:
        .then(res => {
          return {
            next: res.data.paging.next,
            mixes: res.data.data,
          };
          return res.data;
        })
        .catch(() => {
          return null;
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
      {name, dj, starts_at, ends_at, redundancy, genres},
      {dataSources, authenticated, user, headers},
    ) => {
      if (authenticated) {
        return models.Show.post({
          name,
          dj,
          starts_at,
          ends_at,
          genres,
          redundancy,
          uid: user.id,
        });
      }
      return null;
    },
    del_show: async (_, {id}, {authenticated}) => {
      if (authenticated) {
        return models.Show.delete({id});
      }
      return null;
    },
    modify_show: async (
      _,
      {id, name, dj, starts_at, ends_at, redundancy, genres},
      {authenticated, user},
    ) => {
      if (authenticated) {
        return models.Show.modify({
          id,
          name,
          dj,
          starts_at,
          ends_at,
          genres,
          redundancy,
          uid: user.id,
        });
      }
      return null;
    },
    add_event: async (
      _,
      {name, description, starts_at, ends_at, genres, facebook},
      {authenticated, user},
    ) => {
      if (authenticated)
        return models.Event.post({
          name,
          description,
          starts_at,
          ends_at,
          genres,
          facebook,
          uid: user.id,
        });
      return null;
    },
  },
};
