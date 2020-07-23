import React, { useState } from "react";
import {
  Button,
  Stack,
  ModalBody,
  ModalFooter,
  Textarea,
  Input,
  Text,
} from "@chakra-ui/core";
import { AnimatePresence, motion } from "framer-motion";
import ContactSelect from "./contact-select";
import { gql, useMutation } from "@apollo/client";
import { CONTACT_FRAGMENT, GET_CONTACTS, GET_LISTINGS } from "../utils";

function CreateOrSelectContact(props) {
  const [contactId, setContactId] = useState("");

  function handleContactChange(event) {
    setContactId(event.target.value);
  }

  return (
    <AnimatePresence>
      <Stack {...props}>
        <ContactSelect
          name="contactId"
          value={contactId}
          onChange={handleContactChange}
        >
          <option value="">Select a contact</option>
          <option value="new">Create new contact</option>
        </ContactSelect>
        {contactId === "new" && (
          <motion.div
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -10,
              opacity: 0,
            }}
            initial={{
              y: -10,
              opacity: 0,
            }}
          >
            <Stack {...props}>
              <Input placeholder="Contact name" name="name" />
              <Textarea placeholder="Contact notes" name="notes" />
            </Stack>
          </motion.div>
        )}
      </Stack>
    </AnimatePresence>
  );
}

const CREATE_CONTACT = gql`
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) {
      listingId
      contact {
        ...ContactFragment
      }
    }
  }
  ${CONTACT_FRAGMENT}
`;

export default function ContactForm(props) {
  const [createContact, { loading, error }] = useMutation(CREATE_CONTACT, {
    onCompleted: props.onCompleted,
    update(cache, { data }) {
      const { listingId, contact } = data.createContact;

      const { listings } = cache.readQuery({ query: GET_LISTINGS });
      cache.writeQuery({
        query: GET_LISTINGS,
        data: {
          listings: listings.map((listing) => {
            if (listing.id !== listingId) {
              return listing;
            }

            return {
              ...listing,
              contacts: [...listing.contacts, contact],
            };
          }),
        },
      });

      const { contacts } = cache.readQuery({ query: GET_CONTACTS });
      cache.writeQuery({
        query: GET_CONTACTS,
        data: {
          contacts: [...contacts, contact],
        },
      });
    },
  });

  function handleSubmit(event) {
    event.preventDefault();
    const { contactId, name, notes } = event.target;
    if (contactId.value === "new") {
      createContact({
        variables: {
          input: {
            name: name.value,
            notes: notes.value,
            listingId: props.listingId,
          },
        },
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        {error && <Text>{error.message}</Text>}
        <CreateOrSelectContact />
      </ModalBody>
      <ModalFooter>
        <Button isLoading={loading} type="submit">
          Add contact
        </Button>
      </ModalFooter>
    </form>
  );
}
