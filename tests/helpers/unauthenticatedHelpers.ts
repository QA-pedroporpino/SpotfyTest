import { Page, expect } from '@playwright/test';

/**
 * Behind the Test - Episode 1: Unauthenticated User Helpers
 * 
 * Professional helper functions for Spotify Web unauthenticated user flows.
 * These modular functions demonstrate clean code practices and reusable
 * automation patterns for complex user journey testing.
 * 
 * @author Pedro Porpino
 * @series Behind the Test
 * @episode 1
 * @description Helper functions for users who are not logged in to Spotify Web
 */

export async function navigateToSpotifyAndChangeLanguage(page: Page) {
  // Navigate to Spotify main page
  await page.goto('https://open.spotify.com/');
  await page.waitForLoadState('domcontentloaded');
  
  // Use the specific data-testid for language selection
  const languageButton = page.getByTestId('language-selection-button');
  await expect(languageButton).toBeVisible();
  await languageButton.click();
  
  // Select English from the language dropdown
  const englishOption = page.getByRole('option', { name: /english/i });
  await expect(englishOption).toBeVisible();
  await englishOption.click();
  
  // Wait for the language change to take effect
  await page.waitForLoadState('networkidle');
  
  // Verify language change by checking if common UI elements are in English
  const searchPlaceholder = page.getByPlaceholder(/what do you want to listen to?|search/i);
  await expect(searchPlaceholder).toBeVisible();
}

export async function searchForArtist(page: Page, artistName: string) {
  // Click on the search input
  const searchInput = page.getByRole('searchbox', { name: /search/i });
  await expect(searchInput).toBeVisible();
  await searchInput.click();
  
  // Type the artist name
  await searchInput.fill(artistName);
  await searchInput.press('Enter');
  
  // Wait for search results to load
  await page.waitForLoadState('networkidle');
  
  // Verify search results are displayed
  const searchResults = page.locator('[data-testid="search-results"]').or(
    page.locator('section').filter({ hasText: /artists|top result/i })
  );
  await expect(searchResults).toBeVisible();
}

export async function openArtistFirstAlbum(page: Page) {
  // Look for the first artist result and click on it
  const firstArtist = page.locator('[data-testid="top-result-card"]').or(
    page.locator('a[href*="/artist/"]')
  ).first();
  await expect(firstArtist).toBeVisible();
  await firstArtist.click();
  
  await page.waitForLoadState('networkidle');
  
  // Find and click on the first album
  const firstAlbum = page.locator('a[href*="/album/"]').first();
  await expect(firstAlbum).toBeVisible();
  await firstAlbum.click();
  
  await page.waitForLoadState('networkidle');
  
  // Verify we're on an album page
  const albumTitle = page.locator('h1').or(page.locator('[data-testid="album-title"]'));
  await expect(albumTitle).toBeVisible();
}

export async function attemptToPlaySong(page: Page) {
  // Try to click the main play button for the album
  const playButton = page.getByRole('button', { name: /play/i }).first();
  await expect(playButton).toBeVisible();
  await playButton.click();
  
  // Alternative: try clicking on the first song's play button
  const songPlayButton = page.locator('[data-testid="play-button"]').first().or(
    page.locator('button[aria-label*="Play"]').first()
  );
  
  if (await songPlayButton.isVisible()) {
    await songPlayButton.click();
  }
}

export async function verifyLoginModalAppears(page: Page) {
  // Check if login modal appears
  const loginModal = page.locator('[data-testid="login-modal"]').or(
    page.locator('div').filter({ hasText: /log in|sign up|create account/i })
  );
  await expect(loginModal).toBeVisible();
  
  // Verify modal content
  const loginText = page.getByText(/log in|sign up|start listening/i);
  await expect(loginText).toBeVisible();
  
  // Verify there are login/signup buttons
  const loginButton = page.getByRole('button', { name: /log in|sign up/i });
  await expect(loginButton).toBeVisible();
}

export async function closeLoginModalAndVerifyConsistency(page: Page) {
  // Find and click the close button (usually an X or close icon)
  const closeButton = page.locator('[data-testid="modal-close-button"]').or(
    page.getByRole('button', { name: /close|×/i })
  ).or(
    page.locator('button[aria-label*="close"]')
  );
  
  await expect(closeButton).toBeVisible();
  await closeButton.click();
  
  // Verify modal is closed by checking it's no longer visible
  const loginModal = page.locator('[data-testid="login-modal"]').or(
    page.locator('div').filter({ hasText: /log in|sign up|create account/i })
  );
  await expect(loginModal).not.toBeVisible();
  
  // Verify we're still on the album page and content is consistent
  const albumTitle = page.locator('h1').or(page.locator('[data-testid="album-title"]'));
  await expect(albumTitle).toBeVisible();
  
  // Verify the play button is still visible and functional
  const playButton = page.getByRole('button', { name: /play/i }).first();
  await expect(playButton).toBeVisible();
} 