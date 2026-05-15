/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, login, logout, testConnection } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Users, FileText, ClipboardList, LogOut, LogIn, Menu, X, Plus, Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/EmployeeForm';
import { Records } from './components/Records';
import { TimeReports } from './components/TimeReports';
import { Employee } from './types';

type View = 'employees' | 'records' | 'time-reports' | 'new-employee';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('employees');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-slate-200"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2 uppercase">EduGestão <span className="text-blue-600 font-light">Pro</span></h1>
          <p className="text-slate-500 mb-8 text-sm">Autenticação necessária para acesso ao sistema.</p>
          <button
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </button>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'employees', label: 'Funcionários', icon: Users },
    { id: 'records', label: 'Gerar Documentos', icon: FileText },
    { id: 'time-reports', label: 'Gerador de Ponto', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-slate-900 text-slate-300 flex flex-col fixed h-full z-30"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          {isSidebarOpen ? (
             <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-white font-bold text-xl tracking-tight uppercase">EduGestão <span className="text-blue-500 font-light">Pro</span></h1>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Gestão Escolar v1.0</p>
             </div>
          ) : (
            <ClipboardList className="w-8 h-8 text-blue-500 mx-auto" />
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-500">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 mx-auto" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${currentView === item.id ? 'text-white' : 'text-slate-500'}`} />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className={`flex items-center gap-3 ${isSidebarOpen ? 'mb-4' : 'mb-0'} px-2`}>
              <img src={user.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-slate-700" />
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-white font-bold text-xs truncate">{user.displayName}</p>
                  <p className="text-slate-500 text-[10px] truncate">Admin</p>
                </div>
              )}
           </div>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-wider`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[260px]' : 'ml-[80px]'} flex flex-col`}>
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>EduGestão</span>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-900">
              {navItems.find(n => n.id === currentView)?.label || 'Cadastro'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {currentView === 'employees' && (
              <button
                onClick={() => setCurrentView('new-employee')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-md shadow-blue-100"
              >
                <Plus className="w-4 h-4" />
                Novo Funcionário
              </button>
            )}
            {currentView === 'new-employee' && (
              <div className="flex gap-2">
                <button
                   onClick={() => { setEditingEmployee(null); setCurrentView('employees'); }}
                   className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold uppercase hover:bg-slate-50 text-slate-600 transition-all"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="p-8 flex-1 bg-slate-50 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {currentView === 'employees' && <EmployeeList onEdit={(emp) => { 
                  setEditingEmployee(emp);
                  setCurrentView('new-employee');
                }} />}
                {currentView === 'new-employee' && (
                  <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                       <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                         {editingEmployee ? 'Editar Funcionário' : 'Novo Cadastro de Funcionário'}
                       </h3>
                    </div>
                    <EmployeeForm 
                      initialData={editingEmployee} 
                      onSuccess={() => {
                        setEditingEmployee(null);
                        setCurrentView('employees');
                      }} 
                    />
                  </div>
                )}
                {currentView === 'records' && <Records />}
                {currentView === 'time-reports' && <TimeReports />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
