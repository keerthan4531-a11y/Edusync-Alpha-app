import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Stage 1 Content...')

  // Delete existing Stage 1 content to prevent duplicates during multiple seeds
  await prisma.stage1Content.deleteMany()

  // 1. Reading Passages
  const readingPassages = [
    {
      type: 'READING',
      title: 'The Great Barrier Reef',
      content: "The Great Barrier Reef is the world's largest coral reef system, extending over 2,300 kilometers along Australia's coast. It consists of thousands of individual reefs and hundreds of islands, providing a home for a diverse range of marine life, including colorful fish, sea turtles, and whales. However, the reef faces significant threats from rising ocean temperatures, which cause coral bleaching, and pollution from nearby land development. Conservation efforts are underway to protect this natural wonder, but global action on climate change remains the most critical factor for its long-term survival.",
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 1,
          question: "Where is the Great Barrier Reef located and how long is it?",
          options: [
            "It is located off the coast of Australia and is over 2,300 kilometers long.",
            "It is located near Hawaii and is 1,000 kilometers long.",
            "It is located in the Indian Ocean and is 500 kilometers long.",
            "It is located off the coast of Japan and is 2,300 kilometers long."
          ],
          correctIndex: 0
        },
        {
          id: 2,
          question: "What is the most critical factor for the reef's long-term survival?",
          options: [
            "Stopping coastal land development.",
            "Global action on climate change.",
            "Building more aquariums.",
            "Reducing the fish population."
          ],
          correctIndex: 1
        }
      ])
    },
    {
      type: 'READING',
      title: 'Marie Curie',
      content: "Marie Curie was a pioneering physicist and chemist, born in Poland in 1867. She is best known for her discovery of radium and polonium, and her extensive research on radioactivity. Curie's work was groundbreaking, as she became the first woman to win a Nobel Prize and the only person to win Nobel Prizes in two different scientific fields: Physics and Chemistry. Despite the challenges she faced as a woman in a male-dominated field, her dedication and brilliance paved the way for future generations of scientists. She also developed mobile X-ray units during World War I to help treat wounded soldiers.",
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 1,
          question: "What elements did Marie Curie discover?",
          options: [
            "Oxygen and Hydrogen",
            "Uranium and Plutonium",
            "Radium and Polonium",
            "Carbon and Nitrogen"
          ],
          correctIndex: 2
        },
        {
          id: 2,
          question: "What was unique about Marie Curie's Nobel Prize achievements?",
          options: [
            "She was the youngest person to ever win a Nobel Prize.",
            "She won three Nobel Prizes in the same field.",
            "She was the first woman to win one and the only person to win in two different scientific fields.",
            "She won a Nobel Prize without publishing any research papers."
          ],
          correctIndex: 2
        }
      ])
    }
  ]

  // 2. Listening Challenges (Fill the Beats / Audio snippets)
  const listeningChallenges = [
    {
      type: 'LISTENING',
      title: 'Daily Routine',
      // For a real app, this would be an audio URL. For now, we simulate audio playback text on the frontend 
      // or use browser TTS.
      content: "I usually wake up at 7 AM. I brush my teeth, take a shower, and then have breakfast. For breakfast, I like to eat cereal and drink a cup of coffee. After that, I take the bus to work.",
      difficulty: 'easy',
      questions: JSON.stringify([
        {
          id: 1,
          question: "What time does the speaker wake up?",
          options: ["6 AM", "7 AM", "8 AM", "9 AM"],
          correctIndex: 1
        },
        {
          id: 2,
          question: "What does the speaker have for breakfast?",
          options: ["Eggs and toast", "Pancakes", "Cereal and coffee", "Oatmeal and juice"],
          correctIndex: 2
        }
      ])
    },
    {
      type: 'LISTENING',
      title: 'A Weekend Trip',
      content: "Last weekend, my family and I went to the mountains. We rented a small cabin near a beautiful lake. During the day, we hiked through the forest and enjoyed the fresh air. In the evening, we built a campfire and roasted marshmallows.",
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 1,
          question: "Where did the family go for the weekend?",
          options: ["To the beach", "To the city", "To the mountains", "To a theme park"],
          correctIndex: 2
        },
        {
          id: 2,
          question: "What did they do in the evening?",
          options: ["Watched a movie", "Built a campfire and roasted marshmallows", "Went for a night swim", "Played board games"],
          correctIndex: 1
        }
      ])
    },
    {
      type: 'LISTENING',
      title: 'Grid Navigation Practice',
      content: "Welcome to campus grid navigation. Start at the Library which is at coordinates row 1, col 1. Go one block east to coordinates row 1, col 2. From there, go one block south to row 2, col 2. Finally, go one block south again to arrive at the Hostel at coordinates row 3, col 2. Trace this path step-by-step.",
      difficulty: 'medium',
      questions: JSON.stringify({
        isDirection: true,
        gridSize: 5,
        start: { row: 1, col: 1 },
        end: { row: 3, col: 2 },
        correctPath: [
          { row: 1, col: 1 },
          { row: 1, col: 2 },
          { row: 2, col: 2 },
          { row: 3, col: 2 }
        ],
        landmarks: [
          { name: "Library", row: 1, col: 1 },
          { name: "Hostel", row: 3, col: 2 },
          { name: "Auditorium", row: 0, col: 3 },
          { name: "Cafeteria", row: 4, col: 0 }
        ]
      })
    },
    {
      type: 'LISTENING',
      title: 'Voice Tone Analysis',
      content: "I am absolutely thrilled and excited about our new campus research project!",
      difficulty: 'easy',
      questions: JSON.stringify({
        isToneAnalysis: true,
        question: "Based on the audio snippet, what is the emotional tone of the speaker?",
        options: ["Sarcastic", "Excited", "Anxious", "Bored"],
        correctIndex: 1
      })
    }
  ]

  // 3. Writing Prompts
  const writingPrompts = [
    {
      type: 'WRITING',
      title: 'Describe Your Hometown',
      content: "Write a short paragraph (3-5 sentences) describing your hometown. What do you like most about it?",
      difficulty: 'easy',
      questions: null
    },
    {
      type: 'WRITING',
      title: 'The Impact of Technology',
      content: "How has technology changed the way we learn? Write a short paragraph expressing your opinion.",
      difficulty: 'medium',
      questions: null
    }
  ]

  // 4. Speaking Prompts (Read Aloud)
  const speakingPrompts = [
    {
      type: 'SPEAKING',
      title: 'Read Aloud 1',
      content: "The weather is beautiful today with clear skies and a gentle breeze.",
      difficulty: 'easy',
      questions: null
    },
    {
      type: 'SPEAKING',
      title: 'Read Aloud 2',
      content: "Learning new languages opens doors to different cultures and opportunities.",
      difficulty: 'medium',
      questions: null
    }
  ]

  // 5. Vocabulary Quizzes (Meaning Check)
  const vocabMeaningChallenges = [
    {
      type: 'VOCAB_MEANING',
      title: 'eloquent',
      content: 'eloquent',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 1,
          word: 'eloquent',
          pronunciation: '/ˈɛləkwənt/',
          meaning: 'fluent or persuasive in speaking or writing',
          tamil: 'சொல்லாற்றல் மிக்க (fluent or persuasive)',
          example: 'His eloquent speech moved the entire audience to tears.',
          options: [
            'fluent or persuasive in speaking or writing',
            'difficult to understand or parse',
            'loud, noisy and disruptive',
            'extremely slow and hesitant'
          ],
          correct: 0
        }
      ])
    },
    {
      type: 'VOCAB_MEANING',
      title: 'resilient',
      content: 'resilient',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 2,
          word: 'resilient',
          pronunciation: '/rɪˈzɪliənt/',
          meaning: 'able to withstand or recover quickly from difficult conditions',
          tamil: 'மீள்திறன் கொண்ட (able to bounce back)',
          example: 'The local economy has proven remarkably resilient in the face of the recession.',
          options: [
            'easily broken or fragile',
            'able to withstand or recover quickly from difficult conditions',
            'indifferent to changes',
            'stubborn and unyielding'
          ],
          correct: 1
        }
      ])
    },
    {
      type: 'VOCAB_MEANING',
      title: 'pragmatic',
      content: 'pragmatic',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 3,
          word: 'pragmatic',
          pronunciation: '/præɡˈmætɪk/',
          meaning: 'dealing with things sensibly and realistically in a way that is based on practical considerations',
          tamil: 'நடைமுறைக்குரிய (practical approach)',
          example: 'She took a pragmatic approach to managing the budget.',
          options: [
            'extremely idealistic and theoretical',
            'dealing with things sensibly and realistically based on practical considerations',
            'lazy and passive',
            'unpredictable and moody'
          ],
          correct: 1
        }
      ])
    },
    {
      type: 'VOCAB_MEANING',
      title: 'meticulous',
      content: 'meticulous',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 4,
          word: 'meticulous',
          pronunciation: '/mɪˈtɪkjələs/',
          meaning: 'showing great attention to detail; very careful and precise',
          tamil: 'மிகவும் கவனமாக (careful & detailed)',
          example: 'The researcher kept meticulous records of the experiment.',
          options: [
            'messy and disorganized',
            'showing great attention to detail; very careful and precise',
            'quick and careless',
            'fearful and hesitant'
          ],
          correct: 1
        }
      ])
    },
    {
      type: 'VOCAB_MEANING',
      title: 'articulate',
      content: 'articulate',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 5,
          word: 'articulate',
          pronunciation: '/ɑːˈtɪkjʊlət/',
          meaning: 'having or showing the ability to speak fluently and coherently',
          tamil: 'தெளிவாக பேசக்கூடிய (clear & fluent speaking)',
          example: 'She is an articulate speaker who expresses her ideas clearly.',
          options: [
            'having or showing the ability to speak fluently and coherently',
            'unable to express thoughts clearly',
            'loud and argumentative',
            'speaking multiple languages fluently'
          ],
          correct: 0
        }
      ])
    }
  ]

  // 6. Vocabulary Quizzes (Fill in the blanks)
  const vocabFillChallenges = [
    {
      type: 'VOCAB_FILL',
      title: 'eloquent fill',
      content: 'eloquent',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 1,
          word: 'eloquent',
          sentence: 'The class president delivered an ______ presentation that convinced the board.',
          hint: 'fluent or persuasive in speaking or writing',
          tamil: 'சொல்லாற்றல் மிக்க (fluent or persuasive)',
          example: 'His eloquent speech moved the entire audience.'
        }
      ])
    },
    {
      type: 'VOCAB_FILL',
      title: 'resilient fill',
      content: 'resilient',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 2,
          word: 'resilient',
          sentence: 'Despite facing many setbacks, the startup remained ______ and eventually succeeded.',
          hint: 'able to withstand or recover quickly from difficult conditions',
          tamil: 'மீள்திறன் கொண்ட (able to bounce back)',
          example: 'They are resilient and soon rebuilt after the storm.'
        }
      ])
    },
    {
      type: 'VOCAB_FILL',
      title: 'pragmatic fill',
      content: 'pragmatic',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 3,
          word: 'pragmatic',
          sentence: 'Instead of dreaming about ideal solutions, we must make a ______ decision today.',
          hint: 'dealing with things sensibly and realistically based on practical considerations',
          tamil: 'நடைமுறைக்குரிய (practical approach)',
          example: 'A pragmatic view keeps us grounded.'
        }
      ])
    },
    {
      type: 'VOCAB_FILL',
      title: 'meticulous fill',
      content: 'meticulous',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 4,
          word: 'meticulous',
          sentence: "The engineer's ______ design ensured that the bridge had zero safety flaws.",
          hint: 'showing great attention to detail; very careful and precise',
          tamil: 'மிகவும் கவனமாக (careful & detailed)',
          example: 'Meticulous research yields exact results.'
        }
      ])
    },
    {
      type: 'VOCAB_FILL',
      title: 'articulate fill',
      content: 'articulate',
      difficulty: 'medium',
      questions: JSON.stringify([
        {
          id: 5,
          word: 'articulate',
          sentence: 'Students must learn to ______ their thoughts clearly during presentations.',
          hint: 'express (an idea or feeling) fluently and coherently',
          tamil: 'தெளிவாக பேசக்கூடிய (clear & fluent speaking)',
          example: 'We must articulate our vision clearly.'
        }
      ])
    }
  ]

  const allContent = [
    ...readingPassages,
    ...listeningChallenges,
    ...writingPrompts,
    ...speakingPrompts,
    ...vocabMeaningChallenges,
    ...vocabFillChallenges
  ]

  for (const item of allContent) {
    await prisma.stage1Content.create({
      data: item
    })
  }

  console.log(`Seeded ${allContent.length} Stage 1 content items (including vocabulary challenges).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
