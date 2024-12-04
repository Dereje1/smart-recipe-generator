import { render, screen, fireEvent } from '@testing-library/react';
import ScrollToTopButton from '../../../src/components/ScrollToTopButton';

describe('ScrollToTopButton', () => {
  beforeAll(() => {
    // Mock the window.scrollTo method
    global.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the button when scrolled down', () => {
    // Render the component
    render(<ScrollToTopButton />);

    // Mock the scrollY value and dispatch the scroll event
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
    fireEvent.scroll(window);

    // Check if the button is visible
    const button = screen.getByRole('button', { name: '↑' });
    expect(button).toBeInTheDocument();
  });

  it('hides the button when scrolled up', () => {
    // Render the component
    render(<ScrollToTopButton />);

    // Mock the scrollY value and dispatch the scroll event
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    fireEvent.scroll(window);

    // Check if the button is not visible
    const button = screen.queryByRole('button', { name: '↑' });
    expect(button).not.toBeInTheDocument();
  });

  it('scrolls to top when clicked', () => {
    // Render the component
    render(<ScrollToTopButton />);

    // Mock the scrollY value and dispatch the scroll event
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
    fireEvent.scroll(window);

    // Find the button and simulate a click
    const button = screen.getByRole('button', { name: '↑' });
    fireEvent.click(button);

    // Check if scrollTo was called
    expect(global.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });
});
