export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      catalogues: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          pdf_url: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          pdf_url: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          pdf_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          name_somali: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          name_somali: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          name_somali?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          selected_color: string | null
          selected_size: string | null
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          selected_color?: string | null
          selected_size?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_rate_limits: {
        Row: {
          blocked_until: string | null
          id: string
          order_count: number | null
          phone_identifier: string
          window_start: string | null
        }
        Insert: {
          blocked_until?: string | null
          id?: string
          order_count?: number | null
          phone_identifier: string
          window_start?: string | null
        }
        Update: {
          blocked_until?: string | null
          id?: string
          order_count?: number | null
          phone_identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          changed_by_email: string | null
          id: string
          new_status: string
          old_status: string | null
          order_id: string
          reason: string | null
          status_type: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          changed_by_email?: string | null
          id?: string
          new_status: string
          old_status?: string | null
          order_id: string
          reason?: string | null
          status_type: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          changed_by_email?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
          order_id?: string
          reason?: string | null
          status_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          alt_phone: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string
          delivery_address: string | null
          delivery_area: string | null
          delivery_city: string | null
          delivery_directions: string | null
          delivery_fee: number
          delivery_instructions: string | null
          delivery_method: string
          discount_amount: number
          fulfilment_status: string
          id: string
          order_notes: string | null
          order_number: string
          payer_phone: string | null
          payment_datetime: string | null
          payment_method: string
          payment_reference: string | null
          payment_rejection_reason: string | null
          payment_status: string
          payment_transaction_ref: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal_amount: number | null
          total_amount: number
        }
        Insert: {
          admin_notes?: string | null
          alt_phone?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone: string
          delivery_address?: string | null
          delivery_area?: string | null
          delivery_city?: string | null
          delivery_directions?: string | null
          delivery_fee?: number
          delivery_instructions?: string | null
          delivery_method?: string
          discount_amount?: number
          fulfilment_status?: string
          id?: string
          order_notes?: string | null
          order_number?: string
          payer_phone?: string | null
          payment_datetime?: string | null
          payment_method?: string
          payment_reference?: string | null
          payment_rejection_reason?: string | null
          payment_status?: string
          payment_transaction_ref?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_amount?: number | null
          total_amount: number
        }
        Update: {
          admin_notes?: string | null
          alt_phone?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          delivery_address?: string | null
          delivery_area?: string | null
          delivery_city?: string | null
          delivery_directions?: string | null
          delivery_fee?: number
          delivery_instructions?: string | null
          delivery_method?: string
          discount_amount?: number
          fulfilment_status?: string
          id?: string
          order_notes?: string | null
          order_number?: string
          payer_phone?: string | null
          payment_datetime?: string | null
          payment_method?: string
          payment_reference?: string | null
          payment_rejection_reason?: string | null
          payment_status?: string
          payment_transaction_ref?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_amount?: number | null
          total_amount?: number
        }
        Relationships: []
      }
      product_colors: {
        Row: {
          created_at: string
          hex_code: string
          id: string
          name: string
          product_id: string
        }
        Insert: {
          created_at?: string
          hex_code?: string
          id?: string
          name: string
          product_id: string
        }
        Update: {
          created_at?: string
          hex_code?: string
          id?: string
          name?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          created_at: string
          eu_size: string
          id: string
          product_id: string
          stock: number
          us_size: string
        }
        Insert: {
          created_at?: string
          eu_size: string
          id?: string
          product_id: string
          stock?: number
          us_size: string
        }
        Update: {
          created_at?: string
          eu_size?: string
          id?: string
          product_id?: string
          stock?: number
          us_size?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_on_sale: boolean
          low_stock_threshold: number
          name: string
          price: number
          sale_price: number | null
          stock: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_on_sale?: boolean
          low_stock_threshold?: number
          name: string
          price: number
          sale_price?: number | null
          stock?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_on_sale?: boolean
          low_stock_threshold?: number
          name?: string
          price?: number
          sale_price?: number | null
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      sale_banners: {
        Row: {
          created_at: string
          discount_text: string
          discount_text_somali: string
          end_time: string
          id: string
          is_active: boolean
          title: string
          title_somali: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_text?: string
          discount_text_somali?: string
          end_time?: string
          id?: string
          is_active?: boolean
          title?: string
          title_somali?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_text?: string
          discount_text_somali?: string
          end_time?: string
          id?: string
          is_active?: boolean
          title?: string
          title_somali?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_fulfilment_status: {
        Args: { _new_status: string; _note?: string; _order_id: string }
        Returns: {
          message: string
          ok: boolean
        }[]
      }
      admin_set_payment_status: {
        Args: {
          _allow_duplicate?: boolean
          _new_status: string
          _order_id: string
          _reason?: string
        }
        Returns: {
          duplicate_order_numbers: string[]
          message: string
          ok: boolean
        }[]
      }
      check_order_rate_limit: {
        Args: { _max_orders?: number; _phone: string; _window_minutes?: number }
        Returns: boolean
      }
      create_order_v2: {
        Args: {
          _alt_phone: string
          _customer_name: string
          _customer_phone: string
          _delivery_area: string
          _delivery_city: string
          _delivery_directions: string
          _delivery_instructions: string
          _delivery_method: string
          _items: Json
          _order_notes: string
          _payer_phone: string
          _payment_datetime: string
          _payment_method: string
          _transaction_ref: string
        }
        Returns: {
          error_message: string
          order_id: string
          order_number: string
          total_amount: number
        }[]
      }
      create_validated_order:
        | {
            Args: {
              _customer_phone: string
              _items: Json
              _payment_method: string
              _payment_reference: string
            }
            Returns: {
              error_message: string
              order_id: string
            }[]
          }
        | {
            Args: {
              _customer_name?: string
              _customer_phone: string
              _delivery_address?: string
              _delivery_method?: string
              _items: Json
              _order_notes?: string
              _payment_method: string
              _payment_reference: string
            }
            Returns: {
              error_message: string
              order_id: string
            }[]
          }
      format_order_number: { Args: { n: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_order: {
        Args: { _order_number: string; _phone: string }
        Returns: Json
      }
      next_order_number: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      order_status: ["pending", "paid", "processing", "completed", "cancelled"],
    },
  },
} as const
