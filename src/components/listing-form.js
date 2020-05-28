import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Input,
  Button,
  Stack,
  Select,
  Text,
  Textarea,
  ModalFooter,
  ModalBody,
} from "@chakra-ui/core";
import { AnimatePresence, motion } from "framer-motion";

export default function ListingForm(props) {
  const [mutate, { loading, error }] = useMutation(
    props.mutation,
    props.mutationOptions
  );

  const [company, setCompany] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const { title, description, url, notes, newCompany } = event.target;

    const input = {
      id: props.listing?.id,
      title: title.value,
      description: description.value,
      url: url.value,
      notes: notes.value,
    };

    if (newCompany) {
      input.newCompany = newCompany.value;
    } else if (company) {
      input.companyId = company;
    }

    mutate({ variables: { input } });
  };

  function handleCompanyChange(event) {
    setCompany(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
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
        <Select value={company} onChange={handleCompanyChange}>
          <option>Select a company</option>
          <option value="new">Create new company</option>
          {/* TODO: loop through existing companies */}
        </Select>
        <AnimatePresence>
          {company === "new" && (
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
              <Input autoFocus placeholder="Company name" name="newCompany" />
            </motion.div>
          )}
        </AnimatePresence>
      </ModalBody>
      <ModalFooter>
        <Button mr="2" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button variantColor="purple" isLoading={loading} type="submit">
          {props.buttonText}
        </Button>
      </ModalFooter>
    </form>
  );
}
