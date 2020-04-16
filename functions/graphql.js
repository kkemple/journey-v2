const { ApolloServer, gql } = require("apollo-server-lambda");

const typeDefs = gql`
  type Query {
    listings: [Listing!]!
  }

  type Mutation {
    createListing(input: CreateListingInput!): Listing!
  }

  input CreateListingInput {
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

const mockData = [
  {
    id: 1,
    title: "Software Developer",
    description:
      "This candidate should have a strong grasp on developing software",
    url: "https://myjobboard.com/acme/software-developer.php",
    note: null,
    company: {
      id: 1,
      name: "Acme Inc.",
      url: "https://acme.com",
      listings: [],
    },
    contacts: [],
  },
  {
    id: 2,
    title: "Developer Advocate",
    description:
      "This candidate should have a strong grasp on developer advocacy",
    url: "https://myjobboard.com/acme/developer-advocate.php",
    note: null,
    company: {
      id: 1,
      name: "Acme Inc.",
      url: "https://acme.com",
      listings: [],
    },
    contacts: [],
  },
];

const resolvers = {
  Query: {
    listings() {
      return mockData;
    },
  },
  Mutation: {
    createListing(_, params, context) {
      console.log(params);
      return { ...mockData[0], ...params.input, id: 3 };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler();
