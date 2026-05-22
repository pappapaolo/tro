export type CityId = "milan" | "rome";

export interface City {
  id: CityId;
  label: string;
  /** Matches the `city` field on Venue. */
  venueCity: string;
}

export const CITIES: City[] = [
  { id: "milan", label: "Milan", venueCity: "Milan" },
  { id: "rome", label: "Rome", venueCity: "Rome" },
];

export const DEFAULT_CITY: CityId = "milan";

export function cityFromVenueCity(venueCity: string): CityId {
  const c = CITIES.find(
    (x) => x.venueCity.toLowerCase() === venueCity.toLowerCase(),
  );
  return c?.id ?? "milan";
}
