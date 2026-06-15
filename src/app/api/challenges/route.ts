import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const DEFAULT_CHALLENGES = [
  {
    id: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you cannot use the same element twice.",
    difficulty: "Easy",
    languages: ["python", "javascript"],
    rewardXP: 100,
    rewardCoins: 50,
    initialCode: {
      python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
      javascript: "function twoSum(nums, target) {\n    // Write your code here\n    return [];\n}"
    },
    harnesses: {
      python: "\nimport json, sys\ntry:\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        print(twoSum(json.loads(lines[0]), int(lines[1])))\nexcept Exception as e:\n    print(e)",
      javascript: "\nconst fs = require('fs');\ntry {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\n    if (input.length >= 2) {\n        console.log(JSON.stringify(twoSum(JSON.parse(input[0]), parseInt(input[1]))));\n    }\n} catch (e) {\n    console.error(e);\n}"
    },
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]" },
      { input: "[3,2,4]\n6", output: "[1,2]" }
    ]
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    difficulty: "Easy",
    languages: ["python", "javascript"],
    rewardXP: 75,
    rewardCoins: 35,
    initialCode: {
      python: "def reverseString(s):\n    # Write your code here\n    return s[::-1]",
      javascript: "function reverseString(s) {\n    // Write your code here\n    return s.split('').reverse().join('');\n}"
    },
    harnesses: {
      python: "\nimport sys\ntry:\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        print(reverseString(lines[0].strip('\"')))\nexcept:\n    pass",
      javascript: "\nconst fs = require('fs');\ntry {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\n    console.log(reverseString(input.replace(/\"/g, '')));\n} catch (e) {}\n"
    },
    testCases: [
      { input: "\"hello\"", output: "olleh" },
      { input: "\"Hannah\"", output: "hannaH" }
    ]
  },
  {
    id: "factorial",
    title: "Factorial",
    description: "Write a recursive function to calculate the factorial of a positive integer n.",
    difficulty: "Medium",
    languages: ["python", "javascript"],
    rewardXP: 120,
    rewardCoins: 60,
    initialCode: {
      python: "def factorial(n):\n    # Write your code here\n    pass",
      javascript: "function factorial(n) {\n    // Write your code here\n    return 1;\n}"
    },
    harnesses: {
      python: "\nimport sys\ntry:\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        print(factorial(int(lines[0])))\nexcept:\n    pass",
      javascript: "\nconst fs = require('fs');\ntry {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\n    console.log(factorial(parseInt(input)));\n} catch (e) {}\n"
    },
    testCases: [
      { input: "5", output: "120" },
      { input: "3", output: "6" }
    ]
  }
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let problems = await db.problem.findMany();

    // Auto-seed if database is empty
    if (problems.length === 0) {
      await db.$transaction(
        DEFAULT_CHALLENGES.map(ch =>
          db.problem.create({
            data: {
              id: ch.id,
              title: ch.title,
              description: ch.description,
              difficulty: ch.difficulty,
              languageSupport: ch.languages.join(","),
              testCases: JSON.stringify({
                rewardXP: ch.rewardXP,
                rewardCoins: ch.rewardCoins,
                initialCode: ch.initialCode,
                harnesses: ch.harnesses,
                testCases: ch.testCases
              })
            }
          })
        )
      );
      problems = await db.problem.findMany();
    }

    // Map DB structures to Frontend Challenge interface
    const challenges = problems.map(prob => {
      let extra = {
        rewardXP: 100,
        rewardCoins: 50,
        initialCode: {},
        harnesses: {},
        testCases: []
      };
      try {
        extra = JSON.parse(prob.testCases);
      } catch (e) {
        console.error("Failed to parse testCases JSON for problem", prob.id, e);
      }

      return {
        id: prob.id,
        title: prob.title,
        description: prob.description,
        difficulty: prob.difficulty as "Easy" | "Medium" | "Hard",
        languages: prob.languageSupport.split(","),
        rewardXP: extra.rewardXP || 100,
        rewardCoins: extra.rewardCoins || 50,
        initialCode: extra.initialCode || {},
        harnesses: extra.harnesses || {},
        testCases: extra.testCases || []
      };
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Failed to fetch/seed problems:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}
