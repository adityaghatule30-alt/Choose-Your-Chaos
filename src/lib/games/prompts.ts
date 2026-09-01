export const GAME_PROMPTS = {
  worst_answer: [
    { id: 'wa-1', prompt: "Your boss accidentally sends your confidential appraisal to the entire company group. What do you reply?" },
    { id: 'wa-2', prompt: "You get caught sneaking into a VIP party without an invitation. What is your excuse?" },
    { id: 'wa-3', prompt: "Your date asks what your biggest red flag is on the first date. What is your answer?" },
    { id: 'wa-4', prompt: "The airport security agent asks what is making ticking noises in your carry-on luggage. What do you say?" },
    { id: 'wa-5', prompt: "Your friend asks for your honest opinion on their disastrous haircut. What do you tell them?" },
    { id: 'wa-6', prompt: "You accidentally liked a photo from 8 years ago of your ex's new partner. How do you explain yourself?" },
  ],
  imposter: [
    {
      id: 'imp-1',
      crewPrompt: "Describe something you would pack for a tropical beach vacation 🏖️",
      imposterPrompt: "Describe something you would pack for an Arctic mountain expedition 🏔️",
    },
    {
      id: 'imp-2',
      crewPrompt: "Name a food item you would order at a fancy Italian restaurant 🍝",
      imposterPrompt: "Name a food item you would order at a 3 AM roadside food stall 🍔",
    },
    {
      id: 'imp-3',
      crewPrompt: "Describe a common household chore that takes under 5 minutes 🧹",
      imposterPrompt: "Describe a complex home renovation project 🔨",
    },
    {
      id: 'imp-4',
      crewPrompt: "What is something you buy at a pharmacy during cold season? 💊",
      imposterPrompt: "What is something you buy at a hardware construction store? 🧰",
    },
  ],
  guess_player: [
    { id: 'gp-1', prompt: "What is the most embarrassing purchase you made online at 2:00 AM?" },
    { id: 'gp-2', prompt: "What is a completely irrational fear you still have as an adult?" },
    { id: 'gp-3', prompt: "What is the wildest lie you ever told to get out of attending social plans?" },
    { id: 'gp-4', prompt: "If you had 24 hours with zero legal consequences, what is the first thing you do?" },
  ],
  chain_reaction: [
    { id: 'cr-1', starter: "I woke up in a Walmart parking lot with a megaphone and zero memories." },
    { id: 'cr-2', starter: "The wedding officiant cleared their throat, turned to the crowd, and said 'Actually, I object.'" },
    { id: 'cr-3', starter: "My smart fridge just sent a threatening message to my group chat." },
    { id: 'cr-4', starter: "The elevator got stuck between the 13th and 14th floor, and someone started playing a saxophone." },
  ],
  two_truths: [
    {
      id: 'tt-1',
      situation: "College campus legends and chaotic mishaps",
      statements: [
        "A student accidentally emailed their final dissertation draft to the entire university alumni database.",
        "The campus cafeteria chef was caught serving frozen pizza from the local supermarket as 'Artisanal Italian'.",
        "A student trained the campus pigeons to steal fries from freshmen outdoor tables.",
      ],
      fakeIndex: 2,
    },
    {
      id: 'tt-2',
      situation: "Corporate disaster stories",
      statements: [
        "An intern replied 'unsubscribe' to an all-hands CEO announcement email.",
        "A manager accidentally screen-shared their active job search application for a direct competitor.",
        "The company mascot suit caught fire during the annual shareholder celebration speech.",
      ],
      fakeIndex: 2,
    },
    {
      id: 'tt-3',
      situation: "Bizarre real-world laws and historical incidents",
      statements: [
        "It is legally forbidden to own a singular guinea pig in Switzerland because they get lonely.",
        "In Victorian England, whistling on public omnibuses after 9 PM carried a 3-shilling penalty.",
        "A war between Australia and wild emus ended in a ceasefire victory for the emus.",
      ],
      fakeIndex: 1,
    },
  ],
  caption_chaos: [
    { id: 'cc-1', prompt: "When you realize you've been nodding and agreeing for 10 minutes to a conversation you didn't hear a word of." },
    { id: 'cc-2', prompt: "The face you make when the waiter is singing Happy Birthday to the table right next to yours." },
    { id: 'cc-3', prompt: "When your phone falls directly onto your face while lying in bed at 1:30 AM." },
    { id: 'cc-4', prompt: "Checking your bank account on Monday morning after a 'very calm and chill' weekend." },
    { id: 'cc-5', prompt: "When someone says 'we need to talk' and starts typing for 15 consecutive minutes." },
  ],
}
