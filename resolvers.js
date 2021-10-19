const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const models = require('./models');
const secret = process.env.JWT_SECRET;
const expose = item => Object.assign(item, item.serialize({shallow: true}));
module.exports = {
  Query: {
    User: (_, {id}) =>
      models.User.fetch(id).then(res => {
        return res;
      }),
  },
  Mutation: {
    login: async (_, {username, password}, {dataSources}) => {
      try {
        const user = await models.User.login(username);
        return user;
        if (!(await bcrypt.compare(password, user.get('password')))) {
          throw new Error('bad credentials');
        }
        return jwt.sign({uid: user.get('id')}, secret, {expiresIn: '2h'});
      } catch (e) {
        throw new Error('login failed');
      }
    },
    register: async (_, {username, password}, {dataSources}) => {
      const hash = bcrypt.hashSync(password, 8);
      try {
        const user = await new models.User({
          name: username,
          password: hash,
        }).save();
        return jwt.sign({uid: user.get('id')}, secret, {expiresIn: '2h'});
      } catch (e) {
        throw new Error('could not create user: it may already exists');
      }
    },
  },
};
