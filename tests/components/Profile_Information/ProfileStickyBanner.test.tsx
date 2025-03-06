import { render, screen, fireEvent } from '@testing-library/react';
import ProfileStickyBanner from '../../../src/components/Profile_Information/ProfileStickyBanner';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('ProfileStickyBanner Component', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    localStorage.clear();
  });

  it('renders the banner when user has no recipes', () => {
    render(<ProfileStickyBanner userHasRecipes={false} />);

    expect(screen.getByText('👩‍🍳 Ready to Cook?')).toBeInTheDocument();
    expect(screen.getByText('Create your first recipe now and share your culinary ideas!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '🍽️ Create a Recipe' })).toBeInTheDocument();
  });

  it('does not render when user has recipes', () => {
    render(<ProfileStickyBanner userHasRecipes={true} />);

    expect(screen.queryByText('👩‍🍳 Ready to Cook?')).not.toBeInTheDocument();
  });

  it('does not render when banner has been dismissed', () => {
    localStorage.setItem('dismissedRecipeBanner', 'true');
    render(<ProfileStickyBanner userHasRecipes={false} />);

    expect(screen.queryByText('👩‍🍳 Ready to Cook?')).not.toBeInTheDocument();
  });

  it('navigates to recipe creation when "Create Recipe" button is clicked', () => {
    render(<ProfileStickyBanner userHasRecipes={false} />);

    const createButton = screen.getByRole('button', { name: '🍽️ Create a Recipe' });
    fireEvent.click(createButton);

    expect(mockRouterPush).toHaveBeenCalledWith('/CreateRecipe');
  });

  it('dismisses the banner when close button is clicked', () => {
    render(<ProfileStickyBanner userHasRecipes={false} />);

    const closeButton = screen.getByRole('button', { name: 'close' });
    fireEvent.click(closeButton);

    expect(screen.queryByText('👩‍🍳 Ready to Cook?')).not.toBeInTheDocument();
    expect(localStorage.getItem('dismissedRecipeBanner')).toBe('true');
  });
});
