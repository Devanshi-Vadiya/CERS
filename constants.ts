import { EmergencyCategory, EmergencyType, Volunteer } from './types';

// Updated Palette:
// Primary Emergency: #FF4757 (Red)
// Safe: #2ED573 (Green)
// Trust: #3742FA (Blue)
// Warning: #FFA502 (Orange)

export const EMERGENCY_TYPES: EmergencyType[] = [
  {
    id: 'heart_attack',
    name: 'Heart Attack',
    icon: 'HeartPulse',
    category: EmergencyCategory.CRITICAL,
    color: 'bg-[#FF4757]',
    instructions: [
      'Call emergency services immediately.',
      'Have person sit down & rest.',
      'Loosen tight clothing.',
      'Administer aspirin if available (chew).',
      'Begin CPR if unconscious/not breathing.'
    ],
    do: ['Keep patient calm', 'Loosen clothing', 'Check breathing'],
    dont: ['Do not leave alone', 'No food/water', 'No driving']
  },
  {
    id: 'accident',
    name: 'Accident',
    icon: 'Car',
    category: EmergencyCategory.CRITICAL,
    color: 'bg-[#FF4757]',
    instructions: [
      'Ensure your safety first.',
      'Do not move injured person unless in danger.',
      'Apply pressure to bleeding.',
      'Keep warm.'
    ],
    do: ['Stop bleeding', 'Keep warm', 'Check responsiveness'],
    dont: ['Do not move patient', 'Do not remove embedded objects']
  },
  {
    id: 'bleeding',
    name: 'Bleeding',
    icon: 'Droplets',
    category: EmergencyCategory.URGENT,
    color: 'bg-[#FF4757]',
    instructions: [
      'Apply direct pressure with clean cloth.',
      'Elevate injured area above heart.',
      'Add more cloth if soaking through.'
    ],
    do: ['Apply pressure', 'Elevate wound', 'Keep lying down'],
    dont: ['Do not remove dressing', 'No tourniquet unless trained']
  },
  {
    id: 'burns',
    name: 'Fire / Burns',
    icon: 'Flame',
    category: EmergencyCategory.URGENT,
    color: 'bg-[#FF4757]',
    instructions: [
      'Cool with cool running water (10-20m).',
      'Remove jewelry/tight items.',
      'Cover loosely with sterile gauze.'
    ],
    do: ['Cool with water', 'Cover loosely', 'Elevate area'],
    dont: ['No ice', 'Do not burst blisters', 'No creams']
  },
  {
    id: 'stroke',
    name: 'Stroke',
    icon: 'Brain',
    category: EmergencyCategory.CRITICAL,
    color: 'bg-[#FFA502]',
    instructions: [
      'F.A.S.T: Face, Arms, Speech, Time.',
      'Call emergency services immediately.',
      'Note time symptoms started.',
      'Lay person on side if unconscious.'
    ],
    do: ['Check Face drooping', 'Check Arm weakness', 'Check Speech'],
    dont: ['No medication', 'No food/drink', 'Do not let them sleep']
  },
  {
    id: 'breathing',
    name: 'Breathing',
    icon: 'Wind',
    category: EmergencyCategory.MODERATE,
    color: 'bg-[#FFA502]',
    instructions: [
      'Help person sit upright.',
      'Assist with inhaler if asthmatic.',
      'Reassure and keep calm.',
      'Call emergency if lips turn blue.'
    ],
    do: ['Sit upright', 'Use inhaler', 'Loosen clothing'],
    dont: ['Do not lie down', 'Do not crowd']
  },
  {
    id: 'seizure',
    name: 'Seizure',
    icon: 'Zap',
    category: EmergencyCategory.URGENT,
    color: 'bg-[#FFA502]',
    instructions: [
      'Ease person to floor.',
      'Turn gently onto one side (recovery position).',
      'Clear area of hard or sharp objects.',
      'Place something soft under head.'
    ],
    do: ['Time the seizure', 'Protect head', 'Loosen neckwear'],
    dont: ['Do not hold down', 'Do not put anything in mouth', 'Do not give water']
  },
  {
    id: 'panic',
    name: 'Panic / Other',
    icon: 'HelpCircle',
    category: EmergencyCategory.MODERATE,
    color: 'bg-[#2f3640]',
    instructions: [
      'Stay with the person.',
      'Speak calmly and use short sentences.',
      'Help them focus on breathing (slow, deep breaths).',
      'Ask what they need.'
    ],
    do: ['Stay calm', 'Listen', 'Reassure'],
    dont: ['Do not judge', 'Do not leave alone', 'Do not invalidate feelings']
  }
];

export const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Sarah J.', distance: '0.2 km', role: 'First Responder', rating: 4.9 },
  { id: 'v2', name: 'Dr. Mike T.', distance: '0.8 km', role: 'Doctor', rating: 5.0 },
  { id: 'v3', name: 'Alex R.', distance: '1.2 km', role: 'Civilian', rating: 4.5 },
];
