import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { addEvidencia } from "@/src/data/storage/evidenciasStorage";
import { Evidencia } from "@/src/domain/models/Evidencia";

export default function NuevaEvidenciaScreen() {
  const { checklistItemId } = useLocalSearchParams<{ checklistItemId: string }>();

  const [comentario, setComentario] = useState("");
  const [imageUri, setImageUri] = useState("");

  const pickImageFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Debes permitir acceso a la galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Debes permitir acceso a la cámara.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (!imageUri) {
      return Alert.alert("Validación", "Debes agregar una imagen.");
    }

    const evidencia: Evidencia = {
      id: Date.now().toString(),
      checklistItemId: checklistItemId!,
      imageUri,
      comentario: comentario.trim(),
      createdAt: new Date().toISOString(),
    };

    await addEvidencia(evidencia);

    Alert.alert("Éxito", "Evidencia guardada correctamente.");
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <ThemedText type="title">Nueva evidencia</ThemedText>
            <ThemedText style={styles.subtitle}>
              Registra una imagen y un comentario para documentar este punto del checklist.
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle">Captura de evidencia</ThemedText>
            <ThemedText style={styles.helpText}>
              Puedes seleccionar una imagen desde la galería o tomar una foto con la cámara.
            </ThemedText>
          </View>

          <View style={styles.actionsCard}>
            <Pressable style={styles.secondaryButton} onPress={pickImageFromGallery}>
              <ThemedText style={styles.secondaryButtonText}>
                Seleccionar de galería
              </ThemedText>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={takePhoto}>
              <ThemedText style={styles.secondaryButtonText}>Tomar foto</ThemedText>
            </Pressable>
          </View>

          <View style={styles.previewCard}>
            <ThemedText type="subtitle">Vista previa</ThemedText>

            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.emptyPreview}>
                <ThemedText style={styles.emptyPreviewText}>
                  Aún no has seleccionado una imagen.
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.fieldBlock}>
              <ThemedText style={styles.label}>Comentario</ThemedText>
              <TextInput
                placeholder="Describe la evidencia registrada"
                placeholderTextColor="#9CA3AF"
                value={comentario}
                onChangeText={setComentario}
                style={[styles.input, styles.multilineInput]}
                multiline
              />
            </View>
          </View>

          <View style={styles.actionsBlock}>
            <Pressable style={styles.primaryButton} onPress={onSave}>
              <ThemedText style={styles.primaryButtonText}>Guardar evidencia</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  headerBlock: {
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  helpText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 14,
  },
  imagePreview: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  emptyPreview: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  emptyPreviewText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  fieldBlock: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  actionsBlock: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});