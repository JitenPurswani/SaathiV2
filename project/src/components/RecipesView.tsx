import { useState } from 'react';
import { ChefHat, Heart, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AIService } from '../lib/aiService';
import { MealType } from '../types';

export function RecipesView() {
  const { recipes, pantryItems, addRecipe, updateRecipe, deleteRecipe } = useData();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | undefined>();
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useOllama] = useState(true);

  const mealTypes: (MealType | 'all')[] = ['all', 'breakfast', 'lunch', 'dinner', 'snack'];

  const handleGenerateRecipes = async () => {

    if (pantryItems.length === 0) {
      alert('Please add some items to your pantry first!');
      return;
    }

    setIsGenerating(true);
    try {
      const aiService = new AIService(useOllama ? { provider: 'ollama', baseUrl: '/openai', model: 'llama3' } : apiKey);
      const suggestedRecipes = await aiService.suggestRecipes(
        pantryItems,
        selectedMealType,
        user?.language || 'en'
      );

      (suggestedRecipes || []).forEach(recipe => {
        addRecipe(recipe);
      });

      alert(`Generated ${suggestedRecipes.length} recipe suggestions!`);
    } catch (error) {
      console.error('Error generating recipes:', error);
      alert('Failed to generate recipes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredRecipes = (recipes || []).filter(r =>
    selectedMealType === undefined || selectedMealType === 'all' || r.mealType === selectedMealType
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Recipe Suggestions</h2>
      </div>

      {showApiKeyInput && !useOllama && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Enter Cerebras API Key</h3>
          <p className="text-xs text-blue-700 mb-3">
            Get your API key from{' '}
            <a
              href="https://cloud.cerebras.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Cerebras Cloud
            </a>
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter your API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (apiKey) {
                  setShowApiKeyInput(false);
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Generate Recipe Ideas
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Based on your pantry items ({pantryItems.length} items available)
            </p>

            <div className="flex gap-3 flex-wrap">
              <select
                value={selectedMealType || 'all'}
                onChange={(e) => setSelectedMealType(e.target.value === 'all' ? undefined : e.target.value as MealType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                disabled={isGenerating}
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateRecipes}
                disabled={isGenerating || pantryItems.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Recipes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No recipes yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add items to your pantry and generate recipe suggestions
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{recipe.recipeName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {recipe.mealType && (
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        {recipe.mealType}
                      </span>
                    )}
                    {recipe.cuisineType && (
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        {recipe.cuisineType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateRecipe(recipe.id, { isFavorite: !recipe.isFavorite })}
                    className={`transition-colors ${
                      recipe.isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients:</h4>
                  <ul className="space-y-1">
                    {(Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map((ingredient, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>
                          {ingredient.name} - {ingredient.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {recipe.instructions && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Instructions:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{recipe.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
