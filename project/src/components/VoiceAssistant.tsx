import { useEffect, useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { TimePickerModal } from './TimePickerModal';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AIService } from '../lib/aiService';
import { parseRelativeDate } from '../lib/dateUtils';

export function VoiceAssistant() {
  const { addReminder, addPantryItem, pantryItems } = useData();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useOllama, setUseOllama] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pendingReminder, setPendingReminder] = useState<{ title: string; original: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mom_assistant_ai_api_key');
    if (saved) setApiKey(saved);
  }, []);

  const handleTranscript = async (text: string) => {
    if (!text.trim()) return;

    setFeedback('');
    setIsProcessing(true);

    try {
      if (apiKey || useOllama) {
        const aiService = new AIService(useOllama ? { provider: 'ollama', baseUrl: '/openai', model: 'llama3' } : apiKey);
        const result = await aiService.processVoiceInput(
          text,
          user?.language || 'en',
          pantryItems
        );

        processAIResult(result, text);
      } else {
        processBasicInput(text);
      }
    } catch (error) {
      console.error('Processing error:', error);
      setFeedback('Sorry, I had trouble processing that. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processAIResult = (result: any, originalText: string) => {
    const { intent, data } = result;

    switch (intent) {
      case 'reminder': {
        const lower = originalText.toLowerCase();
        const hasBuyVerb = /(\bbuy\b|खरीद|खरीदना|\blena\b|लेना)/.test(lower);
        const qtyUnit = /(\d+\s*(kg|kilo|किलो|l|liter|litre|लीटर)|आधा|half)/i.test(originalText);
        // Only consider shopping if a buy-verb is present
        let item: string | undefined;
        let isShopping = false;
        if (hasBuyVerb) {
          const cand = data?.itemName || extractItemName(originalText);
          if (cand && cand !== 'है') {
            item = cand;
            isShopping = true;
          }
        }

        const buildTitle = () => {
          const fromAi = (data?.title || '').trim();
          // Reject AI titles that are just stopwords or end with 'खरीदना' without an item
          if (fromAi && !/^है\s*खरीदना$/i.test(fromAi) && !/^hai\s*kharidna$/i.test(fromAi)) return fromAi;
          if (isShopping && item) return user?.language === 'hi' ? `${item} खरीदना` : `Buy ${item}`;
          return originalText;
        };
        const title = buildTitle();
        const parsed = data?.when ? parseRelativeDate(String(data.when)) : parseRelativeDate(originalText);
        if (parsed) {
          addReminder({
            title,
            originalVoiceInput: originalText,
            reminderType: isShopping ? 'shopping' : 'task',
            dueDate: parsed,
            isCompleted: false,
            priority: 'medium',
          });
          setFeedback(user?.language === 'hi' ? '✓ रिमाइंडर जोड़ दिया गया!' : '✓ Reminder added successfully!');
        } else {
          setPendingReminder({ title, original: originalText });
          setShowTimePicker(true);
        }
        break;
      }

      case 'pantry_add':
        // Confirm with user before adding to pantry if this came from a shopping phrase
        const quantity = data?.quantity ?? extractQuantity(originalText);
        // Support array of items (comma/और/and separated)
        const names: string[] = (data?.itemName && Array.isArray(data.itemName))
          ? data.itemName
          : (data?.itemName ? [data.itemName] : extractMultipleItems(originalText));
        let itemsToAdd = names.filter(Boolean);
        if (itemsToAdd.length === 0) {
          const single = prompt(user?.language === 'hi' ? 'कौन सा आइटम?' : 'Which item?') || '';
          if (single.trim()) itemsToAdd = [single.trim()];
        }
        if (itemsToAdd.length === 0) {
          setFeedback(user?.language === 'hi' ? 'समझ नहीं आया, दोबारा बोलें।' : 'Could not identify the item. Please try again.');
          break;
        }
        const confirmAdd = data?.addToPantry === true ? true : confirm(user?.language === 'hi' ? `पैंट्री में जोड़ें? (${itemsToAdd.join(', ')})` : `Add to pantry? (${itemsToAdd.join(', ')})`);
        if (confirmAdd) {
          itemsToAdd.forEach(nm => addPantryItem({
            itemName: nm,
            quantity: quantity || 0,
            unit: data?.unit || extractUnit(originalText) || 'pieces',
            category: 'other',
            lowStockThreshold: 0,
          }));
          setFeedback(user?.language === 'hi' ? '✓ पैंट्री में जोड़ दिया गया!' : '✓ Added to pantry!');
        } else {
          setFeedback(user?.language === 'hi' ? 'ठीक है, रिमाइंडर बना दिया गया है।' : 'Okay, reminder set.');
        }
        break;

      case 'recipe_request':
        setFeedback(
          user?.language === 'hi'
            ? 'कृपया "Recipes" टैब देखें!'
            : 'Please check the "Recipes" tab!'
        );
        break;

      default:
        processBasicInput(originalText);
    }
  };

  const processBasicInput = (text: string) => {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('remind') ||
      lowerText.includes('याद') ||
      lowerText.includes('करना') ||
      lowerText.includes('जाना')
    ) {
      const reminderDate = parseRelativeDate(text);
      addReminder({
        title: text,
        originalVoiceInput: text,
        reminderType: 'task',
        dueDate: reminderDate,
        isCompleted: false,
        priority: 'medium',
      });
      setFeedback(
        user?.language === 'hi'
          ? '✓ रिमाइंडर जोड़ दिया गया!'
          : '✓ Reminder added!'
      );
    } else {
      setFeedback(
        user?.language === 'hi'
          ? 'मुझे समझ नहीं आया। कृपया दोबारा कोशिश करें।'
          : 'I did not understand. Please try again.'
      );
    }
  };

  const extractQuantity = (text: string): number => {
    const match = text.match(/(\d+\.?\d*)\s*(kilo|kg|liter|litre|piece|pieces|किलो|लीटर)/i);
    return match ? parseFloat(match[1]) : 0;
  };

  const extractUnit = (text: string): string => {
    if (text.includes('kilo') || text.includes('kg') || text.includes('किलो')) return 'kg';
    if (text.includes('liter') || text.includes('litre') || text.includes('लीटर')) return 'liter';
    return 'pieces';
  };

  const extractItemName = (text: string): string => {
    // Improved Hindi/English normalization with small dictionary
    const dict: Record<string, string> = {
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
    const cleaned = text.toLowerCase().replace(/[\p{P}\p{S}]/gu, ' ');
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const stop = new Set(['mujhe','मुझे','lena','लेना','khareedna','खरीद','खरीदना','buy','get','please','pls','remind','याद','करना','ko','के','का','की','एक','है','hain','hoon','hai','jana','जाना','के','पास','doctor','डॉक्टर']);
    for (const t of tokens) {
      if (stop.has(t)) continue;
      if (dict[t]) return dict[t];
    }
    // Fallback: take last non-stop token
    const fallback = tokens.filter(t => !stop.has(t)).pop();
    return (fallback || '').trim();
  };

  const extractMultipleItems = (text: string): string[] => {
    const normalized = text.replace(/ और | and |,|\+/gi, ',');
    const parts = normalized.split(',').map(s => extractItemName(s)).filter(Boolean);
    return Array.from(new Set(parts));
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 shadow-lg border-2 border-blue-200">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-3 shadow-lg">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {user?.language === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}
        </h2>
        <p className="text-gray-600 text-sm">
          {user?.language === 'hi'
            ? 'माइक बटन दबाएं और बोलें'
            : 'Press the mic button and speak'}
        </p>

        {!apiKey && !useOllama && (
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Enable AI features
          </button>
        )}
      </div>

      {showApiKeyInput && !useOllama && (
        <div className="mb-6 bg-white p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 mb-2">
            Enter your Cerebras API key for enhanced AI processing
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={() => {
                if (apiKey) { localStorage.setItem('mom_assistant_ai_api_key', apiKey); setShowApiKeyInput(false); }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <VoiceInput onTranscript={handleTranscript} className="mb-6" />

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-gray-600 py-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </div>
      )}

      {feedback && (
        <div className={`
          text-center p-4 rounded-lg font-medium
          ${feedback.startsWith('✓')
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }
        `}>
          {feedback}
        </div>
      )}

      <div className="mt-6 bg-white bg-opacity-60 rounded-lg p-4 text-sm text-gray-700">
        <h3 className="font-semibold mb-2">
          {user?.language === 'hi' ? 'उदाहरण:' : 'Examples:'}
        </h3>
        <ul className="space-y-1 text-xs">
          <li>• "Mujhe 2 kilo doodh lena hai"</li>
          <li>• "Mujhe shaam ko 6 baje doctor ke pass jaana hai"</li>
          <li>• "Remind me to call bhai tomorrow"</li>
          <li>• "What's for breakfast?" {user?.language === 'hi' ? '(Recipes टैब में देखें)' : '(Check Recipes tab)'}</li>
        </ul>
      </div>

      <TimePickerModal
        open={showTimePicker}
        onClose={() => { setShowTimePicker(false); setPendingReminder(null); }}
        onConfirm={(date) => {
          setShowTimePicker(false);
          if (!pendingReminder) return;
          const fallback = new Date(Date.now() + 60 * 60 * 1000);
          addReminder({
            title: pendingReminder.title,
            originalVoiceInput: pendingReminder.original,
            reminderType: 'task',
            dueDate: date || fallback,
            isCompleted: false,
            priority: 'medium',
          });
          setPendingReminder(null);
          setFeedback(user?.language === 'hi' ? '✓ रिमाइंडर जोड़ दिया गया!' : '✓ Reminder added successfully!');
        }}
        title={user?.language === 'hi' ? 'समय चुनें' : 'Set reminder time'}
      />
    </div>
  );
}
