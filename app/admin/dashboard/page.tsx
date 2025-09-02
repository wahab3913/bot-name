'use client';

import Link from 'next/link';
import { Upload, Brain, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const quickActions = [
    {
      title: 'Upload Knowledge',
      description: 'Add new documents to enhance AI understanding',
      icon: Upload,
      href: '/admin/dashboard/files',
      iconBg: 'bg-[#101238]',
      cardBg: 'bg-blue-50',
    },
    {
      title: 'Train AI',
      description: 'Create Q&A pairs to improve responses',
      icon: Brain,
      href: '/admin/dashboard/qa',
      iconBg: 'bg-[#101238]',
      cardBg: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8 overflow-hidden">
      {/* Header */}
      <div className="relative mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">
            AI Command Center
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Monitor, train, and optimize your intelligent assistant
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-1 md:p-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`group relative ${action.cardBg} p-4 md:p-8 rounded-xl md:rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] block overflow-hidden`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div
                      className={`w-10 h-10 md:w-16 md:h-16 ${action.iconBg} rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 group-hover:scale-105 transition-transform duration-300`}
                    >
                      <Icon className="h-5 w-5 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-gray-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 md:h-6 md:w-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                </div>

                {/* Animated background effect */}
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100"></div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
