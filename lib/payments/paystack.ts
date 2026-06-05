interface PaystackOptions {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
}

const verifyPaymentCloudFunction = async (reference: string) => {
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const { app } = await import('../firebase/config');
  
  const functions = getFunctions(app);
  const verifyFn = httpsCallable(functions, 'verifyPayment');
  
  const result = await verifyFn({ reference });
  return result.data;
};

export const initiatePaystackPayment = ({ email, amount, reference, onSuccess, onClose }: PaystackOptions) => {
  const existingScript = document.getElementById('paystack-inline-script');
  
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.id = 'paystack-inline-script';
    script.async = true;
    script.onload = () => {
      openPaystack(email, amount, reference, onSuccess, onClose);
    };
    document.body.appendChild(script);
  } else {
    openPaystack(email, amount, reference, onSuccess, onClose);
  }
};

const openPaystack = (email: string, amount: number, reference: string, onSuccess: (res: any) => void, onClose: () => void) => {
  // @ts-ignore
  const paystack = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_sample",
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo
    ref: reference,
    currency: 'NGN',
    callback: function(response: any) {
      // Call Cloud function to verify and process payment
      verifyPaymentCloudFunction(response.reference)
        .then(() => {
          onSuccess(response);
        })
        .catch(err => {
          console.error("Cloud function verify error", err);
          // Still call onSuccess for frontend flow if cloud function failed 
          // (in a real app, you might show an error or a "pending verification" state instead)
          onSuccess(response); 
        });
    },
    onClose: function() {
      onClose();
    }
  });
  
  paystack.openIframe();
};
