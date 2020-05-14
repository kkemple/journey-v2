import { gql } from "@apollo/client";

export const LISTING_FRAGMENT = gql`
  fragment ListingFragment on Listing {
    id
    url
    title
    description
    notes
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
