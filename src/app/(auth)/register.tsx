import { useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../lib/supabase"
import { useRouter } from "expo-router"

export default function RegisterScreen() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Erro", "Por favor, preencha todos os campos")
            return
        }

        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem")
            return
        }

        if (password.length < 6) {
            Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres")
            return
        }

        setLoading(true)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            Alert.alert("Erro", error.message)
            setLoading(false)
            return
        }

        if (data.user) {
            const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", data.user.id)
                .single()

            if (!existingProfile) {
                const { error: profileError } = await supabase.from("profiles").insert([
                    {
                        id: data.user.id,
                        name: name,
                        role: "user",
                    },
                ])

                if (profileError) {
                    Alert.alert("Erro", "Erro ao criar perfil: " + profileError.message)
                } else {
                    Alert.alert(
                        "Conta Criada com Sucesso! 🎉", 
                        `Olá ${name}! Sua conta foi criada com sucesso.\n\nVerifique seu email (${email}) e clique no link de confirmação para ativar sua conta.\n\nApós a confirmação, você poderá fazer login e começar a gerenciar seus espaços!`,
                        [
                            {
                                text: "Entendi",
                                onPress: () => router.push("/")
                            }
                        ]
                    )
                }
            } else {
                Alert.alert(
                    "Conta Criada com Sucesso! 🎉", 
                    `Faça login para acessar sua conta.`,
                    [
                        {
                            text: "OK",
                            onPress: () => router.push("/")
                        }
                    ]
                )
            }
        }

        setLoading(false)
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.logoContainer}>
                        <Ionicons name="calendar" size={40} color="#fff" />
                    </View>
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Comece a gerenciar seus espaços hoje</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nome completo"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar senha"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? "Criando conta..." : "Criar Conta"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/")}>
                        <Text style={styles.linkText}>
                            Já tem conta? <Text style={styles.linkTextBold}>Faça login</Text>
                        </Text>
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
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
        position: "relative",
    },
    backButton: {
        position: "absolute",
        left: 0,
        top: 0,
        padding: 10,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
    },
    form: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: "#f9fafb",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: "#374151",
    },
    button: {
        backgroundColor: "#c7a166",
        borderRadius: 12,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    linkButton: {
        marginTop: 20,
        alignItems: "center",
    },
    linkText: {
        color: "#6b7280",
        fontSize: 14,
    },
    linkTextBold: {
        color: "#c7a166",
        fontWeight: "bold",
    },
})