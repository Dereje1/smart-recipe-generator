import '@testing-library/jest-dom'

// Mock the ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// console.error and .info will not show up in tests
global.console = {
    ...global.console,
    error: jest.fn(),
    info: jest.fn(),
    log: console.log,
    warn: console.warn,
    debug: console.debug,
    dir: console.dir,
  };