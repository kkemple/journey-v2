const {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
  gql,
} = require("apollo-server-lambda");
const { Listing, User, Company, Contact } = require("../db");
const jwt = require("jsonwebtoken");

const typeDefs = gql`
  type Query {
    listings: [Listing!]!
    companies: [Company!]!
    contacts: [Contact!]!
  }

  type Mutation {
    createListing(input: CreateListingInput!): Listing!
    updateListing(input: UpdateListingInput!): Listing!
    deleteListing(id: ID!): Listing!
    createContact(input: CreateContactInput!): ListingContact!
    removeContact(input: RemoveContactInput!): ListingContact!
  }

  input CreateListingInput {
    title: String!
    description: String
    url: String!
    notes: String
    newCompany: String
    companyId: ID
  }

  input UpdateListingInput {
    id: ID!
    title: String!
    description: String
    url: String!
    notes: String
    newCompany: String
    companyId: ID
  }

  input CreateContactInput {
    name: String!
    notes: String!
    listingId: ID!
  }

  input RemoveContactInput {
    id: ID!
    listingId: ID!
  }

  type Contact {
    id: ID!
    name: String!
    notes: String!
  }

  type ListingContact {
    contact: Contact!
    listingId: ID!
  }

  type Company {
    id: ID!
    name: String!
    listings: [Listing!]!
  }

  type Listing {
    id: ID!
    title: String!
    description: String
    url: String!
    notes: String
    company: Company
    contacts: [Contact!]!
  }
`;

const resolvers = {
  Listing: {
    company: (listing) => listing.getCompany(),
    contacts: (listing) => listing.getContacts(),
  },
  Query: {
    listings(_, __, { user }) {
      return user.getListings({
        order: [["id", "desc"]],
      });
    },
    companies: () => Company.findAll(),
    contacts: (_, __, { user }) => user.getContacts(),
  },
  Mutation: {
    async createContact(_, { input }, { user }) {
      const { listingId, ...rest } = input;
      const contact = await Contact.create({
        ...rest,
        userId: user.id,
      });

      await contact.addListing(listingId);
      return {
        contact,
        listingId,
      };
    },
    async removeContact(_, { input }, { user }) {
      const { id, listingId } = input;

      const listing = await Listing.findOne({
        where: {
          id: listingId,
          userId: user.id,
        },
      });

      if (!listing) {
        throw new ForbiddenError("You do not have access to this listing");
      }

      const contact = await Contact.findByPk(id);

      await listing.removeContact(contact);

      return { contact, listingId };
    },
    async createListing(_, args, { user }) {
      const { newCompany, ...input } = args.input;

      if (newCompany) {
        const company = await Company.create({ name: newCompany });
        input.companyId = company.id;
      }

      const listing = await Listing.create({
        ...input,
        userId: user.id,
      });

      return listing;
    },
    async updateListing(_, args, { user }) {
      const { id, ...input } = args.input;
      const listing = await Listing.findOne({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!listing) {
        throw new ForbiddenError("You do not have access to this listing");
      }

      return listing.update(input);
    },
    async deleteListing(_, { id }, { user }) {
      const listing = await Listing.findOne({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!listing) {
        throw new ForbiddenError("You do not have access to this listing");
      }

      await listing.destroy();
      return listing;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({ event }) {
    try {
      const token = event.headers.authorization.replace(/bearer\s+/i, "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new Error("User not found");
      }

      return { user };
    } catch (error) {
      throw new AuthenticationError("Unauthorized");
    }
  },
});

exports.handler = server.createHandler();
