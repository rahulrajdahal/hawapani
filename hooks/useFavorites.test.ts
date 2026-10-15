import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let states: any[] = [];
let stateIndex = 0;
let effectFn: (() => void | (() => void)) | undefined = undefined;
let renderCallback: (() => void) | undefined = undefined;

vi.mock('react', () => ({
  useState: (initial: any) => {
    const currentIndex = stateIndex++;
    if (states[currentIndex] === undefined) {
      states[currentIndex] = typeof initial === 'function' ? initial() : initial;
    }
    const setState = (newVal: any) => {
      states[currentIndex] = typeof newVal === 'function' ? newVal(states[currentIndex]) : newVal;
      if (renderCallback) {
        renderCallback();
      }
    };
    return [states[currentIndex], setState];
  },
  useEffect: (cb: () => void | (() => void)) => {
    effectFn = cb;
  },
}));

import {
  DEFAULT_FAVORITES,
  FAVORITES_STORAGE_KEY,
  addFavoriteEntry,
  isFavoriteMatch,
  migrateLegacyFavorites,
  normalizeCity,
  removeFavoriteEntry,
  useFavorites,
} from './useFavorites';

describe('useFavorites domain logic', () => {
  describe('DEFAULT_FAVORITES', () => {
    it('includes "Douglas, Isle of Man" by default instead of ambiguous "Douglas"', () => {
      expect(DEFAULT_FAVORITES).toContain('Douglas, Isle of Man');
      expect(DEFAULT_FAVORITES).not.toContain('Douglas');
    });
  });

  describe('migrateLegacyFavorites', () => {
    it('migrates legacy "Douglas" entries to "Douglas, Isle of Man"', () => {
      const legacy = ['Bhaktapur', 'Auckland', 'Douglas', 'Canberra'];
      const migrated = migrateLegacyFavorites(legacy);
      expect(migrated).toEqual([
        'Bhaktapur',
        'Auckland',
        'Douglas, Isle of Man',
        'Canberra',
      ]);
    });

    it('preserves already qualified or other cities untouched', () => {
      const current = ['Douglas, Isle of Man', 'Tokyo, Japan', 'London'];
      expect(migrateLegacyFavorites(current)).toEqual(current);
    });
  });

  describe('isFavoriteMatch', () => {
    const favorites = ['Bhaktapur', 'Auckland', 'Douglas, Isle of Man', 'Canberra'];

    it('matches exact favorite city names', () => {
      expect(isFavoriteMatch(favorites, 'Douglas, Isle of Man')).toBe(true);
      expect(isFavoriteMatch(favorites, 'Bhaktapur')).toBe(true);
      expect(isFavoriteMatch(favorites, 'Auckland')).toBe(true);
    });

    it('matches case-insensitively and with trimmed whitespace', () => {
      expect(isFavoriteMatch(favorites, '  douglas, isle of man  ')).toBe(true);
      expect(isFavoriteMatch(favorites, 'AUCKLAND')).toBe(true);
    });

    it('matches when city and country are passed separately', () => {
      expect(isFavoriteMatch(favorites, 'Douglas', 'Isle of Man')).toBe(true);
      expect(isFavoriteMatch(favorites, 'Douglas', 'isle of man')).toBe(true);
    });

    it('matches target string that includes country when country parameter is omitted', () => {
      expect(isFavoriteMatch(favorites, 'Douglas, Isle of Man')).toBe(true);
    });

    it('CRITICAL: NEVER matches "Douglasville" when favorite is "Douglas, Isle of Man"', () => {
      expect(isFavoriteMatch(favorites, 'Douglasville')).toBe(false);
      expect(isFavoriteMatch(favorites, 'Douglasville, USA')).toBe(false);
      expect(isFavoriteMatch(favorites, 'Douglasville', 'United States of America')).toBe(false);
    });

    it('does not match "Douglas" when country differs (e.g. Douglas, USA)', () => {
      expect(isFavoriteMatch(favorites, 'Douglas', 'United States of America')).toBe(false);
    });

    it('returns false for undefined or empty input', () => {
      expect(isFavoriteMatch(favorites, undefined)).toBe(false);
      expect(isFavoriteMatch(favorites, null)).toBe(false);
      expect(isFavoriteMatch(favorites, '')).toBe(false);
    });
  });

  describe('addFavoriteEntry', () => {
    const initial = ['Auckland', 'Canberra'];

    it('adds a new city with country when specified', () => {
      const result = addFavoriteEntry(initial, 'Douglas', 'Isle of Man');
      expect(result).toContain('Douglas, Isle of Man');
      expect(result).toHaveLength(3);
    });

    it('prevents adding duplicates', () => {
      const result1 = addFavoriteEntry(initial, 'Auckland');
      expect(result1).toEqual(initial);

      const withDouglas = ['Douglas, Isle of Man'];
      const result2 = addFavoriteEntry(withDouglas, 'Douglas', 'Isle of Man');
      expect(result2).toEqual(withDouglas);
    });

    it('ignores empty or whitespace-only additions', () => {
      expect(addFavoriteEntry(initial, '   ')).toEqual(initial);
    });
  });

  describe('removeFavoriteEntry', () => {
    const list = ['Bhaktapur', 'Douglas, Isle of Man', 'Canberra'];

    it('removes matching city by full string', () => {
      const updated = removeFavoriteEntry(list, 'Douglas, Isle of Man');
      expect(updated).not.toContain('Douglas, Isle of Man');
      expect(updated).toHaveLength(2);
    });

    it('removes matching city case-insensitively', () => {
      const updated = removeFavoriteEntry(list, 'bhaktapur');
      expect(updated).not.toContain('Bhaktapur');
      expect(updated).toHaveLength(2);
    });

    it('CRITICAL: removing "Douglasville" does NOT remove "Douglas, Isle of Man"', () => {
      const updated = removeFavoriteEntry(list, 'Douglasville');
      expect(updated).toContain('Douglas, Isle of Man');
      expect(updated).toEqual(list);
    });

    it('does not remove city when city names match but countries differ', () => {
      const listWithLondon = ['London, UK'];
      const updated = removeFavoriteEntry(listWithLondon, 'London, Canada');
      expect(updated).toEqual(['London, UK']);
    });

    it('removes qualified favorite when unqualified base name is supplied', () => {
      const listWithLondon = ['London, UK'];
      const updated = removeFavoriteEntry(listWithLondon, 'London');
      expect(updated).toEqual([]);
    });
  });
});

describe('useFavorites hook', () => {
  let mockStorage: Record<string, string>;

  function renderFavoritesHook() {
    let currentHook!: ReturnType<typeof useFavorites>;
    const render = () => {
      stateIndex = 0;
      currentHook = useFavorites();
    };
    renderCallback = render;
    render();
    effectFn?.();
    return {
      get current() {
        return currentHook;
      },
    };
  }

  beforeEach(() => {
    states = [];
    stateIndex = 0;
    effectFn = undefined;
    renderCallback = undefined;
    mockStorage = {};

    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };

    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('initializes localStorage with DEFAULT_FAVORITES when no existing storage is found', () => {
    const runner = renderFavoritesHook();
    expect(runner.current.isLoaded).toBe(true);
    expect(runner.current.favorites).toEqual(DEFAULT_FAVORITES);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(DEFAULT_FAVORITES)
    );
  });

  it('loads and migrates legacy favorites from localStorage', () => {
    mockStorage[FAVORITES_STORAGE_KEY] = JSON.stringify(['Douglas', 'Auckland']);

    const runner = renderFavoritesHook();

    expect(runner.current.favorites).toEqual(['Douglas, Isle of Man', 'Auckland']);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(['Douglas, Isle of Man', 'Auckland'])
    );
  });

  it('safely handles empty array or invalid JSON in localStorage', () => {
    mockStorage[FAVORITES_STORAGE_KEY] = JSON.stringify([]);

    const runner = renderFavoritesHook();
    expect(runner.current.isLoaded).toBe(true);

    // Corrupt JSON
    mockStorage[FAVORITES_STORAGE_KEY] = '{invalid json';
    states = [];
    const runner2 = renderFavoritesHook();
    expect(runner2.current.isLoaded).toBe(true);

    // Non-string or oversized items
    mockStorage[FAVORITES_STORAGE_KEY] = JSON.stringify([123, null, 'Valid City', 'a'.repeat(150)]);
    states = [];
    const runner3 = renderFavoritesHook();
    expect(runner3.current.favorites).toEqual(['Valid City']);
  });

  it('allows adding, removing, and checking favorites', () => {
    const runner = renderFavoritesHook();

    // Add favorite
    runner.current.addFavorite('Paris', 'France');
    expect(runner.current.favorites).toContain('Paris, France');

    // Duplicate add should not re-persist
    const setItemCallCount = vi.mocked(localStorage.setItem).mock.calls.length;
    runner.current.addFavorite('Paris', 'France');
    expect(vi.mocked(localStorage.setItem).mock.calls.length).toBe(setItemCallCount);

    // isFavorite check
    expect(runner.current.isFavorite('Paris', 'France')).toBe(true);
    expect(runner.current.isFavorite('Tokyo', 'Japan')).toBe(false);

    // Remove favorite
    runner.current.removeFavorite('Paris, France');
    expect(runner.current.favorites).not.toContain('Paris, France');
  });

  it('supports toggleFavorite to add or remove cities', () => {
    const runner = renderFavoritesHook();

    // Toggle on
    runner.current.toggleFavorite('Kathmandu', 'Nepal');
    expect(runner.current.favorites).toContain('Kathmandu, Nepal');

    // Toggle off
    runner.current.toggleFavorite('Kathmandu', 'Nepal');
    expect(runner.current.favorites).not.toContain('Kathmandu, Nepal');
  });

  it('gracefully handles localStorage.setItem exceptions (e.g. quota exceeded)', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const runner = renderFavoritesHook();
    expect(() => runner.current.addFavorite('NewCity', 'Country')).not.toThrow();
  });
});
