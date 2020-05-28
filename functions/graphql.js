const {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
  gql,
} = require("apollo-server-lambda");
const { Listing, User, Company } = require("../db");
const jwt = require("jsonwebtoken");

const typeDefs = gql`
  type Query {
    listings: [Listing!]!
    companies: [Company!]!
  }

  type Mutation {
    createListing(input: CreateListingInput!): Listing!
    updateListing(input: UpdateListingInput!): Listing!
    deleteListing(id: ID!): Listing!
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
  }

  type Contact {
    id: ID!
    name: String!
    company: Company
    email: String
    notes: String
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
  },
  Query: {
    listings(_, __, { user }) {
      return user.getListings({
        order: [["id", "desc"]],
      });
    },
    companies: () => Company.findAll(),
  },
  Mutation: {
    async createListing(_, args, { user }) {
      const { newCompany, ...input } = args.input;

      if (newCompany) {
        const company = await Company.create({ name: newCompany });
        input.companyId = company.id;
      }

      return Listing.create({
        ...input,
        userId: user.id,
      });
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
