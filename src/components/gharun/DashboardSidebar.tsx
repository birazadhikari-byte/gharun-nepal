import React, { useState } from 'react';
import {
  LayoutDashboard, ClipboardList, PlusCircle, User, LogOut,
  Briefcase, DollarSign, Star, Shield, Users, FileText, History,
  ChevronLeft, ChevronRight, MessageCircle, Car, BarChart3,
  Home, Menu, X, MapPin, CreditCard
} from 'lucide-react';
import { isInternalRole } from '@/contexts/AuthContext';
import { t } from '@/lib/i18n';


interface SidebarItem {
  id: string;
  en: string;
  np: string;
  icon: React.ElementType;
  badge?: number;
}

interface DashboardSidebarProps {
  role: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onGoHome: () => void;
  userName: string;
  userEmail?: string;
  badges?: Record<string, number>;
}

const GHARUN_WHATSAPP = '9779713242471';


const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  role, activeTab, onTabChange, onLogout, onGoHome, userName, userEmail, badges = {}
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getMenuItems = (): SidebarItem[] => {
    if (role === 'client') {
      return [
        { id: 'overview', en: t.clientDash.dashboard.en, np: t.clientDash.dashboard.np, icon: LayoutDashboard },
        { id: 'new-request', en: t.clientDash.newRequest.en, np: t.clientDash.newRequest.np, icon: PlusCircle },
        { id: 'my-requests', en: t.clientDash.myRequests.en, np: t.clientDash.myRequests.np, icon: ClipboardList, badge: badges['my-requests'] },
        { id: 'payments', en: 'Payments', np: 'भुक्तानी', icon: CreditCard, badge: badges['payments'] },
        { id: 'track', en: t.clientDash.trackService.en, np: t.clientDash.trackService.np, icon: MapPin },
        { id: 'messages', en: t.clientDash.messages.en, np: t.clientDash.messages.np, icon: MessageCircle, badge: badges['messages'] },
        { id: 'profile', en: t.clientDash.myProfile.en, np: t.clientDash.myProfile.np, icon: User },
      ];
    }
    if (role === 'provider') {

      return [
        { id: 'overview', en: t.providerDash.providerDashboard.en, np: t.providerDash.providerDashboard.np, icon: LayoutDashboard },
        { id: 'available-jobs', en: 'Available Jobs', np: 'उपलब्ध कामहरू', icon: ClipboardList, badge: badges['available-jobs'] },
        { id: 'assigned-jobs', en: t.providerDash.assignedJobs.en, np: t.providerDash.assignedJobs.np, icon: Briefcase, badge: badges['assigned-jobs'] },
        { id: 'job-history', en: t.providerDash.jobHistory.en, np: t.providerDash.jobHistory.np, icon: History },
        { id: 'earnings', en: t.providerDash.earnings.en, np: t.providerDash.earnings.np, icon: DollarSign },
        { id: 'ratings', en: t.providerDash.myRatings.en, np: t.providerDash.myRatings.np, icon: Star },
        { id: 'messages', en: t.providerDash.messages.en, np: t.providerDash.messages.np, icon: MessageCircle, badge: badges['messages'] },
        { id: 'profile', en: t.providerDash.myProfile.en, np: t.providerDash.myProfile.np, icon: User },
        { id: 'documents', en: 'Documents', np: 'कागजातहरू', icon: FileText },
      ];
    }

    // Internal roles - menu items without exposing role names
    if (isInternalRole(role)) {
      return [
        { id: 'overview', en: 'Dashboard', np: 'ड्यासबोर्ड', icon: LayoutDashboard },
        { id: 'requests', en: 'All Requests', np: 'सबै अनुरोधहरू', icon: ClipboardList, badge: badges['requests'] },
        { id: 'providers', en: 'Providers', np: 'प्रदायकहरू', icon: Users, badge: badges['providers'] },
        { id: 'clients', en: 'Clients', np: 'ग्राहकहरू', icon: User },
        { id: 'submissions', en: 'Submissions', np: 'पेशहरू', icon: FileText, badge: badges['submissions'] },
        { id: 'rides', en: 'Ride Connector', np: 'सवारी कनेक्टर', icon: Car },
        { id: 'pricing', en: 'Pricing', np: 'मूल्य', icon: DollarSign },
        { id: 'analytics', en: 'Analytics', np: 'विश्लेषण', icon: BarChart3 },
        { id: 'audit', en: 'Audit Logs', np: 'अडिट लगहरू', icon: History },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  // Determine visual theme based on role type
  const isInternal = isInternalRole(role);
  const roleColors = {
    client: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', light: 'bg-blue-50 text-blue-700', active: 'bg-blue-100 text-blue-800 border-blue-300', accent: 'text-blue-600' },
    provider: { bg: 'bg-green-600', hover: 'hover:bg-green-700', light: 'bg-green-50 text-green-700', active: 'bg-green-100 text-green-800 border-green-300', accent: 'text-green-600' },
    internal: { bg: 'bg-gray-700', hover: 'hover:bg-gray-800', light: 'bg-gray-50 text-gray-700', active: 'bg-gray-100 text-gray-800 border-gray-300', accent: 'text-gray-600' },
  };

  const colorKey = isInternal ? 'internal' : (role as 'client' | 'provider');
  const colors = roleColors[colorKey] || roleColors.client;

  // Public-facing role label only
  const roleLabel = role === 'client' ? `${t.sidebar.clientPanel.en}` : role === 'provider' ? `${t.sidebar.providerPanel.en}` : 'Panel';
  const roleLabelNp = role === 'client' ? t.sidebar.clientPanel.np : role === 'provider' ? t.sidebar.providerPanel.np : 'प्यानल';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & Role */}
      <div className={`${colors.bg} px-4 py-5 text-white`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">{t.brand.en}</h2>
              <p className="text-[10px] text-white/70">{roleLabel}</p>
              <p className="text-[9px] text-white/50">{roleLabelNp}</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-[10px] text-gray-500 truncate">{userEmail || roleLabel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? `${colors.active} border`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={collapsed ? item.en : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? colors.accent : 'text-gray-400'}`} />
              {!collapsed && (
                <>
                  <div className="flex-1 text-left truncate">
                    <span>{item.en}</span>
                    <span className="block text-[9px] opacity-50">{item.np}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} text-white`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && item.badge > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold ${colors.bg} text-white flex items-center justify-center`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1">
        <button
          onClick={onGoHome}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          <Home className="w-5 h-5 text-gray-400" />
          {!collapsed && (
            <div>
              <span>{t.sidebar.backToHome.en}</span>
              <span className="block text-[9px] opacity-50">{t.sidebar.backToHome.np}</span>
            </div>
          )}
        </button>

        <a
          href={`https://wa.me/${GHARUN_WHATSAPP}?text=${encodeURIComponent('Namaste! I need help from Gharun Nepal.')}`}
          target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-600 hover:bg-green-50 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          {!collapsed && (
            <div>
              <span>{t.sidebar.whatsappSupport.en}</span>
              <span className="block text-[9px] opacity-50">{t.sidebar.whatsappSupport.np}</span>
            </div>
          )}
        </a>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && (
            <div>
              <span>{t.sidebar.signOut.en}</span>
              <span className="block text-[9px] opacity-50">{t.sidebar.signOut.np}</span>
            </div>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-2 border-t border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-200"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 shadow-sm transition-all duration-300
        ${collapsed ? 'w-[72px]' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent />
      </aside>

      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`} />
    </>
  );
};

export default DashboardSidebar;
