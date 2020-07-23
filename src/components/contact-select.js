import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Select } from "@chakra-ui/core";
import { GET_CONTACTS } from "../utils";

export default function ContactSelect({ children, ...props }) {
  const { data, loading, error } = useQuery(GET_CONTACTS);
  return (
    <Select isDisabled={loading || error} {...props}>
      {children}
      {data?.contacts.map((contact) => (
        <option key={contact.id} value={contact.id}>
          {contact.name}
        </option>
      ))}
    </Select>
  );
}
