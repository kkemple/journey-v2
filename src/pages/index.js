import React from "react";
import { useQuery, gql } from "@apollo/client";
import { Box, Heading, Text, Link } from "@chakra-ui/core";
import { Helmet } from "react-helmet";
import { graphql, useStaticQuery } from "gatsby";

export default function Index() {
  const { site } = useStaticQuery(
    graphql`
      {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  );

  const { data, loading, error } = useQuery(gql`
    {
      listings {
        id
        title
        description
        url
        company {
          name
          url
        }
      }
    }
  `);

  if (loading) return <div>Loading the universe...</div>;
  if (error) {
    return (
      <>
        <div>Universe broken...</div>
        <p>{error.message}</p>
      </>
    );
  }

  const { title } = site.siteMetadata;
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box as="header" py="3" px="4" bg="gray.100">
        {title}
      </Box>
      {data.listings.map(listing => (
        <Box key={listing.id} p="4">
          <Heading mb="2">
            <Link href={listing.url}>{listing.title}</Link>
          </Heading>
          <Text>
            {listing.company.url ? (
              <Link href={listing.company.url}>{listing.company.name}</Link>
            ) : (
              listing.company.name
            )}
          </Text>
          <Text>{listing.description}</Text>
        </Box>
      ))}
    </>
  );
}
