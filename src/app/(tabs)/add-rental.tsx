import { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "@/src/lib/supabase"
import type { Space } from "@/src/lib/supabase"
import { useRouter } from "expo-router"

export default function AddRentalScreen() {
    const [spaces, setSpaces] = useState<Space[]>([])
    const [selectedSpaceId, setSelectedSpaceId] = useState("")
    const [clientName, setClientName] = useState("")
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [notes, setNotes] = useState("")
    const [price, setPrice] = useState("")
    const [loading, setLoading] = useState(false)
    const [showStartPicker, setShowStartPicker] = useState(false)
    const [showEndPicker, setShowEndPicker] = useState(false)
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadSpaces()
    }, [])

    const loadSpaces = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase.from("spaces").select("*").eq("owner_id", user.id).order("name")

            if (error) {
                Alert.alert("Erro", "Erro ao carregar espaços")
                return
            }

            setSpaces(data || [])
            if (data && data.length > 0) {
                setSelectedSpaceId(data[0].id)
            }
        } catch (error) {
            console.error("Erro ao carregar espaços:", error)
        }
    }

    const checkAvailability = async (spaceId: string, startTime: Date, endTime: Date) => {
        try {
            const { data, error } = await supabase
                .from("rentals")
                .select("id, client_name, start_time, end_time")
                .eq("space_id", spaceId)
                .or(`and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`)

            if (error) {
                console.error("Erro ao verificar disponibilidade:", error)
                return { available: false, error: "Erro ao verificar disponibilidade" }
            }

            if (data && data.length > 0) {
                const conflictingRental = data[0]
                const conflictStart = new Date(conflictingRental.start_time)
                const conflictEnd = new Date(conflictingRental.end_time)

                return {
                    available: false,
                    error: `Espaço já está alugado para ${conflictingRental.client_name} de ${conflictStart.toLocaleDateString("pt-BR")} ${conflictStart.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} até ${conflictEnd.toLocaleDateString("pt-BR")} ${conflictEnd.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                }
            }

            return { available: true }
        } catch (error) {
            console.error("Erro inesperado ao verificar disponibilidade:", error)
            return { available: false, error: "Erro inesperado ao verificar disponibilidade" }
        }
    }

    const handleSave = async () => {
        if (!selectedSpaceId) {
            Alert.alert("Erro", "Selecione um espaço")
            return
        }

        if (!clientName.trim()) {
            Alert.alert("Erro", "Nome do cliente é obrigatório")
            return
        }

        if (startDate >= endDate) {
            Alert.alert("Erro", "Data de início deve ser anterior à data de fim")
            return
        }

        setLoading(true)

        try {
            const availabilityCheck = await checkAvailability(selectedSpaceId, startDate, endDate)

            if (!availabilityCheck.available) {
                Alert.alert("Espaço Indisponível", availabilityCheck.error || "O espaço não está disponível neste período")
                setLoading(false)
                return
            }

            const rentalData = {
                space_id: selectedSpaceId,
                client_name: clientName.trim(),
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                notes: notes.trim() || null,
                price: price ? Number.parseFloat(price) : null,
            }

            const { error } = await supabase.from("rentals").insert([rentalData])

            if (error) {
                Alert.alert("Erro", "Erro ao salvar aluguel: " + error.message)
            } else {
                Alert.alert("Sucesso", "Aluguel criado com sucesso!", [{ text: "OK", onPress: () => router.back() }])
            }
        } catch (error) {
            Alert.alert("Erro", "Erro inesperado ao salvar aluguel")
        } finally {
            setLoading(false)
        }
    }

    const formatDateTime = (date: Date) => {
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    if (spaces.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="business-outline" size={64} color="#000" />
                <Text style={styles.emptyTitle}>Nenhum espaço cadastrado</Text>
                <Text style={styles.emptyText}>Você precisa cadastrar pelo menos um espaço antes de criar aluguéis</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("add-space")}>
                    <Text style={styles.emptyButtonText}>Cadastrar Espaço</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Espaço *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={selectedSpaceId} onValueChange={setSelectedSpaceId} style={styles.picker}>
                                {spaces.map((space) => (
                                    <Picker.Item key={space.id} label={space.name} value={space.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome do Cliente *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nome do cliente"
                                value={clientName}
                                onChangeText={setClientName}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Data e Hora de Início *</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                            <Text style={styles.dateText}>{formatDateTime(startDate)}</Text>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowStartPicker(false);
                                    if (event.type === "set" && selectedDate) {
                                        setStartDate((prev) => new Date(
                                            selectedDate.getFullYear(),
                                            selectedDate.getMonth(),
                                            selectedDate.getDate(),
                                            prev.getHours(),
                                            prev.getMinutes()
                                        ));
                                    }
                                }}
                            />
                        )}
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartTimePicker(true)}>
                            <Ionicons name="time-outline" size={20} color="#9ca3af" />
                            <Text style={styles.dateText}>
                                {startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                        </TouchableOpacity>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="time"
                                display="default"
                                onChange={(event, selectedTime) => {
                                    setShowStartTimePicker(false);
                                    if (event.type === "set" && selectedTime) {
                                        setStartDate((prev) => new Date(
                                            prev.getFullYear(),
                                            prev.getMonth(),
                                            prev.getDate(),
                                            selectedTime.getHours(),
                                            selectedTime.getMinutes()
                                        ));
                                    }
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Data e Hora de Fim *</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                            <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                            <Text style={styles.dateText}>{formatDateTime(endDate)}</Text>
                        </TouchableOpacity>
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowEndPicker(false);
                                    if (event.type === "set" && selectedDate) {
                                        setEndDate((prev) => new Date(
                                            selectedDate.getFullYear(),
                                            selectedDate.getMonth(),
                                            selectedDate.getDate(),
                                            prev.getHours(),
                                            prev.getMinutes()
                                        ));
                                    }
                                }}
                            />
                        )}
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndTimePicker(true)}>
                            <Ionicons name="time-outline" size={20} color="#9ca3af" />
                            <Text style={styles.dateText}>
                                {endDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </Text>
                        </TouchableOpacity>
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="time"
                                display="default"
                                onChange={(event, selectedTime) => {
                                    setShowEndTimePicker(false);
                                    if (event.type === "set" && selectedTime) {
                                        setEndDate((prev) => new Date(
                                            prev.getFullYear(),
                                            prev.getMonth(),
                                            prev.getDate(),
                                            selectedTime.getHours(),
                                            selectedTime.getMinutes()
                                        ));
                                    }
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Preço (R$)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="cash-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="0,00"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Observações</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text-outline" size={20} color="#fff" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Observações adicionais..."
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>{loading ? "Verificando disponibilidade..." : "Salvar Aluguel"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#c7a166",
        paddingTop: 45,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    form: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: "#f9fafb",
    },
    inputIcon: {
        marginTop: 12,
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 44,
        fontSize: 16,
        color: "#374151",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
        paddingTop: 12,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        backgroundColor: "#f9fafb",
    },
    picker: {
        height: 50,
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#f9fafb",
        margin: 5
    },
    dateText: {
        fontSize: 16,
        color: "#374151",
        marginLeft: 8,
    },
    saveButton: {
        backgroundColor: "#c7a166",
        borderRadius: 12,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        backgroundColor: "#c7a166",
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