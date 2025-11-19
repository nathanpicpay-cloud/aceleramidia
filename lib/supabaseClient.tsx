
import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const supabaseUrl = 'https://kjbjdouebkytjgnbibkk.supabase.co';

// ------------------------------------------------------------------
// 👇 COLOQUE SUA CHAVE (ANON KEY) AQUI DENTRO DAS ASPAS ABAIXO 👇
// Ela começa com "eyJ..." e pode ser encontrada em Project Settings > API no painel do Supabase
// ------------------------------------------------------------------
const SUPABASE_ANON_KEY = ""; 
// ------------------------------------------------------------------

// Helper para acessar variáveis de ambiente com segurança
const getEnvVar = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}
  
  return null;
};

// Tenta pegar a chave da variável manual ou das variáveis de ambiente
const supabaseKey = 
  (SUPABASE_ANON_KEY.length > 10) ? SUPABASE_ANON_KEY :
  (getEnvVar('SUPABASE_KEY') || 
   getEnvVar('NEXT_PUBLIC_SUPABASE_KEY') || 
   getEnvVar('VITE_SUPABASE_KEY') || 
   getEnvVar('REACT_APP_SUPABASE_KEY') ||
   getEnvVar('SUPABASE_ANON_KEY') ||
   getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'));

// Inicializa o cliente.
// Se não houver chave, o app não quebra, mas as requisições falharão.
const validKey = supabaseKey || 'CHAVE_NAO_CONFIGURADA';

export const supabase = createClient(supabaseUrl, validKey);
