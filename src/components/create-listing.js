import React, { useRef } from "react";
import { gql } from "@apollo/client";
import ListingForm from "./listing-form";
import { Box, Heading } from "@chakra-ui/core";
import { GET_LISTINGS, LISTING_FRAGMENT } from "../utils";

const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      ...ListingFragment
    }
  }
  ${LISTING_FRAGMENT}
`;

export default function CreateListing() {
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
            const { listings } = cache.readQuery({ query: GET_LISTINGS });
            cache.writeQuery({
              query: GET_LISTINGS,
              data: {
                listings: [data.createListing, ...listings],
              },
            });
          },
        }}
      />
    </Box>
  );
}
