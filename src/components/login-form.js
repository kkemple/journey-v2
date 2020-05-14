import React, { useState } from "react";
import { Flex, Button, Stack, Heading, Input, Text } from "@chakra-ui/core";
import { useApolloClient } from "@apollo/client";

export default function LoginForm() {
  const client = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    const response = await fetch("/.netlify/functions/auth", {
      headers: {
        Authorization: `Basic ${btoa(
          `${event.target.email.value}:${event.target.password.value}`
        )}`,
      },
    });

    if (response.ok) {
      const token = await response.text();
      localStorage.setItem("journey:token", token);
      client.resetStore();
    } else {
      const error = await response.text();
      setError(new Error(error));
      setLoading(false);
    }
  }

  return (
    <Flex h="100vh" align="center" justify="center" bg="white">
      <Stack
        p="8"
        rounded="lg"
        shadow="-16px 16px 32px #ededed, 16px -16px 32px #ffffff"
        maxW="320px"
        w="full"
        as="form"
        spacing="4"
        bg="white"
        onSubmit={handleSubmit}
      >
        <Heading textAlign="center" fontSize="xl" pb="2">
          Journey (v2)
        </Heading>
        {error && <Text color="red.500">{error.message}</Text>}
        <Input placeholder="Email" type="email" name="email" />
        <Input placeholder="Password" type="password" name="password" />
        <Button mt="2" ml="auto" isLoading={loading} type="submit">
          Log in
        </Button>
      </Stack>
    </Flex>
  );
}
