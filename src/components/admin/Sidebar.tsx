import React from 'react';
import { LayoutDashboard, ShoppingBag, FolderTree, Image as ImageIcon, Settings as SettingsIcon, LogOut, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../store/AppContext';
import { AdminView } from './AdminLayout';
import { LogoLockup } from '../brand/Logo';

interface SidebarProps {
  currentView: AdminView;
  onChangeView: (view: AdminView) => void;
  closeSidebar: () => void;
}

export const Sidebar = ({ currentView, onChangeView, closeSidebar }: SidebarProps) => {
  const { logoutAdmin } = useAppContext();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="h-full flex flex-col pt-4 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <div className="px-6 flex justify-between items-start gap-3 mb-8">
        <div className="min-w-0">
          <LogoLockup className="h-7" />
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
            Admin Panel
          </p>
        </div>
        <button onClick={closeSidebar} className="shrink-0 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onChangeView(item.id as AdminView);
              if (window.innerWidth < 768) closeSidebar();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentView === item.id 
                ? 'bg-[#ece9fa] dark:bg-[#3626a7]/20 brand-text' 
                : 'text-gray-600 dark:text-gray-400 dark:text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-800 dark:text-white'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        <button 
          onClick={() => {
            logoutAdmin();
            toast.success('Exited admin panel');
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Exit Admin</span>
        </button>
      </div>
    </div>
  );
};
