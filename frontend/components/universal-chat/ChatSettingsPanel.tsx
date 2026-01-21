'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  XMarkIcon,
  Cog6ToothIcon,
  SparklesIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  ChatBubbleBottomCenterTextIcon,
  BoltIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import type { AIProvider } from '../../app/agents/types';
import { PROVIDER_MODEL_OPTIONS, getAgentProviderOptions } from '../../lib/aiProviders';

export interface AgentSettings {
  temperature: number;
  maxTokens: number;
  mode: 'professional' | 'balanced' | 'creative' | 'fast' | 'coding';
  systemPrompt: string;
  provider: AIProvider;
  model: string;
}

// Neural presets from Neural-Link Interface
export const NEURAL_PRESETS = {
  educational: {
    name: 'Educational',
    icon: AcademicCapIcon,
    prompt:
      'You are an educational mentor. Use clear logic, step-by-step explanations, and helpful analogies. Make complex topics accessible.',
    temp: 0.5,
    tokens: 2500,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  professional: {
    name: 'Professional',
    icon: BriefcaseIcon,
    prompt:
      'You are a professional business advisor. Use formal language, precise data, and actionable insights. Be concise and results-oriented.',
    temp: 0.3,
    tokens: 2000,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  creative: {
    name: 'Creative',
    icon: SparklesIcon,
    prompt:
      'You are a creative visionary. Generate imaginative, novel, and thought-provoking responses. Think outside the box and explore unconventional ideas.',
    temp: 1.2,
    tokens: 3000,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  coding: {
    name: 'Coding',
    icon: CodeBracketIcon,
    prompt:
      'You are a senior software engineer. Provide clean, well-documented code with clear explanations. Follow best practices and include error handling.',
    temp: 0.4,
    tokens: 4000,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  conversational: {
    name: 'Casual Chat',
    icon: ChatBubbleBottomCenterTextIcon,
    prompt:
      'You are a friendly conversational partner. Be warm, engaging, and personable. Use casual language and show genuine interest.',
    temp: 0.8,
    tokens: 2000,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  experimental: {
    name: 'Experimental',
    icon: BeakerIcon,
    prompt:
      'You are an experimental AI pushing boundaries. Be bold, unconventional, and exploratory. Challenge assumptions and offer unique perspectives.',
    temp: 1.5,
    tokens: 3500,
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
};

interface ChatSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgentSettings;
  onUpdateSettings: (settings: Partial<AgentSettings>) => void;
  onResetSettings: () => void;
  agentName: string;
  agentId?: string;
  theme?: 'default' | 'neural';
  isLeftPanel?: boolean;
}

export default function ChatSettingsPanel({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
  agentName,
  agentId = '',
  theme = 'default',
  isLeftPanel = false,
}: ChatSettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    'presets'
  );
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Get agent-specific provider options
  const providerOptions = useMemo(() => getAgentProviderOptions(agentId), [agentId]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const applyPreset = (presetKey: string) => {
    const preset = NEURAL_PRESETS[presetKey as keyof typeof NEURAL_PRESETS];
    if (!preset) return;

    setActivePreset(presetKey);
    onUpdateSettings({
      systemPrompt: preset.prompt,
      temperature: preset.temp,
      maxTokens: preset.tokens,
      mode: presetKey as AgentSettings['mode'],
    });
  };

  const isNeural = theme === 'neural';

  // Theme-based styles
  const panelStyles = isNeural
    ? 'bg-gray-900/95 border-cyan-500/30 !text-[#E5E7EB]'
    : 'bg-white border-gray-200 text-gray-900';

  const headerStyles = isNeural
    ? 'bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600'
    : 'bg-gradient-to-r from-indigo-500 to-purple-600';

  const sectionStyles = isNeural
    ? 'bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/30'
    : 'bg-gray-50 border-gray-200 hover:border-indigo-300';

  const inputStyles = isNeural
    ? 'bg-gray-800 border-gray-700 !text-[#E5E7EB] focus:border-cyan-500 focus:ring-cyan-500/20'
    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500';

  const sliderAccent = isNeural ? 'accent-cyan-500' : 'accent-indigo-600';

  if (!isOpen) return null;

  // Left panel mode (like sessions sidebar)
  if (isLeftPanel) {
    return (
      <div
        className={`w-72 flex-shrink-0 flex flex-col h-full border-r ${panelStyles} transition-all duration-300`}
      >
        {/* Header */}
        <div
          className={`${headerStyles} px-4 py-3 flex items-center justify-between flex-shrink-0`}
        >
          <div className="flex items-center space-x-2">
            {isNeural ? (
              <CpuChipIcon className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <Cog6ToothIcon className="w-5 h-5 text-white" />
            )}
            <div>
              <h3 className="text-white font-bold text-sm">
                {isNeural ? 'Neural Config' : 'Settings'}
              </h3>
              <p className="text-white/70 text-xs">{agentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all"
            title="Back to Sessions"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          {/* Presets */}
          <div className={`rounded-xl border p-3 ${sectionStyles}`}>
            <h4
              className={`text-xs font-semibold mb-2 ${
                isNeural ? 'text-cyan-400' : 'text-indigo-600'
              }`}
            >
              AI Presets
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(NEURAL_PRESETS).map(([key, preset]) => {
                const IconComponent = preset.icon;
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${preset.color} text-white shadow-md`
                        : `${preset.bgColor} ${preset.borderColor} border hover:scale-[1.02]`
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature */}
          <div className={`rounded-xl border p-3 ${sectionStyles}`}>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-medium ${
                  isNeural ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Temperature
              </span>
              <span
                className={`text-xs font-mono ${
                  isNeural ? 'text-cyan-400' : 'text-indigo-600'
                }`}
              >
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) =>
                onUpdateSettings({ temperature: parseFloat(e.target.value) })
              }
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${sliderAccent}`}
            />
          </div>

          {/* Max Tokens */}
          <div className={`rounded-xl border p-3 ${sectionStyles}`}>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-medium ${
                  isNeural ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Max Tokens
              </span>
              <span
                className={`text-xs font-mono ${
                  isNeural ? 'text-cyan-400' : 'text-indigo-600'
                }`}
              >
                {settings.maxTokens}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="8000"
              step="500"
              value={settings.maxTokens}
              onChange={(e) =>
                onUpdateSettings({ maxTokens: parseInt(e.target.value) })
              }
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${sliderAccent}`}
            />
          </div>

          {/* AI Assistant Selection */}
          <div className={`rounded-xl border p-3 ${sectionStyles}`}>
            <h4
              className={`text-xs font-semibold mb-2 ${
                isNeural ? 'text-cyan-400' : 'text-indigo-600'
              }`}
            >
              AI Assistant
            </h4>
            <select
              value={settings.provider}
              onChange={(e) => {
                const newProvider = e.target.value as AIProvider;
                const providerOption = providerOptions.find(
                  (opt) => opt.provider === newProvider
                );
                const firstModel =
                  providerOption?.models[0]?.value || settings.model;
                onUpdateSettings({
                  provider: newProvider,
                  model: firstModel,
                });
              }}
              className={`w-full px-2 py-1.5 rounded-lg text-xs border ${inputStyles}`}
            >
              {providerOptions.map((opt) => (
                <option key={opt.provider} value={opt.provider}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className={`block text-xs mt-2 mb-1 ${isNeural ? 'text-gray-400' : 'text-gray-500'}`}>
              Response Style
            </label>
            <select
              value={settings.model}
              onChange={(e) => onUpdateSettings({ model: e.target.value })}
              className={`w-full px-2 py-1.5 rounded-lg text-xs border ${inputStyles}`}
            >
              {(
                providerOptions.find(
                  (opt) => opt.provider === settings.provider
                )?.models || []
              ).map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={onResetSettings}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1 ${
              isNeural
                ? 'bg-gray-800 hover:bg-gray-700 !text-[#E5E7EB] border border-gray-700'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            }`}
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>
    );
  }

  // Original floating panel mode
  return (
    <div
      ref={panelRef}
      className={`absolute right-4 top-16 z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-xl ${panelStyles}`}
      style={isNeural ? { boxShadow: '0 0 40px rgba(0, 255, 255, 0.15)' } : {}}
    >
      {/* Header */}
      <div
        className={`${headerStyles} px-5 py-4 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-3">
          {isNeural ? (
            <CpuChipIcon className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <Cog6ToothIcon className="w-6 h-6 text-white" />
          )}
          <div>
            <h3 className="text-white font-bold text-lg">
              {isNeural ? 'Neural Configuration' : 'Agent Settings'}
            </h3>
            <p className="text-white/70 text-xs">{agentName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Neural Presets Section */}
        <div className={`rounded-xl border transition-all ${sectionStyles}`}>
          <button
            onClick={() =>
              setExpandedSection(
                expandedSection === 'presets' ? null : 'presets'
              )
            }
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <BoltIcon
                className={`w-5 h-5 ${
                  isNeural ? 'text-cyan-400' : 'text-indigo-500'
                }`}
              />
              <span className="font-semibold">Neural Presets</span>
            </div>
            {expandedSection === 'presets' ? (
              <ChevronUpIcon className="w-4 h-4 opacity-60" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 opacity-60" />
            )}
          </button>

          {expandedSection === 'presets' && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {Object.entries(NEURAL_PRESETS).map(([key, preset]) => {
                const Icon = preset.icon;
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className={`p-3 rounded-xl border-2 transition-all text-left group ${
                      isActive
                        ? `${preset.bgColor} ${preset.borderColor} shadow-lg`
                        : isNeural
                          ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div
                        className={`p-1.5 rounded-lg bg-gradient-to-br ${preset.color}`}
                      >
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-medium text-sm">{preset.name}</span>
                    </div>
                    <p
                      className={`text-xs ${
                        isNeural ? 'text-gray-400' : 'text-gray-500'
                      } line-clamp-2`}
                    >
                      Temp: {preset.temp} · {preset.tokens} tokens
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Temperature Section */}
        <div className={`rounded-xl border p-4 ${sectionStyles}`}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold">Temperature</label>
            <span
              className={`text-sm font-mono px-2.5 py-1 rounded-lg ${
                isNeural
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              {settings.temperature.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={settings.temperature}
            onChange={(e) =>
              onUpdateSettings({ temperature: parseFloat(e.target.value) })
            }
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              isNeural ? 'bg-gray-700' : 'bg-gray-200'
            } ${sliderAccent}`}
          />
          <div
            className={`flex justify-between text-xs mt-2 ${
              isNeural ? 'text-gray-500' : 'text-gray-500'
            }`}
          >
            <span>🎯 Precise</span>
            <span>⚖️ Balanced</span>
            <span>🎨 Creative</span>
          </div>
        </div>

        {/* Max Tokens Section */}
        <div className={`rounded-xl border p-4 ${sectionStyles}`}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold">Response Length</label>
            <span
              className={`text-sm font-mono px-2.5 py-1 rounded-lg ${
                isNeural
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              {settings.maxTokens}
            </span>
          </div>
          <input
            type="range"
            min="256"
            max="4096"
            step="128"
            value={settings.maxTokens}
            onChange={(e) =>
              onUpdateSettings({ maxTokens: parseInt(e.target.value) })
            }
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              isNeural ? 'bg-gray-700' : 'bg-gray-200'
            } ${sliderAccent}`}
          />
          <div
            className={`flex justify-between text-xs mt-2 ${
              isNeural ? 'text-gray-500' : 'text-gray-500'
            }`}
          >
            <span>Brief</span>
            <span>Standard</span>
            <span>Detailed</span>
          </div>
        </div>

        {/* Model Provider Section */}
        <div className={`rounded-xl border transition-all ${sectionStyles}`}>
          <button
            onClick={() =>
              setExpandedSection(expandedSection === 'model' ? null : 'model')
            }
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <CpuChipIcon
                className={`w-5 h-5 ${
                  isNeural ? 'text-purple-400' : 'text-indigo-500'
                }`}
              />
              <span className="font-semibold">AI Model</span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isNeural
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {settings.provider}
              </span>
              {expandedSection === 'model' ? (
                <ChevronUpIcon className="w-4 h-4 opacity-60" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 opacity-60" />
              )}
            </div>
          </button>

          {expandedSection === 'model' && (
            <div className="px-4 pb-4 space-y-3">
              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    isNeural ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Provider
                </label>
                <select
                  value={settings.provider}
                  onChange={(e) => {
                    const newProvider = e.target.value as AIProvider;
                    const providerOption = providerOptions.find(
                      (opt) => opt.provider === newProvider
                    );
                    const firstModel =
                      providerOption?.models[0]?.value || settings.model;
                    onUpdateSettings({
                      provider: newProvider,
                      model: firstModel,
                    });
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${inputStyles}`}
                >
                  {providerOptions.map((opt) => (
                    <option key={opt.provider} value={opt.provider}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    isNeural ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Model
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => onUpdateSettings({ model: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${inputStyles}`}
                >
                  {(
                    providerOptions.find(
                      (opt) => opt.provider === settings.provider
                    )?.models || []
                  ).map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* System Prompt Section */}
        <div className={`rounded-xl border transition-all ${sectionStyles}`}>
          <button
            onClick={() =>
              setExpandedSection(expandedSection === 'prompt' ? null : 'prompt')
            }
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <ChatBubbleBottomCenterTextIcon
                className={`w-5 h-5 ${
                  isNeural ? 'text-pink-400' : 'text-indigo-500'
                }`}
              />
              <span className="font-semibold">System Prompt</span>
            </div>
            {expandedSection === 'prompt' ? (
              <ChevronUpIcon className="w-4 h-4 opacity-60" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 opacity-60" />
            )}
          </button>

          {expandedSection === 'prompt' && (
            <div className="px-4 pb-4">
              <textarea
                value={settings.systemPrompt}
                onChange={(e) =>
                  onUpdateSettings({ systemPrompt: e.target.value })
                }
                placeholder="Custom instructions for the agent..."
                rows={4}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm resize-none ${inputStyles}`}
              />
              <p
                className={`text-xs mt-2 ${
                  isNeural ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                These instructions guide the agent's behavior and personality.
              </p>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetSettings}
          className={`w-full py-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center space-x-2 ${
            isNeural
              ? 'border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
              : 'border-gray-300 hover:border-red-300 text-gray-500 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Reset to Defaults</span>
        </button>
      </div>

      {/* Footer Status */}
      <div
        className={`px-4 py-3 border-t ${
          isNeural
            ? 'border-gray-800 bg-gray-900/50'
            : 'border-gray-100 bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className={isNeural ? 'text-gray-500' : 'text-gray-500'}>
            Settings auto-saved
          </span>
          <div className="flex items-center space-x-1.5">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                isNeural ? 'bg-cyan-400' : 'bg-green-400'
              }`}
            />
            <span className={isNeural ? 'text-cyan-400' : 'text-green-600'}>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
