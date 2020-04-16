import React, { useState } from "react";
import { useQuery, useApolloClient, gql } from "@apollo/client";
import {
  Box,
  Flex,
  Input,
  Button,
  Stack,
  Heading,
  Text,
  Link,
} from "@chakra-ui/core";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

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
      client.resetStore();
    } else {
      const error = await response.text();
      setError(new Error(error));
      setLoading(false);
    }
  }

  return (
    <Flex h="100vh" align="center" justify="center" bg="white">
      <Stack
        p="8"
        rounded="lg"
        shadow="33px 33px 86px #e6e6e6,
        -33px -33px 86px #ffffff"
        maxW="320px"
        w="full"
        as="form"
        spacing="4"
        bg="white"
        onSubmit={handleSubmit}
      >
        <Heading textAlign="center" fontSize="xl" pb="2">
          Journey (v2)
        </Heading>
        {error && <Text color="red.500">{error.message}</Text>}
        <Input placeholder="Email" type="email" name="email" />
        <Input placeholder="Password" type="password" name="password" />
        <Button mt="2" ml="auto" isLoading={loading} type="submit">
          Log in
        </Button>
      </Stack>
    </Flex>
  );
}

export default function Index() {
  const { data, client } = useQuery(LOGGED_IN_QUERY);

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
      {isLoggedIn ? (
        <>
          <Box as="header" py="3" px="4" bg="gray.100">
            {title}
          </Box>
          <Button
            onClick={() => {
              localStorage.removeItem("journey:token");
              client.resetStore();
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
