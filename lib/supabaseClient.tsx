
import { createClient } from '@supabase/supabase-js';

// The Supabase URL provided
const supabaseUrl = 'https://kjbjdouebkytjgnbibkk.supabase.co';

// Helper to safely access environment variables in various browser/build environments
const getEnvVar = (key: string) => {
  try {
    // Check process.env (Standard/CRA/Next.js)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore reference errors if process is not defined
  }

  try {
    // Check import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore errors
  }
  
  return null;
};

// Try to find the key in standard environment variable locations
const supabaseKey = 
  getEnvVar('SUPABASE_KEY') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_KEY') || 
  getEnvVar('VITE_SUPABASE_KEY') || 
  getEnvVar('REACT_APP_SUPABASE_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Initialize the client only if we have both URL and Key
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
