import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProblemStatements } from "@/lib/problem-statements-service";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let statements = await getProblemStatements();
    
    // Auto-seed if empty
    if (statements.length === 0) {
      const defaultStatements = [
        {
          title: "Smart Irrigation System using IoT and AI",
          description: "Develop an automated irrigation control system that uses soil moisture sensors, weather forecasting, and machine learning algorithms to optimize water usage in agricultural fields. The system should minimize water wastage while ensuring optimal soil conditions for crop growth."
        },
        {
          title: "AI-Based Automated Traffic Violation Detection",
          description: "Create an intelligent system for traffic surveillance cameras that can automatically detect speed violations, red-light jumping, helmet violations, and triple-riding on two-wheelers. The system should extract license plate details using OCR and notify authorities in real-time."
        },
        {
          title: "Blockchain-Based Secure Digital Credential Wallet",
          description: "Design a secure, decentralized repository for academic diplomas, certifications, and government transcripts using Ethereum or Hyperledger. The wallet should allow institutions to issue tamper-proof digital credentials and enable quick verification by employers."
        },
        {
          title: "Mental Health Support chatbot using NLP",
          description: "Build a conversational agent designed to provide support, stress-relief strategies, and basic cognitive behavioral exercises for students dealing with academic pressure. The chatbot should analyze sentiment and escalate critical cases to human counselors."
        }
      ];

      await db.$transaction(
        defaultStatements.map(stmt => 
          db.problemStatement.create({
            data: stmt
          })
        )
      );

      statements = await getProblemStatements();
    }

    return NextResponse.json(statements);
  } catch (error) {
    console.error("Failed to fetch/seed problem statements:", error);
    return NextResponse.json({ error: "Failed to fetch problem statements" }, { status: 500 });
  }
}

