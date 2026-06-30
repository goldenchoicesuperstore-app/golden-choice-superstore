import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize app if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const verifyPayment = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const uid = context.auth.uid;
  const { reference } = data;

  if (!reference) {
    throw new functions.https.HttpsError('invalid-argument', 'Reference is required.');
  }

  try {
    // 1. Check idempotency: Have we already processed this order?
    const orderRef = db.collection('orders').doc(reference);
    const orderDoc = await orderRef.get();
    
    if (orderDoc.exists && orderDoc.data()?.paymentStatus === 'paid') {
      return { success: true, message: 'Already verified' };
    }

    // 2. Call Paystack API to verify the transaction
    const paystackKey = functions.config().paystack?.secret || process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackKey) {
      console.warn("Paystack secret key is missing. Ensure it's set in your functions environment.");
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` }
    });
    
    const result = await response.json();

    if (!result.status || result.data.status !== 'success') {
      throw new functions.https.HttpsError('failed-precondition', 'Payment verification failed at gateway.');
    }

    // 3. Prepare Batch Write for atomic updates
    const batch = db.batch();

    // Update the Order status
    batch.set(orderRef, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 4. Decrement Stock Quantity
    if (orderDoc.exists && orderDoc.data()?.items) {
      const items = orderDoc.data()?.items;
      for (const item of items) {
        if (item.productId) {
          const productRef = db.collection('products').doc(item.productId);
          batch.update(productRef, {
            stockQuantity: admin.firestore.FieldValue.increment(-item.quantity),
            soldCount: admin.firestore.FieldValue.increment(item.quantity)
          });
        }
      }
    }

    // 5. Clear User Cart (If stored in Firestore)
    const cartRef = db.collection('carts').doc(uid);
    batch.delete(cartRef);

    // 6. Send Notification
    const notifRef = db.collection('notifications').doc();
    batch.set(notifRef, {
      userId: uid,
      title: 'Order Confirmed! 🎉',
      body: `Your payment for order ${reference} was successful and your order is now being processed.`,
      type: 'order_update',
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Commit the batch
    await batch.commit();

    return { success: true, message: 'Payment successfully verified and order confirmed.' };
    
  } catch (error) {
    console.error("verifyPayment Error:", error);
    throw new functions.https.HttpsError('internal', 'Error verifying payment', error);
  }
});

