import { useState, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { Calendar } from "react-native-calendars"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "@/src/lib/supabase"
import type { CalendarView } from "@/src/lib/supabase"
import { useFocusEffect, useRouter } from "expo-router"

type MarkedDates = {
  [key: string]: {
    marked: boolean
    dotColor: string
    selectedColor?: string
  }
}

export default function CalendarScreen() {
  const router = useRouter()
  const [rentals, setRentals] = useState<CalendarView[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [markedDates, setMarkedDates] = useState<MarkedDates>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getDatesBetween = (startDate: string, endDate: string): string[] => {
    const dates: string[] = []
    const start = new Date(startDate.split("T")[0])
    const end = new Date(endDate.split("T")[0])

    const currentDate = new Date(start)
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  const loadRentals = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("calendar_view")
        .select("*")
        .gte("start_time", new Date().toISOString().split("T")[0])
        .order("start_time", { ascending: true })

      if (error) {
        Alert.alert("Erro", "Erro ao carregar calendário")
        return
      }

      setRentals(data || [])

      const marked: MarkedDates = {}
      data?.forEach((rental) => {
        const rentalDates = getDatesBetween(rental.start_time, rental.end_time)
        rentalDates.forEach((date) => {
          marked[date] = {
            marked: true,
            dotColor: "#c7a166",
          }
        })
      })

      setMarkedDates(marked)
    } catch (error) {
      console.error("Erro ao carregar calendário:", error)
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

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString)
  }

  const getSelectedDateRentals = () => {
    if (!selectedDate) return []

    return rentals.filter((rental) => {
      const startDate = new Date(rental.start_time.split("T")[0])
      const endDate = new Date(rental.end_time.split("T")[0])
      const selected = new Date(selectedDate)

      return selected >= startDate && selected <= endDate
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatSelectedDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number)

    const date = new Date(year, month - 1, day)

    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const selectedDateRentals = getSelectedDateRentals()

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: "#c7a166",
            },
          }}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#b6c1cd",
            selectedDayBackgroundColor: "#c7a166",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#c7a166",
            dayTextColor: "#2d4150",
            textDisabledColor: "#d9e1e8",
            dotColor: "#c7a166",
            selectedDotColor: "#ffffff",
            arrowColor: "#c7a166",
            disabledArrowColor: "#d9e1e8",
            monthTextColor: "#2d4150",
            indicatorColor: "#c7a166",
            textDayFontWeight: "300",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "300",
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
        />
      </View>

      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>{formatSelectedDate(selectedDate)}</Text>

          {selectedDateRentals.length === 0 ? (
            <View style={styles.emptyDay}>
              <Ionicons name="calendar-outline" size={32} color="#9ca3af" />
              <Text style={styles.emptyDayText}>Nenhum aluguel neste dia</Text>
            </View>
          ) : (
            <View style={styles.rentalsList}>
              {selectedDateRentals.map((rental) => (
                <View key={rental.id} style={styles.rentalItem}>
                  <View style={styles.rentalTime}>
                    <Ionicons name="time-outline" size={16} color="#c7a166" />
                    <Text style={styles.timeText}>
                      {formatTime(rental.start_time)} - {formatTime(rental.end_time)}
                    </Text>
                  </View>
                  <Text style={styles.rentalClient}>{rental.client_name}</Text>
                  <Text style={styles.rentalSpace}>{rental.space_name}</Text>

                  {rental.start_time.split("T")[0] !== rental.end_time.split("T")[0] && (
                    <View style={styles.multiDayIndicator}>
                      <Ionicons name="calendar" size={14} color="#6b7280" />
                      <Text style={styles.multiDayText}>Aluguel de múltiplos dias</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/add-rental")}>
          <Ionicons name="add-circle-outline" size={24} color="#c7a166" />
          <Text style={styles.actionButtonText}>Novo Aluguel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7a166",
    paddingTop: 45,
  },
  calendarContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDateContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 16,
    textTransform: "capitalize",
  },
  emptyDay: {
    alignItems: "center",
    padding: 20,
  },
  emptyDayText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 8,
  },
  rentalsList: {
    gap: 12,
  },
  rentalItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#c7a166",
  },
  rentalTime: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#c7a166",
    fontWeight: "600",
    marginLeft: 4,
  },
  rentalClient: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  rentalSpace: {
    fontSize: 14,
    color: "#6b7280",
  },
  multiDayIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  multiDayText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
    fontStyle: "italic",
  },
  quickActions: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#c7a166",
    marginLeft: 8,
  },
})
