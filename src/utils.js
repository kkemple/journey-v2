import { gql } from "@apollo/client";

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
  }
`;

export const GET_LISTINGS = gql`
  {
    listings {
      ...ListingFragment
    }
  }
  ${LISTING_FRAGMENT}
`;
