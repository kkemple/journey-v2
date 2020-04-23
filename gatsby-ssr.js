import React from "react";
import {
  ApolloProvider,
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import fetch from "isomorphic-fetch";

const httpLink = new HttpLink({
  fetch,
  uri: "/.netlify/functions/graphql",
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("journey:token");
  if (token) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return forward(operation);
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
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
