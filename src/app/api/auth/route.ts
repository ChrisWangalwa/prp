import { NextResponse } from "next/server";
import { auth } from "@/config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export async function POST(req: Request) {
  try {
    const { email, password, action } = await req.json();

    if (!email || !password || !action) {
      return NextResponse.json(
        { error: "Missing email, password, or action" },
        { status: 400 }
      );
    }

    let user;
    if (action === "login") {
      const result = await signInWithEmailAndPassword(auth, email, password);
      user = result.user;
    } else if (action === "signup") {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      user = result.user;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      uid: user.uid,
      email: user.email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
