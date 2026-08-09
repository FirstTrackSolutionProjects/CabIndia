// cabindia-mobile/src/screens/ChatScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons/Ionicons';

// Pre-defined responses for common issues
const BOT_RESPONSES = {
  'booking': 'I understand you\'re having trouble with booking. Here\'s what you can do:\n1. Check your internet connection\n2. Try restarting the app\n3. If the issue persists, our team will help you immediately.',
  'driver': 'I\'m sorry to hear about the driver issue. Please note the driver details and we\'ll investigate this matter. Your safety is our priority.',
  'payment': 'I understand your concern about payment. Don\'t worry, all payments are secure. Let me check the status of your transaction.',
  'safety': 'Safety is our top priority. If you feel unsafe, please use the SOS button in the app or call emergency services. We\'re here to help.',
  'cancel': 'I understand you want to cancel. Please note that cancellation fees may apply depending on the stage of your ride.',
  'general': 'Thank you for reaching out. Our support team is available 24/7 to assist you with any issue.'
};

const getBotResponse = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('book') || msg.includes('ride') || msg.includes('cab')) return BOT_RESPONSES.booking;
  if (msg.includes('driver') || msg.includes('captain')) return BOT_RESPONSES.driver;
  if (msg.includes('pay') || msg.includes('cash') || msg.includes('card') || msg.includes('upi')) return BOT_RESPONSES.payment;
  if (msg.includes('safe') || msg.includes('sos') || msg.includes('emergency')) return BOT_RESPONSES.safety;
  if (msg.includes('cancel') || msg.includes('refund')) return BOT_RESPONSES.cancel;
  return BOT_RESPONSES.general;
};

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hello! Welcome to CabIndia Support. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking and responding
    setTimeout(() => {
      const response = getBotResponse(input);
      setMessages(prev => [...prev, { from: 'bot', text: response }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CabIndia Support</Text>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.from === 'user' ? styles.userBubble : styles.botBubble]}>
            {m.from === 'bot' && (
              <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>C</Text>
              </View>
            )}
            <View style={styles.bubbleContent}>
              <Text style={m.from === 'user' ? styles.userText : styles.botText}>
                {m.text}
              </Text>
            </View>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.bubble, styles.botBubble]}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarText}>C</Text>
            </View>
            <View style={styles.bubbleContent}>
              <View style={styles.typingContainer}>
                <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '200ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '400ms' }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={20} color={input.trim() ? COLORS.background : '#666'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderColor: COLORS.borderColor,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginLeft: -24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  statusText: {
    color: '#22c55e',
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
  },
  chatContent: {
    paddingVertical: SIZES.padding,
  },
  bubble: {
    flexDirection: 'row',
    marginBottom: SIZES.margin,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  botAvatarText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  bubbleContent: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.cardBackground,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  userText: {
    color: COLORS.background,
    fontFamily: FONTS.medium,
    fontSize: SIZES.body,
  },
  botText: {
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: SIZES.body,
    lineHeight: 20,
  },
  typingContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    animationName: 'bounce',
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
  },
  inputRow: {
    flexDirection: 'row',
    padding: SIZES.padding,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.padding,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    gap: SIZES.margin,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    color: COLORS.text,
    fontSize: SIZES.body,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.inputBackground,
  },
});