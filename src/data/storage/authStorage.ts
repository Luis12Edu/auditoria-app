import * as SecureStore from "expo-secure-store";

const USER_KEY = "AUDITAPP_USER";      // usuario registrado
const SESSION_KEY = "AUDITAPP_SESSION"; // sesión activa

export type StoredUser = {
  name: string;
  email: string;
  passwordHash: string;
  consent: boolean;
  createdAt: string;
};

export async function saveUser(user: StoredUser) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<StoredUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveSession(email: string) {
  await SecureStore.setItemAsync(SESSION_KEY, email);
}

export async function getSession(): Promise<string | null> {
  return await SecureStore.getItemAsync(SESSION_KEY);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function getCurrentUser(): Promise<StoredUser | null> {
  const session = await getSession();
  const user = await getUser();

  if (!session || !user) return null;
  if (user.email !== session) return null;

  return user;
}
