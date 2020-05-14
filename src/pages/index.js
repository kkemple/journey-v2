import React, { useState } from "react";
import { useQuery, useApolloClient, gql, useMutation } from "@apollo/client";
import {
  Box,
  Flex,
  Input,
  Button,
  Stack,
  Heading,
  Text,
  Textarea,
  Link,
  useToast,
} from "@chakra-ui/core";
import { Helmet } from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";
import {
  uniqueNamesGenerator,
  animals,
  adjectives,
} from "unique-names-generator";

const LOGGED_IN_QUERY = gql`
  {
    isLoggedIn @client
  }
`;

const LISTING_FRAGMENT = gql`
  fragment ListingFragment on Listing {
    id
    url
    title
    description
    notes
  }
`;

const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      ...ListingFragment
    }
  }
  ${LISTING_FRAGMENT}
`;

const DELETE_LISTING = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id) {
      ...ListingFragment
    }
  }
  ${LISTING_FRAGMENT}
`;

const JOB_LISTINGS = gql`
  {
    listings {
      ...ListingFragment
    }
  }
  ${LISTING_FRAGMENT}
`;

function DeleteButton({ id }) {
  const toast = useToast();
  const [deleteListing, { loading }] = useMutation(DELETE_LISTING, {
    variables: { id },
    onCompleted(data) {
      toast({
        title: "Listing deleted",
        description: `${data.deleteListing.title} was deleted`,
        status: "success",
      });
    },
    update: (cache, { data }) => {
      const { listings } = cache.readQuery({
        query: JOB_LISTINGS,
      });

      cache.writeQuery({
        query: JOB_LISTINGS,
        data: {
          listings: listings.filter(
            (listing) => listing.id !== data.deleteListing.id
          ),
        },
      });
    },
  });

  return (
    <Button
      isDisabled={loading}
      leftIcon="delete"
      onClick={() => {
        if (global.confirm("Are you sure?")) {
          deleteListing();
        }
      }}
    >
      Delete
    </Button>
  );
}

function JobListings() {
  const { data, loading, error } = useQuery(JOB_LISTINGS);

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
          {listing.description && <Text>{listing.description}</Text>}
          <DeleteButton id={listing.id} />
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
        shadow="-16px 16px 32px #ededed, 16px -16px 32px #ffffff"
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

const CreateJobListing = () => {
  const [createListing, { loading, error, data }] = useMutation(CREATE_LISTING);

  const handleSubmit = (event) => {
    event.preventDefault();

    const { title, description, url, notes } = event.target;

    const input = {
      title:
        title.value ||
        uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          length: 2,
          separator: " ",
        }),
      description: description.value,
      url: url.value,
      notes: notes.value,
    };

    createListing({
      variables: { input },
      update: (cache, { data }) => {
        const { listings } = cache.readQuery({ query: JOB_LISTINGS });
        cache.writeQuery({
          query: JOB_LISTINGS,
          data: {
            listings: [...listings, data.createListing],
          },
        });
      },
    });
  };

  return (
    <Box maxW="480px" w="full" mt="8" mx="4">
      <Heading mb="4" fontSize="md">
        Create New Listing
      </Heading>
      <Stack as="form" onSubmit={handleSubmit}>
        <Input type="text" name="title" placeholder="Job Title" />
        <Input type="text" name="description" placeholder="Job Description" />
        <Input isRequired type="url" name="url" placeholder="Listing URL" />
        <Textarea name="notes" placeholder="Notes" />
        <Button mt="2" mr="auto" isLoading={loading} type="submit">
          Create Listing
        </Button>
      </Stack>
    </Box>
  );
};

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
          <Flex
            as="header"
            justify="space-between"
            align="center"
            px="4"
            bg="gray.100"
            h="12"
          >
            <Heading fontSize="lg">{title}</Heading>
            <Button
              size="sm"
              onClick={() => {
                localStorage.removeItem("journey:token");
                client.resetStore();
              }}
            >
              Log Out
            </Button>
          </Flex>
          <CreateJobListing />
          <JobListings />
        </>
      ) : (
        <LoginForm />
      )}
    </>
  );
}
