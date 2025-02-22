import { gql, useQuery } from "@apollo/client";
import { Card, Heading, Icon, Input, Stack } from "@chakra-ui/react";
import { Icon as LeafletIcon } from "leaflet";
import useDebounce from "../../hooks/useDebounce";
import React, { useMemo, useState } from "react";
import { MapContainer, useMap, Marker, Popup, TileLayer } from "react-leaflet";
import styled from "styled-components";
import { RxCross2 } from "react-icons/rx";
import { InputGroup } from "../../components/ui/input-group";

const GET_STATIONS = gql`
  {
    stations {
      gtfsId
      name
      lat
      lon
      vehicleMode
    }
  }
`;
const markerIcon = new LeafletIcon({
  iconUrl: "/assets/icons/marker.svg",
  iconSize: [25, 25],
  iconAnchor: [6, 25],
  popupAnchor: [6, -30],
});
const StationWrapper = styled.div`
  display: grid;
  grid-template-columns: 350px auto;
  grid-template-areas: "list map";
  height: 100vh;
  position: relative;
  .map-container {
    height: 100vh;
    width: 100%;
    grid-area: map;
  }
  .list-column {
    max-height: 100%;
    overflow-y: auto;
    grid-area: list;
    z-index: 9999;
    box-shadow: 0px 0px 30px -4px #333;
  }
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    grid-template-rows: 50% 50%;
    grid-template-areas:
      "map"
      "list";
    .map-container {
      height: 50vh;
    }
  }
`;

const ListColumn = styled.div``;
const MarkersWithBounds = ({ markers }: { markers: any[] }) => {
  const map = useMap();
  if (markers) {
    map.fitBounds(
      markers.map((st) => [st.lat, st.lon]),
      {
        padding: [30, 30],
      }
    );
  }

  return (
    <>
      {markers.map((marker: any) => (
        <Marker icon={markerIcon} position={[marker.lat, marker.lon]}>
          <Popup>
            {marker.name}
            <br /> {marker.gtfsId}
            <br /> {marker.vehicleMode}
          </Popup>
        </Marker>
      ))}
      ;
    </>
  );
};
type Station = {
  gtfsId: string;
  name: string;
  lat: number;
  lon: number;
  vehicleMode: string;
};
const Stations: React.FC = () => {
  const { loading, error, data } = useQuery<{ stations: Station[] }>(
    GET_STATIONS
  );
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 1000);
  const stations = useMemo(() => {
    if (!data?.stations) return [];
    if (!keyword) return data.stations;
    const matchedStations = data.stations.filter((st) =>
      st.name.toLowerCase().includes(debouncedKeyword.toLowerCase())
    );
    return matchedStations;
  }, [data, debouncedKeyword]);

  if (loading || !data?.stations) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <StationWrapper>
      <Stack className="list-column" padding={"10px"}>
        <Heading>Stations</Heading>
        <InputGroup
          endOffset={10}
          endElement={
            keyword.length > 0 ? (
              <Icon
                color="white"
                size="md"
                width={30}
                onClick={() => setKeyword("")}
              >
                <RxCross2 />
              </Icon>
            ) : null
          }
        >
          <Input
            type="text"
            paddingStart={"5px"}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Filter stations..."
            borderRadius={6}
          />
        </InputGroup>
        <ListColumn>
          <Stack>
            {stations.map((station) => {
              return (
                <Card.Root key={station.gtfsId} size="sm" padding={5}>
                  <Card.Header>
                    <Heading size="md"> {station.name}</Heading>
                  </Card.Header>
                  <Card.Body color="fg.muted" fontSize={14}>
                    {station.lat} - {station.lon}
                  </Card.Body>
                </Card.Root>
              );
            })}
          </Stack>
        </ListColumn>
      </Stack>
      <div className="map-container">
        <MapContainer
          style={{
            width: "100%",
            height: "100%",
          }}
          zoom={13}
        >
          <TileLayer url="https://cdn.digitransit.fi/map/v3/hsl-map-en/{z}/{x}/{y}.png?digitransit-subscription-key=a1e437f79628464c9ea8d542db6f6e94" />
          <MarkersWithBounds markers={stations} />
        </MapContainer>
      </div>
    </StationWrapper>
  );
};

export default Stations;
