import { Sun, Moon, Flame, Plus, Trash2, ShoppingBag, Pencil, Menu, ChevronUp } from 'lucide-react';

export const SunIcon = ({ className }) => <Sun className={className || "w-4 h-4"} />;
export const MoonIcon = ({ className }) => <Moon className={className || "w-4 h-4"} />;

export const FlameIcon = ({ className, level = 'Spark', isLit = true }) => {
  let strokeColor = '#2F5D50'; // primary green
  let glowColor = 'rgba(47, 93, 80, 0.4)';
  
  if (!isLit) {
    strokeColor = '#94a3b8';
    glowColor = 'rgba(148,163,184,0.1)';
  } else if (level === 'Blaze') {
    strokeColor = '#D4A017'; // warning yellow/gold
    glowColor = 'rgba(212, 160, 23, 0.6)';
  } else if (level === 'Mythic Flame') {
    strokeColor = '#C44536'; // danger red/orange
    glowColor = 'rgba(196, 69, 54, 0.8)';
  }

  return (
    <Flame 
      className={`${className} transition-all duration-500 ${isLit ? 'animate-pulse' : ''}`}
      style={{ filter: `drop-shadow(0 0 12px ${glowColor})`, color: strokeColor }}
      strokeWidth={isLit ? 2.5 : 1.5}
    />
  );
};

export const PlusIcon = ({ className }) => <Plus className={className || "w-5 h-5"} />;
export const TrashIcon = ({ className }) => <Trash2 className={className || "w-4 h-4"} />;
export const ShoppingBagIcon = ({ className }) => <ShoppingBag className={className || "w-5 h-5"} />;
export const PencilIcon = ({ className }) => <Pencil className={className || "w-4 h-4"} />;
export const MenuIcon = ({ className }) => <Menu className={className || "w-5 h-5"} />;
export const ChevronUpIcon = ({ className }) => <ChevronUp className={className || "w-4 h-4"} />;
