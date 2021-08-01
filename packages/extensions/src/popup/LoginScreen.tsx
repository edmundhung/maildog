import React from 'react';

interface Props {
  isLoading: boolean;
  onLogin: () => void;
  onLearnMore: () => void;
}

function LoginScreen({
  isLoading,
  onLogin,
  onLearnMore,
}: Props): React.ReactElement {
  return (
    <main className="flex flex-col items-center w-72 h-96 bg-primary">
      <figure className="flex-grow flex items-center">
        <img
          className={`w-32 h-32 text-secondary ${
            isLoading ? 'animate-spin' : ''
          }`}
          src="./assets/logo.svg"
          alt="logo"
        />
        <figcaption className="hidden">maildog</figcaption>
      </figure>
      <footer className={`w-full py-2 text-sm ${isLoading ? 'invisible' : ''}`}>
        <div className="py-1 px-4">
          <button
            className="w-full p-2 rounded text-primary bg-white focus:outline-white"
            type="button"
            onClick={onLogin}
          >
            Login with GitHub
          </button>
        </div>
        <div className="py-1 px-4">
          <button
            className="w-full p-2 text-white focus:outline-white"
            type="button"
            onClick={onLearnMore}
          >
            Learn more
          </button>
        </div>
      </footer>
    </main>
  );
}

export default LoginScreen;
