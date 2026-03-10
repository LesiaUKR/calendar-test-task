import { useEffect, useState } from 'react';

import { type Country, fetchAvailableCountries } from '../services/holidayService';

const COUNTRY_STORAGE_KEY = 'calendar-country';

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState(() => {
    try {
      return localStorage.getItem(COUNTRY_STORAGE_KEY) ?? 'US';
    } catch {
      return 'US';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, country);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Country persistence failed', error);
      }
    }
  }, [country]);

  useEffect(() => {
    let cancelled = false;

    fetchAvailableCountries()
      .then(data => {
        if (!cancelled) {
          setCountries(data);
          if (!data.some(c => c.countryCode === country)) {
            setCountry('US');
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCountries([{ countryCode: 'US', name: 'United States' }]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [country]);

  return { countries, country, setCountry };
}
