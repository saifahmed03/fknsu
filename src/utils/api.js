// FILE: src/utils/api.js
import { supabase } from '../supabaseClient';

export const api = {
  profiles: {
    get: async (id) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    getAll: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  },

  applications: {
    getByStudent: async (studentId) => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          programs (
            *,
            universities (*)
          )
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getAll: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles!applications_student_id_fkey (full_name, email),
          programs (
            name,
            universities (name)
          )
        `)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (application) => {
      const { data, error } = await supabase
        .from('applications')
        .insert([application])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  documents: {
    getByApplication: async (applicationId) => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (document) => {
      const { data, error } = await supabase
        .from('documents')
        .insert([document])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  programs: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          universities (*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (program) => {
      const { data, error } = await supabase
        .from('programs')
        .insert([program])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  universities: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (university) => {
      const { data, error } = await supabase
        .from('universities')
        .insert([university])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('universities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('universities')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  reviews: {
    getByApplication: async (applicationId) => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_reviewer_id_fkey (full_name)
        `)
        .eq('application_id', applicationId)
        .order('reviewed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getAll: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          applications (
            id,
            profiles!applications_student_id_fkey (full_name, email),
            programs (name)
          ),
          profiles!reviews_reviewer_id_fkey (full_name)
        `)
        .order('reviewed_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (review) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  notifications: {
    getByStudent: async (studentId) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (notification) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    markAsRead: async (id) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read_status: true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  }
};
