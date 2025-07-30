import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "@/src/lib/supabase"
import * as Clipboard from "expo-clipboard"

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null)
    const [displayName, setDisplayName] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [publicLink, setPublicLink] = useState("")

    useEffect(() => {
        loadUserData()
        generatePublicLink()
    }, [])

    const loadUserData = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                setDisplayName(user.user_metadata?.display_name || user.email?.split("@")[0] || "")
            }
        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error)
        }
    }

    const generatePublicLink = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (user) {
                const link = `moneve://availability/${user.id}`
                setPublicLink(link)
            }
        } catch (error) {
            console.error("Erro ao gerar link público:", error)
        }
    }

    const updateDisplayName = async () => {
        if (!displayName.trim()) {
            Alert.alert("Erro", "Nome não pode estar vazio")
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                data: { display_name: displayName.trim() },
            })

            if (error) throw error

            Alert.alert("Sucesso", "Nome atualizado com sucesso!")
        } catch (error: any) {
            Alert.alert("Erro", error.message)
        } finally {
            setLoading(false)
        }
    }

    const updatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Erro", "Preencha todos os campos de senha")
            return
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Erro", "Nova senha e confirmação não coincidem")
            return
        }

        if (newPassword.length < 6) {
            Alert.alert("Erro", "Nova senha deve ter pelo menos 6 caracteres")
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) throw error

            Alert.alert("Sucesso", "Senha atualizada com sucesso!")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            Alert.alert("Erro", error.message)
        } finally {
            setLoading(false)
        }
    }

    const copyLink = async () => {
        try {
            await Clipboard.setStringAsync(publicLink)
            Alert.alert("Copiado!", "Link copiado para a área de transferência")
        } catch (error) {
            console.error("Erro ao copiar link:", error)
            Alert.alert("Erro", "Não foi possível copiar o link")
        }
    }

    const shareLink = async () => {
        try {
            await Share.share({
                message: `Confira a disponibilidade dos meus espaços! Abra este link no app Moneve: ${publicLink}`,
                title: "Disponibilidade de Espaços - Moneve",
            })
        } catch (error) {
            console.error("Erro ao compartilhar:", error)
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações da Conta</Text>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.emailText}>{user?.email}</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome de Exibição</Text>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Seu nome"
                            placeholderTextColor="#9ca3af"
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={updateDisplayName}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Atualizar Nome</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Compartilhar Disponibilidade</Text>
                <View style={styles.card}>
                    <Text style={styles.description}>
                        Compartilhe com seus clientes para que eles possam ver a disponibilidade dos seus espaços:
                    </Text>

                    <View style={styles.linkActions}>
                        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={copyLink}>
                            <Ionicons name="copy-outline" size={16} color="#374151" />
                            <Text style={styles.secondaryButtonText}>Copiar Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={shareLink}>
                            <Ionicons name="share-outline" size={16} color="#fff" />
                            <Text style={styles.buttonText}>Compartilhar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alterar Senha</Text>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nova Senha</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Digite a nova senha"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar Nova Senha</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirme a nova senha"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={updatePassword} disabled={loading}>
                        <Text style={styles.buttonText}>Alterar Senha</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
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
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#374151",
        backgroundColor: "#fff",
        marginBottom: 12,
    },
    emailText: {
        fontSize: 16,
        color: "#6b7280",
        padding: 12,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
    },
    description: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
        lineHeight: 20,
    },
    linkActions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
        flex: 1,
        minWidth: "45%",
    },
    primaryButton: {
        backgroundColor: "#c7a166",
    },
    secondaryButton: {
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButtonText: {
        color: "#374151",
        fontSize: 16,
        fontWeight: "600",
    },
})
