import React from "react";
import "leaflet/dist/leaflet.css";
import {
  Card,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Button,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Flex
      justifyContent="center"
      alignContent="center"
      direction="column"
      gap="20"
    >
      <Container textAlign="center">
        <Heading size="lg">HSL App</Heading>
        <Text>Explore Uussimaas HSL Transportation Data</Text>
      </Container>
      <Stack direction={{ base: "column", md: "row" }} gap="10">
        <Card.Root size="lg" padding={10}>
          <Card.Header>
            <Heading size="md">Stations</Heading>
          </Card.Header>
          <br />
          <Card.Body color="fg.muted">
            See the list of the stations in the Capital region.
          </Card.Body>
          <Card.Footer>
            <Link to="/stations">Explore</Link>
          </Card.Footer>
        </Card.Root>
        <Card.Root size="lg" padding={10}>
          <Card.Header>
            <Heading size="md">Routes</Heading>
          </Card.Header>
          <br />
          <Card.Body color="fg.muted">
            Explore the transportion routes of the Capital region.
          </Card.Body>
          <Card.Footer>
            <Link to="/routes">Explore</Link>
          </Card.Footer>
        </Card.Root>
      </Stack>
    </Flex>
  );
};
export default App;
