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

class Contact extends Sequelize.Model {}
Contact.init(
  {
    name: Sequelize.STRING,
    notes: Sequelize.TEXT,
  },
  {
    sequelize,
    modelName: "contact",
  }
);

Contact.belongsTo(User);
User.hasMany(Contact);

class Listing extends Sequelize.Model {
  async createAndAddContacts(contactsInput) {
    const contacts = await Contact.bulkCreate(contactsInput, {
      returning: true,
    });

    const user = await this.getUser();
    return Promise.all([
      user.addContacts(contacts),
      this.addContacts(contacts),
    ]);
  }
}

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

Listing.belongsToMany(Contact, { through: "listing_contacts" });
Contact.belongsToMany(Listing, { through: "listing_contacts" });

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

sequelize.sync();

exports.sequelize = sequelize;
exports.User = User;
exports.Listing = Listing;
exports.Company = Company;
exports.Contact = Contact;
