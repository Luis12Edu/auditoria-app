import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { getUser } from "../../data/storage/userStorage";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const user = await getUser();

    if (!user) {
      Alert.alert("No existe usuario registrado");
      return;
    }

    if (user.email === email && user.password === password) {
      navigation.navigate("Home");
    } else {
      Alert.alert("Credenciales incorrectas");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} />

      <Text>Password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} />

      <Button title="Ingresar" onPress={handleLogin} />
      <Button title="Ir a Registro" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}
