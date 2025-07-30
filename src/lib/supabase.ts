import Constants from "expo-constants"
import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl!
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type Profile = {
  id: string
  name: string
  role: "admin" | "user"
  created_at: string
}

export type Space = {
  id: string
  owner_id: string
  name: string
  description?: string
  location?: string
  capacity?: number
  created_at: string
}

export type Rental = {
  id: string
  space_id: string
  client_name: string
  start_time: string
  end_time: string
  notes?: string
  price?: number
  created_at: string
}

export type CalendarView = {
  id: string
  space_name: string
  client_name: string
  start_time: string
  end_time: string
}
