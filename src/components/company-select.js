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

export default function CompanySelect({ children, ...props }) {
  const { data, loading, error } = useQuery(GET_COMPANIES);
  return (
    <Select isDisabled={loading || error} {...props}>
      {children}
      {data?.companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </Select>
  );
}
