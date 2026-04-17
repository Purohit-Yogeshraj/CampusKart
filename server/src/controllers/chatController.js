import { Message } from "../models/Message.js";
import { User } from "../models/User.js";

export async function sendMessage(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { recipientId, message, listingId } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({ success: false, message: "Recipient and message are required" });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: "Recipient not found" });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      message: message.trim(),
      listing: listingId,
    });

    // Populate sender info
    await newMessage.populate("sender", "username");

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getConversation(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { conversationWith } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: conversationWith },
        { sender: conversationWith, recipient: req.user._id },
      ],
    })
      .populate("sender", "username _id")
      .populate("recipient", "username _id")
      .populate({
        path: "listing",
        select: "title status user",
        populate: {
          path: "user",
          select: "username _id",
        },
      })
      .sort({ createdAt: 1 })
      .limit(50);

    // Mark messages as read
    await Message.updateMany(
      {
        recipient: req.user._id,
        sender: conversationWith,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getConversations(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    // Get unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { recipient: req.user._id }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", req.user._id] }, "$recipient", "$sender"],
          },
          lastMessage: { $last: "$message" },
          lastMessageTime: { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$recipient", req.user._id] }, { $eq: ["$isRead", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    // Populate user details
    const conversationDetails = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id).select("username email -_id");
        return {
          ...conv,
          user,
          conversationWith: conv._id,
        };
      })
    );

    res.json({ success: true, conversations: conversationDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function markAsRead(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    const { senderId } = req.params;

    await Message.updateMany(
      {
        sender: senderId,
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
