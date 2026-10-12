import React from 'react';
import {
  Flame,
  Zap,
  Wine,
  Coffee,
  Pill,
  Skull,
  Shield,
  Heart,
  Sparkles,
  AlertCircle,
  Activity,
  Dice5,
  Cookie,
  Wind,
  Dumbbell,
  Brain,
  DollarSign,
  Droplets,
  Package,
  Layers,
  Cigarette,
  GlassWater,
  Sparkle,
} from 'lucide-react';

export interface IconOption {
  id: string;
  label: string;
}

export const AVAILABLE_ICONS: IconOption[] = [
  { id: 'flame', label: 'Flame / Fire' },
  { id: 'cigarette', label: 'Cigarette' },
  { id: 'zap', label: 'Energy / Zap' },
  { id: 'wine', label: 'Alcohol / Wine' },
  { id: 'coffee', label: 'Caffeine / Coffee' },
  { id: 'glass-water', label: 'Drink / Glass' },
  { id: 'pill', label: 'Pill / Medication' },
  { id: 'skull', label: 'Toxicity / Skull' },
  { id: 'wind', label: 'Vape / Smoke' },
  { id: 'dice', label: 'Gambling / Dice' },
  { id: 'cookie', label: 'Sugar / Binge' },
  { id: 'droplets', label: 'Liquid' },
  { id: 'dumbbell', label: 'Body / Habit' },
  { id: 'brain', label: 'Mind / Craving' },
  { id: 'shield', label: 'Shield / Defense' },
  { id: 'heart', label: 'Heart / Health' },
  { id: 'sparkles', label: 'Sparkles / Clean' },
  { id: 'activity', label: 'Pulse / Spike' },
  { id: 'dollar-sign', label: 'Financial' },
  { id: 'package', label: 'Package / Substance' },
];

export const PRESET_COLORS: { hex: string; label: string }[] = [
  { hex: '#EF4444', label: 'Crimson' },
  { hex: '#F97316', label: 'Amber' },
  { hex: '#F59E0B', label: 'Gold' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#06B6D4', label: 'Cyan' },
  { hex: '#3B82F6', label: 'Cobalt' },
  { hex: '#8B5CF6', label: 'Violet' },
  { hex: '#EC4899', label: 'Rose' },
  { hex: '#64748B', label: 'Slate' },
  { hex: '#14B8A6', label: 'Teal' },
];

interface MonochromeIconProps {
  name: string;
  colorHex?: string;
  size?: number;
  className?: string;
  showContainer?: boolean;
  containerSize?: 'sm' | 'md' | 'lg';
  isDarkMode?: boolean;
}

export const MonochromeIcon: React.FC<MonochromeIconProps> = ({
  name,
  colorHex = '#3B82F6',
  size = 20,
  className = '',
  showContainer = false,
  containerSize = 'md',
  isDarkMode = true,
}) => {
  const getIconElement = () => {
    const iconProps = {
      size,
      strokeWidth: 2,
      style: { color: colorHex },
      className: 'transition-colors',
    };

    switch (name.toLowerCase()) {
      case 'flame':
      case 'fire':
        return <Flame {...iconProps} />;
      case 'cigarette':
      case 'smoking':
        return <Cigarette {...iconProps} />;
      case 'zap':
      case 'energy':
      case 'bolt':
        return <Zap {...iconProps} />;
      case 'wine':
      case 'beer':
      case 'alcohol':
        return <Wine {...iconProps} />;
      case 'coffee':
      case 'caffeine':
        return <Coffee {...iconProps} />;
      case 'glass-water':
      case 'drink':
        return <GlassWater {...iconProps} />;
      case 'pill':
      case 'drugs':
        return <Pill {...iconProps} />;
      case 'skull':
        return <Skull {...iconProps} />;
      case 'wind':
      case 'vape':
        return <Wind {...iconProps} />;
      case 'dice':
      case 'gambling':
        return <Dice5 {...iconProps} />;
      case 'cookie':
      case 'sugar':
      case 'food':
        return <Cookie {...iconProps} />;
      case 'droplets':
        return <Droplets {...iconProps} />;
      case 'dumbbell':
        return <Dumbbell {...iconProps} />;
      case 'brain':
        return <Brain {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      case 'heart':
        return <Heart {...iconProps} />;
      case 'sparkles':
      case 'sparkle':
        return <Sparkles {...iconProps} />;
      case 'activity':
      case 'pulse':
        return <Activity {...iconProps} />;
      case 'dollar-sign':
      case 'money':
        return <DollarSign {...iconProps} />;
      case 'package':
      default:
        return <Package {...iconProps} />;
    }
  };

  if (!showContainer) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{getIconElement()}</span>;
  }

  const containerDimensions =
    containerSize === 'sm'
      ? 'w-8 h-8 rounded-lg'
      : containerSize === 'lg'
      ? 'w-14 h-14 rounded-2xl'
      : 'w-11 h-11 rounded-xl';

  // Dynamic light/dark mode badge tinting:
  // Light mode: 12% opacity tint background, sharp accent border
  // Dark mode: Dark slate background (#1E1E1E) with 15% opacity accent glow and hairline border
  const containerBgStyle = isDarkMode
    ? {
        backgroundColor: '#1E1E1E',
        borderColor: `${colorHex}33`,
        boxShadow: `0 0 12px ${colorHex}15`,
      }
    : {
        backgroundColor: `${colorHex}14`,
        borderColor: `${colorHex}30`,
      };

  return (
    <div
      className={`inline-flex items-center justify-center border shrink-0 transition-all ${containerDimensions} ${className}`}
      style={containerBgStyle}
    >
      {getIconElement()}
    </div>
  );
};
