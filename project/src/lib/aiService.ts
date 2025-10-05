import { PantryItem, Recipe, MealType } from '../types';

interface CerebrasResponse {
  intent: 'reminder' | 'pantry_add' | 'pantry_query' | 'recipe_request' | 'unknown';
  data: any;
  confidence: number;
}

export class AIService {
  private providerConfig: { provider: 'ollama'; baseUrl: string; model: string } | { provider: 'cerebras'; apiKey: string };

  constructor(config: { provider: 'ollama'; baseUrl: string; model: string } | string) {
    if (typeof config === 'string') {
      this.providerConfig = { provider: 'cerebras', apiKey: config };
    } else {
      this.providerConfig = { ...config, provider: 'ollama' };
    }
  }

  async processVoiceInput(
    input: string,
    language: 'en' | 'hi',
    pantryItems?: PantryItem[]
  ): Promise<CerebrasResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(language, pantryItems);

      // For parsing/reminders/pantry: prefer Cerebras when API key is available; otherwise fall back to Ollama
      const useCerebras = !!this.apiKey;
      const baseUrl = useCerebras ? this.cerebras.baseUrl : this.ollama.baseUrl;
      const model = useCerebras ? this.cerebras.model : this.ollama.model;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (useCerebras && this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      return this.parseAIResponse(aiResponse, input);
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.fallbackParser(input, language);
    }
  }

  async suggestRecipes(
    pantryItems: PantryItem[],
    mealType?: MealType,
    language: 'en' | 'hi' = 'en'
  ): Promise<Recipe[]> {
    try {
      const itemsList = pantryItems
        .map(item => `${item.itemName} (${item.quantity} ${item.unit})`)
        .join(', ');

      const prompt = language === 'hi'
        ? `पैंट्री में उपलब्ध सामग्री: ${itemsList}.
${mealType ? `${mealType} के लिए` : ''} 1-2 बहुत सरल रेसिपी बनाओ।
नियम:
1) रेसिपी के Ingredients में केवल पैंट्री की चीज़ें रखें (नाम और मात्रा)।
2) जो चीज़ें पैंट्री में नहीं हैं/कम हैं उन्हें "missingIngredients" में सूचीबद्ध करो (नाम और वैकल्पिक मात्रा/यूनिट)।
3) केवल वैध JSON लौटाओ, कोई prose या code fences नहीं।
स्कीमा:
[
  {
    "recipeName": string,
    "ingredients": [{"name": string, "quantity": string}],
    "instructions": string,
    "mealType"?: string,
    "cuisineType"?: string,
    "missingIngredients": [{"name": string, "quantity"?: string, "unit"?: string}]
  }
]
यदि पैंट्री में 2 या उससे कम आइटम हैं, तो सिर्फ 1 आसान रेसिपी दो।`
        : `Pantry items: ${itemsList}.
Return 1-2 very simple ${mealType ? `${mealType}` : ''} recipes.
Rules:
1) Use ONLY pantry items in "ingredients" (name + quantity).
2) Anything not present (or insufficient) goes into "missingIngredients" with name and optional quantity/unit.
3) Respond ONLY with valid JSON (no prose, no code fences).
Schema:
[
  {
    "recipeName": string,
    "ingredients": [{"name": string, "quantity": string}],
    "instructions": string,
    "mealType"?: string,
    "cuisineType"?: string,
    "missingIngredients": [{"name": string, "quantity"?: string, "unit"?: string}]
  }
]
If the pantry has 2 or fewer items, return exactly 1 simple recipe.`;

      let baseUrl: string;
      let model: string;

      if (this.providerConfig.provider === 'ollama') {
        baseUrl = this.providerConfig.baseUrl;
        model = this.providerConfig.model;
      } else {
        // Fallback or default to cerebras if not ollama
        baseUrl = 'https://api.cerebras.ai/v1';
        model = 'llama3.1-8b';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful cooking assistant. Respond ONLY with valid JSON as specified by the user schema. Do not include prose or code fences.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 800,
          // Encourage JSON with OpenAI-compatible flag (Ollama supports json output via response_format or format)
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      let recipesData = this.extractJSON(aiResponse);
      if (!Array.isArray(recipesData) || recipesData.length === 0) {
        // If a single object returned, wrap it
        try {
          const obj = JSON.parse(aiResponse);
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            recipesData = [obj];
          }
        } catch {}
      }

      if (!Array.isArray(recipesData) || recipesData.length === 0) {
        // Final fallback: create a trivial recipe from pantry
        const name = (pantryItems[0]?.itemName || 'Simple Dish') + ' Recipe';
        const fallback: Recipe = {
          id: crypto.randomUUID(),
          userId: 'local',
          recipeName: name,
          ingredients: pantryItems.map(p => ({ name: p.itemName, quantity: `${p.quantity} ${p.unit}` })),
          instructions: 'Combine available ingredients and cook to taste.',
          mealType,
          cuisineType: 'any',
          isFavorite: false,
          suggestedAt: new Date(),
          createdAt: new Date(),
        };
        return [fallback];
      }

      return recipesData.map((r: any) => ({
        ...r,
        isFavorite: false,
      }));
    } catch (error) {
      console.error('Recipe suggestion error:', error);
      return this.fallbackRecipes(pantryItems, mealType);
    }
  }

  private buildSystemPrompt(language: 'en' | 'hi', pantryItems?: PantryItem[]): string {
    const schema = `Strict JSON only (no prose). Use this schema:
{
  "intent": "reminder" | "pantry_add" | "pantry_query" | "recipe_request" | "unknown",
  "confidence": number, // 0..1
  "data": {
    "title"?: string,             // for reminders
    "when"?: string,              // natural time string if present
    "itemName"?: string,          // normalized Hindi item name (e.g., "दूध", "टमाटर", "आलू")
    "quantity"?: number,
    "unit"?: "kg" | "liter" | "pieces" | string,
    "isNegated"?: boolean,        // true if user said NOT buying / haven’t bought
    "addToPantry"?: boolean       // true only if user explicitly confirms item is now owned
  }
}`;

    const examplesEn = `Examples:
User: "I need to buy 2 kg tomatoes tomorrow evening"
JSON: {"intent":"reminder","confidence":0.92,"data":{"title":"Buy tomatoes","when":"tomorrow 6pm","itemName":"टमाटर","quantity":2,"unit":"kg","isNegated":false,"addToPantry":false}}

User: "I bought milk"
JSON: {"intent":"pantry_add","confidence":0.9,"data":{"itemName":"दूध","quantity":1,"unit":"liter","addToPantry":true}}

User: "I haven't bought tomatoes"
JSON: {"intent":"reminder","confidence":0.9,"data":{"title":"Buy tomatoes","itemName":"टमाटर","isNegated":true,"addToPantry":false}}`;

    const examplesHi = `उदाहरण:
यूज़र: "मुझे 2 किलो टमाटर कल शाम लेना है"
JSON: {"intent":"reminder","confidence":0.92,"data":{"title":"टमाटर खरीदना","when":"कल शाम 6 बजे","itemName":"टमाटर","quantity":2,"unit":"kg","isNegated":false,"addToPantry":false}}

यूज़र: "मैं दूध ले आया"
JSON: {"intent":"pantry_add","confidence":0.9,"data":{"itemName":"दूध","quantity":1,"unit":"liter","addToPantry":true}}

यूज़र: "अभी टमाटर नहीं खरीदे"
JSON: {"intent":"reminder","confidence":0.9,"data":{"title":"टमाटर खरीदना","itemName":"टमाटर","isNegated":true,"addToPantry":false}}`;

    const base = language === 'hi'
      ? `तुम एक सहायक हो जो हिंदी और अंग्रेज़ी समझता है।
खरीदना/लेना जैसे वाक्य पहले "reminder" होते हैं; "pantry_add" सिर्फ तभी जब यूज़र स्पष्ट रूप से बता दे कि सामान खरीद लिया/मौजूद है। नकारात्मक वाक्य ("नहीं खरीदा") पर pantry_add मत करना, reminder दो।\n${schema}\n${examplesHi}`
      : `You understand Hindi and English. Shopping phrases default to "reminder"; only use "pantry_add" if the user clearly states the item is already bought/owned. Negative statements ("haven't bought") must not add to pantry; create a reminder.\n${schema}\n${examplesEn}`;

    if (pantryItems && pantryItems.length > 0) {
      const items = pantryItems.map(i => i.itemName).join(', ');
      return base + `\n\nAvailable pantry items: ${items}`;
    }

    return base;
  }

  private parseAIResponse(aiResponse: string, originalInput: string): CerebrasResponse {
    try {
      // Try to extract JSON from code blocks or plain text
      const blockMatch = aiResponse.match(/```json[\s\S]*?```/i);
      const text = blockMatch ? blockMatch[0].replace(/```json|```/gi, '') : aiResponse;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          intent: parsed.intent || 'unknown',
          data: { ...parsed.data, originalInput },
          confidence: parsed.confidence || 0.7,
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    return {
      intent: 'unknown',
      data: { originalInput },
      confidence: 0.3,
    };
  }

  private fallbackParser(input: string, language: 'en' | 'hi'): CerebrasResponse {
    const lowerInput = input.toLowerCase();

    // Treat buy/खरीदना/लेना as shopping reminders by default; pantry add happens only after confirmation
    const reminderKeywords = ['remind', 'याद', 'करना', 'जाना', 'लेना', 'appointment', 'doctor', 'buy', 'खरीद', 'खरीदना'];
    const pantryKeywords = ['kilo', 'किलो', 'liter', 'लीटर'];
    const recipeKeywords = ['breakfast', 'lunch', 'dinner', 'recipe', 'cook', 'खाना', 'बनाना', 'नाश्ता'];

    if (reminderKeywords.some(kw => lowerInput.includes(kw))) {
      // Try to extract shopping item details for better reminder titles
      const { itemName, quantity, unit } = this.extractShoppingDetails(input);
      const title = itemName ? (language === 'hi' ? `${itemName} खरीदना` : `Buy ${itemName}`) : input;
      return {
        intent: 'reminder',
        data: { title, originalInput: input, itemName, quantity, unit, reminderType: 'shopping' },
        confidence: 0.7,
      };
    }

    if (pantryKeywords.some(kw => lowerInput.includes(kw))) {
      return {
        intent: 'pantry_add',
        data: { description: input, originalInput: input },
        confidence: 0.6,
      };
    }

    if (recipeKeywords.some(kw => lowerInput.includes(kw))) {
      return {
        intent: 'recipe_request',
        data: { query: input, originalInput: input },
        confidence: 0.6,
      };
    }

    return {
      intent: 'unknown',
      data: { originalInput: input },
      confidence: 0.3,
    };
  }

  private extractShoppingDetails(input: string): { itemName?: string; quantity?: number; unit?: string } {
    const text = input.toLowerCase();
    const qtyMatch = text.match(/(\d+\.?\d*)\s*(kilo|kg|liter|litre|लीटर|किलो)?/i);
    const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : undefined;
    const unitRaw = qtyMatch?.[2]?.toLowerCase();
    const unit = unitRaw ? (unitRaw.includes('kg') || unitRaw.includes('kilo') || unitRaw.includes('किलो') ? 'kg' : 'liter') : undefined;

    // Simple Hindi/English noun mapping
    const dictionary: Record<string, string> = {
      'doodh': 'दूध', 'dudh': 'दूध', 'milk': 'दूध',
      'chawal': 'चावल', 'rice': 'चावल',
      'aloo': 'आलू', 'potato': 'आलू',
      'pyaaz': 'प्याज', 'pyaz': 'प्याज', 'onion': 'प्याज',
      'tamatar': 'टमाटर', 'tomato': 'टमाटर',
      'anda': 'अंडा', 'egg': 'अंडा',
      'cheeni': 'चीनी', 'sugar': 'चीनी',
      'mirch': 'मिर्च', 'chilli': 'मिर्च', 'chili': 'मिर्च',
      'haldi': 'हल्दी', 'turmeric': 'हल्दी',
      'atta': 'आटा', 'flour': 'आटा',
    };

    const tokens = text
      .replace(/[\p{P}\p{S}]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
    const stop = new Set(['mujhe','मुझे','lenA','लेना','khareedna','खरीदना','buy','get','please','pls','remind','याद','करना','ko','किलो','लीटर']);
    for (const t of tokens) {
      if (stop.has(t)) continue;
      if (dictionary[t]) return { itemName: dictionary[t], quantity, unit };
    }
    // Fallback: return last non-stopword token as item
    const fallback = tokens.filter(t => !stop.has(t)).pop();
    return { itemName: fallback, quantity, unit };
  }

  private extractJSON(text: string): any[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('JSON extraction failed:', error);
    }
    return [];
  }

  private fallbackRecipes(pantryItems: PantryItem[], mealType?: MealType): Recipe[] {
    const hasRice = pantryItems.some(i => i.itemName.toLowerCase().includes('rice') || i.itemName.includes('चावल'));
    const hasMilk = pantryItems.some(i => i.itemName.toLowerCase().includes('milk') || i.itemName.includes('दूध'));
    const hasVegetables = pantryItems.some(i => i.category === 'vegetables');

    const recipes: Partial<Recipe>[] = [];

    if (hasRice && hasVegetables) {
      recipes.push({
        recipeName: 'Vegetable Pulao / सब्जी पुलाव',
        ingredients: [
          { name: 'Rice / चावल', quantity: '2 cups' },
          { name: 'Mixed Vegetables / मिक्स सब्जियां', quantity: '1 cup' },
          { name: 'Spices / मसाले', quantity: 'to taste' },
        ],
        instructions: 'Cook rice with vegetables and spices.',
        mealType: 'lunch',
        cuisineType: 'Indian',
      });
    }

    if (hasMilk) {
      recipes.push({
        recipeName: 'Milk Tea / दूध की चाय',
        ingredients: [
          { name: 'Milk / दूध', quantity: '1 cup' },
          { name: 'Tea / चाय', quantity: '1 tsp' },
          { name: 'Sugar / चीनी', quantity: 'to taste' },
        ],
        instructions: 'Boil milk with tea and sugar.',
        mealType: 'breakfast',
        cuisineType: 'Indian',
      });
    }

    return recipes as Recipe[];
  }
}
