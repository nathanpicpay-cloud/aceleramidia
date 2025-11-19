
import React, { useState } from 'react';
import { Instagram, WhatsApp } from './Icons';
import { UploadCloud } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('Nenhum arquivo selecionado');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    } else {
      setFile(null);
      setFileName('Nenhum arquivo selecionado');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle form submission here (e.g., API call)
    console.log({ ...formData, file });
    alert('Obrigado pelo seu contato! (Demonstração: os dados foram registrados no console).');
    // Reset form
    setFormData({ name: '', email: '', message: '' });
    setFile(null);
    setFileName('Nenhum arquivo selecionado');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  return (
    <section id="contato" className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-manrope font-extrabold mb-4">
            Entre em <span className="text-[#FF007F]">Contato</span>
          </h2>
          <p className="max-w-2xl mx-auto text-zinc-400 mb-12">
            Quer transformar sua presença digital? Preencha o formulário abaixo ou fale conosco pelas redes sociais.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Seu nome"
                required
                className="w-full bg-zinc-900/50 border-2 border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF007F] focus:border-[#FF007F] transition-all duration-300 outline-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Seu e-mail"
                required
                className="w-full bg-zinc-900/50 border-2 border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF007F] focus:border-[#FF007F] transition-all duration-300 outline-none"
              />
            </div>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Sua mensagem..."
              required
              className="w-full bg-zinc-900/50 border-2 border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF007F] focus:border-[#FF007F] transition-all duration-300 outline-none resize-none"
            ></textarea>

            <div>
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="w-full bg-zinc-900/50 border-2 border-dashed border-zinc-700 rounded-lg p-4 text-zinc-400 hover:border-[#FF007F] hover:text-white transition-all duration-300 flex flex-col items-center justify-center">
                        <UploadCloud className="w-8 h-8 mb-2" />
                        <span className="font-semibold">Clique para anexar um arquivo</span>
                        <span className="text-sm mt-1 truncate max-w-full block">{fileName}</span>
                    </div>
                </label>
                <input id="file-upload" name="file-upload" type="file" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="inline-block bg-[#FF007F] text-white font-bold py-3 px-10 rounded-full text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_25px_rgba(255,0,127,0.6)]"
              >
                Enviar Mensagem
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-16">
            <p className="text-zinc-400 mb-6">Ou nos encontre aqui:</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <a href="#" className="inline-flex items-center justify-center gap-3 bg-zinc-800/50 border border-zinc-700 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-zinc-800 hover:border-[#FF007F] transition-all duration-300 w-full sm:w-auto">
                    <WhatsApp />
                    <span>WhatsApp</span>
                </a>
                <a href="#" className="inline-flex items-center justify-center gap-3 bg-zinc-800/50 border border-zinc-700 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-zinc-800 hover:border-[#FF007F] transition-all duration-300 w-full sm:w-auto">
                    <Instagram />
                    <span>Instagram</span>
                </a>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
