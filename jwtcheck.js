const jwt = require('jsonwebtoken');
const models = require('./models');
module.exports = async ({req}) => {
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
        req.user = res;
      });
      return {
        authenticated: true,
        user,
        headers: req.headers,
      };
    }
  }
  return {authenticated: false, headers: req.headers};
};
