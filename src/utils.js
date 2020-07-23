import { gql } from "@apollo/client";

export const CONTACT_FRAGMENT = gql`
  fragment ContactFragment on Contact {
    id
    name
    notes
  }
`;

export const LISTING_FRAGMENT = gql`
  fragment ListingFragment on Listing {
    id
    url
    title
    description
    notes
    company {
      name
      id
    }
    contacts {
      ...ContactFragment
    }
  }
  ${CONTACT_FRAGMENT}
`;

export const GET_LISTINGS = gql`
  {
    listings {
      ...ListingFragment
    }
  }
  ${LISTING_FRAGMENT}
`;

export const GET_CONTACTS = gql`
  query GetContacts {
    contacts {
      id
      name
    }
  }
`;
