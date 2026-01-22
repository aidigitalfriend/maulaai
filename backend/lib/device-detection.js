/**
 * DEVICE DETECTION UTILITIES
 * Functions to detect device type, browser, and OS from user agent
 */

// ============================================
// DETECT DEVICE TYPE
// ============================================
export function detectDevice(userAgent) {
  const ua = userAgent.toLowerCase();

  if (
    /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  ) {
    if (/tablet|ipad/i.test(ua)) {
      return 'tablet';
    }
    return 'mobile';
  }

  return 'desktop';
}

// ============================================
// DETECT BROWSER
// ============================================
export function detectBrowser(userAgent) {
  const ua = userAgent.toLowerCase();

  if (ua.includes('chrome') && !ua.includes('edg')) {
    return 'Chrome';
  } else if (ua.includes('firefox')) {
    return 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'Safari';
  } else if (ua.includes('edg')) {
    return 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    return 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    return 'Internet Explorer';
  }

  return 'Unknown';
}

// ============================================
// DETECT OPERATING SYSTEM
// ============================================
export function detectOS(userAgent) {
  const ua = userAgent.toLowerCase();

  if (ua.includes('windows')) {
    return 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    return 'macOS';
  } else if (ua.includes('linux')) {
    return 'Linux';
  } else if (ua.includes('android')) {
    return 'Android';
  } else if (
    ua.includes('ios') ||
    ua.includes('iphone') ||
    ua.includes('ipad')
  ) {
    return 'iOS';
  }

  return 'Unknown';
}
