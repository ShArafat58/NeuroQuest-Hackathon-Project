import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { verifyJWTEdge } from "@/lib/jwt-edge";
import { changeVersionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("neuroquest_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWTEdge(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = changeVersionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { new_version } = validationResult.data;

    const { error: updateError } = await supabaseServer
      .from("users")
      .update({ version: new_version })
      .eq("id", payload.userId);

    if (updateError) {
      console.error("Failed to update version:", updateError);
      return NextResponse.json({ error: "Failed to update version" }, { status: 500 });
    }

    return NextResponse.json({ success: true, new_version });
  } catch (error: any) {
    console.error("Unexpected error changing version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
