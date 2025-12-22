/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component, PropsWithChildren } from 'react';

class ErrorBoundary extends Component<PropsWithChildren, { hasError: boolean; errorInfo: any}> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    this.setState({ errorInfo: info });
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo ? this.state.errorInfo.componentStack : null}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary
