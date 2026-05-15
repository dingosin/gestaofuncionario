import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Employee } from '../types';
import { User, Phone, MapPin, Briefcase, Trash2, Edit2, Search, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeListProps {
  onEdit: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(emps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'employees');
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await deleteDoc(doc(db, 'employees', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `employees/${id}`);
      }
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cpf.includes(searchTerm)
  );

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome, cargo ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredEmployees.map((emp) => (
            <motion.div
              key={emp.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{emp.name}</h3>
                    <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 w-fit">
                      <Briefcase className="w-3 h-3" />
                      {emp.role}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(emp)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => emp.id && handleDelete(emp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-300" />
                  {emp.phone}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[9px] uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">CPF</span>
                  {emp.cpf}
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="truncate">{emp.address}, {emp.number}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed text-slate-400 text-sm font-medium">
          Nenhum registro encontrado.
        </div>
      )}
    </div>
  );
};
