import React from "react";
import { useQuery, gql } from "@apollo/client";
import { Box, Heading, List, ListItem } from "@chakra-ui/core";
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
      country(code: "NZ") {
        name
        emoji
        languages {
          code
          name
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
  const { emoji, name, languages } = data.country;
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box as="header" py="3" px="4" bg="gray.100">
        {title}
      </Box>
      <Box p="4">
        <Heading mb="2">
          {emoji} {name}
        </Heading>
        <List styleType="disc">
          {languages.map(language => (
            <ListItem key={language.code}>{language.name}</ListItem>
          ))}
        </List>
      </Box>
    </>
  );
}
