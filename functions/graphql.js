const {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
  gql,
} = require("apollo-server-lambda");
const { Listing, User } = require("../db");
const jwt = require("jsonwebtoken");

const typeDefs = gql`
  type Query {
    listings: [Listing!]!
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
    logo: String
    listings: [Listing!]!
    url: String
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
  Query: {
    listings(_, __, { user }) {
      return user.getListings({
        order: [["id", "desc"]],
      });
    },
  },
  Mutation: {
    createListing(_, { input }, { user }) {
      return Listing.create({ ...input, userId: user.id });
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
