import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://api.digitransit.fi/routing/v2/hsl/gtfs/v1?digitransit-subscription-key=a1e437f79628464c9ea8d542db6f6e94", // Replace with your GraphQL API endpoint
  cache: new InMemoryCache(),
});

export default client;
