import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { esChat } from "@/lib/es-engine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gridSize = 5;

    let startX = Math.floor(Math.random() * gridSize);
    let startY = Math.floor(Math.random() * gridSize);

    const numMoves = Math.floor(Math.random() * 3) + 3; // 3 to 5 moves
    let currX = startX;
    let currY = startY;
    
    // For our grid, Y=0 is top, Y=4 is bottom.
    // So moving North = Y-1. South = Y+1.
    const possibleDirs = [
      { name: "North", dx: 0, dy: -1 },
      { name: "South", dx: 0, dy: 1 },
      { name: "East", dx: 1, dy: 0 },
      { name: "West", dx: -1, dy: 0 }
    ];

    let moveScript = "";
    let prevDirName = "";

    for (let i = 0; i < numMoves; i++) {
      const shuffledDirs = [...possibleDirs].sort(() => Math.random() - 0.5);
      
      let moved = false;
      for (const dir of shuffledDirs) {
        if ((dir.name === "North" && prevDirName === "South") ||
            (dir.name === "South" && prevDirName === "North") ||
            (dir.name === "East" && prevDirName === "West") ||
            (dir.name === "West" && prevDirName === "East")) {
            continue; 
        }

        const nextX = currX + dir.dx;
        const nextY = currY + dir.dy;
        
        if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
           currX = nextX;
           currY = nextY;
           moveScript += `Move 1 block ${dir.name}. `;
           prevDirName = dir.name;
           moved = true;
           break;
        }
      }
      
      if (!moved) {
        for (const dir of shuffledDirs) {
          const nextX = currX + dir.dx;
          const nextY = currY + dir.dy;
          if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
             currX = nextX;
             currY = nextY;
             moveScript += `Move 1 block ${dir.name}. `;
             prevDirName = dir.name;
             break;
          }
        }
      }
    }

    const prompt = `You are a friendly navigation guide for an English learning app. 
I have a 5x5 grid game. The user starts at a specific location on the board.
The sequence of moves they need to make is: "${moveScript.trim()}"

Write a short, natural, friendly 2-3 sentence audio script telling the user what to do.
For example: "Hi there! Let me guide you to your destination. From where you are, move two blocks North, then turn East for one block..."
Make it sound like a natural human speaking, combining consecutive identical moves if needed (e.g. "Move 1 block North. Move 1 block North." -> "Move two blocks North").
DO NOT mention coordinates or grid sizes. Just give the directions cleanly. Keep it simple and encouraging.`;

    let audioText = `Welcome navigator! ${moveScript.trim()} Follow these steps carefully to reach your goal.`;

    try {
      const aiTextResponse = await esChat([
        { role: "system", content: "You are a friendly navigation guide for an English learning app." },
        { role: "user", content: prompt }
      ]);
      if (aiTextResponse && aiTextResponse.length > 5) {
        audioText = aiTextResponse.trim();
      }
    } catch (err) {
      console.warn("[ES-ENGINE] generate-listen-go AI failed, using script fallback:", err);
    }
    
    return NextResponse.json({
      success: true,
      audioText,
      startPos: { x: startX, y: startY },
      endPos: { x: currX, y: currY },
      gridSize: gridSize
    });


  } catch (error) {
    console.error("Generate listen-go error:", error);
    return NextResponse.json({ error: "Failed to generate challenge" }, { status: 500 });
  }
}
