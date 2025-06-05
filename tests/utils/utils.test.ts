import { getSession } from "next-auth/react"
import axios from "axios";
import { updateRecipeList, getServerSidePropsUtility, call_api, playAudio, paginationQueryHelper } from "../../src/utils/utils";
import { PaginationQueryType } from "../../src/types";
import { stubRecipeBatch } from "../stub";

jest.useFakeTimers();
jest.mock('axios');
jest.mock("next-auth/react")


describe('Refreshing a list of recipes', () => {
    it('will modify a list of recipes', () => {
        const modifiedRecipe = {
            ...stubRecipeBatch[1],
            likedBy: []
        }
        const updatedList = updateRecipeList(stubRecipeBatch, modifiedRecipe);
        expect(updatedList[1].likedBy).toEqual([])
    })
    it('will remove from a list of recipes', () => {
        expect(stubRecipeBatch.length).toBe(2)
        const updatedList = updateRecipeList(stubRecipeBatch, null, '6683b8d38475eac9af5fe838');
        expect(updatedList.length).toBe(1)
    })
})

describe('getServerSideProps abstraction utility', () => {
    let axiosSpy: any;
    beforeEach(() => {
        axiosSpy = jest.spyOn(axios, 'get');
    })
    afterEach(() => {
        axiosSpy.mockClear()
    })
    it('will redirect to root if there is no user session', async () => {
        (getSession as jest.Mock).mockImplementationOnce(() => null)
        const result = await getServerSidePropsUtility({} as any, '/any')
        expect(result).toEqual({ redirect: { destination: '/', permanent: false } })
    })

    it('will succesfully return the props', async () => {
        (getSession as jest.Mock).mockImplementationOnce(() => 'active session')
        axiosSpy.mockImplementationOnce(() => Promise.resolve({ data: 'succesfully got recipe data' }))
        const result = await getServerSidePropsUtility({ req: { headers: { cookie: 'a cookie' } } } as any, '/any')
        expect(result).toEqual({ props: { recipes: 'succesfully got recipe data' } })
    })

    it('will return an empty array for the props if the request gets rejected', async () => {
        (getSession as jest.Mock).mockImplementationOnce(() => 'active session')
        axiosSpy.mockImplementationOnce(() => Promise.reject())
        const result = await getServerSidePropsUtility({ req: { headers: { cookie: 'a cookie' } } } as any, '/any')
        expect(result).toEqual({ props: { recipes: [] } })
    })
})

describe('The api call making utility', () => {
    it('shall execute', async () => {
        (axios.get as jest.Mock).mockImplementationOnce(() => Promise.resolve({ data: 'succesfully executed' }))
        const ans = await call_api({ address: 'mock-address' });
        expect(ans).toBe('succesfully executed')
    })
    it('shall handle failures', async () => {
        (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('API call failed')))
        await expect(call_api({ address: 'mock-address' })).rejects.toThrow('API call failed');
    })
})

/*
Note: this entire function was tested by GPT4-o, had to tweak jest.timers() and ordering to make it work
see original @: gpt-testing.md
*/

describe('playAudio', () => {
    let mockAudioInstance: jest.Mocked<HTMLAudioElement>;
    let mockAudioRef: { current: HTMLAudioElement | null };

    beforeEach(() => {
        // Mock the HTMLAudioElement
        mockAudioInstance = {
            preload: '',
            load: jest.fn(),
            play: jest.fn(),
            oncanplaythrough: null,
            onerror: null,
            onended: null,
        } as unknown as jest.Mocked<HTMLAudioElement>;

        // Mock Audio constructor
        jest.spyOn(global, 'Audio').mockImplementation(() => mockAudioInstance);

        // Mock the audioRef
        mockAudioRef = { current: null };
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('should preload and play audio successfully', async () => {
        // Simulate successful loading
        const playMock = jest.fn().mockResolvedValue(undefined);
        mockAudioInstance.play = playMock;

        const onEndMock = jest.fn();

        // Trigger preload success
        const preloadTrigger = () => {
            if (mockAudioInstance.oncanplaythrough) {
                mockAudioInstance.oncanplaythrough(new Event('canplaythrough'));
            }
        };

        setTimeout(preloadTrigger, 100);
        // Start the function
        const result = playAudio('mock-audio-url', mockAudioRef, onEndMock);
        jest.runAllTimers(); // advance timers
        await expect(result).resolves.toBeUndefined();

        // Assertions
        expect(mockAudioInstance.load).toHaveBeenCalledTimes(1);
        expect(playMock).toHaveBeenCalledTimes(1);
        expect(mockAudioRef.current).toBe(mockAudioInstance as HTMLAudioElement);
    });

    test('should call onEnd when audio finishes playing', async () => {
        const playMock = jest.fn().mockResolvedValue(undefined);
        mockAudioInstance.play = playMock;

        const onEndMock = jest.fn();

        const preloadTrigger = () => {
            if (mockAudioInstance.oncanplaythrough) {
                mockAudioInstance.oncanplaythrough(new Event('canplaythrough'));
            }
        };

        setTimeout(preloadTrigger, 100);

        const endTrigger = () => {
            if (mockAudioInstance.onended) {
                mockAudioInstance.onended(new Event('ended'));
            }
        };

        setTimeout(endTrigger, 200);
        const result = playAudio('mock-audio-url', mockAudioRef, onEndMock);
        jest.runAllTimers();
        // Assertions
        expect(onEndMock).toHaveBeenCalledTimes(1);
    });

    test('should handle audio loading error', async () => {
        const errorTrigger = () => {
            if (mockAudioInstance.onerror) {
                mockAudioInstance.onerror(new Event('error'));
            }
        };

        setTimeout(errorTrigger, 100);
        const result = playAudio('mock-audio-url', mockAudioRef);
        jest.runAllTimers();
        await expect(result).rejects.toThrow('Error loading audio');
    });

    test('should handle audio loading timeout', async () => {
        const preloadTrigger = () => {
            if (mockAudioInstance.oncanplaythrough) {
                mockAudioInstance.oncanplaythrough(new Event('canplaythrough'));
            }
        };

        setTimeout(preloadTrigger, 21000); // Beyond 10-second timeout
        const result = playAudio('mock-audio-url', mockAudioRef);
        jest.runAllTimers();
        await expect(result).rejects.toThrow('Audio loading timeout');
    });

    test('should handle audio playback error', async () => {
        const playMock = jest.fn().mockRejectedValue(new Error('Playback error'));
        mockAudioInstance.play = playMock;

        const preloadTrigger = () => {
            if (mockAudioInstance.oncanplaythrough) {
                mockAudioInstance.oncanplaythrough(new Event('canplaythrough'));
            }
        };

        setTimeout(preloadTrigger, 100);
        const result = playAudio('mock-audio-url', mockAudioRef);
        jest.runAllTimers();
        await expect(result).rejects.toThrow('Playback error');
    });
});

describe('paginationQueryHelper', () => {
  test('returns defaults when query object is empty', () => {
    const result = paginationQueryHelper({} as PaginationQueryType);
    expect(result).toEqual({ page: 1, limit: 12, skip: 0, sortOption: 'popular', query: undefined });
  });

  test('converts page and limit to numbers', () => {
    const result = paginationQueryHelper({ page: '2', limit: '5' } as PaginationQueryType);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.skip).toBe(5);
  });

  test('handles sortOption and query strings', () => {
    const result = paginationQueryHelper({ page: '1', limit: '10', sortOption: 'recent', query: 'apple' });
    expect(result.sortOption).toBe('recent');
    expect(result.query).toBe('apple');
  });
});
