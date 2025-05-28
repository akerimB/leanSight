# LeanSight - New Features

This document outlines the newly implemented features in the LeanSight application.

## 1. Auto-Save Functionality

The auto-save functionality automatically saves form data as users type, preventing data loss and improving user experience.

### Key Components

- `useAutoSave` hook: A custom hook that handles debounced auto-saving
- `AutoSaveStatus` component: Shows real-time saving status to users
- `withAutoSave` HOC: Higher-order component for easily adding auto-save to any form
- Storage utilities: Functions for working with localStorage and sessionStorage

### Implementation

The auto-save system provides:

- **Debounced Saving**: Only saves after a user stops typing (customizable delay)
- **Local Storage Backup**: All form data is backed up locally
- **Server Sync**: Option to save to server alongside local storage
- **Visual Indicators**: Users can see when changes are being saved
- **Draft Recovery**: If a user refreshes or closes the browser, their work is preserved

### How to Use

To add auto-save to any form:

1. Wrap your form component with the `withAutoSave` HOC:

```jsx
import { withAutoSave } from '@/components/withAutoSave';

const YourFormWithAutoSave = withAutoSave(YourFormComponent, {
  formName: 'unique-form-name',
  debounceMs: 2000, // Save after 2 seconds of inactivity
  // For local storage only:
  localStorageOnly: true,
  // Or for server sync:
  onSave: async (data) => {
    // Save data to server
    await api.saveData(data);
  }
});
```

2. Adapt your form component to work with auto-save:

```jsx
function YourFormComponent({ 
  data,            // The current form data 
  setData,         // Function to update form data
  initialData,     // Initial data (possibly loaded from storage)
  save,            // Manual save function
  onSubmit         // Submit function (clears draft after successful submission)
}) {
  // Use data and setData instead of local state
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(data);
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Example

See the example implementation at `/examples/autosave` to understand how it works in practice.

## 2. Progressive Web App (PWA)

LeanSight is now a Progressive Web App (PWA), which means it can be installed on devices and used offline.

### Features

- **Installable**: Users can add the app to their home screen
- **Offline Support**: Basic functionality works without an internet connection
- **Cached Assets**: Faster loading times with cached resources
- **Responsive Design**: Works well on all device sizes
- **Native-like Experience**: Feels like a native app when installed

### Implementation

The PWA is implemented using:

- **next-pwa**: Integration with Next.js for PWA functionality
- **Web Manifest**: Configuration for app appearance and behavior when installed
- **Service Worker**: Handles caching and offline functionality
- **Offline Page**: A dedicated page shown when users are offline

### How It Works

1. When users visit the site, the service worker is installed
2. Essential assets are cached for offline use
3. If the user goes offline, they can still access cached pages
4. API requests are stored when online and available offline
5. Changes made offline are synced when connectivity returns

### Testing the PWA

To test the PWA features:

1. Build and run the production version: `npm run build && npm start`
2. Open Chrome DevTools > Application > Service Workers to see the registered service worker
3. Use the "Offline" checkbox to simulate offline mode
4. Try installing the app by clicking the install button in the address bar

## Getting Started

1. Install the required dependencies:
   ```
   npm install next-pwa
   ```

2. Build and start the application in production mode:
   ```
   npm run build
   npm start
   ```

3. Visit the auto-save example at `/examples/autosave` to see it in action 