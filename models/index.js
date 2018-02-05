const Sequelize = require('sequelize');

const scheme = require('./scheme');

const Op = Sequelize.Op;

const sequelize = new Sequelize(
  null, null, null,
  {
    dialect: 'sqlite',
    storage: 'db.sqlite3',
    peratorsAliases: {
      $and: Op.and
    },
    logging: false,
    operatorsAliases: false
  }
);

scheme(sequelize);
sequelize.sync();

module.exports.sequelize = sequelize;
module.exports.models = sequelize.models;
