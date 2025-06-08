const THEME_STATE_KEY = 'themeState';
const THEME_USER_SOURCE = 'user';
const THEME_SYSTEM_SOURCE = 'system';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';
const LIGHT_SCHEME_QUERY = '(prefers-color-scheme: light)';

type Theme = typeof LIGHT_THEME | typeof DARK_THEME;
type ThemeSource = typeof THEME_USER_SOURCE | typeof THEME_SYSTEM_SOURCE;
type ThemeState = { theme: Theme; source: ThemeSource };

const getSystemPreference = (): Theme => {
	if (typeof window !== 'undefined' && window.matchMedia) {
		return window.matchMedia(LIGHT_SCHEME_QUERY).matches ? LIGHT_THEME : DARK_THEME;
	}
	return DARK_THEME;
};

const applyThemeToDOM = (theme: Theme) => {
	if (typeof window !== 'undefined') {
		document.documentElement.setAttribute('data-theme', theme);
		document.documentElement.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
	}
};

const safeLoadTheme = (): ThemeState | null => {
	if (typeof window === 'undefined') return null;
	try {
		const storedState = localStorage.getItem(THEME_STATE_KEY);
		if (storedState) {
			const parsedState = JSON.parse(storedState);
			if (
				parsedState &&
				typeof parsedState.theme === 'string' &&
				isValidTheme(parsedState.theme) &&
				typeof parsedState.source === 'string' &&
				(parsedState.source === THEME_USER_SOURCE || parsedState.source === THEME_SYSTEM_SOURCE)
			) {
				return parsedState as ThemeState;
			} else {
				console.warn('[theme.ts] Invalid theme state found in localStorage:', parsedState);
				localStorage.removeItem(THEME_STATE_KEY);
			}
		}
	} catch (error) {
		console.warn('[theme.ts] Failed to load or parse theme state from localStorage:', error);
	}
	return null;
};

const persistAndApplyTheme = (theme: Theme, source: ThemeSource) => {
	if (typeof window !== 'undefined') {
		try {
			const state: ThemeState = { theme, source };
			localStorage.setItem(THEME_STATE_KEY, JSON.stringify(state));
		} catch (error) {
			console.warn('[theme.ts] Failed to persist theme state to localStorage:', error);
		}
		applyThemeToDOM(theme);
	}
};

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
	if (typeof window === 'undefined') return;
	const newSystemTheme = e.matches ? LIGHT_THEME : DARK_THEME;

	const currentThemeState = safeLoadTheme();
	if (!currentThemeState || currentThemeState.source !== THEME_USER_SOURCE) {
		persistAndApplyTheme(newSystemTheme, THEME_SYSTEM_SOURCE);
	}
};

let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;
let mediaQueryList: MediaQueryList | null = null;

export const setupThemeListener = () => {
	if (typeof window !== 'undefined') {
		cleanupThemeListener();

		try {
			mediaQueryList = window.matchMedia(LIGHT_SCHEME_QUERY);
			mediaQueryListener = handleSystemThemeChange;

			if (mediaQueryList.addEventListener) {
				mediaQueryList.addEventListener('change', mediaQueryListener);
			} else {
				mediaQueryList.addListener(mediaQueryListener);
			}
		} catch (error) {
			console.warn('[theme.ts] Failed to setup system theme listener:', error);
			mediaQueryListener = null;
			mediaQueryList = null;
		}
	}
};

export const cleanupThemeListener = () => {
	if (typeof window !== 'undefined' && mediaQueryListener && mediaQueryList) {
		try {
			if (mediaQueryList.removeEventListener) {
				mediaQueryList.removeEventListener('change', mediaQueryListener);
			} else {
				mediaQueryList.removeListener(mediaQueryListener);
			}
		} catch (error) {
			console.warn('[theme.ts] Failed to cleanup theme listener:', error);
		} finally {
			mediaQueryListener = null;
			mediaQueryList = null;
		}
	}
};

const isValidTheme = (theme: any): theme is Theme => {
	return theme === LIGHT_THEME || theme === DARK_THEME;
};

const initializeTheme = () => {
	if (typeof window !== 'undefined') {
		const loadedState = safeLoadTheme();

		if (
			loadedState &&
			loadedState.source === THEME_USER_SOURCE &&
			isValidTheme(loadedState.theme)
		) {
			applyThemeToDOM(loadedState.theme);
		} else {
			const systemTheme = getSystemPreference();
			persistAndApplyTheme(systemTheme, THEME_SYSTEM_SOURCE);
		}
	}
};

initializeTheme();

export const toggleTheme = () => {
	if (typeof window !== 'undefined') {
		let currentTheme: Theme;
		const currentDataTheme = document.documentElement.getAttribute('data-theme');

		if (currentDataTheme && isValidTheme(currentDataTheme)) {
			currentTheme = currentDataTheme;
		} else {
			const loadedState = safeLoadTheme();
			if (loadedState && isValidTheme(loadedState.theme)) {
				currentTheme = loadedState.theme;
			} else {
				currentTheme = getSystemPreference();
			}
		}

		const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
		persistAndApplyTheme(newTheme, THEME_USER_SOURCE);
	}
};

setupThemeListener();
