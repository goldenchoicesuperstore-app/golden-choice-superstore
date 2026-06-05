import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const notifyAdminOnNewChat = functions.firestore
  .document("supportChats/{chatId}")
  .onCreate(async (snapshot, context) => {
    const chatData = snapshot.data();
    const db = admin.firestore();

    const adminsQuery = await db.collection("users").where("role", "==", "admin").get();
    const batch = db.batch();
    const tokens: string[] = [];

    adminsQuery.docs.forEach((adminDoc) => {
      const adminId = adminDoc.id;
      const notificationRef = db.collection(`users/${adminId}/notifications`).doc();
      
      batch.set(notificationRef, {
        title: "New Support Chat",
        body: `${chatData.userName || 'A customer'} started a new conversation.`,
        type: "new_chat",
        chatId: context.params.chatId,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const data = adminDoc.data();
      if (data.fcmTokens && Array.isArray(data.fcmTokens)) {
        tokens.push(...data.fcmTokens);
      }
    });

    await batch.commit();

    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: "New Support Chat",
          body: `${chatData.userName || 'A customer'} started a new conversation.`
        },
        data: {
          chatId: context.params.chatId,
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        }
      }).catch(console.error);
    }
  });
