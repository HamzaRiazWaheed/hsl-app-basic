import ClearableInput from "../../components/ui/input-clearable";
import { gql, useQuery } from "@apollo/client";
import {
  Heading,
  SimpleGrid,
  Flex,
  Card,
  Text,
  HStack,
  Button,
} from "@chakra-ui/react";
import polyline from "google-polyline";
import { useMemo, useState } from "react";
import { styled } from "styled-components";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { LatLngTuple, Icon as LeafletIcon } from "leaflet";
import { createPortal } from "react-dom";
import { CloseButton } from "../../components/ui/close-button";

const TRANSPORT_MODES = {
  RAIL: "RAIL",
  SUBWAY: "SUBWAY",
  TRAM: "TRAM",
  BUS: "BUS",
} as const;

const GET_ROUTES = gql`
  {
    routes(transportModes: [${Object.values(TRANSPORT_MODES).join(",")}]) {
      gtfsId
      shortName
      longName
      mode
    }
  }
`;
const RouteWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: fixed;
  z-index: 9999;
  height: 100vh;
  top: 0;
  left: 0;
  .close-button {
    position: absolute;
    right: 5px;
    top: 5px;
    z-index: 99999;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    background: rgba(0, 0, 0, 0.8);
  }
  .map-container {
    height: 100vh;
    width: 100%;
  }
  .back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    cursor: pointer;
    z-index: 999;
  }
  .name {
  }
`;
const markerIcon = new LeafletIcon({
  iconUrl: "/assets/icons/marker.svg",
  iconSize: [25, 25],
  iconAnchor: [6, 25],
  popupAnchor: [6, -30],
});

type Patterns = {
  directionId: 0 | 1;
  geometry: {
    lat: number;
    lng: number;
  };
  patternGeometry: {
    length: number;
    points: string;
  };
}[];
const RouteGeomatriesWithBounds = ({
  stops,
  patterns,
}: {
  stops: StopGEOJSON[];
  patterns: Patterns;
}) => {
  const map = useMap();
  const points = stops.map((stop) => [
    stop.geometries.geoJson.coordinates[1],
    stop.geometries.geoJson.coordinates[0],
  ]) as LatLngTuple[];
  if (stops) {
    map.fitBounds(points, {
      padding: [30, 30],
    });
  }
  const colors = ["blue", "green"];

  return points.map((point) => {
    return (
      <>
        <Marker position={point} icon={markerIcon}>
          <Popup>{stop.name}</Popup>
        </Marker>
        {patterns.map((pattern) => {
          console.log(
            polyline.decode(pattern.patternGeometry.points),
            colors[pattern.directionId]
          );
          return (
            <Polyline
              key={`${stop.name}-${pattern.directionId}`}
              pathOptions={{
                color: colors[pattern.directionId],
                dashArray: "10,10",
              }}
              positions={polyline.decode(pattern.patternGeometry.points)}
            />
          );
        })}
      </>
    );
  });
};
type Route = {
  gtfsId: string;
  shortName: string;
  longName: string;
  mode: keyof typeof TRANSPORT_MODES;
};
type StopGEOJSON = {
  gtfsId: string;
  name: string;
  geometries: {
    geoJson: {
      type: "Point";
      coordinates: number[];
    };
  };
};

const SingleRoute = ({
  route,
  onClose,
}: {
  route: Route;
  onClose: () => void;
}) => {
  const GET_ROUTE = gql`
    query Route($id: String!) {
      route(id: $id) {
        gtfsId
        shortName
        longName
        mode
        patterns {
          directionId
          name
          semanticHash
          patternGeometry {
            length
            points
          }
          geometry {
            lat
            lon
          }
        }
        stops {
          gtfsId
          name
          geometries {
            geoJson
          }
        }
      }
    }
  `;
  const { loading, error, data } = useQuery<{
    route: Route & { stops: StopGEOJSON[]; patterns: Patterns };
  }>(GET_ROUTE, {
    variables: { id: route.gtfsId },
  });
  if (loading || !data?.route) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <RouteWrapper>
      <CloseButton onClick={onClose} className="close-button" />
      <div className="map-container">
        <MapContainer
          style={{
            width: "100%",
            height: "100%",
          }}
          zoom={13}
        >
          <TileLayer url="https://cdn.digitransit.fi/map/v3/hsl-map-en/{z}/{x}/{y}.png?digitransit-subscription-key=a1e437f79628464c9ea8d542db6f6e94" />
          <RouteGeomatriesWithBounds
            stops={data.route.stops}
            patterns={data.route.patterns}
          />
        </MapContainer>
      </div>
    </RouteWrapper>
  );
};
const RoutesSection = ({
  mode,
  routes,
}: {
  mode: Route["mode"];
  routes: Route[];
}) => {
  const [openRoute, setOpenRoute] = useState(false);
  const [routeToOpen, setRouteToOpen] = useState<Route | null>(null);
  const [filterTerm, setFilterTerm] = useState("");
  const filteredRoutes = useMemo(() => {
    if (!filterTerm) return routes;
    const term = filterTerm.toLowerCase();
    return routes.filter(
      (route) =>
        route.longName.toLowerCase().includes(term) ||
        route.shortName.toLowerCase().includes(term)
    );
  }, [routes, filterTerm]);
  return (
    <Flex direction="column" gap={5}>
      <Flex alignItems="center" justifyContent="space-between" gap="10px">
        <HStack>
          <Heading size="lg">{mode}</Heading>
          <Text fontSize="medium" color="GrayText">
            ({routes.length})
          </Text>
        </HStack>
        <ClearableInput
          term={filterTerm}
          onChange={(val) => setFilterTerm(val)}
          debounceTime={500}
          placeholder="Filter..."
        />
      </Flex>
      <SimpleGrid minChildWidth="xs" gap="10px">
        {filteredRoutes.map((route) => (
          <>
            <Card.Root size="lg" padding={2}>
              <Card.Header>
                <Heading size="md">{route.shortName}</Heading>
              </Card.Header>
              <Card.Body color="fg.muted">{route.longName}</Card.Body>
              <Card.Footer>
                <Button
                  onClick={() => {
                    console.log("Done!");
                    setRouteToOpen(route);
                    setOpenRoute(!openRoute);
                  }}
                >
                  Explore
                </Button>
              </Card.Footer>
            </Card.Root>
          </>
        ))}
      </SimpleGrid>
      {openRoute && routeToOpen
        ? createPortal(
            <SingleRoute
              route={routeToOpen}
              onClose={() => {
                setOpenRoute(false);
                setRouteToOpen(null);
              }}
            />,
            document.body
          )
        : null}
    </Flex>
  );
};

const RoutesList = ({ routes }: { routes: Route[] }) => {
  const sectionedRoutes = useMemo(() => {
    const sections: { [key in Route["mode"]]: Route[] } = {
      RAIL: [],
      BUS: [],
      SUBWAY: [],
      TRAM: [],
    };
    routes.forEach((route) => {
      sections[route.mode].push(route);
    });
    return sections;
  }, [routes]);

  return (
    <Flex direction="column" gap={10}>
      {Object.values(TRANSPORT_MODES).map((mode) => (
        <RoutesSection key={mode} mode={mode} routes={sectionedRoutes[mode]} />
      ))}
    </Flex>
  );
};

const HSLRoutes: React.FC = () => {
  const { loading, error, data } = useQuery<{ routes: Route[] }>(GET_ROUTES);

  if (loading || !data?.routes) return <p>Loading...</p>;
  if (!data.routes) return <p>No Routes</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Flex direction="column">
      <Heading>HSL Routes</Heading>
      <br />
      <RoutesList routes={data.routes} />
    </Flex>
  );
};

export default HSLRoutes;
