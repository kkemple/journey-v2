import React from "react";
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import fetch from "isomorphic-fetch";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    fetch,
    uri: "/.netlify/functions/graphql",
  }),
  resolvers: {
    Query: {
      isLoggedIn() {
        const token = localStorage.getItem("journey:token");
        return Boolean(token);
      },
    },
  },
});

export const wrapRootElement = ({ element }) => (
  <ApolloProvider client={client}>{element}</ApolloProvider>
);
