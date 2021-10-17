const pool = require('./pool');
const User = {
  fetch(id) {
    return new Promise((resolve, reject) => {
      resolve({
        id: 'hello ' + id
      });
    });
  },
};
module.exports = {
  User,
};
