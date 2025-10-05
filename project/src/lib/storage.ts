import { Reminder, PantryItem, Recipe } from '../types';

const STORAGE_KEYS = {
  REMINDERS: 'mom_assistant_reminders',
  PANTRY: 'mom_assistant_pantry',
  RECIPES: 'mom_assistant_recipes',
  USER: 'mom_assistant_user',
};

export const storage = {
  getReminders: (): Reminder[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!data) return [];
    return JSON.parse(data).map((r: any) => ({
      ...r,
      dueDate: r.dueDate ? new Date(r.dueDate) : undefined,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    }));
  },

  saveReminders: (reminders: Reminder[]) => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  },

  getPantryItems: (): PantryItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PANTRY);
    if (!data) return [];
    return JSON.parse(data).map((p: any) => ({
      ...p,
      expiryDate: p.expiryDate ? new Date(p.expiryDate) : undefined,
      addedAt: new Date(p.addedAt),
      updatedAt: new Date(p.updatedAt),
    }));
  },

  savePantryItems: (items: PantryItem[]) => {
    localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(items));
  },

  getRecipes: (): Recipe[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
    if (!data) return [];
    return JSON.parse(data).map((r: any) => ({
      ...r,
      suggestedAt: new Date(r.suggestedAt),
      createdAt: new Date(r.createdAt),
    }));
  },

  saveRecipes: (recipes: Recipe[]) => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  },

  getUser: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: any) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getApiKey: (): string | null => {
    return localStorage.getItem('mom_assistant_ai_api_key');
  },

  saveApiKey: (key: string) => {
    localStorage.setItem('mom_assistant_ai_api_key', key);
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
