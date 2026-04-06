import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../../domain/models/User";

const USER_KEY = "APP_USER";

export const saveUser = async (user: User) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<User | null> => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};
