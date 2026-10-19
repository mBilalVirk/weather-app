export function formatTime(
  isoString: string | Date | null | undefined,
  timezone = 'UTC',
  is12h = true
): string {
  if (!isoString) return '--:--';
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: is12h ? 'numeric' : '2-digit',
      minute: '2-digit',
      hour12: is12h,
    }).format(date);
  } catch {
    // Fallback if timezone string is invalid
    try {
      const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
      return new Intl.DateTimeFormat('en-US', {
        hour: is12h ? 'numeric' : '2-digit',
        minute: '2-digit',
        hour12: is12h,
      }).format(date);
    } catch {
      return '--:--';
    }
  }
}

export function formatDate(
  isoString: string | Date | null | undefined,
  timezone = 'UTC',
  style: 'short' | 'medium' | 'full' = 'medium'
): string {
  if (!isoString) return '';
  try {
    const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
    if (style === 'short') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric',
      }).format(date);
    } else if (style === 'full') {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  } catch {
    return '';
  }
}

export function getDayName(isoDate: string, timezone = 'UTC'): string {
  if (!isoDate) return '';
  try {
    // If it's a date string like '2025-05-12'
    const date = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00Z`);
    const today = new Date();
    
    // Check if today in timezone
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date);
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(today);
    
    if (dateStr === todayStr) {
      return 'Today';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
    }).format(date);
  } catch {
    return '';
  }
}

export function calculateDayProgress(
  sunriseIso: string,
  sunsetIso: string,
  currentIso?: string
): {
  progress: number; // 0 to 100
  isDay: boolean;
  daylightDurationFormatted: string;
  timeRemaining: string;
} {
  try {
    const sunrise = new Date(sunriseIso).getTime();
    const sunset = new Date(sunsetIso).getTime();
    const now = currentIso ? new Date(currentIso).getTime() : Date.now();

    const totalDaylightMs = Math.max(0, sunset - sunrise);
    const hours = Math.floor(totalDaylightMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalDaylightMs % (1000 * 60 * 60)) / (1000 * 60));
    const daylightDurationFormatted = `${hours}h ${minutes}m`;

    if (now < sunrise) {
      const msUntilRise = sunrise - now;
      const h = Math.floor(msUntilRise / (1000 * 60 * 60));
      const m = Math.floor((msUntilRise % (1000 * 60 * 60)) / (1000 * 60));
      return {
        progress: 0,
        isDay: false,
        daylightDurationFormatted,
        timeRemaining: `Sunrise in ${h}h ${m}m`,
      };
    }

    if (now > sunset) {
      return {
        progress: 100,
        isDay: false,
        daylightDurationFormatted,
        timeRemaining: 'Sun has set',
      };
    }

    const elapsed = now - sunrise;
    const progress = Math.min(100, Math.max(0, (elapsed / totalDaylightMs) * 100));
    const msUntilSet = sunset - now;
    const h = Math.floor(msUntilSet / (1000 * 60 * 60));
    const m = Math.floor((msUntilSet % (1000 * 60 * 60)) / (1000 * 60));

    return {
      progress: Math.round(progress),
      isDay: true,
      daylightDurationFormatted,
      timeRemaining: `${h}h ${m}m of daylight left`,
    };
  } catch {
    return {
      progress: 50,
      isDay: true,
      daylightDurationFormatted: '--h --m',
      timeRemaining: '--',
    };
  }
}
