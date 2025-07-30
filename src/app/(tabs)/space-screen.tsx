import { useState, useCallback } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "@/src/lib/supabase" 
import type { Space } from "@/src/lib/supabase"
import { useFocusEffect, useRouter } from "expo-router"

export default function SpacesScreen() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter();
  const loadSpaces = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        Alert.alert("Erro", "Erro ao carregar espaços")
        return
      }

      setSpaces(data || [])
    } catch (error) {
      console.error("Erro ao carregar espaços:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadSpaces()
    }, []),
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadSpaces()
  }

  const deleteSpace = async (spaceId: string) => {
    Alert.alert("Confirmar exclusão", "Tem certeza que deseja excluir este espaço? Esta ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("spaces").delete().eq("id", spaceId)

          if (error) {
            Alert.alert("Erro", "Erro ao excluir espaço")
          } else {
            loadSpaces()
          }
        },
      },
    ])
  }

  const renderSpace = ({ item }: { item: Space }) => (
    <View style={styles.spaceCard}>
      <View style={styles.spaceInfo}>
        <Text style={styles.spaceName}>{item.name}</Text>
        {item.description && <Text style={styles.spaceDescription}>{item.description}</Text>}
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.spaceLocation}>{item.location}</Text>
          </View>
        )}
        {item.capacity && (
          <View style={styles.capacityContainer}>
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text style={styles.spaceCapacity}>{item.capacity} pessoas</Text>
          </View>
        )}
      </View>

      <View style={styles.spaceActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => deleteSpace(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Espaços</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("add-space")}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {spaces.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={64} color="#000" />
          <Text style={styles.emptyTitle}>Nenhum espaço cadastrado</Text>
          <Text style={styles.emptyText}>Comece adicionando seu primeiro espaço para aluguel</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("add-space")}>
            <Text style={styles.emptyButtonText}>Adicionar Espaço</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={spaces}
          renderItem={renderSpace}
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
    backgroundColor: "#faf4eb",
    borderBottomWidth: 1,
    borderBottomColor: "#faf4eb",
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
  spaceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  spaceInfo: {
    flex: 1,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  spaceDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  spaceLocation: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  capacityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceCapacity: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  spaceActions: {
    justifyContent: "center",
  },
  actionButton: {
    padding: 8,
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
