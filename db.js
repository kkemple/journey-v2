const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING, {
  dialectOptions: {
    ssl: true,
  },
});

class User extends Sequelize.Model {}
User.init(
  {
    email: Sequelize.STRING,
    password: Sequelize.STRING,
  },
  {
    sequelize,
    modelName: "user",
  }
);

class Listing extends Sequelize.Model {}
Listing.init(
  {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    url: Sequelize.STRING,
    notes: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: "listing",
  }
);

Listing.belongsTo(User);
User.hasMany(Listing);

class Company extends Sequelize.Model {}
Company.init(
  {
    name: Sequelize.STRING,
  },
  {
    sequelize,
    modelName: "company",
  }
);

Listing.belongsTo(Company);
Company.hasMany(Listing);

exports.sequelize = sequelize;
exports.User = User;
exports.Listing = Listing;
exports.Company = Company;
