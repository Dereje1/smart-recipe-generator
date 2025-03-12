import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import Loading from "../../src/components/Loading";

describe('Loading Component', () => {

  // Basic render test
  it('renders the default spinner', () => {
    const { container } = render(<Loading />);
    expect(container).toMatchSnapshot();
  });

  // Test for Progress Bar (Recipe Generation)
  it('displays progress bar with generation messages', () => {
    render(<Loading isProgressBar loadingType="generation" />);

    // Check for initial generation message
    expect(screen.getByText(/Chopping up some fresh ingredients/i)).toBeInTheDocument();

    // Check if progress bar exists
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  // Test for Progress Bar (Recipe Saving)
  it('displays progress bar with saving messages', () => {
    render(<Loading isProgressBar loadingType="saving" />);

    // Check for initial saving message
    expect(screen.getByText(/Generating beautiful images/i)).toBeInTheDocument();

    // Check if progress bar exists
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  // Test Completion State
  it('shows completion message when isComplete is true', () => {
    render(<Loading isProgressBar isComplete={true} />);

    const completeMessage = screen.getByText(/Your recipe is ready/i);
    expect(completeMessage).toBeInTheDocument();
  });

  // Test Final Message Before Completion (Saving)
  it('displays final saving message before completion', async () => {
    jest.useFakeTimers();

    render(<Loading isProgressBar loadingType="saving" />);

    // Fast-forward to trigger the final message
    act(() => {
      jest.advanceTimersByTime(30000); // Simulate 20 seconds
    });

    const finalMessage = await screen.findByText(/Putting it all together/i);
    expect(finalMessage).toBeInTheDocument();

    jest.useRealTimers();
  });

  // Test Final Message Before Completion (Generation)
  it('displays final generation message before completion', async () => {
    jest.useFakeTimers();

    render(<Loading isProgressBar loadingType="generation" />);

    // Fast-forward to trigger the final message
    act(() => {
      jest.advanceTimersByTime(30000); // Simulate 20 seconds
    });

    const finalMessage = await screen.findByText(/Finalizing your recipe/i);
    expect(finalMessage).toBeInTheDocument();

    jest.useRealTimers();
  });
});
