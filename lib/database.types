export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          games: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          name: string
          games?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          name?: string
          games?: string | null
          joined_at?: string
        }
        Relationships: []
      }
      game_nights: {
        Row: {
          id: string
          date: string
          description: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          date: string
          description?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          date?: string
          description?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
