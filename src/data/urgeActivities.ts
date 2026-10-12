import { UrgeActivity } from '../types';

export const URGE_ACTIVITIES: UrgeActivity[] = [
  // --- < 2 Mins ---
  {
    id: 'act-breathe-478',
    title: '4-7-8 Parasympathetic Reset',
    duration_category: '<2min',
    duration_label: '90 Seconds',
    description: 'Scientifically drops your heart rate and signals safety to your nervous system.',
    type: 'breathing',
    instructions: [
      'Exhale completely through your mouth with a whoosh sound.',
      'Close your mouth and inhale quietly through your nose for 4 seconds.',
      'Hold your breath for a count of 7 seconds.',
      'Exhale forcefully through your mouth for 8 seconds.',
      'Repeat 4 cycles. Notice your shoulders dropping.',
    ],
  },
  {
    id: 'act-cold-shock',
    title: 'Diver’s Reflex Cold Water Shock',
    duration_category: '<2min',
    duration_label: '60 Seconds',
    description: 'Triggers the mammalian dive reflex, rapidly downregulating the amygdala and craving spike.',
    type: 'cold_shock',
    instructions: [
      'Fill a sink or bowl with ice cold water, or grab an ice cube.',
      'Splash your face thoroughly with icy water for 30 seconds, or hold an ice cube firmly in your palm.',
      'Focus intensely on the crisp cold temperature shock on your skin.',
      'Dry your face slowly while taking 3 slow, deep abdominal breaths.',
    ],
  },
  {
    id: 'act-physical-shake',
    title: '60-Second Neurogenic Shakeout',
    duration_category: '<2min',
    duration_label: '1 Minute',
    description: 'Discharge trapped sympathetic adrenaline by shaking your limbs vigorously.',
    type: 'physical',
    instructions: [
      'Stand up and shake your hands and wrists vigorously like shaking off water.',
      'Bounce gently on your heels and shake your arms, shoulders, and legs.',
      'Let your jaw go slack and exhale loudly.',
      'Stop abruptly and feel the tingling calm energy spreading through your body.',
    ],
  },

  // --- 5–15 Mins ---
  {
    id: 'act-grounding-54321',
    title: '5-4-3-2-1 Sensory Grounding',
    duration_category: '5-15min',
    duration_label: '5–8 Minutes',
    description: 'Pulls attention out of internal obsessive craving loops and anchors you in physical reality.',
    type: 'grounding',
    instructions: [
      'Acknowledge 5 things you can see right in front of you (notice their color and shadow).',
      'Acknowledge 4 things you can physically feel (the floor beneath your feet, fabric of your shirt).',
      'Acknowledge 3 distinct sounds you can hear in your environment.',
      'Acknowledge 2 things you can smell (or two scents you deeply enjoy).',
      'Acknowledge 1 thing you can taste (or take a sip of fresh cold water).',
    ],
  },
  {
    id: 'act-urge-delay-timer',
    title: '10-Minute Craving Delay Protocol',
    duration_category: '5-15min',
    duration_label: '10 Minutes',
    description: 'Cravings peak at 3–5 minutes and sharply drop. Agree to wait just 10 minutes before deciding.',
    type: 'timer',
    instructions: [
      'Start the 10-minute countdown clock.',
      'Commit to yourself: "I do not have to fight this forever; I only need to wait 10 minutes."',
      'Observe the physical urge like a spectator watching a wave swell and crest.',
      'At 10 minutes, evaluate if the acute physical urge has softened.',
    ],
  },
  {
    id: 'act-quick-circuit',
    title: '25 Pushups / High Knees Burst',
    duration_category: '5-15min',
    duration_label: '7 Minutes',
    description: 'Floods your bloodstream with natural endorphins and dopamine without the substance.',
    type: 'physical',
    instructions: [
      'Do 20–25 pushups or 40 jumping jacks with high energy.',
      'Follow immediately with 30 seconds of high knees or a brisk stair climb.',
      'Drink a full glass of cold water.',
      'Check in: Notice how physical exertion satisfied the craving for stimulation.',
    ],
  },

  // --- 15+ Mins ---
  {
    id: 'act-journal-reflection',
    title: 'Craving Autopsy & Cost Journal',
    duration_category: '15+min',
    duration_label: '15–20 Minutes',
    description: 'Decouple impulse from action by writing down the exact trigger and future consequences.',
    type: 'journal',
    instructions: [
      'What exact event, thought, or emotion triggered this craving 5 minutes ago?',
      'Play the tape forward: If I give in right now, how will I feel 2 hours from now? Tomorrow morning?',
      'How much money will I protect today by walking away?',
      'What is one alternative reward I can give myself instead (tea, walk, shower, call a friend)?',
    ],
  },
  {
    id: 'act-change-scenery',
    title: 'Complete Environment Swap Walk',
    duration_category: '15+min',
    duration_label: '20 Minutes',
    description: 'Break habitual sensory cue-loops by immediately leaving the physical room or building.',
    type: 'environment',
    instructions: [
      'Put on your shoes and leave your current room or building immediately.',
      'Leave your wallet and substance triggers behind.',
      'Walk at a steady pace for 10 minutes in one direction, paying attention to the sky and trees.',
      'Turn around and walk back. By the time you return, the acute cue-loop is broken.',
    ],
  },
];
