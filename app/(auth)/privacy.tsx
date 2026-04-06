import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function PrivacyScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
        Aviso de Privacidad y Consentimiento
      </Text>

      <ScrollView style={{ flex: 1 }}>
        <Text style={{ lineHeight: 20 }}>
          Esta aplicación tiene fines académicos. Los datos capturados (nombre, correo y evidencias
          registradas) se utilizarán únicamente para demostrar funcionalidades del proyecto.
          {"\n\n"}
          Medidas básicas:
          {"\n"}• Minimización de datos: se solicita solo lo necesario.
          {"\n"}• Almacenamiento seguro: credenciales y sesión se almacenan de forma cifrada en el dispositivo.
          {"\n"}• No se comparte información con terceros.
          {"\n\n"}
          Al continuar, usted otorga su consentimiento para el tratamiento de sus datos conforme a este aviso.
        </Text>
      </ScrollView>

      <Pressable
        onPress={() => router.back()}
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 10,
          backgroundColor: "#111",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Regresar</Text>
      </Pressable>
    </View>
  );
}
