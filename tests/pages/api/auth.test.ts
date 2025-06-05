/**
 * @jest-environment node
 */
import type { Adapter } from 'next-auth/adapters';
import type { DefaultSession } from 'next-auth';

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => 'handler'),
}));

const adapterMock = jest.fn(() => ({ name: 'adapter' } as unknown as Adapter));

// ⚠️ TypeScript will throw a "spread argument must be a tuple" error
// if we try to mock MongoDBAdapter using a spread (...args) inside jest.mock.
// This is because TypeScript cannot guarantee the args are a tuple in this context.
// Using a regular function and `arguments` sidesteps the issue safely.
jest.mock('@next-auth/mongodb-adapter', () => ({
  MongoDBAdapter: function () {
    return adapterMock.apply(this, arguments as any);
  },
}));

jest.mock('../../../src/lib/mongodb', () => ({
  clientPromise: 'clientPromiseMock',
}));

describe('authOptions configuration', () => {
  let authOptions: any;
  let NextAuth: jest.Mock;
  beforeEach(() => {
    jest.resetModules();
    NextAuth = require('next-auth').default;
    ({ authOptions } = require('../../../src/pages/api/auth/[...nextauth]'));
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('NextAuth is called with the exported authOptions', () => {
    expect(NextAuth).toHaveBeenCalledWith(authOptions);
    expect(adapterMock).toHaveBeenCalledWith('clientPromiseMock');
    expect(authOptions.adapter).toEqual({ name: 'adapter' });
  });

  test('custom profile transformer is exposed via options', () => {
    const provider = authOptions.providers[0];
    const prof = provider.options.profile({ sub: 'abc', email: 'e@x.com' });
    expect(prof).toEqual({
      id: 'abc',
      name: 'Anonymous',
      email: 'e@x.com',
      image: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
    });
  });

  test('callbacks modify session and redirect correctly', async () => {
    const sess = { user: {} } as DefaultSession;
    const returned = await authOptions.callbacks.session({ session: sess, token: {}, user: { id: 'u1' } });
    expect(returned.user.id).toBe('u1');

    const same = await authOptions.callbacks.redirect({ url: 'https://site.com/RecipeDetail/1', baseUrl: 'https://base/' });
    expect(same).toBe('https://site.com/RecipeDetail/1');
    const base = await authOptions.callbacks.redirect({ url: 'https://site.com/other', baseUrl: 'https://base/' });
    expect(base).toBe('https://base/');
  });
});
