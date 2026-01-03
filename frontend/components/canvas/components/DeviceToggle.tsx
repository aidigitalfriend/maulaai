'use client';

import { BRAND_COLORS, DEVICE_STYLES } from '../constants';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceToggleProps {
  activeDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
}

const DEVICE_ICONS: Record<DeviceType, JSX.Element> = {
  desktop: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  tablet: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  mobile: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

export default function DeviceToggle({ activeDevice, onDeviceChange }: DeviceToggleProps) {
  const devices: DeviceType[] = ['desktop', 'tablet', 'mobile'];

  return (
    <div className={`flex items-center gap-1 ${BRAND_COLORS.bgSecondary} rounded-lg p-1`}>
      {devices.map((device) => (
        <button
          key={device}
          onClick={() => onDeviceChange(device)}
          className={`p-1.5 rounded-md transition-all ${
            activeDevice === device
              ? `${BRAND_COLORS.btnPrimary}`
              : `${BRAND_COLORS.textSecondary} hover:text-white`
          }`}
          title={`${device.charAt(0).toUpperCase() + device.slice(1)} (${DEVICE_STYLES[device].width})`}
        >
          {DEVICE_ICONS[device]}
        </button>
      ))}
    </div>
  );
}
