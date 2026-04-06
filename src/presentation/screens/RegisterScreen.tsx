import React, { useState } from "react";
import { Alert, Button, Switch, Text, TextInput, View } from "react-native";
import { saveUser } from "../../data/storage/userStorage";

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);

  const handleRegister = async () => {
    if (!accepted) {
      Alert.alert("Debe aceptar el aviso de privacidad");
      return;
    }

    await saveUser({ name, email, password, acceptedPrivacy: accepted });
    Alert.alert("Usuario registrado correctamente");
    navigation.navigate("Login");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Nombre</Text>
      <TextInput value={name} onChangeText={setName} />

      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} />

      <Text>Password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} />

      <Text>Aviso de Privacidad</Text>
      <Text>
        Esta aplicación almacenará sus datos únicamente para fines académicos.
      </Text>

      <Switch value={accepted} onValueChange={setAccepted} />

      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
}
