import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Priya',
      text: 'Hey Rahul, kya kal subah 10 baje mil rahe hain?',
      isLocked: false,
      timestamp: '10:00 AM'
    },
    {
      id: '2',
      sender: 'Rahul',
      text: 'Haan bilkul!',
      isLocked: false,
      timestamp: '10:01 AM'
    },
    {
      id: '3',
      sender: 'Rahul',
      text: 'Tum kal bohot khubsurat lag rahi thi... I really like you ❤️',
      isLocked: true,
      category: 'Feelings / Intimate',
      timestamp: '10:05 AM'
    },
    {
      id: '4',
      sender: 'Priya',
      text: 'Theek hai kal milte hain.',
      isLocked: false,
      timestamp: '10:06 AM'
    }
  ]);

  const [unlockedMap, setUnlockedMap] = useState({});
  const [inputText, setInputText] = useState('');
  const [isLockEnabled, setIsLockEnabled] = useState(false);

  // Trigger Hardware Biometrics (Fingerprint / FaceID on Android & iOS)
  const authenticateAndUnlock = async (messageId) => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometrics Not Available',
          'Biometric hardware enrolled nahi hai. Default demo unlock ho raha hai.'
        );
        unlockMessageTemporarily(messageId);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Fingerprint / Face ID to view private message',
        fallbackLabel: 'Enter Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        unlockMessageTemporarily(messageId);
      } else {
        Alert.alert('Authentication Failed', 'Fingerprint / Face verify nahi hua.');
      }
    } catch (error) {
      console.error('Biometric Error:', error);
      Alert.alert('Error', 'Biometric scan error: ' + error.message);
    }
  };

  const unlockMessageTemporarily = (messageId) => {
    setUnlockedMap((prev) => ({ ...prev, [messageId]: true }));
    // Auto-relock after 15 seconds
    setTimeout(() => {
      setUnlockedMap((prev) => {
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
    }, 15000);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      sender: 'Rahul',
      text: inputText.trim(),
      isLocked: isLockEnabled,
      category: isLockEnabled ? 'Personal Feelings' : 'General',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setIsLockEnabled(false);
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender === 'Rahul';
    const isUnlocked = Boolean(unlockedMap[item.id]);

    if (!item.isLocked) {
      return (
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={styles.senderText}>{item.sender}</Text>
          <Text style={styles.msgText}>{item.text}</Text>
          <Text style={styles.timeText}>{item.timestamp}</Text>
        </View>
      );
    }

    if (isUnlocked) {
      return (
        <View style={[styles.bubble, styles.unlockedBubble]}>
          <Text style={styles.unlockedHeader}>🔓 Biometric Verified (Auto-relocks in 15s)</Text>
          <Text style={styles.unlockedText}>{item.text}</Text>
          <Text style={styles.categoryBadge}>🏷️ {item.category || 'Feelings & Private'}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.bubble, styles.lockedBubble]}>
        <Text style={styles.lockedHeader}>🔒 Private & Sensitive Message</Text>
        <Text style={styles.blurPlaceholder}>••••••••••••••••••••••••••••••••••••</Text>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => authenticateAndUnlock(item.id)}
        >
          <Text style={styles.unlockButtonText}>👆 Tap with Fingerprint / Face ID</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 SecureChat (Priya)</Text>
        <Text style={styles.headerSubtitle}>🛡️ Message-Level Biometric Shield Active</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.lockToggle, isLockEnabled ? styles.lockToggleActive : null]}
          onPress={() => setIsLockEnabled(!isLockEnabled)}
        >
          <Text style={styles.lockToggleText}>{isLockEnabled ? '🔒' : '🔓'}</Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, isLockEnabled ? styles.inputLocked : null]}
          placeholder={isLockEnabled ? 'Type secret/feeling message...' : 'Type message...'}
          placeholderTextColor="#64748b"
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  header: { padding: 16, backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc' },
  headerSubtitle: { fontSize: 12, color: '#a855f7', marginTop: 2 },
  listContent: { padding: 16 },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 12, maxWidth: '85%' },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#16a34a' },
  otherBubble: { alignSelf: 'flex-start', backgroundColor: '#1e293b' },
  senderText: { fontSize: 10, color: '#94a3b8', marginBottom: 2 },
  msgText: { fontSize: 14, color: '#f8fafc' },
  timeText: { fontSize: 10, color: '#e2e8f0', alignSelf: 'flex-end', marginTop: 4 },
  lockedBubble: { alignSelf: 'flex-start', backgroundColor: '#1e1b4b', borderWidth: 1, borderColor: '#f43f5e', width: '85%' },
  lockedHeader: { fontSize: 12, fontWeight: 'bold', color: '#fb7185', marginBottom: 4 },
  blurPlaceholder: { color: '#64748b', fontSize: 13, letterSpacing: 2, marginVertical: 4 },
  unlockButton: { marginTop: 6, backgroundColor: '#e11d48', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  unlockButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  unlockedBubble: { alignSelf: 'flex-start', backgroundColor: '#3b0764', borderWidth: 1, borderColor: '#a855f7', width: '85%' },
  unlockedHeader: { fontSize: 11, color: '#4ade80', fontWeight: 'bold', marginBottom: 4 },
  unlockedText: { fontSize: 14, color: '#faf5ff' },
  categoryBadge: { fontSize: 10, color: '#d8b4fe', marginTop: 6, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', alignItems: 'center' },
  lockToggle: { padding: 10, backgroundColor: '#1e293b', borderRadius: 12, marginRight: 8 },
  lockToggleActive: { backgroundColor: '#7e22ce' },
  lockToggleText: { fontSize: 16 },
  input: { flex: 1, backgroundColor: '#020617', color: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#334155' },
  inputLocked: { borderColor: '#a855f7', backgroundColor: '#2e1065' },
  sendButton: { marginLeft: 8, backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});
