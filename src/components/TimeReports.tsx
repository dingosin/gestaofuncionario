import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { Employee, EmployeeRecord } from '../types';
import { Clock, Download, FileCheck, Send, Printer, User, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const TimeReports: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [reportData, setReportData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snap) => {
      setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    });
    return () => unsub();
  }, []);

  const generateReport = async () => {
    setIsGenerating(true);
    // In a real app, you'd fetch records for the specific month/employee here
    // For this demo, we'll simulate the report based on existing records
    setTimeout(() => {
      setReportData({
        period: month,
        generatedAt: new Date().toLocaleString(),
        summary: employees.map(emp => ({
          name: emp.name,
          role: emp.role,
          status: 'Completo',
          daysTotal: 22,
          absences: 0,
        }))
      });
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Controle e Fechamento de Ponto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Período de Referência</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Escopo do Relatório</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm"
            >
              <option value="all">Todos os Funcionários</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2.5 px-6 rounded-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-md"
            >
              {isGenerating ? 'Calculando...' : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Gerar Fechamento
                </>
              )}
            </button>
          </div>
        </div>

        {reportData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-slate-100 pt-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Consolidado Mensal — {month}</h4>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Protocolo: {new Date().getTime()}</p>
              </div>
              <div className="flex gap-2">
                <button
                   onClick={() => window.print()}
                   className="p-1.5 border border-slate-200 rounded text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button className="p-1.5 border border-slate-200 rounded text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="bg-slate-900 px-4 py-2 rounded-t-lg grid grid-cols-4 text-[9px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <div className="col-span-2">Funcionário</div>
                <div className="text-center">Dias</div>
                <div className="text-right">Ação</div>
              </div>
              {reportData.summary.map((row: any, idx: number) => (
                <div key={idx} className="bg-white px-4 py-2 border-x border-b border-slate-50 flex items-center justify-between text-[11px] font-medium text-slate-600 last:rounded-b-lg">
                  <div className="col-span-2 flex items-center gap-3 w-1/2">
                    <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-slate-400 font-bold text-[10px]">
                      {row.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-900 truncate">{row.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase">{row.role}</p>
                    </div>
                  </div>
                  <div className="font-mono text-center w-1/4">{row.daysTotal}d</div>
                  <div className="w-1/4 text-right">
                    <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase">Liberado</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-900 p-5 rounded-xl text-white">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Envio Funcionário</span>
                  <Send className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-[11px] leading-tight text-slate-400 mb-4">
                  Disponibiliza o espelho de ponto para conferência e assinatura individualizada.
                </p>
                <button className="w-full py-2 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
                  Emitir Vias
                </button>
              </div>
              <div className="bg-slate-900 p-5 rounded-xl text-white border border-blue-500/20">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Envio Diretoria</span>
                  <FileCheck className="w-3.5 h-3.5 text-green-500" />
                </div>
                <p className="text-[11px] leading-tight text-slate-400 mb-4">
                  Consolidado geral formatado para processamento administrativo da diretora.
                </p>
                <button className="w-full py-2 border border-slate-700 bg-slate-800 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                  Emitir Geral
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
        Sistema de Controle: Recomenda-se fechamento até o 5º dia útil.
      </div>
    </div>
  );
};
