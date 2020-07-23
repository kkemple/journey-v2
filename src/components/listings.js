import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Box,
  Flex,
  Button,
  Heading,
  Text,
  Stack,
  FormLabel,
  Tag,
  TagLabel,
  Modal,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/core";
import { AnimatePresence, motion } from "framer-motion";
import { GET_LISTINGS } from "../utils";
import ListingMenu from "./listing-menu";
import CompanySelect from "./company-select";
import ContactForm from "./contact-form";
import RemoveContactButton from "./remove-contact-button";

function AddContactButton(props) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <Button
        my="1"
        rounded="full"
        variant="outline"
        variantColor="purple"
        size="sm"
        fontSize="md"
        onClick={onOpen}
      >
        Add contact
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a contact</ModalHeader>
          <ModalCloseButton />
          <ContactForm onCompleted={onClose} listingId={props.listingId} />
        </ModalContent>
      </Modal>
    </>
  );
}

export default function Listings() {
  const { data, loading, error } = useQuery(GET_LISTINGS);
  const [filter, setFilter] = useState("");

  if (loading) return <div>Loading the universe...</div>;
  if (error) {
    return (
      <>
        <div>Universe broken...</div>
        <p>{error.message}</p>
      </>
    );
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  return (
    <>
      <Box>
        <FormLabel>Filter:</FormLabel>
        <CompanySelect value={filter} onChange={handleFilterChange}>
          <option value="">All Companies</option>
        </CompanySelect>
      </Box>
      <AnimatePresence initial={false}>
        {data.listings
          .filter((listing) => !filter || listing.company?.id === filter)
          .map((listing) => (
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
                    {!!listing.contacts.length && (
                      <Stack isInline as="ul" flexWrap="wrap">
                        {listing.contacts.map((contact) => (
                          <Tag
                            key={contact.id}
                            rounded="full"
                            variant="solid"
                            variantColor="purple"
                            my="1"
                          >
                            <TagLabel>{contact.name}</TagLabel>
                            <RemoveContactButton
                              input={{
                                id: contact.id,
                                listingId: listing.id,
                              }}
                            />
                          </Tag>
                        ))}
                        <AddContactButton listingId={listing.id} />
                      </Stack>
                    )}
                  </Box>
                </Flex>
              </Box>
            </motion.div>
          ))}
      </AnimatePresence>
    </>
  );
}
