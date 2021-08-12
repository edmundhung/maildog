import React, { useRef } from 'react';
import { Config } from '../types';

interface MainScreenProps {
  repository: string;
  configByDomain: Record<string, Config> | null;
  emails: string[];
  onNavigate: () => void;
  onNewEmailRequested: (domain: string) => void;
  onEmailClicked: (email: string) => void;
  onPassphraseProvided: (passphrase: string) => void;
  onUpdate: (config: Config) => void;
}

function MainScreen({
  repository,
  configByDomain,
  emails,
  onNavigate,
  onNewEmailRequested,
  onEmailClicked,
  onPassphraseProvided,
  onOptionUpdate,
}: Props): React.ReactElement {
  const ref = useRef<HTMLInputElement>();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passpharse = ref.current?.value;

    if (!passpharse) {
      return;
    }

    onPassphraseProvided(passpharse);
  };

  return (
    <main className="flex flex-col w-72 h-96 bg-primary">
      <header className="flex flex-row pt-10 pb-4 px-6">
        <h1 className="flex-grow text-base text-white">{repository}</h1>
        <button
          type="button"
          className="focus:outline-white"
          onClick={onNavigate}
        >
          <svg
            className="fill-current text-white rounded-full hover:bg-white hover:bg-opacity-25"
            viewBox="0 0 30 80"
            width="20"
            height="20"
          >
            <rect width="10" height="10" rx="10" x="10" y="15"></rect>
            <rect width="10" height="10" rx="10" x="10" y="35"></rect>
            <rect width="10" height="10" rx="10" x="10" y="55"></rect>
          </svg>
        </button>
      </header>
      {configByDomain === null ? (
        <form className="flex flex-col flex-grow px-6" onSubmit={handleSubmit}>
          <div className="flex-grow">
            <input
              ref={ref}
              type="password"
              className="w-full h-8 p-4 focus:outline-white"
              placeholder="Passphrase"
              tabIndex="0"
              autoFocus
            />
          </div>
          <footer className="w-full py-2 text-sm">
            <div className="py-1">
              <button
                className="w-full p-2 rounded text-primary bg-white focus:outline-white"
                type="submit"
              >
                Decrypt
              </button>
            </div>
            <div className="py-1">
              <button
                className="w-full p-2 text-white focus:outline-white"
                type="button"
                onClick={onNavigate}
              >
                Back
              </button>
            </div>
          </footer>
        </form>
      ) : (
        <>
          <ul>
            {Object.keys(configByDomain).map((domain) => (
              <li key={domain} className="py-1 pr-6">
                <summary className="inline-block w-full text-left px-6 py-1 rounded-r bg-white text-primary">
                  {domain}
                </summary>
                <ul className="px-6 py-2 text-white">
                  <li className="py-1">
                    <button
                      type="button"
                      className="hover:text-secondary focus:outline-white"
                      onClick={() => onNewEmailRequested(domain)}
                    >
                      Generate email address
                    </button>
                  </li>
                  {emails
                    .filter((address) => address.endsWith(`@${domain}`))
                    .map((email) => (
                      <li key={email}>
                        <button
                          type="button"
                          className="hover:text-secondary focus:outline-white"
                          onClick={() => onEmailClicked(email)}
                        >
                          {email}
                        </button>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default MainScreen;
