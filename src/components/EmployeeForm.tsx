import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { InputMask } from '@react-input/mask';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Save, UserPlus } from 'lucide-react';

const employeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  role: z.string().min(2, "Função é obrigatória"),
  rg: z.string().min(12, "RG inválido"),
  birthDate: z.string().min(10, "Data inválida"),
  cpf: z.string().min(14, "CPF inválido"),
  address: z.string().min(5, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  phone: z.string().min(14, "Telefone inválido"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSuccess: () => void;
  initialData?: any;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSuccess, initialData }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (initialData?.id) {
        const docRef = doc(db, 'employees', initialData.id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        const colRef = collection(db, 'employees');
        await addDoc(colRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      onSuccess();
    } catch (error) {
      handleFirestoreError(error, initialData?.id ? OperationType.UPDATE : OperationType.CREATE, 'employees');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome do Funcionário</label>
          <input
            {...register('name')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="Nome completo"
          />
          {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Função / Cargo</label>
          <input
            {...register('role')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="Ex: Professor, Diretor..."
          />
          {errors.role && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.role.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data de Nascimento</label>
          <InputMask
            component="input"
            mask="__/__/____"
            replacement={{ _: /\d/ }}
            {...register('birthDate')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="DD/MM/AAAA"
          />
          {errors.birthDate && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.birthDate.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RG</label>
          <InputMask
            component="input"
            mask="__.__.___-_"
            replacement={{ _: /\d/ }}
            {...register('rg')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="XX.XXX.XXX-X"
          />
          {errors.rg && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.rg.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CPF</label>
          <InputMask
            component="input"
            mask="___.___.___-__"
            replacement={{ _: /\d/ }}
            {...register('cpf')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="XXX.XXX.XXX-XX"
          />
          {errors.cpf && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.cpf.message}</p>}
        </div>

        <div className="md:col-span-2 grid grid-cols-4 gap-4">
          <div className="col-span-3 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Endereço Residencial</label>
            <input
              {...register('address')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="Rua, Avenida..."
            />
            {errors.address && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.address.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nº</label>
            <input
              {...register('number')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="123"
            />
            {errors.number && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.number.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telefone de Contato</label>
          <InputMask
            component="input"
            mask="(__) _____-____"
            replacement={{ _: /\d/ }}
            {...register('phone')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            placeholder="(XX) XXXXX-XXXX"
          />
          {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2.5 px-8 rounded-md transition-all flex items-center gap-2 shadow-md shadow-blue-100 text-sm uppercase tracking-wide"
        >
          {isSubmitting ? 'Salvando...' : (
            <>
              <Save className="w-4 h-4" />
              Salvar Cadastro
            </>
          )}
        </button>
      </div>
    </form>
  );
};
