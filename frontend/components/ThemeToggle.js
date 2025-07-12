import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme, isDark } = useTheme();

  const themes = [
    { key: 'light', icon: Sun, label: 'Light' },
    { key: 'dark', icon: Moon, label: 'Dark' },
    { key: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className={`relative ${className}`}>
      <div className="glass-surface rounded-xl p-1 flex gap-1">
        {themes.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={`
              relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              flex items-center gap-2 min-w-[80px] justify-center
              ${theme === key 
                ? 'text-white shadow-lg' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }
            `}
          >
            {theme === key && (
              <div
                className="absolute inset-0 bg-primary rounded-lg"
              />
            )}
            <Icon size={16} className="relative z-10" />
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;