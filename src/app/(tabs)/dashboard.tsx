import { useState, useCallback } from "react"
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "@/src/lib/supabase"
import type { Space, Rental } from "@/src/lib/supabase"
import { useFocusEffect, useRouter } from "expo-router"
import { useAuth } from "@/src/hooks/use-auth"

export default function DashboardScreen() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter();
  const { logout } = useAuth()

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Carregar espaços
      const { data: spacesData } = await supabase
        .from("spaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      const { data: rentalsData, error } = await supabase
        .from("rentals")
        .select(`
    *,
    spaces(name, owner_id)
  `)
        .filter("spaces.owner_id", "eq", user.id)
        .order("start_time", { ascending: true })
        .limit(5)

      if (error) {
        console.error("Erro ao carregar aluguéis:", error)
      }

      setSpaces(spacesData || [])
      setRentals(rentalsData || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, []),
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleLogout = async () => {
    logout()
    router.push("/(auth)/")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <View
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.subtitle}>Vamos gerenciar seus espaços</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push("profile-screen")} style={styles.profileButton}>
            <Ionicons name="person-outline" size={24} color="#c7a166" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#c7a166" />
          </TouchableOpacity>
        </View>
      </View>


      <View style={styles.statsContainer}>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push("space-screen")}>
          <Ionicons name="business" size={24} color="#c7a166" />
          <Text style={styles.statNumber}>{spaces.length}</Text>
          <Text style={styles.statLabel}>Espaços</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push("calendar-screen")}>
          <Ionicons name="calendar" size={24} color="#c7a166" />
          <Text style={styles.statNumber}>{rentals.length}</Text>
          <Text style={styles.statLabel}>Próximos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("add-space")}>
            <Ionicons name="add-circle" size={32} color="#c7a166" />
            <Text style={styles.actionText}>Novo Espaço</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("add-rental")}>
            <Ionicons name="calendar-outline" size={32} color="#c7a166" />
            <Text style={styles.actionText}>Novo Aluguel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, { flex: 1 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Aluguéis</Text>
          <TouchableOpacity onPress={() => router.push("rental-screen")}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {rentals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Nenhum aluguel agendado</Text>
          </View>
        ) : (
          <FlatList
            data={rentals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.rentalCard}>
                <View style={styles.rentalInfo}>
                  <Text style={styles.rentalClient}>{item.client_name}</Text>
                  <Text style={styles.rentalTime}>
                    {formatDate(item.start_time)} - {formatDate(item.end_time)}
                  </Text>
                  {item.price && (
                    <Text style={styles.rentalPrice}>R$ {item.price.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7a166",
  },
  header: {
    paddingTop: 35,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#faf4eb",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 16,
  },
    headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  profileButton: {
    padding: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  seeAll: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 8,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 12,
  },
  rentalCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rentalInfo: {
    flex: 1,
  },
  rentalClient: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  rentalTime: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  rentalPrice: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
    marginTop: 4,
  },
})
