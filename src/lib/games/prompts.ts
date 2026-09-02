export const GAME_PROMPTS = {
  two_truths: [
    {
      id: 'tt-1',
      situation: "College exam & attendance chaos",
      statements: [
        "I gave proxy attendance for 3 people in a single 8:30 AM lecture.",
        "I studied the entire syllabus in the 45-minute auto ride to college.",
        "I convinced my HOD that my printed lab record was eaten by a stray cow.",
      ],
      fakeIndex: 2,
    },
    {
      id: 'tt-2',
      situation: "Hostel & midnight food escapades",
      statements: [
        "I made cheese Maggi using a clothes iron in my hostel room.",
        "I ordered ₹800 worth of biryani using my roommate's unlocked phone.",
        "I once ate 10 samosas during a single boring 2-hour guest lecture.",
      ],
      fakeIndex: 1,
    },
    {
      id: 'tt-3',
      situation: "Family & WhatsApp group disasters",
      statements: [
        "My mom accidentally added our local sabzi vendor to the family WhatsApp group.",
        "I pretended to have an internet outage during a 2-hour family Zoom call to play games.",
        "My dad caught me sneaking out because my slippers squeaked on the floor.",
      ],
      fakeIndex: 0,
    },
    {
      id: 'tt-4',
      situation: "Money & UPI mishaps",
      statements: [
        "I once paid ₹10 to a tea stall using 4 different payment apps because of server errors.",
        "I sent a ₹500 UPI payment to a random stranger with the note 'Enjoy your life'.",
        "I survived on plain bread and chai for 4 consecutive days before payday.",
      ],
      fakeIndex: 1,
    },
  ],
  mind_reader: [
    { id: 'mr-1', prompt: "Your friend owes you ₹150 for chai and snacks. How do you handle it?" },
    { id: 'mr-2', prompt: "Your attendance is 64% on the last day before exam eligibility. What is your move?" },
    { id: 'mr-3', prompt: "Your parents call on video while you're sitting in a cafe with your crush." },
    { id: 'mr-4', prompt: "You have ₹200 left in your bank account until next week." },
    { id: 'mr-5', prompt: "Your friend gets a haircut that looks completely terrible. What do you say?" },
  ],
}
