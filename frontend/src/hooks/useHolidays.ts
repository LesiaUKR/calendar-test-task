import { useEffect, useRef, useState } from 'react';

import { fetchHolidays, type PublicHoliday } from '../services/holidayService';

type HolidayMap = Map<string, PublicHoliday[]>;

export function useHolidays(year: number, countryCode: string) {
  const [holidays, setHolidays] = useState<HolidayMap>(new Map());
  const cacheRef = useRef<Map<string, HolidayMap>>(new Map());

  useEffect(() => {
    const cacheKey = `${year}-${countryCode}`;

    if (cacheRef.current.has(cacheKey)) {
      setHolidays(cacheRef.current.get(cacheKey)!);
      return;
    }

    let cancelled = false;

    fetchHolidays(year, countryCode)
      .then(data => {
        if (cancelled) return;

        const map: HolidayMap = new Map();
        for (const h of data) {
          const existing = map.get(h.date) ?? [];
          existing.push(h);
          map.set(h.date, existing);
        }

        cacheRef.current.set(cacheKey, map);
        setHolidays(map);
      })
      .catch(() => {
        if (!cancelled) setHolidays(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [year, countryCode]);

  return holidays;
}
