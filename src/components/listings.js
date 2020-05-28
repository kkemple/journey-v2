import React from "react";
import { useQuery } from "@apollo/client";
import { Box, Flex, Heading, Text } from "@chakra-ui/core";
import { Link } from "gatsby";

import { GET_LISTINGS } from "../utils";
import ListingMenu from "./listing-menu";

export default function Listings() {
  const { data, loading, error } = useQuery(GET_LISTINGS);

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
          <Flex>
            <ListingMenu listing={listing} />
            <Box ml="4">
              <Heading>
                <Link href={listing.url}>{listing.title}</Link>
              </Heading>
              {listing.description && <Text>{listing.description}</Text>}
              {listing.company && <Text>{listing.company.name}</Text>}
            </Box>
          </Flex>
        </Box>
      ))}
    </>
  );
}
