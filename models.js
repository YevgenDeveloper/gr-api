const pool = require('./pool');
const User = {
  fetch(id) {
    return new Promise((resolve, reject) => {
      resolve({
        id: 'hello ' + id
      });
    });
  },
  async login(username) {
    pool.query('select * from Users', (err, res) => {
      console.log(err);
    });
    return 'jwt';
  }
};
module.exports = {
  User,
};
