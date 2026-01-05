import React from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { MneeCheckoutWithoutProviders, MneeSharedProviders } from '@mnee-pay/checkout';
import checkoutStyles from '@mnee-pay/checkout/styles.css?inline';

interface ButtonInstance {
  id: string;
  element: HTMLElement;
  props: {
    buttonId: string;
    theme?: 'light' | 'dark' | 'auto';
    apiBaseUrl?: string;
  };
}

const buttonRegistry = new Map<string, ButtonInstance>();
let root: ReactDOM.Root | null = null;
let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  try {
    const styleId = 'mnee-pay-embed-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = checkoutStyles;
      document.head.appendChild(styleEl);
    }
    stylesInjected = true;
  } catch (e) {
    console.error('[MneePay] Failed to inject styles', e);
  }
}

const SharedRoot = () => {
  const instances = Array.from(buttonRegistry.values());

  return (
    <MneeSharedProviders>
      {instances.map((inst) => (
        <React.Fragment key={inst.id}>
          {createPortal(
            <MneeCheckoutWithoutProviders
              buttonId={inst.props.buttonId}
              theme={inst.props.theme}
              apiBaseUrl={inst.props.apiBaseUrl || ''}
              onSuccess={(result) => {
                inst.element.dispatchEvent(
                  new CustomEvent('mnee-payment-success', {
                    detail: result,
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
              onError={(error) => {
                inst.element.dispatchEvent(
                  new CustomEvent('mnee-payment-error', {
                    detail: error,
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
              onCancel={() => {
                inst.element.dispatchEvent(
                  new CustomEvent('mnee-payment-cancel', {
                    bubbles: true,
                    composed: true,
                  })
                );
              }}
            />,
            inst.element
          )}
        </React.Fragment>
      ))}
    </MneeSharedProviders>
  );
};

function updateRoot() {
  if (!root) {
    const container = document.createElement('div');
    container.id = 'mnee-pay-shared-root';
    container.style.display = 'none';
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  }
  root.render(<SharedRoot />);
}

function registerInstance(instance: ButtonInstance) {
  buttonRegistry.set(instance.id, instance);
  updateRoot();
}

function unregisterInstance(id: string) {
  if (buttonRegistry.delete(id)) {
    updateRoot();
  }
}

class MneeButtonElement extends HTMLElement {
  private instanceId: string;
  private mountPoint: HTMLDivElement;

  static get observedAttributes() {
    return ['id', 'button-id', 'theme', 'api-base-url'];
  }

  constructor() {
    super();
    this.instanceId = Math.random().toString(36).slice(2, 9);
    this.mountPoint = document.createElement('div');
    this.mountPoint.classList.add('mnee-embed-mount');
  }

  connectedCallback() {
    injectStyles();
    this.appendChild(this.mountPoint);

    const buttonId = this.getAttribute('button-id') || this.getAttribute('id');
    const theme = (this.getAttribute('theme') as 'light' | 'dark' | 'auto') || 'auto';
    
    const apiBaseUrl = this.getAttribute('api-base-url') || 'https://api.pay.mnee.io'; // Default production API base URL

    if (!buttonId) {
      console.warn('[MneePay] <mnee-button> missing button-id attribute.');
      return;
    }

    registerInstance({
      id: this.instanceId,
      element: this.mountPoint,
      props: { buttonId, theme, apiBaseUrl },
    });
  }

  disconnectedCallback() {
    unregisterInstance(this.instanceId);
    this.mountPoint.remove();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue || !buttonRegistry.has(this.instanceId)) return;

    const instance = buttonRegistry.get(this.instanceId)!;
    if (name === 'id' || name === 'button-id') instance.props.buttonId = newValue;
    if (name === 'theme') instance.props.theme = newValue as any;
    if (name === 'api-base-url') instance.props.apiBaseUrl = newValue;
    
    registerInstance(instance);
  }
}

if (typeof window !== 'undefined' && !customElements.get('mnee-button')) {
  customElements.define('mnee-button', MneeButtonElement);
}