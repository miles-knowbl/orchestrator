import {
  Shield,
  UserCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ApprovalTypeConfig {
  icon: LucideIcon;
  label: string;
  bgClass: string;
  textClass: string;
  iconClass: string;
  borderClass: string;
}

export function getApprovalTypeConfig(type?: string): ApprovalTypeConfig {
  switch (type) {
    case 'human':
      return {
        icon: UserCheck,
        label: 'Human Review',
        bgClass: 'bg-amber-500/10',
        textClass: 'text-amber-400',
        iconClass: 'text-amber-400',
        borderClass: 'border-amber-500/30',
      };
    case 'auto':
      return {
        icon: Zap,
        label: 'Automated',
        bgClass: 'bg-blue-500/10',
        textClass: 'text-blue-400',
        iconClass: 'text-blue-400',
        borderClass: 'border-blue-500/30',
      };
    case 'conditional':
      return {
        icon: HelpCircle,
        label: 'Conditional',
        bgClass: 'bg-purple-500/10',
        textClass: 'text-purple-400',
        iconClass: 'text-purple-400',
        borderClass: 'border-purple-500/30',
      };
    default:
      return {
        icon: Shield,
        label: 'Gate',
        bgClass: 'bg-gray-500/10',
        textClass: 'text-gray-400',
        iconClass: 'text-gray-400',
        borderClass: 'border-[#333]',
      };
  }
}
