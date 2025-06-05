import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Notifications from '../../src/components/Notifications';
import * as apiCalls from '../../src/utils/utils';
import { useRouter } from 'next/router';
import { stubNotifications } from '../stub';

jest.mock('../../src/utils/utils', () => ({
  ...jest.requireActual('../../src/utils/utils'),
  call_api: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const pushMock = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  jest.clearAllMocks();
});

const openPopover = () => {
  fireEvent.click(screen.getByRole('button', { name: 'View notifications' }));
};

it('fetches and displays notifications with unread count', async () => {
  (apiCalls.call_api as jest.Mock).mockResolvedValueOnce(stubNotifications);
  render(<Notifications />);

  openPopover();
  expect(await screen.findByText('stub_message_1')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument();
});

it('marks a notification as read', async () => {
  (apiCalls.call_api as jest.Mock).mockResolvedValueOnce(stubNotifications);
  render(<Notifications />);

  openPopover();
  await screen.findByText('stub_message_1');
  (apiCalls.call_api as jest.Mock).mockResolvedValueOnce({});
  fireEvent.click(screen.getByText('Mark as Read'));

  await waitFor(() =>
    expect(apiCalls.call_api).toHaveBeenLastCalledWith({
      address: '/api/read-notification?id=stub_id_1',
      method: 'put',
    })
  );
  expect(screen.queryByText('Mark as Read')).not.toBeInTheDocument();
});

it('navigates to recipe on view button click', async () => {
  (apiCalls.call_api as jest.Mock).mockResolvedValueOnce(stubNotifications);
  render(<Notifications />);

  openPopover();
  await screen.findByText('stub_message_1');
  fireEvent.click(screen.getByText('View Recipe'));

  expect(pushMock).toHaveBeenCalledWith('/RecipeDetail?recipeId=stub_recipe_id');
});

it('shows See All button when more than five notifications', async () => {
  const many = Array.from({ length: 6 }).map((_, i) => ({
    ...stubNotifications[0],
    _id: `id${i}`,
    recipeId: `id${i}`,
    message: `msg${i}`,
  }));
  (apiCalls.call_api as jest.Mock).mockResolvedValueOnce(many);
  render(<Notifications />);

  openPopover();
  await screen.findByText('msg0');
  const seeAll = screen.getByText('See All Notifications');
  expect(seeAll).toBeInTheDocument();
  fireEvent.click(seeAll);
  expect(pushMock).toHaveBeenCalledWith('/NotificationsPage');
});

it('displays no notifications message', async () => {
  (apiCalls.call_api as jest.Mock).mockResolvedValueOnce([]);
  render(<Notifications />);

  openPopover();
  expect(await screen.findByText('You have no notifications.')).toBeInTheDocument();
});

