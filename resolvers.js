const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
      if (authenticated && user.role == 1) return models.User.users();
    },
    Shows: (_, {}) => {
      return models.Show.fetch();
    }
  },
  Mutation: {
    login: async (_, {name, password}) => {
      try {
        const user = await models.User.login(name);
        if (!(await bcrypt.compare(password, user.password))) {
          throw new Error('Bad credentials');
        }
        return jwt.sign({uid: user.id}, secret, {expiresIn: '2h'});
      } catch (e) {
        throw new Error('Login failed');
      }
    },
    register: async (_, {name, password, role}) => {
      const hash = bcrypt.hashSync(password, 8);
      try {
        const uid = await models.User.register(name, hash, role);
        return jwt.sign({uid: uid, role: role}, secret, {expiresIn: '2h'});
      } catch (e) {
        throw new Error('Could not create user, it may already exists');
      }
    },
  },
};
