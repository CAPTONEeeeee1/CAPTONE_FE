import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Custom event for activity refresh
const ACTIVITY_REFRESH_EVENT = 'activityRefresh';

export function dispatchActivityRefreshEvent() {
  window.dispatchEvent(new Event(ACTIVITY_REFRESH_EVENT));
}

export function subscribeToActivityRefreshEvent(callback) {
  window.addEventListener(ACTIVITY_REFRESH_EVENT, callback);
}

export function unsubscribeFromActivityRefreshEvent(callback) {
  window.removeEventListener(ACTIVITY_REFRESH_EVENT, callback);
}

