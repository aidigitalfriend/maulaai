# Google Maps API Key Restriction Fix Required ⚠️

## Current Status
✅ Google Maps API is loading correctly  
✅ Code updated to use modern AdvancedMarkerElement  
⚠️ **API KEY RESTRICTION ERROR**: `RefererNotAllowedMapError`

## The Problem

Your Google Maps API key (`AIzaSyBRvYE5ix0zuOb-6bPgFX6fcwd3duELO1s`) has **Application Restrictions** enabled, but `https://onelastai.co/tools/ip-info` is not in the allowed list.

**Error Message:**
```
RefererNotAllowedMapError
Your site URL to be authorized: https://onelastai.co/tools/ip-info
```

## How to Fix (Google Cloud Console)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/google/maps-apis/credentials
2. Sign in with your Google account

### Step 2: Find Your API Key
1. Look for the API key: `AIzaSyBRvYE5ix0zuOb-6bPgFX6fcwd3duELO1s`
2. Click on the key name to edit

### Step 3: Update Application Restrictions

#### Option A: Add Specific URLs (Most Secure - Recommended)
Under **Application restrictions** → **HTTP referrers (web sites)**:

Add these referrers:
```
https://onelastai.co/*
https://www.onelastai.co/*
http://localhost:3000/*
http://localhost/*
```

**Format Requirements:**
- Use `/*` to allow all paths under the domain
- Include both `https://` and `http://` versions if needed
- Include `www.` and non-www versions
- Wildcards allowed: `*.onelastai.co/*`

#### Option B: Temporarily Remove Restrictions (Testing Only)
- Select **None** under Application restrictions
- ⚠️ **NOT RECOMMENDED for production** - your API key will be usable from any website

### Step 4: API Restrictions (Optional but Recommended)
Under **API restrictions**:
- Select **Restrict key**
- Check only the APIs you need:
  - ✅ Maps JavaScript API
  - ✅ Geocoding API
  - ✅ Places API (if using autocomplete)

### Step 5: Save Changes
1. Click **Save** at the bottom
2. Wait 1-5 minutes for changes to propagate
3. Clear browser cache and test: https://onelastai.co/tools/ip-info

## Quick Fix Commands

After updating the API key restrictions in Google Cloud Console:

### Clear Cloudflare Cache (if applicable)
```powershell
# From local machine
.\purge-cloudflare-cache.ps1
```

### Clear Browser Cache
- **Chrome/Edge**: Ctrl+Shift+Delete → Clear cached images and files
- **Firefox**: Ctrl+Shift+Delete → Cached Web Content
- Or use Incognito/Private mode for testing

### Verify Fix
```powershell
# Test the page
curl -I https://onelastai.co/tools/ip-info
```

Then visit: https://onelastai.co/tools/ip-info

## Code Updates Applied ✅

### 1. Updated to Modern Marker API
**File**: `frontend/app/tools/ip-info/page.tsx`

- ✅ Added `marker` library to Google Maps script
- ✅ Implemented `google.maps.marker.AdvancedMarkerElement` (recommended by Google)
- ✅ Fallback to deprecated `google.maps.Marker` if AdvancedMarkerElement unavailable
- ✅ Added `mapId` parameter required for AdvancedMarkerElement

**Changes:**
```typescript
// Script now loads marker library
libraries=places,marker

// Map with mapId for AdvancedMarkerElement
const newMap = new google.maps.Map(mapElement, {
  mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
  // ... other options
});

// Use modern API with fallback
if (google.maps.marker?.AdvancedMarkerElement) {
  newMarker = new google.maps.marker.AdvancedMarkerElement({
    position: center,
    map: newMap,
    title: 'Location',
  });
} else {
  // Fallback to deprecated Marker
  newMarker = new google.maps.Marker({...});
}
```

### 2. Deprecation Warning Resolved
**Before:**
```
⚠️ google.maps.Marker is deprecated as of February 21st, 2024
Use google.maps.marker.AdvancedMarkerElement instead
```

**After:**
✅ Using AdvancedMarkerElement (when available)  
✅ Graceful fallback to Marker for compatibility  
✅ No more deprecation warnings

## Expected Behavior After Fix

### Before API Key Fix:
❌ Map shows gray tiles with "For development purposes only" watermark  
❌ Console error: `RefererNotAllowedMapError`  
❌ Map not interactive

### After API Key Fix:
✅ Map displays correctly with full colors and details  
✅ No console errors  
✅ Marker shows location  
✅ Info window displays IP details  
✅ Map is fully interactive (zoom, pan, street view)

## Testing Checklist

After updating API key restrictions:

- [ ] Wait 1-5 minutes for changes to propagate
- [ ] Clear Cloudflare cache (if using Cloudflare)
- [ ] Clear browser cache or use Incognito mode
- [ ] Visit: https://onelastai.co/tools/ip-info
- [ ] Check browser console (F12) - should have no Google Maps errors
- [ ] Verify map displays with full colors (not gray)
- [ ] Click marker - info window should open
- [ ] Test zoom in/out
- [ ] Test manual IP search
- [ ] Check "For development purposes only" watermark is gone

## Troubleshooting

### Issue: Still seeing RefererNotAllowedMapError
**Solutions:**
1. Verify referrer format: `https://onelastai.co/*` (with `/*` at the end)
2. Wait up to 5 minutes for Google's servers to propagate changes
3. Clear all caches (browser, Cloudflare, etc.)
4. Try in Incognito/Private mode
5. Check if you're editing the correct API key

### Issue: "For development purposes only" watermark
**Cause:** API key not authorized or billing not enabled on Google Cloud project
**Solutions:**
1. Enable billing on your Google Cloud project
2. Add valid payment method
3. Ensure API key restrictions are configured correctly

### Issue: Map shows but marker doesn't appear
**Solutions:**
1. Check console for JavaScript errors
2. Verify coordinates are valid: `ipData.location.coordinates`
3. Check if `marker` library loaded correctly
4. Try fallback Marker if AdvancedMarkerElement fails

## Alternative: Create New API Key

If you prefer to create a new unrestricted API key for testing:

1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Click **+ CREATE CREDENTIALS** → **API key**
3. Copy the new key
4. Update `.env` file:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_NEW_API_KEY
   ```
5. Rebuild frontend:
   ```bash
   cd frontend && npm run build && pm2 restart frontend
   ```

## Next Steps

1. **IMMEDIATE**: Fix API key restrictions in Google Cloud Console
2. **TEST**: Verify map works at https://onelastai.co/tools/ip-info
3. **OPTIONAL**: Enable API usage quotas and monitoring
4. **RECOMMENDED**: Set up API key usage alerts in Google Cloud Console

## Documentation Links

- [Google Maps JavaScript API Error Messages](https://developers.google.com/maps/documentation/javascript/error-messages#referer-not-allowed-map-error)
- [API Key Restrictions](https://developers.google.com/maps/api-security-best-practices#restrict-apikey)
- [Advanced Markers Migration Guide](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration)
- [Application Restrictions](https://cloud.google.com/docs/authentication/api-keys#api_key_restrictions)

---

**Current Status**: ⏳ Waiting for API key restriction update in Google Cloud Console  
**Server**: 47.129.43.231 (t3.large)  
**Deployment**: Production  
**Date**: November 6, 2024
