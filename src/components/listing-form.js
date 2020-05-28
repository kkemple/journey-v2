import React, { useState } from "react";
import { useMutation, gql, useQuery } from "@apollo/client";
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

const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
    }
  }
`;

function CompanySelect() {
  const { data, loading, error } = useQuery(GET_COMPANIES);
  const [companyId, setCompanyId] = useState("");

  function handleCompanyChange(event) {
    setCompanyId(event.target.value);
  }

  const isCreatingCompany = companyId === "new";
  return (
    <>
      <Select
        isDisabled={loading || error}
        name="companyId"
        value={companyId}
        onChange={handleCompanyChange}
        mb={isCreatingCompany ? 2 : 0}
      >
        <option>Select a company</option>
        <option value="new">Create new company</option>
        {data?.companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </Select>
      <AnimatePresence>
        {isCreatingCompany && (
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
    </>
  );
}

export default function ListingForm(props) {
  const [mutate, { loading, error }] = useMutation(
    props.mutation,
    props.mutationOptions
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const {
      title,
      description,
      url,
      notes,
      newCompany,
      companyId,
    } = event.target;

    const input = {
      id: props.listing?.id,
      title: title.value,
      description: description.value,
      url: url.value,
      notes: notes.value,
    };

    if (newCompany) {
      input.newCompany = newCompany.value;
    } else if (companyId.value) {
      input.companyId = companyId.value;
    }

    mutate({ variables: { input } });
  };

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
        <CompanySelect />
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
