// cabindia-mobile/src/screens/ChatScreen.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  View, Text, ScrollView, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Modal, FlatList 
} from 'react-native';
import { COLORS, SIZES, GLOBAL_STYLES, FONTS } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

// ============================================
// TICKET SYSTEM
// ============================================
const TICKET_CATEGORIES = [
  { id: 'booking', label: '🚗 Booking Issue', icon: 'car-outline' },
  { id: 'payment', label: '💰 Payment Problem', icon: 'card-outline' },
  { id: 'driver', label: '👤 Driver Issue', icon: 'person-outline' },
  { id: 'safety', label: '🛡️ Safety Concern', icon: 'shield-outline' },
  { id: 'refund', label: '↩️ Refund Request', icon: 'refresh-outline' },
  { id: 'other', label: '📝 Other', icon: 'help-outline' },
];

const TICKET_PRIORITIES = [
  { id: 'low', label: 'Low', color: '#22c55e' },
  { id: 'medium', label: 'Medium', color: '#facc15' },
  { id: 'high', label: 'High', color: '#f97316' },
  { id: 'urgent', label: 'Urgent', color: '#ef4444' },
];

const generateTicketId = () => {
  return 'TKT-' + Date.now().toString().slice(-8) + '-' + 
    Math.random().toString(36).substring(2, 6).toUpperCase();
};

// ============================================
// BOT RESPONSES WITH TICKET CREATION
// ============================================
const getBotResponse = (message, userData, createTicket) => {
  const msg = message.toLowerCase();
  
  // Check for ticket creation keywords
  if (msg.includes('ticket') || msg.includes('issue') || msg.includes('problem') || 
      msg.includes('complaint') || msg.includes('refund') || msg.includes('cancel')) {
    return {
      type: 'ticket_prompt',
      text: "🔧 I'll help you create a support ticket. Please select the category of your issue:",
      categories: TICKET_CATEGORIES,
    };
  }
  
  // Check for refund request
  if (msg.includes('refund') || msg.includes('money back') || msg.includes('return')) {
    return {
      type: 'refund_info',
      text: "💰 I understand you need a refund. Here's what you need to know:\n\n" +
            "• Refunds are processed within 3-5 business days\n" +
            "• You'll receive a confirmation email once processed\n" +
            "• For ride cancellations, refund amount depends on the stage of cancellation\n\n" +
            "Would you like to create a refund ticket? Reply with 'yes' or 'no'",
    };
  }
  
  // Check for ride booking issues
  if (msg.includes('book') || msg.includes('ride') || msg.includes('cab') || msg.includes('driver')) {
    return {
      type: 'ride_help',
      text: "🚗 I can help with ride issues. Here are some common solutions:\n\n" +
            "1. Check your internet connection\n" +
            "2. Restart the app\n" +
            "3. Clear app cache\n" +
            "4. Try booking from a different location\n\n" +
            "If the issue persists, create a support ticket and our team will assist you.",
    };
  }
  
  // Check for payment issues
  if (msg.includes('pay') || msg.includes('cash') || msg.includes('card') || msg.includes('upi') || 
      msg.includes('wallet')) {
    return {
      type: 'payment_help',
      text: "💳 Payment issues? Here's what to do:\n\n" +
            "• Verify your payment method is active\n" +
            "• Check your bank balance\n" +
            "• Try using a different payment method\n" +
            "• Contact your bank for transaction issues\n\n" +
            "For failed payments, your money will be refunded automatically within 3-5 days.",
    };
  }
  
  // Check for safety concerns
  if (msg.includes('safe') || msg.includes('sos') || msg.includes('emergency') || 
      msg.includes('unsafe') || msg.includes('danger')) {
    return {
      type: 'safety_alert',
      text: "🛡️ Your safety is our top priority!\n\n" +
            "• Use the SOS button in the app for immediate help\n" +
            "• Share your trip with trusted contacts\n" +
            "• Track your ride in real-time\n" +
            "• Report any safety concerns immediately\n\n" +
            "❗ If you're in immediate danger, call emergency services (100/112) right away.",
    };
  }
  
  // General greeting
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
    return {
      type: 'greeting',
      text: `👋 Hello ${userData?.name || 'there'}! I'm your CabIndia support assistant.\n\n` +
            "I can help you with:\n" +
            "• 🚗 Ride booking issues\n" +
            "• 💰 Payment and refunds\n" +
            "• 👤 Driver concerns\n" +
            "• 🛡️ Safety features\n" +
            "• 📝 Creating support tickets\n\n" +
            "What can I help you with today?",
    };
  }
  
  // Default response
  return {
    type: 'default',
    text: "🤔 I'm not sure I understand. Here are some things I can help with:\n\n" +
          "• Book a ride\n" +
          "• Check payment status\n" +
          "• Report an issue with a driver\n" +
          "• Request a refund\n" +
          "• Create a support ticket\n" +
          "• Get safety assistance\n\n" +
          "Please describe your issue and I'll do my best to help!",
  };
};

// ============================================
// MAIN CHAT SCREEN
// ============================================
export default function ChatScreen({ navigation, route }) {
  const { userData } = useContext(AuthContext);
  const { driverId, driverName, rideId } = route.params || {};
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [showTickets, setShowTickets] = useState(false);
  
  // Ticket Creation Modal
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketRideId, setTicketRideId] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);
  
  // Refund Modal
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundRideId, setRefundRideId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);
  
  const scrollViewRef = useRef(null);

  // Load tickets on mount
  useEffect(() => {
    fetchTickets();
    
    // Add welcome message
    setMessages([
      { 
        id: '1',
        from: 'bot', 
        type: 'greeting',
        text: `👋 Hello ${userData?.name || 'there'}! I'm your CabIndia support assistant.\n\n` +
              "I can help you with:\n" +
              "• 🚗 Ride booking issues\n" +
              "• 💰 Payment and refunds\n" +
              "• 👤 Driver concerns\n" +
              "• 🛡️ Safety features\n" +
              "• 📝 Creating support tickets\n\n" +
              "What can I help you with today?",
        timestamp: new Date(),
      }
    ]);
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/api/support/tickets');
      if (response.data.success) {
        setTickets(response.data.tickets || []);
      }
    } catch (error) {
      console.error('Fetch tickets error:', error);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { 
      id: Date.now().toString(),
      from: 'user', 
      text: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Process bot response
    setTimeout(() => {
      const response = getBotResponse(input, userData, createTicket);
      
      if (response.type === 'ticket_prompt') {
        // Show category selection
        const botMsg = {
          id: (Date.now() + 1).toString(),
          from: 'bot',
          type: 'ticket_prompt',
          text: response.text,
          categories: response.categories,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
      } else if (response.type === 'refund_info') {
        // Show refund info with action
        const botMsg = {
          id: (Date.now() + 1).toString(),
          from: 'bot',
          type: 'refund_info',
          text: response.text,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          from: 'bot',
          type: response.type || 'default',
          text: response.text,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
      }
      
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const createTicket = async (category, description, priority, rideId) => {
    setCreatingTicket(true);
    try {
      const ticketData = {
        category: category || selectedCategory,
        description: description || ticketDescription,
        priority: priority || ticketPriority,
        rideId: rideId || ticketRideId,
        userId: userData?.id,
        ticketId: generateTicketId(),
      };
      
      const response = await api.post('/api/support/tickets', ticketData);
      
      if (response.data.success) {
        const ticket = response.data.ticket;
        setTickets(prev => [ticket, ...prev]);
        
        // Add confirmation message
        const confirmMsg = {
          id: (Date.now() + 2).toString(),
          from: 'bot',
          type: 'ticket_created',
          text: `✅ Your ticket has been created!\n\n` +
                `📋 Ticket ID: ${ticket.ticketId || ticket.id}\n` +
                `📂 Category: ${ticket.category}\n` +
                `⚡ Priority: ${ticket.priority}\n` +
                `📅 Created: ${new Date(ticket.createdAt).toLocaleString()}\n\n` +
                `Our team will review your issue and get back to you within 24 hours. You can track your ticket status in the app.`,
          ticket: ticket,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, confirmMsg]);
        
        // Reset form
        setTicketModalVisible(false);
        setSelectedCategory(null);
        setTicketDescription('');
        setTicketPriority('medium');
        setTicketRideId('');
        
        Alert.alert(
          '✅ Ticket Created',
          `Your ticket #${ticket.ticketId || ticket.id} has been created. We'll get back to you within 24 hours.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Create ticket error:', error);
      Alert.alert('Error', 'Failed to create support ticket. Please try again.');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleRefund = async (rideId, reason, amount) => {
    setProcessingRefund(true);
    try {
      const response = await api.post('/api/payment/refund', {
        rideId: rideId || refundRideId,
        reason: reason || refundReason,
        amount: parseFloat(amount || refundAmount),
        userId: userData?.id,
      });
      
      if (response.data.success) {
        const refundMsg = {
          id: (Date.now() + 2).toString(),
          from: 'bot',
          type: 'refund_confirmation',
          text: `💰 Refund Request Submitted!\n\n` +
                `🚗 Ride ID: ${rideId || refundRideId}\n` +
                `💵 Amount: ₹${amount || refundAmount}\n` +
                `📅 Refund will be processed within 3-5 business days.\n\n` +
                `You'll receive a confirmation email once the refund is complete.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, refundMsg]);
        setRefundModalVisible(false);
        Alert.alert('✅ Refund Requested', 'Your refund request has been submitted.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund error:', error);
      Alert.alert('Error', 'Failed to process refund. Please try again.');
    } finally {
      setProcessingRefund(false);
    }
  };

  const renderMessage = (msg) => {
    if (msg.from === 'user') {
      return (
        <View key={msg.id} style={[styles.bubble, styles.userBubble]}>
          <View style={styles.bubbleContent}>
            <Text style={styles.userText}>{msg.text}</Text>
            <Text style={styles.timestampText}>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    // Bot messages
    return (
      <View key={msg.id} style={[styles.bubble, styles.botBubble]}>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>C</Text>
        </View>
        <View style={styles.bubbleContent}>
          <Text style={styles.botText}>{msg.text}</Text>
          
          {/* Category Selection for Tickets */}
          {msg.type === 'ticket_prompt' && msg.categories && (
            <View style={styles.categoryContainer}>
              {msg.categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryButton}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setTicketModalVisible(true);
                  }}
                >
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Refund Action */}
          {msg.type === 'refund_info' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setRefundModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Request Refund</Text>
            </TouchableOpacity>
          )}
          
          {/* Ticket Created - View Tickets */}
          {msg.type === 'ticket_created' && msg.ticket && (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewTicketsButton]}
              onPress={() => {
                setShowTickets(true);
                fetchTickets();
              }}
            >
              <Text style={styles.actionButtonText}>View My Tickets</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.timestampText}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CabIndia Support</Text>
        <TouchableOpacity onPress={() => { setShowTickets(true); fetchTickets(); }}>
          <Ionicons name="ticket-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map(renderMessage)}
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

      {/* Input */}
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

      {/* ============================================ */}
      {/* TICKET CREATION MODAL */}
      {/* ============================================ */}
      <Modal
        visible={ticketModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTicketModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📝 Create Support Ticket</Text>
              <TouchableOpacity onPress={() => setTicketModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {TICKET_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categorySelect,
                        selectedCategory === cat.id && styles.categorySelectActive,
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                    >
                      <Text style={styles.categorySelectLabel}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {TICKET_PRIORITIES.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.priorityButton,
                        ticketPriority === p.id && { borderColor: p.color, backgroundColor: p.color + '20' },
                      ]}
                      onPress={() => setTicketPriority(p.id)}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                      <Text style={[
                        styles.priorityText,
                        ticketPriority === p.id && { color: p.color },
                      ]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Describe your issue in detail..."
                  placeholderTextColor={COLORS.textMuted}
                  value={ticketDescription}
                  onChangeText={setTicketDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Ride ID (optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ride ID (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter ride ID if applicable"
                  placeholderTextColor={COLORS.textMuted}
                  value={ticketRideId}
                  onChangeText={setTicketRideId}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setTicketModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={() => {
                  if (!selectedCategory) {
                    Alert.alert('Select Category', 'Please select a category for your ticket.');
                    return;
                  }
                  if (!ticketDescription.trim()) {
                    Alert.alert('Add Description', 'Please describe your issue.');
                    return;
                  }
                  createTicket();
                }}
                disabled={creatingTicket}
              >
                {creatingTicket ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Create Ticket</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================ */}
      {/* TICKETS LIST MODAL */}
      {/* ============================================ */}
      <Modal
        visible={showTickets}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTickets(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎫 My Tickets</Text>
              <TouchableOpacity onPress={() => setShowTickets(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={tickets}
              keyExtractor={(item) => item.id?.toString() || item.ticketId}
              renderItem={({ item }) => (
                <View style={styles.ticketItem}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketId}>{item.ticketId || item.id}</Text>
                    <View style={[
                      styles.ticketStatus,
                      { backgroundColor: item.status === 'resolved' ? '#22c55e' : 
                                       item.status === 'in_progress' ? '#facc15' : '#3b82f6' }
                    ]}>
                      <Text style={styles.ticketStatusText}>
                        {item.status || 'open'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ticketCategory}>{item.category}</Text>
                  <Text style={styles.ticketDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.ticketDate}>
                    {new Date(item.createdAt || item.created_at).toLocaleString()}
                  </Text>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyTickets}>
                  <Ionicons name="ticket-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyTicketsText}>No tickets yet</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ============================================ */}
      {/* REFUND MODAL */}
      {/* ============================================ */}
      <Modal
        visible={refundModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRefundModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💰 Request Refund</Text>
              <TouchableOpacity onPress={() => setRefundModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ride ID *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter ride ID"
                  placeholderTextColor={COLORS.textMuted}
                  value={refundRideId}
                  onChangeText={setRefundRideId}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Refund Amount (₹) *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter amount"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  value={refundAmount}
                  onChangeText={setRefundAmount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reason *</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Why are you requesting a refund?"
                  placeholderTextColor={COLORS.textMuted}
                  value={refundReason}
                  onChangeText={setRefundReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setRefundModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]} 
                onPress={() => {
                  if (!refundRideId.trim()) {
                    Alert.alert('Missing Ride ID', 'Please enter the ride ID.');
                    return;
                  }
                  if (!refundAmount || parseFloat(refundAmount) <= 0) {
                    Alert.alert('Invalid Amount', 'Please enter a valid amount.');
                    return;
                  }
                  if (!refundReason.trim()) {
                    Alert.alert('Missing Reason', 'Please explain why you need a refund.');
                    return;
                  }
                  handleRefund();
                }}
                disabled={processingRefund}
              >
                {processingRefund ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Submit Refund</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ============================================
// STYLES
// ============================================
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
    maxWidth: '90%',
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
  timestampText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
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

  // Category Selection
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: `${COLORS.primary}1A`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },

  // Action Button
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  viewTicketsButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: SIZES.radius * 2,
    borderTopRightRadius: SIZES.radius * 2,
    padding: SIZES.padding * 1.5,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  modalBody: {
    paddingVertical: SIZES.padding,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin,
    paddingTop: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.padding * 0.8,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  modalCancelText: {
    color: COLORS.text,
    fontFamily: FONTS.semibold,
    fontSize: SIZES.medium,
  },
  modalSaveButton: {
    backgroundColor: COLORS.primary,
  },
  modalSaveText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: SIZES.medium,
  },

  // Inputs
  inputGroup: {
    marginBottom: SIZES.margin * 1.5,
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding * 0.8,
    color: COLORS.text,
    fontSize: SIZES.body,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categorySelect: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.inputBackground,
  },
  categorySelectActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}1A`,
  },
  categorySelectLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },

  // Priority
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.inputBackground,
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },

  // Ticket List
  ticketItem: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketId: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  ticketStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ticketStatusText: {
    color: COLORS.background,
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'capitalize',
  },
  ticketCategory: {
    color: COLORS.textMuted,
    fontSize: SIZES.small,
    fontFamily: FONTS.semibold,
  },
  ticketDesc: {
    color: COLORS.text,
    fontSize: SIZES.small,
    marginTop: 2,
  },
  ticketDate: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  emptyTickets: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  emptyTicketsText: {
    color: COLORS.textMuted,
    fontSize: SIZES.medium,
    marginTop: SIZES.margin,
    fontFamily: FONTS.semibold,
  },
});