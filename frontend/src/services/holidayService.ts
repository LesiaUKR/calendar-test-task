import axios from 'axios';

const nagerApi = axios.create({
  baseURL: 'https://date.nager.at/api/v3',
});

export interface Country {
  countryCode: string;
  name: string;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export async function fetchAvailableCountries(): Promise<Country[]> {
  const { data } = await nagerApi.get<Country[]>('/AvailableCountries');
  return data;
}

export async function fetchHolidays(year: number, countryCode: string): Promise<PublicHoliday[]> {
  const { data } = await nagerApi.get<PublicHoliday[]>(`/PublicHolidays/${year}/${countryCode}`);
  return data;
}
