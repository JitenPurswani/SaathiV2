import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Reminder, PantryItem, Recipe } from '../types';
import { storage } from '../lib/storage';
import { useAuth } from './AuthContext';

interface DataContextType {
  reminders: Reminder[];
  pantryItems: PantryItem[];
  recipes: Recipe[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  addPantryItem: (item: Omit<PantryItem, 'id' | 'userId' | 'addedAt' | 'updatedAt'>) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  deletePantryItem: (id: string) => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'userId' | 'suggestedAt' | 'createdAt'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (user) {
      setReminders(storage.getReminders());
      setPantryItems(storage.getPantryItems());
      setRecipes(storage.getRecipes());
    } else {
      setReminders([]);
      setPantryItems([]);
      setRecipes([]);
    }
  }, [user]);

  const addReminder = (reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const newReminder: Reminder = {
      ...reminder,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    storage.saveReminders(updated);
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
    );
    setReminders(updated);
    storage.saveReminders(updated);
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    storage.saveReminders(updated);
  };

  const addPantryItem = (item: Omit<PantryItem, 'id' | 'userId' | 'addedAt' | 'updatedAt'>) => {
    if (!user) return;
    const newItem: PantryItem = {
      ...item,
      id: crypto.randomUUID(),
      userId: user.id,
      addedAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [...pantryItems, newItem];
    setPantryItems(updated);
    storage.savePantryItems(updated);
  };

  const updatePantryItem = (id: string, updates: Partial<PantryItem>) => {
    const updated = pantryItems.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    setPantryItems(updated);
    storage.savePantryItems(updated);
  };

  const deletePantryItem = (id: string) => {
    const updated = pantryItems.filter(p => p.id !== id);
    setPantryItems(updated);
    storage.savePantryItems(updated);
  };

  const addRecipe = (recipe: Omit<Recipe, 'id' | 'userId' | 'suggestedAt' | 'createdAt'>) => {
    if (!user) return;
    const newRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      userId: user.id,
      suggestedAt: new Date(),
      createdAt: new Date(),
    };
    const updated = [...recipes, newRecipe];
    setRecipes(updated);
    storage.saveRecipes(updated);
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    const updated = recipes.map(r => (r.id === id ? { ...r, ...updates } : r));
    setRecipes(updated);
    storage.saveRecipes(updated);
  };

  const deleteRecipe = (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    storage.saveRecipes(updated);
  };

  return (
    <DataContext.Provider
      value={{
        reminders,
        pantryItems,
        recipes,
        addReminder,
        updateReminder,
        deleteReminder,
        addPantryItem,
        updatePantryItem,
        deletePantryItem,
        addRecipe,
        updateRecipe,
        deleteRecipe,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
