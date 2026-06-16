/**
 * g4f-updater.ts — Auto-update system for g4f.dev package
 * 
 * Checks for and applies updates to the g4f npm package.
 * Can be triggered manually from admin or on app startup.
 */

import { db } from './db';

interface UpdateResult {
  success: boolean;
  message: string;
  currentVersion?: string;
  latestVersion?: string;
  updated: boolean;
}

/**
 * Check if g4f package has updates available
 */
export async function checkForG4FUpdates(): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
}> {
  try {
    // Read current version from package.json
    const currentVersion = await getCurrentG4FVersion();
    
    // Check npm registry for latest version
    const response = await fetch('https://registry.npmjs.org/@gpt4free/g4f.dev/latest', {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      return {
        hasUpdate: false,
        currentVersion,
        latestVersion: currentVersion,
      };
    }

    const data = await response.json();
    const latestVersion = data.version || currentVersion;

    return {
      hasUpdate: currentVersion !== latestVersion,
      currentVersion,
      latestVersion,
    };
  } catch {
    return {
      hasUpdate: false,
      currentVersion: 'unknown',
      latestVersion: 'unknown',
    };
  }
}

/**
 * Get current installed g4f version
 */
async function getCurrentG4FVersion(): Promise<string> {
  try {
    // Try reading from node_modules package.json
    const fs = require('fs');
    const path = require('path');
    const pkgPath = path.join(process.cwd(), 'node_modules', '@gpt4free', 'g4f.dev', 'package.json');
    
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return pkg.version || 'unknown';
    }
  } catch {
    // Ignore
  }
  return 'unknown';
}

/**
 * Record the last update timestamp in the database
 */
export async function recordG4FUpdate(): Promise<void> {
  try {
    const settings = await db.aIAdminSettings.findFirst();
    if (settings) {
      await db.aIAdminSettings.update({
        where: { id: settings.id },
        data: { lastG4fUpdate: new Date() },
      });
    }
  } catch {
    // Ignore DB errors during update tracking
  }
}

/**
 * Get the last update info
 */
export async function getG4FUpdateInfo(): Promise<{
  lastUpdate: Date | null;
  autoUpdateEnabled: boolean;
  currentVersion: string;
}> {
  try {
    const settings = await db.aIAdminSettings.findFirst();
    const currentVersion = await getCurrentG4FVersion();
    
    return {
      lastUpdate: settings?.lastG4fUpdate || null,
      autoUpdateEnabled: settings?.autoUpdateEnabled ?? true,
      currentVersion,
    };
  } catch {
    return {
      lastUpdate: null,
      autoUpdateEnabled: true,
      currentVersion: 'unknown',
    };
  }
}
