import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only intercept requests directed to the admin panel
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Retrieve the token from cookies (assuming 'firebaseToken' is set upon login)
  const token = request.cookies.get('firebaseToken')?.value;

  if (!token) {
    // Unauthenticated user
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Next.js Edge Runtime restricts standard Node.js modules like 'crypto' which 'firebase-admin' relies on.
    // Instead of importing the heavy SDK, we achieve the exact same secure verification using 
    // Firebase's Identity Toolkit REST API and Firestore REST API. This ensures flawless Edge execution.

    const apiKey = "AIzaSyDGhr9XeikXnkYIPuxm38PRQMYdqfoPaK8"; // Extracted from your config
    const projectId = "golden-choice-d971f";

    // 1. Verify the ID token natively
    const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token })
    });
    
    if (!verifyRes.ok) {
      // Token is invalid, expired, or malformed
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    const verifyData = await verifyRes.json();
    const uid = verifyData.users[0].localId;

    // 2. Fetch the user's role from Firestore securely
    const firestoreRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!firestoreRes.ok) {
      // User document not found or Firestore error
      return NextResponse.redirect(new URL('/403', request.url));
    }

    const firestoreData = await firestoreRes.json();
    const role = firestoreData.fields?.role?.stringValue;

    if (role === 'admin') {
      // Authorized admin
      return NextResponse.next();
    } else {
      // Authenticated but forbidden
      return NextResponse.redirect(new URL('/403', request.url));
    }
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// Ensure the middleware strictly runs on /admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
