import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Uncaught Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('secret_bubble_last_track');
      localStorage.removeItem('secret_bubble_last_time');
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) caches.delete(name);
        });
      }
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#121212] text-white p-6 select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Secret-Bubble</h1>
          <p className="text-sm text-[#b3b3b3] text-center max-w-sm mb-6">
            An unexpected error occurred while loading. Tap below to reload seamlessly.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-full bg-[#1ed760] text-black font-semibold text-sm hover:scale-[1.02] active:scale-95 transition cursor-pointer shadow-lg"
            >
              Reload App
            </button>
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-full bg-[#242424] hover:bg-[#333] text-white font-medium text-xs transition cursor-pointer border border-white/10"
            >
              Reset Cache & Restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
