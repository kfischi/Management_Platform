export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "client" | "editor";
export type SiteStatus = "active" | "building" | "error" | "paused";
export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "gallery"
  | "cta"
  | "contact"
  | "services"
  | "faq"
  | "testimonials"
  | "video";
export type DeployStatus = "success" | "building" | "failed" | "cancelled";
export type ContractStatus = "active" | "pending" | "expired" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "overdue" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          phone: string | null;
          company: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      sites: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          github_repo: string | null;
          netlify_site_id: string | null;
          netlify_url: string | null;
          netlify_build_hook: string | null;
          status: SiteStatus;
          owner_id: string;
          template: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sites"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sites"]["Insert"]>;
      };
      deployments: {
        Row: {
          id: string;
          site_id: string;
          deploy_id: string;
          status: DeployStatus;
          commit_message: string | null;
          commit_hash: string | null;
          branch: string | null;
          deploy_url: string | null;
          error_message: string | null;
          created_by: string | null;
          created_at: string;
          finished_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["deployments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["deployments"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          profile_id: string;
          company_name: string | null;
          contact_name: string;
          email: string;
          phone: string | null;
          address: string | null;
          notes: string | null;
          status: "active" | "inactive" | "lead";
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      contracts: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string | null;
          amount: number;
          currency: string;
          status: ContractStatus;
          start_date: string;
          end_date: string | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contracts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["contracts"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          client_id: string;
          contract_id: string | null;
          amount: number;
          currency: string;
          status: PaymentStatus;
          due_date: string;
          paid_date: string | null;
          description: string | null;
          invoice_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      media: {
        Row: {
          id: string;
          owner_id: string;
          filename: string;
          original_name: string;
          mime_type: string;
          size: number;
          url: string;
          storage_path: string;
          alt_text: string | null;
          folder: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["media"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["media"]["Insert"]>;
      };
      automations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          n8n_workflow_id: string | null;
          trigger_type: string;
          is_active: boolean;
          last_run_at: string | null;
          run_count: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["automations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["automations"]["Insert"]>;
      };
      chatbots: {
        Row: {
          id: string;
          name: string;
          site_id: string | null;
          config: Json;
          is_active: boolean;
          ai_provider: "claude" | "openai";
          model: string;
          system_prompt: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chatbots"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["chatbots"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: never;
      };
      site_pages: {
        Row: {
          id: string;
          site_id: string;
          slug: string;
          title: string;
          meta_title: string | null;
          meta_desc: string | null;
          is_published: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["site_pages"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["site_pages"]["Insert"]>;
      };
      content_blocks: {
        Row: {
          id: string;
          page_id: string;
          site_id: string;
          block_type: BlockType;
          label: string | null;
          content: Json;
          order_index: number;
          is_visible: boolean;
          is_editable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["content_blocks"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["content_blocks"]["Insert"]>;
      };
      site_settings: {
        Row: {
          id: string;
          site_id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["site_settings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      site_status: SiteStatus;
    };
  };
}
