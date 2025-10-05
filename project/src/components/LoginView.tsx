import { useState } from 'react';
import { Heart, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginView() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name, language);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mb-4 shadow-lg">
            <Heart className="w-10 h-10 text-white fill-current" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Saathi
          </h1>
          <p className="text-gray-600">
            Your caring companion for daily tasks
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should I call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline w-4 h-4 mr-1" />
              Preferred Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`
                  py-3 px-4 rounded-lg border-2 font-medium transition-all
                  ${language === 'hi'
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }
                `}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`
                  py-3 px-4 rounded-lg border-2 font-medium transition-all
                  ${language === 'en'
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }
                `}
              >
                English
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Made with love for managing daily tasks</p>
        </div>
      </div>
    </div>
  );
}
