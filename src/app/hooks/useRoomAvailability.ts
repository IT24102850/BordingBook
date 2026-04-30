import { useEffect, useCallback, useRef } from 'react';

export interface RoomAvailability {
  id: string;
  roomNumber: string;
  occupiedBeds: number;
  bedCount: number;
  status: 'available' | 'partial' | 'full';
  availableFrom?: string;
  isDateRestricted: boolean;
}

/**
 * Calculate room status based on occupancy
 */
export const calculateRoomStatus = (
  occupiedBeds: number,
  bedCount: number
): 'available' | 'partial' | 'full' => {
  if (occupiedBeds <= 0) return 'available';
  if (occupiedBeds >= bedCount) return 'full';
  return 'partial';
};

/**
 * Check if room is available based on availableFrom date
 */
export const isRoomAvailableFromDate = (availableFrom?: string): boolean => {
  if (!availableFrom) return true;
  const availableDate = new Date(availableFrom);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return availableDate <= today;
};

/**
 * Hook to manage real-time room availability
 */
export const useRoomAvailability = (
  rooms: any[],
  onAvailabilityChange?: (updatedRooms: RoomAvailability[]) => void
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Map<string, any>>(new Map());

  // Calculate availability for all rooms
  const calculateAvailability = useCallback(() => {
    const availability: RoomAvailability[] = rooms.map((room) => {
      const occupiedBeds = room.occupiedBeds || 0;
      const bedCount = room.bedCount || 1;
      const status = calculateRoomStatus(occupiedBeds, bedCount);
      const isDateRestricted = !isRoomAvailableFromDate(room.availableFrom);

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        occupiedBeds,
        bedCount,
        status: isDateRestricted ? 'available' : status,
        availableFrom: room.availableFrom,
        isDateRestricted,
      };
    });

    return availability;
  }, [rooms]);

  // Check for changes and notify
  const checkForChanges = useCallback(() => {
    const currentAvailability = calculateAvailability();

    let hasChanges = false;
    currentAvailability.forEach((availability) => {
      const lastState = lastUpdateRef.current.get(availability.id);
      if (
        !lastState ||
        lastState.status !== availability.status ||
        lastState.occupiedBeds !== availability.occupiedBeds ||
        lastState.isDateRestricted !== availability.isDateRestricted
      ) {
        lastUpdateRef.current.set(availability.id, {
          status: availability.status,
          occupiedBeds: availability.occupiedBeds,
          isDateRestricted: availability.isDateRestricted,
        });
        hasChanges = true;
      }
    });

    if (hasChanges && onAvailabilityChange) {
      onAvailabilityChange(currentAvailability);
    }

    return currentAvailability;
  }, [calculateAvailability, onAvailabilityChange]);

  // Initialize and set up polling
  useEffect(() => {
    // Initial check
    checkForChanges();

    // Set up polling interval (every 10 seconds)
    intervalRef.current = setInterval(() => {
      checkForChanges();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkForChanges]);

  // Get current availability
  const getCurrentAvailability = useCallback(() => {
    return calculateAvailability();
  }, [calculateAvailability]);

  return {
    getCurrentAvailability,
    checkForChanges,
  };
};

/**
 * Get availability summary for all rooms
 */
export const getAvailabilitySummary = (rooms: any[]) => {
  const available = rooms.filter((r) => calculateRoomStatus(r.occupiedBeds || 0, r.bedCount || 1) === 'available').length;
  const partial = rooms.filter((r) => calculateRoomStatus(r.occupiedBeds || 0, r.bedCount || 1) === 'partial').length;
  const full = rooms.filter((r) => calculateRoomStatus(r.occupiedBeds || 0, r.bedCount || 1) === 'full').length;

  return { available, partial, full, total: rooms.length };
};
