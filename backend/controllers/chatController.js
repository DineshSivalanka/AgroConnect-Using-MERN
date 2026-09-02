import express from 'express';
import ChatMessage from '../models/ChatMessage.js';

// Get contacts for a user
export const getContacts = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await ChatMessage.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).populate('sender', 'name phone role location').populate('receiver', 'name phone role location');
    
    const contactsMap = new Map();
    messages.forEach(msg => {
      if (msg.sender && msg.sender.id.toString() !== userId) contactsMap.set(msg.sender.id.toString(), msg.sender);
      if (msg.receiver && msg.receiver.id.toString() !== userId) contactsMap.set(msg.receiver.id.toString(), msg.receiver);
    });
    
    res.status(200).json(Array.from(contactsMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat history between two users
export const getHistory = async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    const messages = await ChatMessage.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId }
      ]
    }).populate('sender', 'name phone').populate('receiver', 'name phone').sort('createdAt');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const newMessage = new ChatMessage({
      sender: senderId,
      receiver: receiverId,
      content
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
