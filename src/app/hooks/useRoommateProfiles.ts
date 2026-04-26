import { useEffect, useState } from 'react';

export interface RoommateProfile {
  id: string;
  name: string;
  description: string;
  budget: number;
  academicYear: string;
  gender: string;
  preferences: string;
  image: string;
  roomType: string;
  billsIncluded: boolean;
  availableFrom: string;
  tags: string[];
}

export function useRoommateProfiles() {
  const [profiles, setProfiles] = useState<RoommateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('bb_access_token') || '';
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/roommates/browse`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );
        if (!res.ok) throw new Error('Failed to fetch roommate profiles');
        const data = await res.json();
        setProfiles(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  return { profiles, loading, error };
}
