export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "client" | "editor";
export type SiteStatus = "active" | "building" | "error" | "paused";
export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type ProposalStatus = "draft" | "sent" | "viewed" | "accepted" | "declined";
export type SocialPostStatus = "draft" | "scheduled" | "published" | "failed";
export type DomainStatus = "active" | "expiring" | "expired" | "error";
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
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: never[];
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
          review_token: string | null;
          review_status: string;
          review_comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          github_repo?: string | null;
          netlify_site_id?: string | null;
          netlify_url?: string | null;
          netlify_build_hook?: string | null;
          status?: SiteStatus;
          owner_id: string;
          template?: string | null;
          description?: string | null;
          review_token?: string | null;
          review_status?: string;
          review_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sites"]["Insert"]>;
        Relationships: never[];
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
        Insert: {
          id?: string;
          site_id: string;
          deploy_id: string;
          status: DeployStatus;
          commit_message?: string | null;
          commit_hash?: string | null;
          branch?: string | null;
          deploy_url?: string | null;
          error_message?: string | null;
          created_by?: string | null;
          created_at?: string;
          finished_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["deployments"]["Insert"]>;
        Relationships: never[];
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
        Insert: {
          id?: string;
          profile_id?: string;
          company_name?: string | null;
          contact_name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          status?: "active" | "inactive" | "lead";
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: never[];
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
        Relationships: never[];
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
        Relationships: never[];
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
        Insert: {
          id?: string;
          owner_id: string;
          filename: string;
          original_name: string;
          mime_type: string;
          size: number;
          url: string;
          storage_path: string;
          alt_text?: string | null;
          folder?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media"]["Insert"]>;
        Relationships: never[];
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
          workflow_json: Record<string, unknown> | null;
          tags: string[];
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          n8n_workflow_id?: string | null;
          trigger_type: string;
          is_active?: boolean;
          last_run_at?: string | null;
          run_count?: number;
          workflow_json?: Record<string, unknown> | null;
          tags?: string[];
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["automations"]["Insert"]>;
        Relationships: never[];
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
        Relationships: never[];
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
        Relationships: never[];
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
        Insert: {
          id?: string;
          site_id: string;
          slug: string;
          title: string;
          meta_title?: string | null;
          meta_desc?: string | null;
          is_published?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_pages"]["Insert"]>;
        Relationships: never[];
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
        Relationships: never[];
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
        Relationships: never[];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          source: string | null;
          status: LeadStatus;
          score: number;
          value: number | null;
          tags: string[];
          ai_insight: string | null;
          notes: string | null;
          pipeline_stage: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at" | "updated_at" | "pipeline_stage"> & { pipeline_stage?: string };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: never[];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: never[];
      };
      support_tickets: {
        Row: {
          id: string;
          client_id: string;
          subject: string;
          message: string;
          status: TicketStatus;
          priority: TicketPriority;
          reply: string | null;
          replied_by: string | null;
          replied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          subject: string;
          message: string;
          status?: TicketStatus;
          priority?: TicketPriority;
          reply?: string | null;
          replied_by?: string | null;
          replied_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Insert"]>;
        Relationships: never[];
      };
      proposals: {
        Row: {
          id: string;
          client_name: string;
          client_company: string | null;
          client_email: string;
          project_name: string;
          project_type: string;
          services: Json;
          valid_days: number;
          notes: string | null;
          status: ProposalStatus;
          total_amount: number;
          sent_at: string | null;
          viewed_at: string | null;
          accepted_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["proposals"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["proposals"]["Insert"]>;
        Relationships: never[];
      };
      social_posts: {
        Row: {
          id: string;
          content: string;
          platforms: string[];
          post_type: string;
          status: SocialPostStatus;
          scheduled_at: string | null;
          published_at: string | null;
          image_url: string | null;
          tags: string[];
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          platforms: string[];
          post_type: string;
          status?: SocialPostStatus;
          scheduled_at?: string | null;
          published_at?: string | null;
          image_url?: string | null;
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["social_posts"]["Insert"]>;
        Relationships: never[];
      };
      agency_settings: {
        Row: {
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agency_settings"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["agency_settings"]["Insert"]>;
        Relationships: never[];
      };
      workflow_runs: {
        Row: {
          id: string;
          automation_id: string;
          status: string;
          trigger_type: string;
          trigger_data: Json | null;
          output: Json | null;
          n8n_execution_id: string | null;
          duration_ms: number;
          steps_total: number;
          steps_done: number;
          started_by: string | null;
          started_at: string;
          finished_at: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          automation_id: string;
          status: string;
          trigger_type: string;
          trigger_data?: Json | null;
          output?: Json | null;
          n8n_execution_id?: string | null;
          duration_ms?: number;
          steps_total?: number;
          steps_done?: number;
          started_by?: string | null;
          started_at?: string;
          finished_at?: string | null;
          error_message?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["workflow_runs"]["Insert"]>;
        Relationships: never[];
      };
      domains: {
        Row: {
          id: string;
          domain: string;
          site_id: string | null;
          registrar: string | null;
          expires_at: string | null;
          auto_renew: boolean;
          ssl_enabled: boolean;
          ssl_expires_at: string | null;
          status: DomainStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["domains"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["domains"]["Insert"]>;
        Relationships: never[];
      };
      chat_sessions: {
        Row: {
          id: string;
          site_id: string;
          visitor_id: string;
          lead_id: string | null;
          started_at: string;
          last_msg_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          visitor_id: string;
          lead_id?: string | null;
          started_at?: string;
          last_msg_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_sessions"]["Insert"]>;
        Relationships: never[];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
        Relationships: never[];
      };
      email_sequences: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          trigger: string;
          trigger_config: Record<string, unknown>;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          trigger?: string;
          trigger_config?: Record<string, unknown>;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_sequences"]["Insert"]>;
        Relationships: never[];
      };
      email_sequence_steps: {
        Row: {
          id: string;
          sequence_id: string;
          step_number: number;
          delay_days: number;
          subject: string;
          body_html: string;
          from_name: string | null;
          from_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sequence_id: string;
          step_number: number;
          delay_days?: number;
          subject: string;
          body_html: string;
          from_name?: string | null;
          from_email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_sequence_steps"]["Insert"]>;
        Relationships: never[];
      };
      email_sequence_enrollments: {
        Row: {
          id: string;
          sequence_id: string;
          lead_id: string;
          current_step: number;
          next_send_at: string | null;
          status: string;
          enrolled_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          sequence_id: string;
          lead_id: string;
          current_step?: number;
          next_send_at?: string | null;
          status?: string;
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["email_sequence_enrollments"]["Insert"]>;
        Relationships: never[];
      };
      email_logs: {
        Row: {
          id: string;
          enrollment_id: string | null;
          step_id: string | null;
          lead_id: string | null;
          to_email: string;
          subject: string;
          resend_id: string | null;
          status: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id?: string | null;
          step_id?: string | null;
          lead_id?: string | null;
          to_email: string;
          subject: string;
          resend_id?: string | null;
          status?: string;
          sent_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_logs"]["Insert"]>;
        Relationships: never[];
      };
      site_analytics: {
        Row: {
          id: string;
          site_id: string;
          page_slug: string;
          visitor_id: string | null;
          referrer: string | null;
          user_agent: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          page_slug?: string;
          visitor_id?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_analytics"]["Insert"]>;
        Relationships: never[];
      };
      pipeline_events: {
        Row: {
          id: string;
          lead_id: string | null;
          from_stage: string | null;
          to_stage: string;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          from_stage?: string | null;
          to_stage: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pipeline_events"]["Insert"]>;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      site_status: SiteStatus;
      lead_status: LeadStatus;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      proposal_status: ProposalStatus;
      social_post_status: SocialPostStatus;
      domain_status: DomainStatus;
    };
  };
}
