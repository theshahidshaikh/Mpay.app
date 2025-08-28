import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// For demo purposes, we'll create a client even without real credentials
// In production, you should always validate these environment variables
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://demo.supabase.co') {
  console.warn('⚠️ Using demo Supabase credentials. Please connect to Supabase for full functionality.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'household' | 'mosque_admin' | 'super_admin';
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: 'household' | 'mosque_admin' | 'super_admin';
          full_name: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'household' | 'mosque_admin' | 'super_admin';
          full_name?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mosques: {
        Row: {
          id: string;
          name: string;
          address: string;
          admin_id: string;
          annual_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          admin_id: string;
          annual_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          admin_id?: string;
          annual_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      households: {
        Row: {
          id: string;
          house_number: string;
          head_of_house: string;
          members_count: number;
          male_count: number;
          female_count: number;
          contact_number: string;
          user_id: string;
          mosque_id: string;
          annual_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          house_number: string;
          head_of_house: string;
          members_count: number;
          male_count: number;
          female_count: number;
          contact_number: string;
          user_id: string;
          mosque_id: string;
          annual_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          house_number?: string;
          head_of_house?: string;
          members_count?: number;
          male_count?: number;
          female_count?: number;
          contact_number?: string;
          user_id?: string;
          mosque_id?: string;
          annual_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          household_id: string;
          amount: number;
          payment_date: string;
          month: number;
          year: number;
          payment_method: 'online' | 'cash';
          transaction_id: string | null;
          receipt_url: string | null;
          status: 'pending' | 'paid' | 'failed';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          amount: number;
          payment_date: string;
          month: number;
          year: number;
          payment_method: 'online' | 'cash';
          transaction_id?: string | null;
          receipt_url?: string | null;
          status: 'pending' | 'paid' | 'failed';
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          amount?: number;
          payment_date?: string;
          month?: number;
          year?: number;
          payment_method?: 'online' | 'cash';
          transaction_id?: string | null;
          receipt_url?: string | null;
          status?: 'pending' | 'paid' | 'failed';
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};