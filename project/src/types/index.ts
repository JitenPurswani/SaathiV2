export type ReminderType = 'task' | 'appointment' | 'shopping' | 'other';
export type Priority = 'low' | 'medium' | 'high';
export type PantryCategory = 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'spices' | 'meat' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  originalVoiceInput?: string;
  reminderType: ReminderType;
  dueDate?: Date;
  isCompleted: boolean;
  priority: Priority;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PantryItem {
  id: string;
  userId: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: PantryCategory;
  expiryDate?: Date;
  lowStockThreshold: number;
  addedAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  userId: string;
  recipeName: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string;
  mealType?: MealType;
  cuisineType?: string;
  isFavorite: boolean;
  suggestedAt: Date;
  createdAt: Date;
}

export interface NotificationLog {
  id: string;
  userId: string;
  reminderId?: string;
  sentAt: Date;
  notificationType: 'reminder' | 'low_stock' | 'expiry_warning';
  status: 'sent' | 'delivered' | 'dismissed';
  createdAt: Date;
}
