import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
  ];

  return (
    <aside className="w-64 bg-background-dark min-h-screen border-r border-text-muted/20 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-text-muted/20">
        <h1 className="text-2xl font-bold text-white">Focus Builder</h1>
        <p className="text-xs text-text-muted mt-1">Pomodoro Tracker</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-background-dark shadow-lg'
                      : 'text-text-muted hover:bg-background-dark/50 hover:text-white'
                  }`
                }
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-text-muted/20">
        <div className="text-xs text-text-muted text-center">
          Build your focus, one session at a time
        </div>
      </div>
    </aside>
  );
};
