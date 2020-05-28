import React from "react";
import { useQuery } from "@apollo/client";
import { Box, Flex, Heading, Text } from "@chakra-ui/core";
import { AnimatePresence, motion } from "framer-motion";

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
    <AnimatePresence initial={false}>
      {data.listings.map((listing) => (
        <motion.div
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0.5,
            opacity: 0,
          }}
          initial={{
            scale: 0.5,
            opacity: 0,
          }}
          key={listing.id}
        >
          <Box p="4">
            <Flex>
              <ListingMenu listing={listing} />
              <Box ml="4">
                <Heading>
                  <a href={listing.url}>{listing.title}</a>
                </Heading>
                {listing.description && <Text>{listing.description}</Text>}
                {listing.company && <Text>{listing.company.name}</Text>}
              </Box>
            </Flex>
          </Box>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
