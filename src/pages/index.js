import React, { useState, useRef } from "react";
import { useQuery, useApolloClient, gql, useMutation } from "@apollo/client";
import {
  Box,
  Flex,
  Input,
  Button,
  Stack,
  Heading,
  Text,
  IconButton,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  ModalBody,
  ModalOverlay,
  ModalContent,
  Link,
  useToast,
} from "@chakra-ui/core";
import { Helmet } from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";

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

const UPDATE_LISTING = gql`
  mutation UpdateListing($input: UpdateListingInput!) {
    updateListing(input: $input) {
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
    <MenuItem
      isDisabled={loading}
      onClick={() => {
        if (global.confirm("Are you sure?")) {
          deleteListing();
        }
      }}
    >
      Delete listing
    </MenuItem>
  );
}

function ListingMenu(props) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  function closeModal() {
    setModalOpen(false);
  }

  return (
    <>
      <Menu>
        <MenuButton as={IconButton} icon="chevron-down" />
        <MenuList>
          <MenuItem onClick={() => setModalOpen(true)}>Update listing</MenuItem>
          <DeleteButton id={props.listing.id} />
        </MenuList>
      </Menu>
      <Modal isOpen={modalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update listing</ModalHeader>
          <ModalCloseButton />
          <ListingForm
            listing={props.listing}
            buttonText="Save changes"
            mutation={UPDATE_LISTING}
            mutationOptions={{
              onCompleted(data) {
                closeModal();
                toast({
                  title: "Listing updated",
                  description: `${data.updateListing.title} has been updated`,
                  status: "success",
                });
              },
            }}
          >
            <Button mr="2" onClick={closeModal}>
              Cancel
            </Button>
          </ListingForm>
        </ModalContent>
      </Modal>
    </>
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
          <Flex align="center" mb="2">
            <Heading mr="4">
              <Link href={listing.url}>{listing.title}</Link>
            </Heading>
            <ListingMenu listing={listing} />
          </Flex>
          {listing.description && <Text>{listing.description}</Text>}
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

function ListingForm(props) {
  const [mutate, { loading, error }] = useMutation(
    props.mutation,
    props.mutationOptions
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const { title, description, url, notes } = event.target;

    const input = {
      id: props.listing?.id,
      title: title.value,
      description: description.value,
      url: url.value,
      notes: notes.value,
    };

    mutate({ variables: { input } });
  };

  return (
    <form ref={props.formRef} onSubmit={handleSubmit}>
      <ModalBody as={Stack}>
        {error && <Text color="red.500">{error.message}</Text>}
        <Input
          isRequired
          defaultValue={props.listing?.title}
          type="text"
          name="title"
          placeholder="Job Title"
        />
        <Input
          defaultValue={props.listing?.description}
          type="text"
          name="description"
          placeholder="Job Description"
        />
        <Input
          defaultValue={props.listing?.url}
          isRequired
          type="url"
          name="url"
          placeholder="Listing URL"
        />
        <Textarea
          defaultValue={props.listing?.notes}
          name="notes"
          placeholder="Notes"
        />
      </ModalBody>
      <ModalFooter>
        {props.children}
        <Button variantColor="purple" isLoading={loading} type="submit">
          {props.buttonText}
        </Button>
      </ModalFooter>
    </form>
  );
}

const CreateJobListing = () => {
  const formRef = useRef();
  return (
    <Box maxW="480px" w="full" mt="8" mx="4">
      <Heading mb="4" fontSize="md">
        Create New Listing
      </Heading>
      <ListingForm
        formRef={formRef}
        buttonText="Create Listing"
        mutation={CREATE_LISTING}
        mutationOptions={{
          onCompleted: () => formRef.current.reset(),
          update: (cache, { data }) => {
            const { listings } = cache.readQuery({ query: JOB_LISTINGS });
            cache.writeQuery({
              query: JOB_LISTINGS,
              data: {
                listings: [data.createListing, ...listings],
              },
            });
          },
        }}
      />
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
          <Box maxW="containers.md" mx="auto">
            <CreateJobListing />
            <JobListings />
          </Box>
        </>
      ) : (
        <LoginForm />
      )}
    </>
  );
}
