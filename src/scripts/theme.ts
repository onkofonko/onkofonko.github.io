// Get the theme from localStorage or default to dark
const getTheme = () => localStorage.getItem('theme') || 'dark';

// Set the theme in localStorage and update data-theme attribute
const setTheme = (theme: string) => {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
};

// Initialize theme
setTheme(getTheme());

// Export the toggle function to be used in components
export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
};