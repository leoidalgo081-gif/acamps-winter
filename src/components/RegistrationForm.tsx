import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Calendar, Shield, Utensils, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { RegistrationData } from '../types';
import { EVENT_INFO } from '../data';
import { PATRONS, Patron } from './BrandingAssets';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  onBack: () => void;
}

export default function RegistrationForm({ onSubmit, onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    rg: '',
    parentName: '',
    parentPhone: '',
    foodRestriction: '',
  });

  const [selectedPatronId, setSelectedPatronId] = useState<string>('carlo_acutis');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Nome completo é obrigatório';
    if (!formData.email.trim()) {
      tempErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'E-mail inválido';
    }
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Telefone é obrigatório';
    }
    
    const ageNum = parseInt(formData.age);
    if (!formData.age) {
      tempErrors.age = 'Idade é obrigatória';
    } else if (isNaN(ageNum) || ageNum < 14 || ageNum > 17) {
      tempErrors.age = 'O Acamp\'s Winter é para jovens de 14 a 17 anos';
    }

    if (!formData.rg.trim()) tempErrors.rg = 'RG é obrigatório para o seguro';
    if (!formData.parentName.trim()) tempErrors.parentName = 'Nome do responsável é obrigatório';
    if (!formData.parentPhone.trim()) tempErrors.parentPhone = 'Telefone do responsável é obrigatório';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate creation of a unique ticket code
    setTimeout(() => {
      const code = 'AW-' + Math.floor(100000 + Math.random() * 900000);
      const data: RegistrationData = {
        id: Math.random().toString(36).substring(2, 9),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        rg: formData.rg,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        foodRestriction: formData.foodRestriction,
        ticketCode: code,
        registrationDate: new Date().toLocaleDateString('pt-BR'),
        status: 'confirmed',
        patronId: selectedPatronId,
      };
      
      // Save to localStorage so that the user's registration persists
      localStorage.setItem('acamps_winter_registration', JSON.stringify(data));
      
      onSubmit(data);
      setIsSubmitting(false);
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="px-5 py-2 text-white">
      <div className="mb-4 text-center">
        <span className="text-[#dd681f] text-[10px] font-black tracking-[0.3em] uppercase block">
          INSCRIÇÃO OFICIAL
        </span>
        <h2 className="text-2xl font-black tracking-tighter text-white uppercase mt-1">
          Garanta Sua Vaga
        </h2>
        <p className="text-gray-400 text-[11px] mt-1">
          Preencha os dados abaixo para gerar seu passaporte digital.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3.5"
        >
          {/* Nome Completo */}
          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] mb-1.5">
              Nome Completo do Jovem
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <User className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="SEU NOME COMPLETO"
                className={`w-full bg-[#254b8c] border-2 ${
                  errors.fullName ? 'border-red-600' : 'border-[#2e5aa8]'
                } rounded-none py-2 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#dd681f] transition-colors uppercase font-mono`}
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-bold font-mono">
                <AlertCircle className="w-3 h-3" /> {errors.fullName.toUpperCase()}
              </p>
            )}
          </motion.div>

          {/* Email e Telefone em Grid */}
          <div className="grid grid-cols-2 gap-2">
            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] mb-1.5">
                E-mail de Contato
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-500">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="SEU EMAIL"
                  className={`w-full bg-[#254b8c] border-2 ${
                    errors.email ? 'border-red-600' : 'border-[#2e5aa8]'
                  } rounded-none py-2 pl-8 pr-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#dd681f] transition-colors uppercase font-mono`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1 font-bold font-mono">{errors.email.toUpperCase()}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] mb-1.5">
                Celular (WhatsApp)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-500">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className={`w-full bg-[#254b8c] border-2 ${
                    errors.phone ? 'border-red-600' : 'border-[#2e5aa8]'
                  } rounded-none py-2 pl-8 pr-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#dd681f] transition-colors font-mono`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-[10px] mt-1 font-bold font-mono">{errors.phone.toUpperCase()}</p>
              )}
            </motion.div>
          </div>

          {/* Idade e RG */}
          <div className="grid grid-cols-2 gap-2">
            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] mb-1.5">
                Idade (14 a 17)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                </span>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="SUA IDADE"
                  className={`w-full bg-[#254b8c] border-2 ${
                    errors.age ? 'border-red-600' : 'border-[#2e5aa8]'
                  } rounded-none py-2 pl-8 pr-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#dd681f] transition-colors font-mono`}
                />
              </div>
              {errors.age && (
                <p className="text-red-500 text-[10px] mt-1 font-bold font-mono">{errors.age.toUpperCase()}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] mb-1.5">
                RG do Jovem
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                </span>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  placeholder="00.000.000-0"
                  className={`w-full bg-[#254b8c] border-2 ${
                    errors.rg ? 'border-red-600' : 'border-[#2e5aa8]'
                  } rounded-none py-2 pl-8 pr-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#dd681f] transition-colors font-mono`}
                />
              </div>
              {errors.rg && (
                <p className="text-red-500 text-[10px] mt-1 font-bold font-mono">{errors.rg.toUpperCase()}</p>
              )}
            </motion.div>
          </div>

          <div className="border-t border-[#2e5aa8] my-2 pt-2">
            <span className="text-[10px] text-[#dd681f] font-black tracking-[0.2em] block mb-2">
              DADOS DO RESPONSÁVEL (OBRIGATÓRIO)
            </span>
          </div>

          {/* Nome do Responsável */}
          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] mb-1.5">
              Nome do Responsável Legal
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <User className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="NOME DO RESPONSÁVEL"
                className={`w-full bg-[#254b8c] border-2 ${
                  errors.parentName ? 'border-red-600' : 'border-[#2e5aa8]'
                } rounded-none py-2 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#dd681f] transition-colors uppercase font-mono`}
              />
            </div>
            {errors.parentName && (
              <p className="text-red-500 text-[10px] mt-1 font-bold font-mono">{errors.parentName.toUpperCase()}</p>
            )}
          </motion.div>

          {/* Telefone do Responsável */}
          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] mb-1.5">
              Celular do Responsável
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Phone className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="(00) 90000-0000"
                className={`w-full bg-[#254b8c] border-2 ${
                  errors.parentPhone ? 'border-red-600' : 'border-[#2e5aa8]'
                } rounded-none py-2 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#dd681f] transition-colors font-mono`}
              />
            </div>
            {errors.parentPhone && (
              <p className="text-red-500 text-[10px] mt-1 font-bold font-mono">{errors.parentPhone.toUpperCase()}</p>
            )}
          </motion.div>

          {/* Santo Intercessor Selector (Branding elements sticker-sheet) */}
          <motion.div variants={itemVariants} className="border-t border-[#2e5aa8] pt-4 mt-2">
            <span className="text-[10px] text-[#dd681f] font-black tracking-[0.2em] block mb-1">
              ESCOLHA SEU SANTO INTERCESSOR (STIKERS OFICIAIS)
            </span>
            <p className="text-[10px] text-gray-400 mb-3 uppercase tracking-wide">
              Seu passaporte digital receberá o selo/adesivo oficial do patrono que você escolher!
            </p>

            {/* Horizontal Scrollable Saints list */}
            <div className="flex gap-3 overflow-x-auto pb-3.5 no-scrollbar snap-x snap-mandatory">
              {PATRONS.map((patron) => {
                const isSelected = selectedPatronId === patron.id;
                return (
                  <button
                    key={patron.id}
                    type="button"
                    onClick={() => setSelectedPatronId(patron.id)}
                    className={`flex-shrink-0 w-[145px] p-2.5 bg-[#254b8c] border-2 transition-all rounded-none text-left flex flex-col justify-between cursor-pointer snap-start relative ${
                      isSelected
                        ? 'border-[#dd681f] shadow-[0_4px_12px_rgba(232,82,28,0.25)] bg-[#254b8c]'
                        : 'border-[#2e5aa8] hover:border-gray-700'
                    }`}
                  >
                    {/* Active Selected Sticker Badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-[#dd681f] text-white p-0.5 rounded-full z-10">
                        <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* Patron Avatar Sticker */}
                    <div className="w-16 h-16 mx-auto mb-2 relative transform transition-transform hover:scale-105">
                      {patron.avatar}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-white block truncate leading-tight">
                        {patron.nickname}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-gray-500 block leading-tight tracking-tight uppercase line-clamp-2">
                        {patron.tagline}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Short info about selected patron */}
            {selectedPatronId && (
              <motion.div
                key={selectedPatronId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#254b8c]/50 border border-[#2e5aa8] p-2.5 text-[10px] leading-relaxed text-gray-400 font-mono uppercase tracking-wide mb-3"
              >
                <strong className="text-white block mb-0.5">
                  {PATRONS.find(p => p.id === selectedPatronId)?.name.toUpperCase()}
                </strong>
                {PATRONS.find(p => p.id === selectedPatronId)?.description}
              </motion.div>
            )}
          </motion.div>

          {/* Restrição Alimentar ou Alergias */}
          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#F5F5F5] mb-1.5">
              Alergias ou Restrições (Opcional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Utensils className="w-4 h-4 text-gray-400" />
              </span>
              <input
                type="text"
                name="foodRestriction"
                value={formData.foodRestriction}
                onChange={handleChange}
                placeholder="EX: ALERGIA A GLÚTEN, VEGETARIANO, ETC."
                className="w-full bg-[#254b8c] border-2 border-[#2e5aa8] rounded-none py-2 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#dd681f] transition-colors uppercase font-mono"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Buttons */}
        <div className="space-y-3 pt-2 pb-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#dd681f] hover:bg-white hover:text-[#254b8c] text-white font-black py-3 px-4 text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded-none border-2 border-transparent hover:border-[#dd681f] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                PROCESSANDO...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                GERAR MEU INGRESSO
              </>
            )}
          </motion.button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-center text-xs text-[#F5F5F5] opacity-60 hover:opacity-100 transition-opacity py-2 bg-transparent rounded-none border-2 border-[#2e5aa8] tracking-[0.15em] uppercase font-black cursor-pointer"
          >
            Voltar para informações
          </button>
        </div>
      </form>
    </div>
  );
}
