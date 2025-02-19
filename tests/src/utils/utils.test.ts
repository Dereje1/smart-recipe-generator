import { getSession } from "next-auth/react"
import axios from "axios";
import { updateRecipeList, getFilteredRecipes, getServerSidePropsUtility, call_api, playAudio } from "../../../src/utils/utils";
import { stubRecipeBatch } from "../../stub";

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

describe('Filtering recipes (search)', () => {
    it('will return the full list if no search term is provided', () => {
      const result = getFilteredRecipes(stubRecipeBatch, null);
      expect(result).toEqual(stubRecipeBatch);
    });
  
    it('will filter by name', () => {
      const result = getFilteredRecipes(stubRecipeBatch, 'recipe_1');
      expect(result).toEqual([stubRecipeBatch[0]]);
    });
  
    it('will filter by ingredients', () => {
      const result = getFilteredRecipes(stubRecipeBatch, 'recipe_2_ingredi');
      expect(result).toEqual([stubRecipeBatch[1]]);
    });
  
    it('will filter by dietary preferences', () => {
      const result = getFilteredRecipes(stubRecipeBatch, 'recipe_1_preference_1');
      expect(result).toEqual([stubRecipeBatch[0]]);
    });
  
    // New test case: primary tag search should take precedence.
    // Assume stubRecipeBatch[0] has a tag that includes 'specialtag'.
    it('will filter exclusively by tags when tag matches exist', () => {
      const result = getFilteredRecipes(stubRecipeBatch, 'specialtag');
      // Even if other recipes match via name/ingredients/diet, only those with a matching tag should be returned.
      expect(result).toEqual([stubRecipeBatch[0]]);
    });
  
    // New test case: fallback search should be used if no tag matches are found.
    // Assume no recipe has a tag that includes 'Recipe_2_name', but stubRecipeBatch[1] matches via name, ingredient, or dietary preference.
    it('will use fallback search (name, ingredients, dietary preferences) when no tag matches exist', () => {
      const result = getFilteredRecipes(stubRecipeBatch, 'Recipe_2_name');
      expect(result).toEqual([stubRecipeBatch[1]]);
    });
  });
  

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
