import Notification from "../models/Notification.js";


// ==========================
// GET NOTIFICATIONS
// ==========================
export const getNotifications =
async (req, res) => {

  try {

    const notifications =
      await Notification.find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(
      notifications
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};


// ==========================
// MARK AS READ
// ==========================
export const markAsRead =
async (req, res) => {

  try {

    await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true
      }
    );

    res.status(200).json({
      message:
        "Notification read"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};