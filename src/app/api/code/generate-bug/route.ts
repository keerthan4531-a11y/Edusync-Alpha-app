import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { esChat } from "@/lib/es-engine";
import { safeJsonParse } from "@/lib/utils";

export interface AIGeneratedBug {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: "Easy" | "Medium" | "Hard";
  buggyCode: string;
  correctCode: string;
  bugLine: number;
  bugExplanation: string;
  hint: string;
  expectedOutput: string;
  testCases: { input: string; output: string }[];
}

const FALLBACK_BUGS: AIGeneratedBug[] = [
  {
    id: "find-max-fallback",
    title: "Find Maximum Element in Array",
    description: "Find the largest number in a list of integers.",
    language: "python",
    difficulty: "Easy",
    buggyCode: "def find_max(arr):\n    max_val = 0\n    for i in arr:\n        if i < max_val:\n            max_val = i\n    return max_val\n\nprint(find_max([3, 7, 2, 9, 4]))",
    correctCode: "def find_max(arr):\n    max_val = arr[0]\n    for i in arr:\n        if i > max_val:\n            max_val = i\n    return max_val\n\nprint(find_max([3, 7, 2, 9, 4]))",
    bugLine: 4,
    bugExplanation: "The comparison operator `if i < max_val:` is inverted! It should be `if i > max_val:` to find the maximum value.",
    hint: "Look closely at the comparison operator `<` vs `>` inside the for loop.",
    expectedOutput: "9",
    testCases: [{ input: "", output: "9" }]
  },
  {
    id: "count-vowels-fallback",
    title: "Count Vowels in Sentence",
    description: "Count total vowel characters in a string.",
    language: "python",
    difficulty: "Easy",
    buggyCode: "def count_vowels(s):\n    vowels = 'aeiou'\n    count = 0\n    for char in s:\n        if char in vowels:\n            count += 2\n    return count\n\nprint(count_vowels('hello world'))",
    correctCode: "def count_vowels(s):\n    vowels = 'aeiou'\n    count = 0\n    for char in s:\n        if char in vowels:\n            count += 1\n    return count\n\nprint(count_vowels('hello world'))",
    bugLine: 6,
    bugExplanation: "The counter is incrementing by 2 instead of 1 (`count += 2`).",
    hint: "Check how much `count` increases per vowel found.",
    expectedOutput: "3",
    testCases: [{ input: "", output: "3" }]
  },
  {
    id: "palindrome-check-fallback",
    title: "Palindrome String Check",
    description: "Check if a string reads the same forwards and backwards.",
    language: "python",
    difficulty: "Medium",
    buggyCode: "def is_palindrome(s):\n    cleaned = s.lower().replace(' ', '')\n    return cleaned == cleaned[::1]\n\nprint(is_palindrome('racecar'))",
    correctCode: "def is_palindrome(s):\n    cleaned = s.lower().replace(' ', '')\n    return cleaned == cleaned[::-1]\n\nprint(is_palindrome('racecar'))",
    bugLine: 3,
    bugExplanation: "The string slice step `[::1]` does not reverse the string! It should be `[::-1]` to reverse.",
    hint: "Check the step argument in python string slicing `[::1]` vs `[::-1]`.",
    expectedOutput: "True",
    testCases: [{ input: "", output: "True" }]
  },
  {
    id: "sum-even-fallback",
    title: "Sum of Even Numbers",
    description: "Calculate the sum of all even numbers in a given list.",
    language: "python",
    difficulty: "Easy",
    buggyCode: "def sum_evens(nums):\n    total = 0\n    for n in nums:\n        if n % 2 != 0:\n            total += n\n    return total\n\nprint(sum_evens([1, 2, 3, 4, 5, 6]))",
    correctCode: "def sum_evens(nums):\n    total = 0\n    for n in nums:\n        if n % 2 == 0:\n            total += n\n    return total\n\nprint(sum_evens([1, 2, 3, 4, 5, 6]))",
    bugLine: 4,
    bugExplanation: "The modulo condition `n % 2 != 0` selects odd numbers instead of even numbers!",
    hint: "Even numbers leave remainder 0 when divided by 2 (`n % 2 == 0`).",
    expectedOutput: "12",
    testCases: [{ input: "", output: "12" }]
  }
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const difficulty = body.difficulty || "Medium";

    const systemPrompt = `You are a Senior Python Developer creating a bug hunting coding challenge for students.
You MUST return ONLY a raw JSON object with no markdown formatting or extra text.

JSON Schema required:
{
  "id": "bug-slug-id",
  "title": "Short Challenge Title",
  "description": "Brief problem statement (1 sentence)",
  "language": "python",
  "difficulty": "${difficulty}",
  "buggyCode": "def function_name(...):\\n    # buggy code here including print call at end\\nprint(function_name(...))",
  "correctCode": "def function_name(...):\\n    # fixed code here\\nprint(function_name(...))",
  "bugLine": 4,
  "bugExplanation": "Explain clearly why line X has a bug and what the fix is.",
  "hint": "Gentle hint to lead student to the fix.",
  "expectedOutput": "Expected stdout result",
  "testCases": [{"input": "", "output": "Expected stdout result"}]
}`;

    const userPrompt = `Generate a unique, realistic Python bug challenge of ${difficulty} difficulty.
The code should have a single logical defect (e.g. inverted comparison operator, off-by-one index, wrong math operator, or faulty boolean condition).
Ensure the buggy code ends with a \`print(function_name(...))\` statement so running it produces output.
Return ONLY valid JSON.`;

    try {
      const responseText = await esChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      const parsed = safeJsonParse<AIGeneratedBug>(responseText);
      if (
        parsed &&
        parsed.buggyCode &&
        parsed.correctCode &&
        parsed.expectedOutput
      ) {
        return NextResponse.json({
          ...parsed,
          id: `ai-bug-${Date.now()}`,
          language: "python",
          testCases: parsed.testCases?.length ? parsed.testCases : [{ input: "", output: parsed.expectedOutput }]
        });
      }
    } catch (aiErr) {
      console.warn("AI generate-bug worker failed, picking random fallback:", aiErr);
    }

    // Pick a random fallback challenge if AI is offline
    const fallback = FALLBACK_BUGS[Math.floor(Math.random() * FALLBACK_BUGS.length)];
    return NextResponse.json({
      ...fallback,
      id: `fallback-bug-${Date.now()}`
    });
  } catch (error: any) {
    console.error("Error in generate-bug route:", error);
    const fallback = FALLBACK_BUGS[0];
    return NextResponse.json({
      ...fallback,
      id: `fallback-bug-${Date.now()}`
    });
  }
}
