import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Select } from "@chakra-ui/core";

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
