import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {useAuth} from '../hooks/useAuth';
import {Button} from '../components';

export const LoginScreen: React.FC = () => {
  const {theme} = useTheme();
  const {login} = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter phone and password');
      return;
    }

    try {
      setLoading(true);
      await login(phone, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text style={[styles.title, theme.typography.h1, {color: theme.colors.text}]}>
              CRM
            </Text>
            <Text
              style={[
                styles.subtitle,
                theme.typography.body1,
                {color: theme.colors.textSecondary},
              ]}>
              Welcome back! Please login to continue
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.label,
                  theme.typography.body2,
                  {color: theme.colors.textSecondary},
                ]}>
                Phone Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                  },
                ]}
                placeholder="Enter phone number"
                placeholderTextColor={theme.colors.textLight}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.label,
                  theme.typography.body2,
                  {color: theme.colors.textSecondary},
                ]}>
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                  },
                ]}
                placeholder="Enter password"
                placeholderTextColor={theme.colors.textLight}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              size="large"
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  button: {
    marginTop: 12,
  },
});
