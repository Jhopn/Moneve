import { useCallback,useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "@/src/lib/supabase" 
import { useFocusEffect, useRouter } from "expo-router"

export default function RentalsScreen() {
  const [rentals, setRentals] = useState<[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter();

  const loadRentals = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("rentals")
        .select(`
          *,
          spaces!inner(name, owner_id)
        `)
        .eq("spaces.owner_id", user.id)
        .order("start_time", { ascending: false })

      if (error) {
        Alert.alert("Erro", "Erro ao carregar aluguéis")
        return
      }

      setRentals(data || [])
    } catch (error) {
      console.error("Erro ao carregar aluguéis:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadRentals()
    }, []),
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadRentals()
  }

  const deleteRental = async (rentalId: string) => {
    Alert.alert("Confirmar exclusão", "Tem certeza que deseja excluir este aluguel?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("rentals").delete().eq("id", rentalId)

          if (error) {
            Alert.alert("Erro", "Erro ao excluir aluguel")
          } else {
            loadRentals()
          }
        },
      },
    ])
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date()
  }

  const renderRental = ({ item }: { item }) => (
    <View style={styles.rentalCard}>
      <View style={styles.rentalHeader}>
        <View style={styles.rentalInfo}>
          <Text style={styles.clientName}>{item.client_name}</Text>
          <Text style={styles.spaceName}>{item.spaces.name}</Text>
        </View>
        <View style={styles.rentalActions}>
          {isUpcoming(item.start_time) && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingText}>Próximo</Text>
            </View>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={() => deleteRental(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rentalDetails}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.timeText}>
            {formatDateTime(item.start_time)} - {formatDateTime(item.end_time)}
          </Text>
        </View>

        {item.price && (
          <View style={styles.priceContainer}>
            <Ionicons name="cash-outline" size={16} color="#10b981" />
            <Text style={styles.priceText}>R$ {item.price.toFixed(2)}</Text>
          </View>
        )}

        {item.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={16} color="#6b7280" />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aluguéis</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("add-rental")}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {rentals.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color="#000" />
          <Text style={styles.emptyTitle}>Nenhum aluguel cadastrado</Text>
          <Text style={styles.emptyText}>Comece adicionando seu primeiro aluguel</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("add-rental")}>
            <Text style={styles.emptyButtonText}>Adicionar Aluguel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rentals}
          renderItem={renderRental}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7a166",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 35,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#faf4eb"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
  },
  addButton: {
    backgroundColor: "#c7a166",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 20,
  },
  rentalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rentalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  rentalInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
  },
  spaceName: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  rentalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  upcomingBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButton: {
    padding: 4,
  },
  rentalDetails: {
    gap: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
    marginLeft: 8,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notesText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#c7a166",
    fontSize: 16,
    fontWeight: "bold",
  },
})