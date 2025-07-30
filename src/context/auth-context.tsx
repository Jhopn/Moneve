import React, { createContext, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase' 
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'

interface AuthContextProps {
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadSession = async () => {
      const storedSession = await AsyncStorage.getItem('supabaseSession')
      if (storedSession) {
        const parsed = JSON.parse(storedSession)
        setSession(parsed)
      }
      setLoading(false)
    }

    loadSession()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      Alert.alert('Erro', error.message)
    } else if (data.session) {
      await AsyncStorage.setItem('supabaseSession', JSON.stringify(data.session))
      setSession(data.session)
    }

    setLoading(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    await AsyncStorage.removeItem('supabaseSession')
    router.push("/(auth)/")
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}


