'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  Globe, 
  MapPin, 
  Shield, 
  Server, 
  Clock, 
  Copy, 
  Download, 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Wifi,
  Navigation,
  ArrowLeft,
} from 'lucide-react';
import DoctorNetworkChat from '@/components/DoctorNetworkChat';
import Script from 'next/script';

// Declare Google Maps JS SDK global to satisfy TypeScript when script is loaded at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;

interface IPLocation {
  city?: string;
  region?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  postal?: string;
  timezone?: string;
}

interface IPNetwork {
  isp?: string;
  organization?: string;
  asn?: string;
  asnName?: string;
  domain?: string;
  type?: string;
}

interface IPSecurity {
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isHosting: boolean;
  threat: 'low' | 'medium' | 'high';
  service?: string;
}

interface IPAbuse {
  contact: string;
  network: string;
  name: string;
}

interface IPMetadata {
  hostname?: string;
  lastUpdated: string;
  source: string;
  userAgent?: string;
}

interface IPInfoData {
  ip: string;
  location: IPLocation;
  network: IPNetwork;
  security: IPSecurity;
  abuse?: IPAbuse;
  metadata: IPMetadata;
}

interface APIResponse {
  success: boolean;
  data: IPInfoData;
  raw: any;
  error?: string;
}

const getThreatColor = (threat: string) => {
  switch (threat) {
    case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    default: return 'text-green-400 bg-green-500/10 border-green-500/30';
  }
};

const getThreatIcon = (threat: string) => {
  switch (threat) {
    case 'high': return <XCircle className="w-4 h-4" />;
    case 'medium': return <AlertTriangle className="w-4 h-4" />;
    default: return <CheckCircle className="w-4 h-4" />;
  }
};

// Advanced security analysis function
const getSecurityAnalysis = (security: IPSecurity, network: IPNetwork) => {
  const warnings: Array<{
    level: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    recommendation: string;
  }> = [];
  const recommendations: string[] = [];
  
  if (security.isTor) {
    warnings.push({
      level: 'high',
      title: 'Tor Network Detected',
      description: 'This IP is associated with the Tor anonymity network. While Tor is legal, it may indicate privacy-focused browsing or potential security concerns.',
      recommendation: 'Monitor for unusual activity if this is unexpected.'
    });
  }
  
  if (security.isProxy) {
    warnings.push({
      level: 'medium',
      title: 'Proxy Server Detected',
      description: 'This IP appears to be using a proxy server, which can hide the real origin of traffic.',
      recommendation: 'Verify if proxy usage is intentional for your use case.'
    });
  }
  
  if (security.isVPN) {
    warnings.push({
      level: 'medium',
      title: 'VPN Connection Detected',
      description: 'This IP is likely connected through a VPN service for privacy protection.',
      recommendation: 'VPNs are generally good for privacy but may affect location accuracy.'
    });
  }
  
  if (security.isHosting) {
    warnings.push({
      level: 'low',
      title: 'Hosting Provider IP',
      description: 'This IP belongs to a hosting/cloud provider rather than a residential ISP.',
      recommendation: 'Common for servers, businesses, or VPN services.'
    });
  }
  
  // Additional security checks based on network info
  if (network.type === 'hosting' || network.organization?.toLowerCase().includes('hosting')) {
    warnings.push({
      level: 'low',
      title: 'Data Center IP',
      description: 'This IP originates from a data center or hosting facility.',
      recommendation: 'Expected for cloud services, servers, or certain VPN providers.'
    });
  }
  
  return { warnings, recommendations };
};

export default function IPInfoPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ipData, setIpData] = useState<IPInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualIP, setManualIP] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [rawData, setRawData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [markerType, setMarkerType] = useState<'advanced' | 'legacy'>('legacy');
  const [infoWindow, setInfoWindow] = useState<any>(null);
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [showQuickInfo, setShowQuickInfo] = useState(true);
  const [toast, setToast] = useState<null | { message: string; type?: 'success' | 'info' | 'error' }>(null);
  const mapsApiKey = useMemo(() => (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim(), []);
  const [mapsAvailable, setMapsAvailable] = useState<boolean>(!!mapsApiKey);

  useGSAP(() => {
    if (!loading && ipData) {
      gsap.from('.result-section', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power3.out',
      });
    }
  }, { scope: containerRef, dependencies: [loading, ipData] });

  // Set up Google Maps callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).initGoogleMaps = () => {
        console.log('Google Maps API fully loaded');
        setMapLoaded(true);
      };
    }
  }, []);

  // Auto-detect user's IP on page load
  useEffect(() => {
    fetchIPInfo();
  }, []);

  const fetchIPInfo = async (targetIP?: string) => {
    try {
      if (targetIP) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      const url = targetIP 
        ? `/api/ipinfo?ip=${encodeURIComponent(targetIP)}`
        : `/api/ipinfo`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to fetch IP information';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result: APIResponse = await response.json();
      
      setIpData(result.data);
      setRawData(result.raw);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIpData(null);
      setRawData(null);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Initialize or update Google Map when coordinates are available
  useEffect(() => {
    if (!mapsAvailable || !mapLoaded || !ipData?.location?.coordinates) return;

    // Wait for google.maps to be fully loaded
    if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.Map) {
      console.warn('Google Maps API not fully loaded yet');
      return;
    }

    const { lat, lng } = ipData.location.coordinates;
    const center = { lat, lng };

    // Create map if not created yet
    if (!map) {
      const mapElement = document.getElementById('google-map');
      if (!mapElement) return;

      try {
        const newMap = new google.maps.Map(mapElement, {
          center,
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
        });

        // Use AdvancedMarkerElement if available (new API), fallback to Marker
        let newMarker: any;
        try {
          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            newMarker = new google.maps.marker.AdvancedMarkerElement({
              position: center,
              map: newMap,
              title: `${ipData.location.city || 'Unknown'}, ${ipData.location.country || 'Unknown'}`,
            });
            setMarkerType('advanced');
          } else {
            throw new Error('AdvancedMarkerElement not available');
          }
        } catch (e) {
          // Fallback to deprecated Marker
          newMarker = new google.maps.Marker({
            position: center,
            map: newMap,
            title: `${ipData.location.city || 'Unknown'}, ${ipData.location.country || 'Unknown'}`,
            animation: google.maps.Animation.DROP,
          });
          setMarkerType('legacy');
        }

        const newInfoWindow = new google.maps.InfoWindow({
          content: buildInfoWindowHtml(ipData, lat, lng, formattedAddress || getFallbackAddress()),
        });

        newMarker.addListener('click', () => newInfoWindow.open(newMap, newMarker));

        setMap(newMap);
        setMarker(newMarker);
        setInfoWindow(newInfoWindow);
        newInfoWindow.open(newMap, newMarker);
      } catch (e) {
        // Likely due to missing/invalid API key or Maps not available
        console.warn('Google Maps initialization failed, disabling map preview.', e);
        setMapsAvailable(false);
      }
      return;
    }

    // Update map center and marker if map already exists (e.g., manual IP lookup)
    map.setCenter(center);
    
    // Update marker position based on marker type
    if (marker) {
      if (markerType === 'advanced') {
        // AdvancedMarkerElement uses property assignment
        marker.position = center;
      } else {
        // Legacy Marker uses setPosition method
        marker.setPosition(center);
      }
    }

    if (infoWindow) {
      infoWindow.setContent(buildInfoWindowHtml(ipData, lat, lng, formattedAddress || getFallbackAddress()));
    }
  }, [mapsAvailable, mapLoaded, ipData, map, marker, markerType, infoWindow, formattedAddress]);

  // Reverse geocode to get a human-readable address for the coordinates
  useEffect(() => {
  if (!mapsAvailable || !mapLoaded || !ipData?.location?.coordinates) return;
    try {
      const geocoder = new google.maps.Geocoder();
      const { lat, lng } = ipData.location.coordinates;
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === 'OK' && results && results[0]) {
          setFormattedAddress(results[0].formatted_address);
        } else {
          setFormattedAddress(getFallbackAddress());
        }
      });
    } catch (e) {
      setFormattedAddress(getFallbackAddress());
    }
  }, [mapsAvailable, mapLoaded, ipData?.location?.coordinates?.lat, ipData?.location?.coordinates?.lng]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIP.trim()) {
      fetchIPInfo(manualIP.trim());
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      setToast({ message: `${field === 'rawData' ? 'Raw data' : field} copied to clipboard`, type: 'success' });
    } catch (err) {
      console.error('Failed to copy:', err);
      setToast({ message: 'Failed to copy', type: 'error' });
    }
  };

  const downloadReport = () => {
    if (!ipData) return;
    
    const report = {
      ip: ipData.ip,
      location: ipData.location,
      network: ipData.network,
      security: ipData.security,
      abuse: ipData.abuse,
      metadata: ipData.metadata,
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-report-${ipData.ip}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fallback address from IP fields when reverse geocoding is unavailable
  const getFallbackAddress = () => {
    if (!ipData) return null;
    const parts = [ipData.location.city, ipData.location.region, ipData.location.country]
      .filter(Boolean)
      .join(', ');
    return parts || null;
  };

  const openInGoogleMapsUrl = (lat?: number, lng?: number) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return '#';
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  const getDirectionsUrl = (lat?: number, lng?: number) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  const shareLocation = (lat?: number, lng?: number, address?: string, ip?: string) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    const url = openInGoogleMapsUrl(lat, lng);
    const text = address || getFallbackAddress() || `${lat}, ${lng}`;
    const title = ip ? `IP ${ip} location` : 'Location';
    try {
      if (navigator.share) {
        navigator
          .share({ title, text, url })
          .then(() => setToast({ message: 'Share dialog opened', type: 'info' }))
          .catch(() => {
            copyToClipboard(url, 'shareUrl');
            setToast({ message: 'Link copied to clipboard', type: 'success' });
          });
      } else {
        copyToClipboard(url, 'shareUrl');
        setToast({ message: 'Link copied to clipboard', type: 'success' });
      }
    } catch {
      copyToClipboard(url, 'shareUrl');
      setToast({ message: 'Link copied to clipboard', type: 'success' });
    }
  };

  // Simple toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  // Detect Google Maps error overlay (e.g., InvalidKeyMapError) and gracefully fallback
  useEffect(() => {
    if (!mapLoaded || !mapsAvailable) return;
    const id = setTimeout(() => {
      const el = document.getElementById('google-map');
      if (!el) return;
      const hasErrorOverlay = !!el.querySelector('.gm-err-container');
      if (hasErrorOverlay) {
        setMapsAvailable(false);
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [mapLoaded, mapsAvailable]);

  const buildInfoWindowHtml = (
    data: IPInfoData,
    lat: number,
    lng: number,
    address?: string | null
  ) => `
    <div style="padding: 12px; max-width: 300px; font-family: system-ui, -apple-system, sans-serif;">
      <h3 style="font-weight: 700; margin-bottom: 10px; color: #1a1a1a; font-size: 16px;">${data.ip}</h3>
      ${address ? `<div style="margin: 6px 0; font-size: 14px; color: #2c3e50; line-height: 1.4;"><strong style="color: #1a1a1a;">Address:</strong> ${address}</div>` : ''}
      <div style="margin: 6px 0; font-size: 14px; color: #2c3e50;"><strong style="color: #1a1a1a;">City:</strong> ${data.location.city || 'Unknown'}</div>
      <div style="margin: 6px 0; font-size: 14px; color: #2c3e50;"><strong style="color: #1a1a1a;">Region:</strong> ${data.location.region || 'N/A'}</div>
      <div style="margin: 6px 0; font-size: 14px; color: #2c3e50;"><strong style="color: #1a1a1a;">Country:</strong> ${data.location.country || 'Unknown'}</div>
      ${data.network.organization ? `<div style="margin: 6px 0; font-size: 14px; color: #2c3e50;"><strong style="color: #1a1a1a;">Organization:</strong> ${data.network.organization}</div>` : ''}
      <div style="margin: 8px 0 4px 0; padding-top: 8px; border-top: 1px solid #e0e0e0; font-size: 13px; color: #34495e;"><strong style="color: #1a1a1a;">Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
    </div>
  `;

  const GlassCard = ({ title, children, icon, className = '' }: { title: string; children: React.ReactNode; icon: React.ReactNode; className?: string }) => (
    <div 
      className={`result-section rounded-2xl p-6 border border-white/10 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="text-cyan-400">{icon}</div>
        <h3 
          className="text-lg font-semibold"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, copyable = false }: { label: string; value?: string; copyable?: boolean }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-200">{value}</span>
          {copyable && (
            <button
              onClick={() => copyToClipboard(value, label)}
              className="p-1 text-gray-500 hover:text-cyan-400 transition-colors"
              title="Copy to clipboard"
            >
              {copiedField === label ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-white mb-2">Detecting Your IP Address</h2>
          <p className="text-gray-400">Please wait while we gather your network information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Google Maps Script (only if key provided); add modern params to satisfy console warnings */}
      {mapsApiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&v=weekly&libraries=places,marker&loading=async&callback=initGoogleMaps`}
          strategy="afterInteractive"
          onError={() => setMapsAvailable(false)}
        />
      )}
      
      <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <Link 
              href="/tools/network-tools" 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Network Tools
            </Link>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm mb-6">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">IP Geolocation</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 50%, #00d4ff 100%)',
                  }}
                >
                  IP Address Lookup
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Get detailed information about any IP address including location, ISP details, 
                security flags, and network information.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Manual Search */}
          <div 
            className="result-section rounded-2xl p-6 mb-8 border border-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <form onSubmit={handleManualSearch} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={manualIP}
                  onChange={(e) => setManualIP(e.target.value)}
                  placeholder="Enter IP address to lookup (e.g., 8.8.8.8)"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !manualIP.trim()}
                className="px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%)',
                  color: 'white',
                }}
              >
                {searchLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Lookup
              </button>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="result-section rounded-2xl p-4 mb-8 border border-red-500/30 bg-red-500/10">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 font-medium">Error</p>
              </div>
              <p className="text-red-200 mt-1">{error}</p>
            </div>
          )}

          {/* IP Information Display */}
          {ipData && (
            <>
              {/* IP Address Header */}
              <div 
                className="result-section rounded-2xl p-6 mb-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                }}
              >
                <div className="flex items-center justify-between relative">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">IP Address: {ipData.ip}</h2>
                    <div className="flex items-center gap-4 text-gray-300">
                      {ipData.location.city && ipData.location.country && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          <span>{ipData.location.city}, {ipData.location.country}</span>
                        </div>
                      )}
                      {ipData.network.isp && (
                        <div className="flex items-center gap-1">
                          <Wifi className="w-4 h-4 text-cyan-400" />
                          <span>{ipData.network.isp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(ipData.ip, 'ip')}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                      title="Copy IP address"
                    >
                      {copiedField === 'ip' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={downloadReport}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                      title="Download report"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Alerts */}
              {(() => {
                const securityAnalysis = getSecurityAnalysis(ipData.security, ipData.network);
                return securityAnalysis.warnings.length > 0 && (
                  <div className="mb-8 space-y-4">
                    {securityAnalysis.warnings.map((warning, idx) => (
                      <div 
                        key={idx} 
                        className={`result-section rounded-2xl border p-4 ${
                          warning.level === 'high' ? 'bg-red-500/10 border-red-500/30' :
                          warning.level === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                          'bg-cyan-500/10 border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${
                            warning.level === 'high' ? 'text-red-400' :
                            warning.level === 'medium' ? 'text-yellow-400' :
                            'text-cyan-400'
                          }`}>
                            {warning.level === 'high' ? <XCircle className="w-5 h-5" /> :
                             warning.level === 'medium' ? <AlertTriangle className="w-5 h-5" /> :
                             <CheckCircle className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold mb-1 ${
                              warning.level === 'high' ? 'text-red-300' :
                              warning.level === 'medium' ? 'text-yellow-300' :
                              'text-cyan-300'
                            }`}>
                              {warning.title}
                            </h3>
                            <p className="text-sm text-gray-300 mb-2">
                              {warning.description}
                            </p>
                            <p className={`text-xs font-medium ${
                              warning.level === 'high' ? 'text-red-400' :
                              warning.level === 'medium' ? 'text-yellow-400' :
                              'text-cyan-400'
                            }`}>
                              💡 {warning.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Google Maps Location Visualization */}
              {ipData.location.coordinates && (
                <div 
                  className="result-section mb-8 rounded-2xl overflow-hidden border border-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-cyan-400" />
                        <h3 
                          className="text-lg font-semibold"
                          style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          Geographic Location
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>{formattedAddress || `${ipData.location.city || 'Unknown'}, ${ipData.location.country || 'Unknown'}`}</span>
                      </div>
                    </div>
                  </div>
                  {mapsAvailable && mapsApiKey ? (
                    <div 
                      id="google-map" 
                      className="w-full h-[400px]"
                      style={{ minHeight: '400px' }}
                    />
                  ) : (
                    <div className="w-full h-[400px] flex items-center justify-center text-center p-6 bg-white/5">
                      <div>
                        <p className="text-gray-300 mb-2">Map preview is unavailable.</p>
                        <p className="text-gray-500 text-sm">Missing or invalid Google Maps API key. You can still open the location below.</p>
                      </div>
                    </div>
                  )}
                  <div className="p-3 bg-yellow-500/10 border-t border-yellow-500/20 text-xs text-yellow-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      Location is approximate based on IP address geolocation. 
                      Actual location may vary by several kilometers.
                    </span>
                  </div>
                  {/* Quick actions and summary cards */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={openInGoogleMapsUrl(ipData.location.coordinates.lat, ipData.location.coordinates.lng)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%)',
                            color: 'white',
                          }}
                        >
                          Open in Google Maps
                        </a>
                        <a
                          href={getDirectionsUrl(ipData.location.coordinates.lat, ipData.location.coordinates.lng)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl font-medium text-sm border border-white/20 text-white hover:bg-white/10 transition-all"
                        >
                          Get Directions
                        </a>
                        <button
                          onClick={() => shareLocation(
                            ipData.location.coordinates!.lat,
                            ipData.location.coordinates!.lng,
                            formattedAddress || getFallbackAddress() || undefined,
                            ipData.ip
                          )}
                          className="px-4 py-2 rounded-xl font-medium text-sm border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all"
                        >
                          Share Location
                        </button>
                        <button
                          onClick={() => {
                            const addr = formattedAddress || getFallbackAddress();
                            if (addr) copyToClipboard(addr, 'address');
                          }}
                          className="px-4 py-2 rounded-xl font-medium text-sm border border-white/20 text-white hover:bg-white/10 transition-all"
                        >
                          Copy Address
                        </button>
                        <button
                          onClick={() => setShowQuickInfo(v => !v)}
                          className="px-4 py-2 rounded-xl font-medium text-sm border border-white/20 text-white hover:bg-white/10 transition-all"
                        >
                          {showQuickInfo ? 'Hide Info' : 'Show Info'}
                        </button>
                      </div>
                    </div>

                    {showQuickInfo && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                          <div className="text-sm text-cyan-300 mb-1">Coordinates</div>
                          <div className="font-semibold text-lg text-white">
                            {ipData.location.coordinates.lat.toFixed(6)}, {ipData.location.coordinates.lng.toFixed(6)}
                          </div>
                        </div>
                        <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4">
                          <div className="text-sm text-purple-300 mb-1">Location</div>
                          <div className="font-semibold text-lg text-white">
                            {formattedAddress || getFallbackAddress() || 'Unknown'}
                          </div>
                        </div>
                        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                          <div className="text-sm text-green-300 mb-1">Network</div>
                          <div className="font-semibold text-lg text-white">
                            {ipData.network.organization || ipData.network.isp || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Location Information */}
                <GlassCard title="Location Information" icon={<MapPin className="w-5 h-5" />}>
                  <div className="space-y-0">
                    <InfoRow label="Address" value={formattedAddress || getFallbackAddress() || undefined} copyable />
                    <InfoRow label="City" value={ipData.location.city} />
                    <InfoRow label="Region" value={ipData.location.region} />
                    <InfoRow label="Country" value={ipData.location.country} />
                    <InfoRow label="Postal Code" value={ipData.location.postal} />
                    <InfoRow label="Timezone" value={ipData.location.timezone} />
                    {ipData.location.coordinates && (
                      <InfoRow 
                        label="Coordinates" 
                        value={`${ipData.location.coordinates.lat}, ${ipData.location.coordinates.lng}`}
                        copyable 
                      />
                    )}
                  </div>
                </GlassCard>

                {/* Network Information */}
                <GlassCard title="Network Information" icon={<Server className="w-5 h-5" />}>
                  <div className="space-y-0">
                    <InfoRow label="ISP" value={ipData.network.isp} copyable />
                    <InfoRow label="Organization" value={ipData.network.organization} />
                    <InfoRow label="ASN" value={ipData.network.asn} copyable />
                    <InfoRow label="ASN Name" value={ipData.network.asnName} />
                    <InfoRow label="Domain" value={ipData.network.domain} copyable />
                    <InfoRow label="Type" value={ipData.network.type} />
                  </div>
                </GlassCard>

                {/* Security Information */}
                <GlassCard title="Security Analysis" icon={<Shield className="w-5 h-5" />}>
                  <div className="space-y-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getThreatColor(ipData.security.threat)}`}>
                      {getThreatIcon(ipData.security.threat)}
                      <span className="font-medium">Threat Level: {ipData.security.threat.toUpperCase()}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${ipData.security.isVPN ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className="text-sm text-gray-300">VPN: {ipData.security.isVPN ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${ipData.security.isProxy ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className="text-sm text-gray-300">Proxy: {ipData.security.isProxy ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${ipData.security.isTor ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className="text-sm text-gray-300">Tor: {ipData.security.isTor ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${ipData.security.isHosting ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <span className="text-sm text-gray-300">Hosting: {ipData.security.isHosting ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    
                    {ipData.security.service && (
                      <InfoRow label="Service" value={ipData.security.service} />
                    )}
                  </div>
                </GlassCard>

                {/* Metadata Information */}
                <GlassCard title="Additional Information" icon={<Clock className="w-5 h-5" />}>
                  <div className="space-y-0">
                    <InfoRow label="Hostname" value={ipData.metadata.hostname} copyable />
                    <InfoRow label="Data Source" value={ipData.metadata.source} />
                    <InfoRow 
                      label="Last Updated" 
                      value={new Date(ipData.metadata.lastUpdated).toLocaleString()} 
                    />
                    {ipData.metadata.userAgent && (
                      <div className="py-2">
                        <span className="text-sm font-medium text-gray-400 block mb-1">User Agent</span>
                        <span className="text-xs text-gray-300 bg-white/5 p-2 rounded block break-all border border-white/5">
                          {ipData.metadata.userAgent}
                        </span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>

              {/* Abuse Contact (if available) */}
              {ipData.abuse && (
                <div 
                  className="result-section rounded-2xl p-6 mb-8 border border-yellow-500/30 bg-yellow-500/10"
                >
                  <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Abuse Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-yellow-400">Contact:</span>
                      <p className="text-yellow-200">{ipData.abuse.contact}</p>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-400">Network:</span>
                      <p className="text-yellow-200">{ipData.abuse.network}</p>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-400">Name:</span>
                      <p className="text-yellow-200">{ipData.abuse.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Data Toggle */}
              <div 
                className="result-section rounded-2xl p-6 border border-white/10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">
                    {showRawData ? 'Hide' : 'Show'} Raw API Data
                  </span>
                </button>
                
                {showRawData && rawData && (
                  <div className="mt-4">
                    <div className="bg-black/50 rounded-xl p-4 overflow-auto border border-white/10">
                      <pre className="text-green-400 text-sm">
                        {JSON.stringify(rawData, null, 2)}
                      </pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(rawData, null, 2), 'rawData')}
                      className="mt-3 px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/10"
                    >
                      {copiedField === 'rawData' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy Raw Data
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Toast notification */}
        {toast && (
          <div 
            className="fixed bottom-4 right-4 px-4 py-3 rounded-xl shadow-lg z-50 border"
            style={{
              background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                         toast.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                         'rgba(59, 130, 246, 0.9)',
              borderColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 
                          toast.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 
                          'rgba(59, 130, 246, 0.5)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-white text-sm font-medium">{toast.message}</p>
          </div>
        )}

        {/* Doctor Network Chat Widget */}
        <DoctorNetworkChat 
          ipContext={ipData ? {
            ip: ipData.ip,
            location: ipData.location,
            network: ipData.network,
            security: ipData.security
          } : undefined}
        />
      </div>
    </>
  );
}
