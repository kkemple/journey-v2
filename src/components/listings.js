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
