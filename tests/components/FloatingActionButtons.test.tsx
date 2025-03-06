import { render, screen, fireEvent } from '@testing-library/react';
import FloatingActionButtons from '../../src/components/FloatingActionButtons';

const routePushMock = jest.fn();

jest.mock("next/router", () => ({
    useRouter: jest.fn(() => ({
        pathname: 'mocked Path',
        push: routePushMock
    })),
}));

describe('FloatingActionButtons', () => {
  beforeAll(() => {
    // Mock the window.scrollTo method
    global.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the "Create Recipe" button', () => {
    render(<FloatingActionButtons />);

    const createButton = screen.getByRole('button', { name: 'Create Recipe' });
    expect(createButton).toBeInTheDocument();
  });

  it('navigates to the Create Recipe page when "Create Recipe" button is clicked', () => {
    render(<FloatingActionButtons />);

    const createButton = screen.getByRole('button', { name: 'Create Recipe' });
    fireEvent.click(createButton);

    expect(routePushMock).toHaveBeenCalledWith('/CreateRecipe');
  });

  it('renders the "Scroll to Top" button when scrolled down', () => {
    render(<FloatingActionButtons />);

    // Mock the scrollY value and dispatch the scroll event
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
    fireEvent.scroll(window);

    const scrollButton = screen.getByRole('button', { name: 'Scroll to Top' });
    expect(scrollButton).toBeInTheDocument();
  });

  it('hides the "Scroll to Top" button when at the top of the page', () => {
    render(<FloatingActionButtons />);

    // Mock the scrollY value and dispatch the scroll event
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    fireEvent.scroll(window);

    const scrollButton = screen.queryByRole('button', { name: 'Scroll to Top' });
    expect(scrollButton).not.toBeInTheDocument();
  });

  it('scrolls to top when "Scroll to Top" button is clicked', () => {
    render(<FloatingActionButtons />);

    // Mock the scrollY value and dispatch the scroll event
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
    fireEvent.scroll(window);

    const scrollButton = screen.getByRole('button', { name: 'Scroll to Top' });
    fireEvent.click(scrollButton);

    expect(global.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
