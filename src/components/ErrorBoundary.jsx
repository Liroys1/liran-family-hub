import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow p-6">
            <div className="font-semibold mb-2">אופס, משהו נשבר</div>
            <div className="text-sm text-gray-600 mb-4">{String(this.state.error?.message || this.state.error)}</div>
            <button className="px-3 py-1 rounded-xl border" onClick={()=>location.reload()}>רענון</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}