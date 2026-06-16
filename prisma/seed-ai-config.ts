/**
 * Seed default AI model configurations for INIXA AI
 * Run with: npx tsx prisma/seed-ai-config.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CONFIGS = [
  // Stage 1 - Communication (lighter models for fast chat responses)
  {
    stage: 'stage-1',
    role: 'ALL',
    feature: 'chat',
    primaryModel: 'gemini-2.5-flash',
    fallback1: 'gpt-4o-mini',
    fallback2: 'deepseek-v3',
    fallback3: 'llama-3.3-70b',
    fallback4: 'qwq-32b',
    fallback5: 'mistral-large',
  },
  {
    stage: 'stage-1',
    role: 'ALL',
    feature: 'writing-grade',
    primaryModel: 'gpt-4o',
    fallback1: 'gemini-2.5-flash',
    fallback2: 'claude-sonnet-4',
    fallback3: 'deepseek-v3',
    fallback4: 'llama-3.3-70b',
    fallback5: 'qwq-32b',
  },
  // Stage 2 - Coding (need good code understanding)
  {
    stage: 'stage-2',
    role: 'ALL',
    feature: 'code-review',
    primaryModel: 'gpt-4o',
    fallback1: 'claude-sonnet-4',
    fallback2: 'gemini-2.5-flash',
    fallback3: 'deepseek-v3',
    fallback4: 'llama-3.3-70b',
    fallback5: 'grok-3',
  },
  {
    stage: 'stage-2',
    role: 'ALL',
    feature: 'chat',
    primaryModel: 'deepseek-v3',
    fallback1: 'gpt-4o-mini',
    fallback2: 'gemini-2.5-flash',
    fallback3: 'llama-3.3-70b',
    fallback4: 'qwq-32b',
    fallback5: 'mistral-large',
  },
  // Stage 3 - Projects (creative + technical)
  {
    stage: 'stage-3',
    role: 'ALL',
    feature: 'idea-gen',
    primaryModel: 'gpt-4o',
    fallback1: 'claude-sonnet-4',
    fallback2: 'gemini-2.5-flash',
    fallback3: 'grok-3',
    fallback4: 'deepseek-v3',
    fallback5: 'llama-3.3-70b',
  },
  // Stage 4 - Career Prep
  {
    stage: 'stage-4',
    role: 'ALL',
    feature: 'mock-interview',
    primaryModel: 'gpt-4o',
    fallback1: 'claude-sonnet-4',
    fallback2: 'gemini-2.5-flash',
    fallback3: 'grok-3',
    fallback4: 'deepseek-v3',
    fallback5: 'llama-3.3-70b',
  },
  {
    stage: 'stage-4',
    role: 'ALL',
    feature: 'resume-scorer',
    primaryModel: 'gemini-2.5-flash',
    fallback1: 'gpt-4o-mini',
    fallback2: 'deepseek-v3',
    fallback3: 'llama-3.3-70b',
    fallback4: 'qwq-32b',
    fallback5: 'mistral-large',
  },
  // General (fallback for any unmatched context)
  {
    stage: 'general',
    role: 'ALL',
    feature: 'chat',
    primaryModel: 'gemini-2.5-flash',
    fallback1: 'gpt-4o-mini',
    fallback2: 'deepseek-v3',
    fallback3: 'llama-3.3-70b',
    fallback4: 'qwq-32b',
    fallback5: 'mistral-large',
  },
];

async function seedAIConfig() {
  console.log('🤖 Seeding INIXA AI model configurations...');

  for (const config of DEFAULT_CONFIGS) {
    await prisma.aIModelConfig.upsert({
      where: {
        stage_role_feature: {
          stage: config.stage,
          role: config.role,
          feature: config.feature,
        },
      },
      create: config,
      update: config,
    });
    console.log(`  ✅ ${config.stage} / ${config.role} / ${config.feature} → ${config.primaryModel}`);
  }

  // Create default admin settings
  const existingSettings = await prisma.aIAdminSettings.findFirst();
  if (!existingSettings) {
    await prisma.aIAdminSettings.create({
      data: {
        g4fBaseUrl: 'https://g4f.dev',
        autoUpdateEnabled: true,
        proxyEnabled: true,
      },
    });
    console.log('  ✅ Default admin settings created');
  }

  console.log('\n✨ AI configuration seeded successfully!');
}

seedAIConfig()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
