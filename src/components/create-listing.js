import React, { useState } from "react";
import { gql } from "@apollo/client";
import ListingForm from "./listing-form";
import {
  ModalCloseButton,
  Modal,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  Button,
} from "@chakra-ui/core";
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
  const [modalOpen, setModalOpen] = useState(false);

  function closeModal() {
    setModalOpen(false);
  }

  function openModal() {
    setModalOpen(true);
  }

  return (
    <>
      <Button mr="2" onClick={openModal} variantColor="purple" size="sm">
        Create listing
      </Button>
      <Modal isOpen={modalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create listing</ModalHeader>
          <ModalCloseButton />
          <ListingForm
            buttonText="Create Listing"
            onCancel={closeModal}
            mutation={CREATE_LISTING}
            mutationOptions={{
              onCompleted: closeModal,
              update: (cache, { data }) => {
                // TODO: update companies too
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
        </ModalContent>
      </Modal>
    </>
  );
}
