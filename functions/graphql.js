const { ApolloServer, gql } = require("apollo-server-lambda");

const typeDefs = gql`
  type Query {
    listings: [Listing!]!
  }

  type Contact {
    id: ID!
    name: String!
    company: Company
    email: String
    note: String
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
    description: String!
    url: String!
    note: String
    company: Company!
    contacts: [Contact!]!
  }
`;

const resolvers = {
  Query: {
    listings() {
      return [
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
            listings: []
          },
          contacts: []
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
            listings: []
          },
          contacts: []
        }
      ];
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

exports.handler = server.createHandler();
