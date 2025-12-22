import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WebhookLog from '@/models/WebhookLog';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    console.log("🔔 Webhook Received:", JSON.stringify(body, null, 2));

    await WebhookLog.create({
      data: body,
      receivedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Webhook stored in DB" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid JSON or DB Error" }, 
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const logs: any[] = await WebhookLog.find({})
      .sort({ receivedAt: -1 })
      .limit(50)
      .lean();

    const formattedLogs = logs.map(log => ({
      id: log._id.toString(),
      receivedAt: log.receivedAt,
      data: log.data
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch logs" }, 
      { status: 500 }
    );
  }
}