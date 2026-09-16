import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import type { ThemeMode } from '../../store/AppContext';

const OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

/**
 * Light / Dark / System picker, styled to match CategoryView's sort
 * dropdown (same solid bg-white/dark panel, same border and hover
 * treatment), so the two dropdown patterns on the site look like one
 * system rather than two different ones.
 *
 * 'System' follows the visitor's device setting and keeps following it live
 * if that changes, see the matching effect in AppContext. Picking Light or
 * Dark is a deliberate override that sticks until they change it again.
 */
export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  const CurrentIcon = current.Icon;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex items-center justify-center hover:scale-[1.05] transition-transform duration-200 p-1"
        title={`Theme: ${current.label}`}
        aria-label={`Change theme, currently ${current.label}`}
      >
        <CurrentIcon
          size={20}
          strokeWidth={2.25}
          className="text-gray-700 dark:text-gray-300 hover:text-jt-blue dark:hover:text-jt-mint transition-colors"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-lg z-50 overflow-hidden">
          {OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-[#ece9fa] dark:hover:bg-[#3626a7]/20 ${
                theme === value ? 'font-bold brand-text' : 'text-gray-600 dark:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={15} />
                {label}
              </span>
              {theme === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
