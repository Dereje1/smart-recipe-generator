import '@testing-library/jest-dom'

// Mock the ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

global.console = {
    ...global.console,
    log: console.log,
    error: jest.fn(),
    warn: console.warn,
    info: console.info,
    debug: console.debug,
    dir: console.dir,
  };