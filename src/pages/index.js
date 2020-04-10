import React, { useState } from "react";
import { useQuery, useApolloClient, gql } from "@apollo/client";
import { Box, Input, Button, Heading, Text, Link } from "@chakra-ui/core";
import { Helmet } from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";

const LOGGED_IN_QUERY = gql`
  {
    isLoggedIn @client
  }
`;

function JobListings() {
  const { data, loading, error } = useQuery(gql`
    {
      listings {
        id
        title
        description
        url
        company {
          name
          url
        }
      }
    }
  `);

  if (loading) return <div>Loading the universe...</div>;
  if (error) {
    return (
      <>
        <div>Universe broken...</div>
        <p>{error.message}</p>
      </>
    );
  }

  return (
    <>
      {data.listings.map((listing) => (
        <Box key={listing.id} p="4">
          <Heading mb="2">
            <Link href={listing.url}>{listing.title}</Link>
          </Heading>
          <Text>
            {listing.company.url ? (
              <Link href={listing.company.url}>{listing.company.name}</Link>
            ) : (
              listing.company.name
            )}
          </Text>
          <Text>{listing.description}</Text>
        </Box>
      ))}
    </>
  );
}

function LoginForm() {
  const client = useApolloClient();

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await fetch("/.netlify/functions/auth", {
      headers: {
        Authorization: `Basic ${btoa(
          `${event.target.email.value}:${event.target.password.value}`
        )}`,
      },
    });

    if (response.ok) {
      const token = await response.text();
      localStorage.setItem("journey:token", token);
      client.writeQuery({
        query: LOGGED_IN_QUERY,
        data: { isLoggedIn: true },
      });
    }

    // TODO: handle errors
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input placeholder="Email" type="email" name="email" />
      <Input placeholder="Password" type="password" name="password" />
      <Button type="submit">Log in</Button>
    </form>
  );
}

export default function Index() {
  const { data, loading, error, client } = useQuery(LOGGED_IN_QUERY);

  const { site } = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  );

  const { title } = site.siteMetadata;
  const isLoggedIn = data?.isLoggedIn;

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box as="header" py="3" px="4" bg="gray.100">
        {title}
      </Box>
      {isLoggedIn ? (
        <>
          <Button
            onClick={() => {
              localStorage.removeItem("journey:token");
              client.writeQuery({
                query: LOGGED_IN_QUERY,
                data: { isLoggedIn: false },
              });
            }}
          >
            Log Out
          </Button>
          <JobListings />
        </>
      ) : (
        <LoginForm />
      )}
    </>
  );
}
