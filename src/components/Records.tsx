import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import { Employee, EmployeeRecord, RecordType } from '../types';
import { Plus, FileText, Calendar, Upload, Check, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InputMask } from '@react-input/mask';

export const Records: React.FC = () => {
  const [records, setRecords] = useState<EmployeeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Record State
  const [newRecord, setNewRecord] = useState<Partial<EmployeeRecord>>({
    type: 'abonada',
    status: 'pending',
    daysCount: '01',
    reason: 'Falta Abonada'
  });

  useEffect(() => {
    // Fetch Employees for selection
    const empUnsubscribe = onSnapshot(collection(db, 'employees'), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    });

    // Fetch Records
    const q = query(collection(db, 'records'), orderBy('createdAt', 'desc'));
    const recUnsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeRecord)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'records'));

    return () => {
      empUnsubscribe();
      recUnsubscribe();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRecord({ ...newRecord, attachmentBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.employeeId || !newRecord.type || !newRecord.date) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    try {
      const employee = employees.find(e => e.id === newRecord.employeeId);
      await addDoc(collection(db, 'records'), {
        ...newRecord,
        employeeName: employee?.name,
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      setNewRecord({ type: 'abonada', status: 'pending', daysCount: '01', reason: 'Falta Abonada' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'records');
    }
  };

  const getBadgeColor = (type: RecordType) => {
    switch (type) {
      case 'abonada': return 'text-orange-600 bg-orange-50';
      case 'ferias': return 'text-blue-600 bg-blue-50';
      case 'folga': return 'text-green-600 bg-green-50';
      case 'atestado': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const openFormWithType = (type: RecordType) => {
    setNewRecord({ 
      ...newRecord, 
      type,
      daysCount: type === 'ferias' ? '30' : '01',
      reason: type === 'abonada' ? 'Falta Abonada' : type === 'folga' ? 'Folga' : ''
    });
    setIsAdding(true);
  };

  const generateDocument = (record: EmployeeRecord) => {
    const employee = employees.find(e => e.id === record.employeeId);
    if (!employee) return;

    const win = window.open('', '_blank');
    if (!win) return;

    const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    let content = '';

    if (record.type === 'abonada' || record.type === 'folga') {
      content = `
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/43/Coat_of_arms_of_Teodoro_Sampaio_%28S%C3%A3o_Paulo%29.png" style="width: 80px; margin-bottom: 10px;">
            <h2 style="margin: 0; font-size: 18px;">MUNICÍPIO TEODORO SAMPAIO</h2>
            <h3 style="margin: 0; font-size: 16px;">SECRETARIA MUNICIPAL DE EDUCAÇÃO</h3>
            <h4 style="margin: 0; font-size: 14px;">EMEF PEDRO CAMINOTO</h4>
          </div>

          <h2 style="text-align: center; font-size: 18px; margin-bottom: 40px;">EXCELENTÍSSIMO SR PREFEITO MUNICIPAL DE TEODORO SAMPAIO</h2>

          <p style="text-indent: 50px; text-align: justify;">
            Eu, <strong>${employee.name}</strong>, servidor (a) público (a) municipal, lotado (a) no cargo de <strong>${employee.role}</strong>, 
            do Setor de <strong>Secretaria Municipal de Educação</strong>, tendo faltado no dia <strong>${record.date}</strong>, 
            <strong>${record.daysCount || '01'} dia</strong>, vem mui respeitosamente à presença de Vossa Excelência solicitar-lhe que seja ABONADA sua falta pelo motivo de:
          </p>

          <div style="margin: 30px 50px;">
            <p>( ${record.reason === 'Falta Abonada' ? 'X' : ' '} ) Falta Abonada</p>
            <p>( ${record.reason === 'Gala' ? 'X' : ' '} ) Gala</p>
            <p>( ${record.reason === 'Serviço obrigatório' ? 'X' : ' '} ) Serviço obrigatório</p>
            <p>( ${record.reason === 'Doação de Sangue' ? 'X' : ' '} ) Doação de Sangue</p>
            <p>( ${record.type === 'folga' ? 'X' : ' '} ) Folga</p>
            <p>( ${record.reason === 'Folga Rural' ? 'X' : ' '} ) Folga Rural</p>
            <p>( ${record.reason === 'Luto' ? 'X' : ' '} ) Luto</p>
            ${record.notes ? `<p>( X ) Outros: ${record.notes}</p>` : '<p>(   ) Outros: __________________________________________________________________</p>'}
          </div>

          <div style="margin-top: 40px;">
            <p>Nestes Termos,</p>
            <p>Pede Deferimento.</p>
          </div>

          <div style="text-align: right; margin-top: 30px;">
            Teodoro Sampaio, ${today}
          </div>

          <div style="margin-top: 80px; display: flex; justify-content: space-between;">
            <div style="text-align: center; border-top: 1px solid #000; width: 45%; padding-top: 10px;">
              <strong>${employee.name}</strong><br>
              ${employee.role}
            </div>
            <div style="text-align: center; border-top: 1px solid #000; width: 45%; padding-top: 10px;">
              <strong>Maria Aparecida Ferreira Lifante</strong><br>
              RG: 23.651.396-5<br>
              Diretora de Escola
            </div>
          </div>

          <div style="margin-top: 50px;">
            <p>De Acordo</p>
            <p>____/____/2026</p>
            <p>Coordenadoria de Gestão de Pessoas</p>
          </div>
        </div>
      `;
    } else if (record.type === 'ferias') {
      content = `
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 18px;">MUNICÍPIO DE TEODORO SAMPAIO</h2>
            <p style="margin: 0; font-size: 12px;">CNPJ N- 44.951.515/0001-42</p>
            <h3 style="margin: 0; font-size: 16px;">EMEF "PEDRO CAMINOTO"</h3>
            <p style="margin: 0; font-size: 11px;">R. PROFESSORA APARECIDA MARIA DE SOUZA, N 1.700 - VILA FURLAN - FONE: (18) 3282-3533</p>
          </div>

          <h2 style="text-align: center; font-size: 18px; margin-bottom: 40px;">EXCELENTÍSSIMO SR PREFEITO MUNICIPAL DE TEODORO SAMPAIO</h2>

          <p style="text-indent: 50px; text-align: justify;">
            Venho por meio deste, informar a Vossa Senhoria, que o (a) funcionário (a) <strong>${employee.name}</strong>, 
            servidor (a) público (a) municipal, lotado (a) no cargo de <strong>${employee.role}</strong>, 
            da <strong>EMEF PEDRO CAMINOTO</strong>, efetivo (a), do <strong>Secretaria Municipal de Educação</strong>, 
            vem mui respeitosamente à presença de Vossa Excelência, solicitar-lhe que seja concedida suas férias regulamentares, 
            pelo período de <strong>${record.daysCount || '30'} dias</strong>, com início em <strong>${record.date}</strong>, 
            referente ao período aquisitivo de <strong>${record.acquisitionPeriod || '____/____'}</strong>, de acordo com o Estatuto dos Servidores Públicos Municipais.
          </p>

          <div style="margin-top: 40px;">
            <p>Nestes Termos</p>
            <p>Pede Deferimento</p>
          </div>

          <div style="text-align: right; margin-top: 30px;">
            Teodoro Sampaio, ________ de ________________ de 2025.
          </div>

          <div style="margin-top: 80px; display: flex; justify-content: space-between;">
            <div style="text-align: center; border-top: 1px solid #000; width: 45%; padding-top: 10px;">
              <strong>${employee.name}</strong><br>
              Cargo
            </div>
            <div style="text-align: center; border-top: 1px solid #000; width: 45%; padding-top: 10px;">
              <strong>Maria Aparecida Ferreira Lifante</strong><br>
              RG: 23.651.396-5<br>
              Diretora de Escola
            </div>
          </div>

          <div style="margin-top: 50px;">
            <p>De Acordo</p>
            <p>____/____/2025</p>
            <p>Coordenadoria de Gestão de Pessoas</p>
          </div>
        </div>
      `;
    }

    win.document.write(`
      <html>
        <head><title>Documento - ${record.type}</title></head>
        <body onload="window.print()">
          ${content}
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Gerar Documentos</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecione o tipo de documento para gerar</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'abonada', label: 'Abonada', color: 'bg-orange-600 shadow-orange-100' },
            { id: 'ferias', label: 'Férias', color: 'bg-blue-600 shadow-blue-100' },
            { id: 'folga', label: 'Folga', color: 'bg-green-600 shadow-green-100' },
            { id: 'atestado', label: 'Atestado', color: 'bg-purple-600 shadow-purple-100' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => openFormWithType(btn.id as RecordType)}
              className={`${btn.color} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] font-black transition-all shadow-md uppercase tracking-wider`}
            >
              <Plus className="w-3 h-3" />
              {btn.label}
            </button>
          ))}
          {isAdding && (
            <button
              onClick={() => setIsAdding(false)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-2 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Funcionário</label>
                  <select
                    value={newRecord.employeeId}
                    onChange={(e) => setNewRecord({ ...newRecord, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm"
                    required
                  >
                    <option value="">Selecione...</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data do Documento / Início</label>
                  <InputMask
                    component="input"
                    mask="__/__/____"
                    replacement={{ _: /\d/ }}
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm"
                    placeholder="DD/MM/AAAA"
                    required
                  />
                </div>

                {newRecord.type === 'ferias' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quantidade de Dias</label>
                      <input
                        type="number"
                        value={newRecord.daysCount}
                        onChange={(e) => setNewRecord({ ...newRecord, daysCount: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm"
                        placeholder="Ex: 30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Período Aquisitivo</label>
                      <input
                        type="text"
                        value={newRecord.acquisitionPeriod}
                        onChange={(e) => setNewRecord({ ...newRecord, acquisitionPeriod: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm"
                        placeholder="Ex: 2023/2024"
                      />
                    </div>
                  </>
                )}

                {(newRecord.type === 'abonada' || newRecord.type === 'folga') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motivo / Tipo</label>
                    <select
                      value={newRecord.reason}
                      onChange={(e) => setNewRecord({ ...newRecord, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none text-sm"
                    >
                      <option value="Falta Abonada">Falta Abonada</option>
                      <option value="Gala">Gala</option>
                      <option value="Serviço obrigatório">Serviço obrigatório</option>
                      <option value="Doação de Sangue">Doação de Sangue</option>
                      <option value="Folga">Folga</option>
                      <option value="Folga Rural">Folga Rural</option>
                      <option value="Luto">Luto</option>
                      <option value="Outros">Outros (especificar em obs)</option>
                    </select>
                  </div>
                )}

                {newRecord.type === 'atestado' && (
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Importar Atestado (Imagem/PDF)</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className={`border-2 border-dashed rounded-md p-3 transition-all flex items-center justify-center gap-3 ${newRecord.attachmentBase64 ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'}`}>
                        {newRecord.attachmentBase64 ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Arquivo Carregado</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload do Documento</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observações (Interno)</label>
                  <textarea
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none min-h-[80px] text-sm"
                    placeholder="Contexto adicional..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-8 rounded-md transition-all shadow-md text-xs uppercase tracking-widest"
                >
                  Gerar e Salvar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-2.5">
        {records.map((rec) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white px-4 py-3 rounded-lg border border-slate-200 flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2.5 rounded-md ${getBadgeColor(rec.type)} flex-shrink-0`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-slate-900 text-xs truncate uppercase tracking-tighter">{rec.employeeName}</h4>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getBadgeColor(rec.type)}`}>
                    {rec.type}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {rec.date} {rec.endDate ? `— ${rec.endDate}` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(rec.type === 'abonada' || rec.type === 'folga' || rec.type === 'ferias') && (
                <button
                  onClick={() => generateDocument(rec)}
                  className="text-[9px] font-bold text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-wider border border-blue-100 bg-blue-50 px-2 py-1 rounded"
                >
                  Imprimir
                </button>
              )}
              {rec.attachmentBase64 && (
                <button
                  onClick={() => {
                    const win = window.open();
                    win?.document.write(`
                      <html>
                        <head><title>Ver Atestado</title></head>
                        <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#f0f0f0;">
                          <img src="${rec.attachmentBase64}" style="max-width: 100%; max-height: 100vh;" />
                        </body>
                      </html>
                    `);
                    win?.document.close();
                  }}
                  className="text-[9px] font-bold text-purple-600 hover:underline flex items-center gap-1 uppercase tracking-wider border border-purple-100 bg-purple-50 px-2 py-1 rounded"
                >
                  Anexo
                </button>
              )}
              <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                rec.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                rec.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                {rec.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
