import React from 'react';

interface NavigationScreenProps {
  repository: string | null;
  options: string[];
  onSelect: (repo: string) => void;
  onInstall: () => void;
  onLogout: () => void;
}

function NavigationScreen({
  repository,
  options,
  onSelect,
  onInstall,
  onLogout,
}: Props): React.ReactElement {
  return (
    <main className="flex flex-col w-72 h-96 bg-primary">
      <header className="pt-10 pb-4 px-6">
        <h1 className="text-base text-white">Select a repository</h1>
      </header>
      <div className="flex flex-col divide-dotted divide-y divide-white text-white h-full pb-6">
        <div className="flex-grow py-6">
          <ul>
            {options.slice(0, 5).map((option) => (
              <li key={option} className="py-1 pr-6">
                <button
                  className={`inline-block w-full text-left px-6 py-1 rounded-r focus:outline-white ${
                    option === repository
                      ? 'bg-white text-primary'
                      : 'hover:bg-white hover:text-primary hover:opacity-50 focus:bg-white focus:text-primary focus:opacity-50'
                  }`}
                  type="button"
                  onClick={() => onSelect(option)}
                >
                  {option.split('/').join(' / ')}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          className="block w-full py-2 px-6 text-left focus:outline-white"
          type="button"
          onClick={onInstall}
        >
          Install additional repository
        </button>
        <button
          className="block w-full py-2 px-6 text-left focus:outline-white"
          type="button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </main>
  );
}

export default NavigationScreen;
