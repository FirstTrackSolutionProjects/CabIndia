// cabindia-mobile/src/screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hello! Welcome to CabIndia Support.' }
  ]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    
    // Simple Bot Auto-Reply Logic
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: 'Our agent will be with you shortly. Ticket Ref: TKT-' + Math.floor(Math.random()*10000) }]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1, backgroundColor: '#0a0a0a'}}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CabIndia Support</Text>
      </View>
      <ScrollView 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        style={styles.chatArea}
      >
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.from === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={m.from === 'user' ? styles.userText : styles.botText}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.textInput} 
          value={input} 
          onChangeText={setInput} 
          placeholder="Type your issue..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <Feather name="send" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 50, backgroundColor: '#111', borderBottomWidth: 1, borderColor: '#333' },
  headerTitle: { color: COLORS.primary, fontWeight: 'bold', textAlign: 'center' },
  chatArea: { flex: 1, padding: 15 },
  bubble: { padding: 12, borderRadius: 15, marginBottom: 10, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#1f2937' },
  userText: { color: '#000', fontWeight: '600' },
  botText: { color: '#fff' },
  inputRow: { flexDirection: 'row', padding: 20, gap: 10, backgroundColor: '#111' },
  textInput: { flex: 1, backgroundColor: '#1f2937', borderRadius: 10, paddingHorizontal: 15, color: '#fff' },
  sendBtn: { backgroundColor: COLORS.primary, width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }
});
