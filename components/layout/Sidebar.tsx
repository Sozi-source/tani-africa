// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Car, 
  Award, 
  User, 
  Settings, 
  LogOut,
  Truck,
  PlusCircle,
  X,
  Package,
  Users,
  Shield,
  BarChart3,
  MessageCircle,
  DollarSign,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  ClipboardList,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
  CreditCard,
  Bell,
  Heart,
  Flag,
  Home,
  Construction,
  Lock,
  Sparkles,
  Zap,
  Gem
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/lib/api/client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DashboardStats {
  totalJobs?: number;
  activeJobs?: number;
  completedJobs?: number;
  pendingBids?: number;
  totalEarnings?: number;
  pendingApprovals?: number;
  totalUsers?: number;
  totalTrips?: number;
  acceptanceRate?: number;
  unreadMessages?: number;
  pendingPayments?: number;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge: string | number | null;
  color: string;
  gradient?: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout, isClient, isDriver, isAdmin, token } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [pathname, isMobile, isOpen, onClose]);

  // Fetch real-time stats from API based on user role
  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !user?.id) return;
      
      try {
        setLoading(true);
        
        if (isClient) {
          const response = await apiClient.get('/jobs');
          const jobs = response.data?.data || response.data || [];
          const userJobs = Array.isArray(jobs) ? jobs.filter((j: any) => j.clientId === user.id) : [];
          
          setStats({
            totalJobs: userJobs.length,
            activeJobs: userJobs.filter((j: any) => ['SUBMITTED', 'BIDDING', 'ACTIVE'].includes(j.status)).length,
            completedJobs: userJobs.filter((j: any) => j.status === 'COMPLETED').length,
            totalTrips: userJobs.filter((j: any) => j.status === 'COMPLETED').length,
            unreadMessages: 0
          });
        } 
        else if (isDriver) {
          const [bidsRes, jobsRes] = await Promise.all([
            apiClient.get('/bids'),
            apiClient.get('/jobs')
          ]);
          
          const bids = bidsRes.data?.data || bidsRes.data || [];
          const jobs = jobsRes.data?.data || jobsRes.data || [];
          const driverBids = Array.isArray(bids) ? bids.filter((b: any) => b.driverId === user.id) : [];
          const driverJobs = Array.isArray(jobs) ? jobs.filter((j: any) => j.driverId === user.id) : [];
          
          const completedJobs = driverJobs.filter((j: any) => j.status === 'COMPLETED');
          const totalEarnings = completedJobs.reduce((sum: number, j: any) => sum + (j.price || 0), 0);
          
          setStats({
            pendingBids: driverBids.filter((b: any) => b.status === 'PENDING').length,
            activeJobs: driverJobs.filter((j: any) => j.status === 'ACTIVE').length,
            completedJobs: completedJobs.length,
            totalEarnings: totalEarnings,
            totalTrips: completedJobs.length,
            acceptanceRate: driverBids.length > 0 ? Math.round((driverBids.filter((b: any) => b.status === 'ACCEPTED').length / driverBids.length) * 100) : 0,
            unreadMessages: 0
          });
        } 
        else if (isAdmin) {
          const [statsRes, pendingDriversRes] = await Promise.all([
            apiClient.get('/admin/stats'),
            apiClient.get('/admin/drivers/pending')
          ]);
          
          const adminStats = statsRes.data?.data || statsRes.data || {};
          const pendingDrivers = pendingDriversRes.data?.data || pendingDriversRes.data || [];
          
          setStats({
            totalUsers: adminStats.totalUsers || 0,
            activeJobs: adminStats.activeJobs || 0,
            completedJobs: adminStats.completedJobs || 0,
            pendingApprovals: Array.isArray(pendingDrivers) ? pendingDrivers.length : 0,
            totalEarnings: adminStats.totalRevenue || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch sidebar stats:', error);
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [token, isClient, isDriver, isAdmin, user?.id]);

  // Brighter navigation colors
  const clientNav: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null, color: 'text-blue-500', gradient: 'from-blue-50 to-blue-100', disabled: false },
    { name: 'My Shipments', href: '/jobs/my', icon: Package, badge: stats.totalJobs ?? 0, color: 'text-green-500', gradient: 'from-green-50 to-green-100', disabled: false },
    { name: 'Post Shipment', href: '/jobs/create', icon: PlusCircle, badge: null, color: 'text-purple-500', gradient: 'from-purple-50 to-purple-100', disabled: false },
    { name: 'Track Shipments', href: '/jobs/track', icon: MapPin, badge: stats.activeJobs ?? 0, color: 'text-orange-500', gradient: 'from-orange-50 to-orange-100', disabled: true, comingSoon: true },
    { name: 'Payment History', href: '/payments', icon: CreditCard, badge: null, color: 'text-cyan-500', gradient: 'from-cyan-50 to-cyan-100', disabled: true, comingSoon: true },
    { name: 'Messages', href: '/messages', icon: MessageCircle, badge: stats.unreadMessages ?? 0, color: 'text-pink-500', gradient: 'from-pink-50 to-pink-100', disabled: true, comingSoon: true },
  ];

  const driverNav: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null, color: 'text-amber-500', gradient: 'from-amber-50 to-amber-100', disabled: false },
    { name: 'Available Jobs', href: '/jobs', icon: Briefcase, badge: null, color: 'text-green-500', gradient: 'from-green-50 to-green-100', disabled: false },
    { name: 'My Bids', href: '/bids/my', icon: Award, badge: stats.pendingBids ?? 0, color: 'text-purple-500', gradient: 'from-purple-50 to-purple-100', disabled: false },
    { name: 'Active Deliveries', href: '/jobs/active', icon: Truck, badge: stats.activeJobs ?? 0, color: 'text-orange-500', gradient: 'from-orange-50 to-orange-100', disabled: false },
    { name: 'Completed Jobs', href: '/jobs/completed', icon: CheckCircle, badge: stats.completedJobs ?? 0, color: 'text-emerald-500', gradient: 'from-emerald-50 to-emerald-100', disabled: false },
    { name: 'My Vehicles', href: '/vehicles', icon: Car, badge: null, color: 'text-cyan-500', gradient: 'from-cyan-50 to-cyan-100', disabled: false },
    { name: 'Earnings', href: '/earnings', icon: Wallet, badge: `KES ${(stats.totalEarnings ?? 0).toLocaleString()}`, color: 'text-emerald-500', gradient: 'from-emerald-50 to-emerald-100', disabled: false },
    { name: 'Messages', href: '/messages', icon: MessageCircle, badge: stats.unreadMessages ?? 0, color: 'text-pink-500', gradient: 'from-pink-50 to-pink-100', disabled: true, comingSoon: true },
  ];

  const adminNav: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard, badge: null, color: 'text-indigo-500', gradient: 'from-indigo-50 to-indigo-100', disabled: false },
    { name: 'Users', href: '/admin/users', icon: Users, badge: stats.totalUsers ?? 0, color: 'text-blue-500', gradient: 'from-blue-50 to-blue-100', disabled: false },
    { name: 'Driver Approvals', href: '/admin/drivers/pending', icon: UserCheck, badge: stats.pendingApprovals ?? 0, color: 'text-red-500', gradient: 'from-red-50 to-red-100', disabled: false },
    { name: 'All Jobs', href: '/admin/jobs', icon: Briefcase, badge: stats.activeJobs ?? 0, color: 'text-green-500', gradient: 'from-green-50 to-green-100', disabled: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, badge: null, color: 'text-purple-500', gradient: 'from-purple-50 to-purple-100', disabled: true, comingSoon: true },
    { name: 'Revenue', href: '/admin/revenue', icon: DollarSign, badge: `KES ${(stats.totalEarnings ?? 0).toLocaleString()}`, color: 'text-emerald-500', gradient: 'from-emerald-50 to-emerald-100', disabled: true, comingSoon: true },
    { name: 'Reports', href: '/admin/reports', icon: FileText, badge: null, color: 'text-orange-500', gradient: 'from-orange-50 to-orange-100', disabled: true, comingSoon: true },
    { name: 'Support Tickets', href: '/admin/support', icon: HelpCircle, badge: null, color: 'text-pink-500', gradient: 'from-pink-50 to-pink-100', disabled: true, comingSoon: true },
  ];

  const commonNav: NavItem[] = [
    { name: 'Profile', href: '/profile', icon: User, color: 'text-gray-500', gradient: 'from-gray-50 to-gray-100', disabled: false, badge: null },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-500', gradient: 'from-gray-50 to-gray-100', disabled: false, badge: null },
    { name: 'Help & Support', href: '/support', icon: HelpCircle, color: 'text-gray-500', gradient: 'from-gray-50 to-gray-100', disabled: false, badge: null },
  ];

  const getNavItems = (): NavItem[] => {
    if (isClient) return clientNav;
    if (isDriver) return driverNav;
    if (isAdmin) return adminNav;
    return [];
  };

  const navItems = getNavItems();
  const RoleIcon = isClient ? Briefcase : isDriver ? Truck : isAdmin ? Shield : User;

  const getRoleGradient = () => {
    if (isAdmin) return 'from-indigo-600 to-purple-600';
    if (isDriver) return 'from-amber-500 to-orange-600';
    if (isClient) return 'from-blue-500 to-cyan-600';
    return 'from-gray-500 to-gray-600';
  };

  const getSidebarGradient = () => {
    if (isAdmin) return 'from-indigo-900/95 via-purple-900/95 to-indigo-900/95';
    if (isDriver) return 'from-amber-900/95 via-orange-900/95 to-amber-900/95';
    if (isClient) return 'from-blue-900/95 via-cyan-900/95 to-blue-900/95';
    return 'from-gray-900/95 to-gray-800/95';
  };

  const isActive = (href: string) => pathname === href;

  const handleNavigation = (item: NavItem) => {
    if (item.disabled) {
      alert(`🚧 "${item.name}" is under development. Coming soon!`);
      return;
    }
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: (!isMobile && isCollapsed) ? '5rem' : '18rem',
          x: (isOpen || !isMobile) ? 0 : -320 
        }}
        className={`
          fixed left-0 top-0 z-50 h-full 
          bg-gradient-to-br ${getSidebarGradient()}
          shadow-2xl transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:z-0
          ${isMobile ? 'shadow-xl' : ''}
        `}
      >
        {/* Animated particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* Header Section */}
        <div className={`relative flex h-16 items-center justify-between px-4 ${(!isMobile && isCollapsed) ? 'justify-center' : ''}`}>
          {(!isCollapsed || isMobile) && (
            <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <Truck className="relative h-7 w-7 text-amber-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 drop-shadow-lg" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Tani Africa
                </span>
                <p className="text-[9px] text-white/40 -mt-0.5">Logistics Hub</p>
              </div>
            </Link>
          )}
          
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
          
          {isMobile && (
            <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Profile Section - Brighter */}
        {user && (!isCollapsed || isMobile) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-3 mt-4 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${getRoleGradient()} rounded-full blur-md opacity-60`} />
                <div className={`relative h-12 w-12 rounded-full bg-gradient-to-r ${getRoleGradient()} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white shadow-lg animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RoleIcon className="h-3 w-3 text-amber-400" />
                  <p className="text-xs text-white/60 capitalize">{user.role?.toLowerCase()}</p>
                </div>
                {isDriver && stats.acceptanceRate && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="h-1.5 w-12 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${stats.acceptanceRate}%` }} />
                    </div>
                    <span className="text-[9px] text-white/50">{stats.acceptanceRate}%</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation - Brighter Items */}
        <nav className="relative flex-1 overflow-y-auto py-4 mt-4 scrollbar-thin scrollbar-thumb-white/20">
          <div className="space-y-1 px-3">
            {navItems.map((item) => (
              <div key={item.name} onMouseEnter={() => setHoveredItem(item.name)} onMouseLeave={() => setHoveredItem(null)}>
                {item.disabled ? (
                  <div className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-not-allowed opacity-50">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    {(!isCollapsed || isMobile) && (
                      <>
                        <span className="font-medium text-sm text-white/40">{item.name}</span>
                        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/30 flex items-center gap-1">
                          <Construction className="h-2.5 w-2.5" />
                          Soon
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => handleNavigation(item)}
                    className={`
                      group relative flex items-center gap-3 rounded-xl px-3 py-2.5 
                      transition-all duration-200 overflow-hidden
                      ${isActive(item.href) 
                        ? `bg-gradient-to-r ${item.gradient} shadow-lg` 
                        : 'hover:bg-white/10'
                      }
                      ${(!isMobile && isCollapsed) ? 'justify-center' : ''}
                    `}
                  >
                    {/* Active indicator */}
                    {isActive(item.href) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-400 rounded-r-full" />
                    )}
                    
                    <item.icon className={`h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-md ${isActive(item.href) ? item.color : 'text-white/60 group-hover:text-white'}`} />
                    
                    {(!isCollapsed || isMobile) && (
                      <>
                        <span className={`font-medium text-sm ${isActive(item.href) ? 'text-gray-900' : 'text-white/80 group-hover:text-white'}`}>
                          {item.name}
                        </span>
                        {item.badge !== null && (
                          <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap shadow-sm
                            ${isActive(item.href) 
                              ? 'bg-white/80 text-gray-800' 
                              : item.name === 'Earnings' || item.name === 'Revenue'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : item.name === 'Driver Approvals'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-white/20 text-white/80'
                            }
                          `}>
                            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Hover glow */}
                    {hoveredItem === item.name && !isCollapsed && (
                      <motion.div 
                        layoutId="hoverGlow"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center my-4">
              <div className="h-1 w-12 bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full w-1/2 bg-gradient-to-r ${isClient ? 'from-blue-400 to-cyan-400' : isDriver ? 'from-amber-400 to-orange-400' : 'from-indigo-400 to-purple-400'} rounded-full animate-pulse`} />
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="my-4 mx-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Common Navigation */}
          <div className="space-y-1 px-3">
            {commonNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  group flex items-center gap-3 rounded-xl px-3 py-2.5 
                  transition-all duration-200
                  ${isActive(item.href) 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }
                  ${(!isMobile && isCollapsed) ? 'justify-center' : ''}
                `}
              >
                <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110`} />
                {(!isCollapsed || isMobile) && (
                  <span className="text-sm">{item.name}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer - Logout */}
        <div className="relative p-4">
          <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className={`
              group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 
              text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300
              ${(!isMobile && isCollapsed) ? 'justify-center' : ''}
            `}
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
            {(!isCollapsed || isMobile) && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        {/* Decorative Sparkle */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-20 pointer-events-none">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
      </motion.aside>
    </>
  );
};