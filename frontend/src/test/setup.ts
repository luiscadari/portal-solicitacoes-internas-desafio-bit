import '@testing-library/jest-dom';

// APIs de navegador usadas pelos componentes Radix (shadcn/ui) e ausentes no jsdom.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver ?? (ResizeObserverStub as unknown as typeof ResizeObserver);
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? jest.fn();
Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture ?? jest.fn(() => false);
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture ?? jest.fn();
