import { useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "@/src/lib/supabase"
import { useRouter } from "expo-router"


export default function AddSpaceScreen() {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [capacity, setCapacity] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Erro", "Nome do espaço é obrigatório")
            return
        }

        setLoading(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) {
                Alert.alert("Erro", "Usuário não encontrado")
                return
            }

            const spaceData = {
                owner_id: user.id,
                name: name.trim(),
                description: description.trim() || null,
                location: location.trim() || null,
                capacity: capacity ? Number.parseInt(capacity) : null,
            }

            const { error } = await supabase.from("spaces").insert([spaceData])

            if (error) {
                Alert.alert("Erro", "Erro ao salvar espaço: " + error.message)
            } else {
                Alert.alert("Sucesso", "Espaço criado com sucesso!", [{ text: "OK", onPress: () => router.back() }])
            }
        } catch (error) {
            Alert.alert("Erro", "Erro inesperado ao salvar espaço")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome do Espaço *</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="business-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Sala de Reunião A"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descrição</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="document-text-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Descreva o espaço, equipamentos disponíveis..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Localização</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 2º andar, Sala 201"
                                value={location}
                                onChangeText={setLocation}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Capacidade (pessoas)</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="people-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 10"
                                value={capacity}
                                onChangeText={setCapacity}
                                keyboardType="numeric"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>{loading ? "Salvando..." : "Salvar Espaço"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#c7a166",
        paddingTop: 20
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 20,
    },
    content: {
        padding: 20,
    },
    backButton: {
        position: "absolute",
        left: 10,
        top: 0,
        padding: 10,
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
})
