import { useEffect, useState } from 'react';

import { type Country, fetchAvailableCountries } from '../services/holidayService';

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState('US');

  useEffect(() => {
    let cancelled = false;

    fetchAvailableCountries()
      .then(data => {
        if (!cancelled) setCountries(data);
      })
      .catch(() => {
        if (!cancelled) {
          setCountries([{ countryCode: 'US', name: 'United States' }]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, country, setCountry };
}
