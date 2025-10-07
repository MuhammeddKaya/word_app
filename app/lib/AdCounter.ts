// Simple in-memory counter for controlling interstitial frequency.
// Session-only: counter resets when the app process restarts.

let clickCount = 1
const SHOW_EVERY = 3 // show one ad every 4 clicks

export function shouldShowInterstitial(): boolean {
  clickCount += 1
  return clickCount % SHOW_EVERY === 0
}

export function resetAdCounter() {
  clickCount = 0
}

export function getAdCounter() {
  return clickCount
}
