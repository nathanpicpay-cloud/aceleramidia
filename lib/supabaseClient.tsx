import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase: any; // Using 'any' to avoid potential import issues with SupabaseClient type

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase URL and/or Anon Key not provided. The application will not connect to the database. Please configure SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
  
  const mockError = { 
    message: 'Supabase client is not initialized. Check your environment variables.', 
    details: '', 
    hint: '', 
    code: 'NO_CLIENT' 
  };
  
  const mockStorageBucket = {
    remove: async () => ({ data: null, error: mockError }),
    upload: async () => ({ data: { path: 'mock_path' }, error: mockError }),
    getPublicUrl: () => ({ data: { publicUrl: 'https://i.imgur.com/OG9NKwa.png' }}) // return a placeholder image
  };

  // This mock builder allows for method chaining like .select().order()
  // and is "thenable" so it can be awaited.
  const createMockQueryBuilder = (initialData: any = { data: [], error: mockError }) => {
    const builder = {
      // Chainable methods that just return the builder
      order: () => builder,
      eq: () => builder,
      select: () => builder, // select can be chained (e.g., after insert)

      // Executor methods that return a promise
      single: async () => {
        // For insert/update, we want a successful single record back
        if (initialData.data && !Array.isArray(initialData.data)) {
          return initialData;
        }
        // For selects, return the first item or an error
        const singleData = Array.isArray(initialData.data) ? initialData.data[0] : null;
        return { data: singleData || null, error: singleData ? null : mockError };
      },

      // The 'then' method makes the object awaitable
      then: (resolve: any, reject: any) => {
        Promise.resolve(initialData).then(resolve, reject);
      }
    };
    return builder;
  };

  supabase = {
    from: (tableName: string) => ({
      select: (columns = '*') => createMockQueryBuilder(), // For `fetchProjects`

      insert: (records: any[]) => {
        const mockRecord = { ...records[0], id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        return createMockQueryBuilder({ data: mockRecord, error: null });
      },

      update: (record: any) => {
        const mockRecord = { ...record, id: 999, created_at: '2025-01-01T00:00:00Z', updated_at: new Date().toISOString() }; // Mock ID
        return createMockQueryBuilder({ data: mockRecord, error: null });
      },

      delete: () => createMockQueryBuilder({ data: [], error: null }),
    }),
    storage: {
      from: () => mockStorageBucket,
    }
  };
}

export { supabase };
