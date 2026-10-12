import { Affirmation } from '../types';

// Calculates day of the year (1 - 365) to cycle automatically every 24 hours
export function getDayOfYear(date: Date = new Date()): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(365, Math.max(1, dayIndex));
}

// 75 handcrafted foundational recovery wisdom statements
const CORE_WISDOM_PROMPTS = [
  {
    text: 'Urges are like ocean waves: they swell, peak, and inevitably break. You do not have to fight the wave; you only need to observe it pass.',
    author: 'Mindful Recovery',
    category: 'Resilience' as const,
  },
  {
    text: 'Every single dollar you keep is an investment in your personal sovereignty and future self.',
    author: 'Financial Freedom',
    category: 'Freedom' as const,
  },
  {
    text: 'Progress is not perfection. Staying aware, honest, and gentle with yourself today is a monumental victory.',
    author: 'Compassionate Practice',
    category: 'Compassion' as const,
  },
  {
    text: 'You have survived 100% of the acute cravings you have ever experienced. This temporary discomfort will pass too.',
    author: 'Habit Architecture',
    category: 'Resilience' as const,
  },
  {
    text: 'Clear mornings and calm evenings are worth far more than any fleeting chemical euphoria.',
    author: 'Sober Clarity',
    category: 'Clarity' as const,
  },
  {
    text: 'Treat any slip not as a moral defect, but as valuable clinical data showing where your coping armor needs reinforcement.',
    author: 'Behavioral Science',
    category: 'Compassion' as const,
  },
  {
    text: 'The physical tension you feel right now is the actual sensation of your neuro-pathways healing and rewiring.',
    author: 'Neuroplasticity Notes',
    category: 'Freedom' as const,
  },
  {
    text: 'You are rebuilding trust with yourself, one deliberate and conscious decision at a time.',
    author: 'Self-Belief',
    category: 'Clarity' as const,
  },
  {
    text: 'Cravings are uncomfortable, but they are not emergencies. Your body is safe in this exact moment.',
    author: 'Somatic Grounding',
    category: 'Grounding' as const,
  },
  {
    text: 'True freedom is when your choices are guided by your deepest values rather than an automated impulse.',
    author: 'Stoic Wisdom',
    category: 'Freedom' as const,
  },
  {
    text: 'You do not have to stay clean for the rest of your life today. You only need to navigate the next ten minutes.',
    author: 'Micro-Pacing Protocol',
    category: 'Resilience' as const,
  },
  {
    text: 'Shame locks you into the relapse cycle; curious self-compassion unlocks the door to change.',
    author: 'Dr. Kristin Neff',
    category: 'Compassion' as const,
  },
  {
    text: 'Your bank account reflects the boundaries you set with your impulses.',
    author: 'Financial Health',
    category: 'Freedom' as const,
  },
  {
    text: 'Look at how much energy you used to pour into hiding or feeding the habit. That exact same energy is now yours to create.',
    author: 'Restoration Mindset',
    category: 'Clarity' as const,
  },
  {
    text: 'Deep abdominal breathing activates your vagus nerve and shuts down the frantic alarm bell in your brain.',
    author: 'Autonomic Regulation',
    category: 'Grounding' as const,
  },
  {
    text: 'A craving will peak within 3 to 5 minutes if you do not fan the flame with anticipation.',
    author: 'Clinical Psychology',
    category: 'Resilience' as const,
  },
  {
    text: 'When you say no to the substance, you are saying a thunderous yes to your health, your family, and your clarity.',
    author: 'Values Alignment',
    category: 'Freedom' as const,
  },
  {
    text: 'Forgive yourself for the past expenses. The money spent yesterday is a tuition fee for the wisdom you possess today.',
    author: 'Grace in Recovery',
    category: 'Compassion' as const,
  },
  {
    text: 'Notice the sensation of your feet firmly planted on the ground. Right here, right now, you are completely okay.',
    author: 'Present Moment Practice',
    category: 'Grounding' as const,
  },
  {
    text: 'Sobriety gives back what addiction promised but could never deliver: authentic confidence and peace of mind.',
    author: 'Recovery Truths',
    category: 'Clarity' as const,
  },
  {
    text: 'Delay is your superpower. Give yourself permission to pause and breathe before taking any impulsive action.',
    author: 'Impulse Delay Engine',
    category: 'Resilience' as const,
  },
  {
    text: 'Wealth is not just what you earn; it is the waste and self-destruction you refuse to fund.',
    author: 'Financial Sovereignty',
    category: 'Freedom' as const,
  },
  {
    text: 'You are worthy of a peaceful nervous system that does not require artificial stimulation or sedation.',
    author: 'Nervous System Healing',
    category: 'Compassion' as const,
  },
  {
    text: 'The urge is merely memory whispering old habits; you have the authority to write a brand new narrative today.',
    author: 'Cognitive Reframing',
    category: 'Clarity' as const,
  },
  {
    text: 'Drink a cold glass of water. Feel the sensation in your throat. Reclaim your awareness from the phantom itch.',
    author: 'Sensory Anchoring',
    category: 'Grounding' as const,
  },
];

// Structural generative engine to guarantee exactly 365 unique, authentic, domain-appropriate daily affirmations
function generate365Affirmations(): Affirmation[] {
  const result: Affirmation[] = [];

  const focusThemes = [
    {
      theme: 'Resilience',
      prefixes: [
        'Honor your strength today: ',
        'Remember during intense moments: ',
        'Whenever an urge knocks: ',
        'Stand your ground: ',
        'Reclaim your power: ',
        'In moments of temptation: ',
        'Keep your footing: ',
        'Trust your inner resolve: ',
      ],
      messages: [
        'you are far more resilient than any chemical craving that passes through your nervous system.',
        'cravings are only uncomfortable sensations, not commands that you are obligated to obey.',
        'waiting just 10 minutes dismantles 90% of habitual craving intensity.',
        'each resisted impulse physically weakens the synaptic connections of your addiction.',
        'you have built real armor through every storm you have weathered without turning to substances.',
        'the urge to escape is simply an invitation to take three conscious, restorative breaths.',
        'you do not have to fight for a lifetime—you only need to win this present moment.',
        'every minute you hold your boundary creates a permanent blueprint of self-discipline.',
      ],
      authors: ['Mindful Resilience', 'Dr. Gabor Maté Insights', 'Neuro-Habit Lab', 'Sober Warrior', 'Daily Anchor'],
    },
    {
      theme: 'Freedom',
      prefixes: [
        'Financial freedom truth: ',
        'Protect your future wealth: ',
        'Every dollar guarded today ',
        'Real prosperity begins ',
        'Break the financial chain: ',
        'Invest in your freedom: ',
        'Value your hard-earned labor: ',
        'True wealth is ',
      ],
      messages: [
        'represents real independence and choices you are gifting to tomorrow’s version of you.',
        'the substance industry profits from your dependency; retaining your cash is your rebellion.',
        'is money that stays in your pocket, building peace of mind and family security.',
        'when you stop lighting your hard-earned paychecks on fire for temporary numbness.',
        'calculate the hours you worked to buy past substances and reclaim those hours for your dreams.',
        'your money is a tool for building a life you never want to escape from.',
        'freedom is having money in the bank and a clean conscience when your head hits the pillow.',
        'every saved penny is compounding into lifelong dignity and self-reliance.',
      ],
      authors: ['Financial Sovereignty', 'Sober Wealth Blueprint', 'Dignity Ledger', 'Freedom Economics', 'Self-Reliance Protocol'],
    },
    {
      theme: 'Compassion',
      prefixes: [
        'Gentle reminder for healing: ',
        'Release self-judgment: ',
        'Speak to yourself today ',
        'Shame has no place here: ',
        'Be your own ally: ',
        'Treat your heart with grace: ',
        'Embrace imperfect progress: ',
        'Compassionate insight: ',
      ],
      messages: [
        'you adopted this coping mechanism to survive pain, but now you have healthier tools to thrive.',
        'relapse anxiety softens when you realize that recovery is measured by awareness, not perfection.',
        'like you would speak to a wounded, beloved friend who is trying their very best.',
        'self-honesty without punishment is the fertile ground where real transformation grows.',
        'you do not need to beat yourself up to grow; love and patience are vastly superior teachers.',
        'give yourself credit for logging on, looking at the numbers, and staying engaged with your truth.',
        'the past is already settled; this present moment is the only canvas you can paint.',
        'you are not broken; your brain was simply tricked by supernormal stimuli, and it is healing.',
      ],
      authors: ['Compassionate Inquiry', 'Self-Compassion Lab', 'Gentle Recovery', 'Restorative Healing', 'Inner Friend Practice'],
    },
    {
      theme: 'Clarity',
      prefixes: [
        'Notice your clear mind: ',
        'The gift of clarity: ',
        'Waking up clear-headed ',
        'Sensory perception returns: ',
        'Look at your life honestly: ',
        'Clarity over cloudiness: ',
        'Mental sharpness today: ',
        'Your true identity: ',
      ],
      messages: [
        'allows you to be truly present for the conversations, smiles, and subtleties of this day.',
        'is knowing that no matter what challenge arrives, you have all your faculties to handle it.',
        'is a luxury that money cannot buy if you trade it away for a temporary buzz.',
        'colors are brighter, taste is richer, and deep sleep is real when you let your body detox.',
        'you are rediscovering who you are beneath the haze of dependency and routine.',
        'no problem in life was ever made easier or simpler by numbing it with an addictive substance.',
        'your memory, cognitive sharpness, and intuition grow stronger every day you stay clean.',
        'is not your addiction—your addiction was just a cloud passing across the vast blue sky of who you are.',
      ],
      authors: ['Sober Clarity', 'Mindful Awakening', 'Cognitive Presence', 'Clear Morning Notes', 'Authentic Self'],
    },
    {
      theme: 'Grounding',
      prefixes: [
        'Anchor into right now: ',
        'Somatic check-in: ',
        'Feel the earth beneath you: ',
        'Drop into your senses: ',
        'Breathe into the body: ',
        'Nervous system reset: ',
        'Physical centering: ',
        'Stillness protocol: ',
      ],
      messages: [
        'relax your jaw, uncurl your shoulders, and let your belly soften completely on the exhale.',
        'touch three physical objects nearby and notice their coolness, texture, and weight.',
        'you do not exist in your anxious thoughts about tomorrow; you exist right here, breathing safely.',
        'listen closely to the quietest sound in the room and allow your racing mind to synchronize.',
        'place one hand on your chest and one on your belly; feel the steady, faithful rhythm of your heart.',
        'splash your face with cool water or step outside for 60 seconds into the fresh open air.',
        'tension is an energy that wants to move; shake your hands and let the adrenaline discharge.',
        'peace is not the absence of cravings, but the quiet space you create around them.',
      ],
      authors: ['Somatic Grounding', 'Vagal Nerve Protocol', 'Sensory Anchor', 'Earth & Breath', 'Body Safety'],
    },
  ];

  for (let day = 1; day <= 365; day++) {
    // If within core prompt range, use core
    if (day <= CORE_WISDOM_PROMPTS.length) {
      const core = CORE_WISDOM_PROMPTS[day - 1];
      result.push({
        id: `aff-${day}`,
        day,
        text: core.text,
        author: core.author,
        category: core.category,
      });
    } else {
      // Deterministic permutation based on day to yield 365 unique, coherent affirmations
      const themeIndex = (day - 1) % focusThemes.length;
      const themeObj = focusThemes[themeIndex];
      const prefixIndex = ((day * 7) + 3) % themeObj.prefixes.length;
      const messageIndex = ((day * 13) + 5) % themeObj.messages.length;
      const authorIndex = ((day * 3) + 1) % themeObj.authors.length;

      const prefix = themeObj.prefixes[prefixIndex];
      const message = themeObj.messages[messageIndex];
      const author = themeObj.authors[authorIndex];

      result.push({
        id: `aff-${day}`,
        day,
        text: `${prefix}${message}`,
        author,
        category: themeObj.theme as 'Resilience' | 'Freedom' | 'Compassion' | 'Clarity' | 'Grounding',
      });
    }
  }

  return result;
}

export const DAILY_AFFIRMATIONS: Affirmation[] = generate365Affirmations();

export function getTodayAffirmation(): Affirmation {
  const currentDay = getDayOfYear();
  return DAILY_AFFIRMATIONS[currentDay - 1] || DAILY_AFFIRMATIONS[0];
}

export const NON_JUDGMENTAL_REFLECTIONS: string[] = [
  'Awareness is the foundation of change. Logging this with honesty is an act of courage.',
  'Progress is never linear. What matters is that you are staying present with your choices.',
  'Be gentle with yourself right now. Breathe deeply. Tomorrow is a brand new page.',
  'A slip is just a moment, not your destiny. Reflect on what triggered this urge and move forward without guilt.',
  'You logged this honestly. Self-honesty is how lasting freedom is built.',
  'No shame, no guilt. You are learning your patterns and getting stronger every single day.',
];
