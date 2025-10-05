import { useState, useEffect } from 'react';
import { Bell, Package, ChefHat, LogOut, Home } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LoginView } from './components/LoginView';
import { VoiceAssistant } from './components/VoiceAssistant';
import { RemindersView } from './components/RemindersView';
import { PantryView } from './components/PantryView';
import { RecipesView } from './components/RecipesView';
import { useNotifications } from './hooks/useNotifications';

type View = 'home' | 'reminders' | 'pantry' | 'recipes';

function MainApp() {
  const { user, logout, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');

  useNotifications();

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-md sticky top-0 z-10 border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Saathi
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.name}! 👋
              </p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b-2 border-gray-200 sticky top-[73px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'home' as View, icon: Home, label: user?.language === 'hi' ? 'होम' : 'Home' },
              { id: 'reminders' as View, icon: Bell, label: user?.language === 'hi' ? 'रिमाइंडर' : 'Reminders' },
              { id: 'pantry' as View, icon: Package, label: user?.language === 'hi' ? 'पैंट्री' : 'Pantry' },
              { id: 'recipes' as View, icon: ChefHat, label: user?.language === 'hi' ? 'रेसिपी' : 'Recipes' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`
                  flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2
                  ${currentView === id
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="space-y-8">
            <VoiceAssistant />

            <div className="grid md:grid-cols-2 gap-6">
              <QuickStatsCard
                title={user?.language === 'hi' ? 'रिमाइंडर' : 'Reminders'}
                icon={Bell}
                color="blue"
                onClick={() => setCurrentView('reminders')}
              />
              <QuickStatsCard
                title={user?.language === 'hi' ? 'पैंट्री आइटम' : 'Pantry Items'}
                icon={Package}
                color="green"
                onClick={() => setCurrentView('pantry')}
              />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {user?.language === 'hi' ? 'कैसे उपयोग करें' : 'How to Use'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">
                    {user?.language === 'hi' ? 'रिमाइंडर जोड़ें' : 'Add Reminders'}
                  </h4>
                  <p>
                    {user?.language === 'hi'
                      ? 'माइक बटन दबाएं और बोलें: "मुझे शाम को 6 बजे डॉक्टर के पास जाना है"'
                      : 'Press mic and say: "Remind me to visit doctor at 6 PM"'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">
                    {user?.language === 'hi' ? 'पैंट्री मैनेज करें' : 'Manage Pantry'}
                  </h4>
                  <p>
                    {user?.language === 'hi'
                      ? 'आइटम जोड़ें और रेसिपी सुझाव पाएं'
                      : 'Add items and get recipe suggestions'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'reminders' && <RemindersView />}
        {currentView === 'pantry' && <PantryView />}
        {currentView === 'recipes' && <RecipesView />}
      </main>

      <footer className="bg-white border-t-2 border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>Made with ❤️ for managing daily tasks</p>
        </div>
      </footer>
    </div>
  );
}

function QuickStatsCard({
  title,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  icon: React.ElementType;
  color: 'blue' | 'green';
  onClick: () => void;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={`
        bg-gradient-to-br ${colorClasses[color]} text-white p-6 rounded-xl shadow-lg
        hover:shadow-xl transition-all transform hover:scale-105
      `}
    >
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-white text-opacity-90 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold">View</p>
        </div>
        <Icon className="w-12 h-12 text-white text-opacity-80" />
      </div>
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
