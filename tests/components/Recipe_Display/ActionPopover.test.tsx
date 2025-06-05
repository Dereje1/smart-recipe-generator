import { render, screen, fireEvent, within } from '@testing-library/react';
import { ActionPopover } from '../../../src/components/Recipe_Display/ActionPopover';
import { stub_recipe_1 } from '../../stub';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('next/image', () => {
  return {
    __esModule: true,
    default: (props: any) => {
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text, react/display-name
      return <img {...props} />;
    },
  };
});

const pushMock = jest.fn();

const baseHandlers = () => ({
    handleClone: jest.fn(),
    handleCopy: jest.fn(),
    handlePlayRecipe: jest.fn(),
    deleteDialog: jest.fn(),
    deleteRecipe: jest.fn(),
    closeDialog: undefined as (() => void) | undefined,
});

const baseStates = () => ({
    hasAudio: false,
    isLoadingAudio: false,
    isPlayingAudio: false,
    linkCopied: false,
    isDeleteDialogOpen: false,
});

const baseData = () => ({
    recipe: { ...stub_recipe_1 },
    buttonType: <span>Menu</span>,
});

const renderPopover = (handlers = baseHandlers(), states = baseStates(), data = baseData()) => {
    return render(
        <ActionPopover handlers={handlers} states={states} data={data} />
    );
};

beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock, events: { on: jest.fn(), off: jest.fn() } });
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://base.url';
    const alertRoot = document.createElement('div');
    alertRoot.setAttribute('id', 'alert-root');
    document.body.appendChild(alertRoot);
    jest.clearAllMocks();
});

afterEach(() => {
    const alertRoot = document.getElementById('alert-root');
    alertRoot?.remove();
});

const openPopover = (container?: HTMLElement) => {
  const queryRoot = container ? within(container) : screen;
  fireEvent.click(queryRoot.getByRole('button', { name: 'Menu' }));
};


test('calls handleClone when clone ingredients clicked', () => {
    const handlers = baseHandlers();
    handlers.handleClone = jest.fn();
    renderPopover(handlers);
    openPopover();
    fireEvent.click(screen.getByText('Clone Ingredients'));
    expect(handlers.handleClone).toHaveBeenCalled();
});

test('opens recipe in new tab and closes dialog', () => {
    const handlers = baseHandlers();
    handlers.closeDialog = jest.fn();
    renderPopover(handlers);
    global.open = jest.fn();
    openPopover();
    fireEvent.click(screen.getByText('Open Recipe'));
    expect(handlers.closeDialog).toHaveBeenCalled();
    expect(global.open).toHaveBeenCalledWith(
        'https://base.url/RecipeDetail?recipeId=6683b8d38475eac9af5fe838',
        '_blank',
        'noopener,noreferrer'
    );
});

test('calls handleCopy when copy link clicked', () => {
    const handlers = baseHandlers();
    handlers.handleCopy = jest.fn();
    renderPopover(handlers);
    openPopover();
    fireEvent.click(screen.getByText('Copy Link'));
    expect(handlers.handleCopy).toHaveBeenCalled();
});

test('displays correct audio controls', async () => {
  const { container: c1 } = renderPopover(baseHandlers(), { ...baseStates(), hasAudio: true });
  openPopover(c1);
  expect(await screen.findByText('Play Recipe')).toBeInTheDocument();

  const { container: c2 } = renderPopover(baseHandlers(), { ...baseStates(), hasAudio: false });
  openPopover(c2);
  expect(await screen.findByText('Generate Audio')).toBeInTheDocument();

  const { container: c3 } = renderPopover(baseHandlers(), { ...baseStates(), isPlayingAudio: true });
  openPopover(c3);
  expect(await screen.findByText('Stop Playing')).toBeInTheDocument();
});

test('shows loading indicator while audio is loading', () => {
    const states = baseStates();
    states.isLoadingAudio = true;
    renderPopover(baseHandlers(), states);
    openPopover();
    expect(screen.getByAltText('audio-load-gif')).toBeInTheDocument();
});

test('renders alert when linkCopied is true', async () => {
    const states = baseStates();
    states.linkCopied = true;
    renderPopover(baseHandlers(), states);
    expect(await screen.findByText('Recipe_1_name copied to clipboard!')).toBeInTheDocument();
});

test('opens delete dialog when isDeleteDialogOpen is true', () => {
    const states = baseStates();
    states.isDeleteDialogOpen = true;
    renderPopover(baseHandlers(), states);
    expect(screen.getByText('Permanently delete Recipe_1_name ?')).toBeInTheDocument();
});

