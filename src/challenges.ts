import { exhibits, wings } from './data'

type Question = { q: string; options: string[]; answer: number }

// One challenge per booth. "code" challenges need the host to share a code word.
export type Challenge =
  | { kind: 'quiz'; title: string; intro: string; questions: Question[] }
  | { kind: 'code'; title: string; intro: string; code: string }
  | { kind: 'order'; title: string; intro: string; steps: string[] }
  | { kind: 'match'; title: string; intro: string; pairs: [string, string][] }
  | { kind: 'scramble'; title: string; intro: string; words: { word: string; hint: string }[] }
  | { kind: 'memory' | 'packets' | 'phish' | 'simon' | 'bugs' | 'password' | 'contrast' | 'roadmap' | 'pedal'; title: string; intro: string }

export const challengeKinds: Record<Challenge['kind'], string> = {
  quiz: 'Quiz', code: 'Find out', order: 'Mini game', match: 'Mini game', scramble: 'Word game', memory: 'Mini game', packets: 'Mini game',
  phish: 'Mini game', simon: 'Mini game', bugs: 'Mini game', password: 'Mini game', contrast: 'Mini game', roadmap: 'Mini game', pedal: 'Mini game',
}

export const challenges: Record<string, Challenge> = {
  sns: { kind: 'packets', title: 'Packet patrol', intro: 'Tap the red threat packets as they hit the network. Leave the green ones alone. Score 10 in 20 seconds.' },
  'engineering-collaboration-tools': { kind: 'memory', title: 'Toolkit match', intro: 'Flip the cards and match every pair of collaboration tools.' },
  'digital-strategy': {
    kind: 'quiz', title: 'Digital first', intro: 'Three quick questions on digital banking.', questions: [
      { q: 'What does an “omnichannel” experience mean?', options: ['A consistent experience across every channel', 'Only one way to contact the bank', 'A TV advertising campaign', 'Branches open all night'], answer: 0 },
      { q: 'Which of these is a digital channel?', options: ['A branch counter', 'A mobile banking app', 'A printed brochure', 'A letter in the mail'], answer: 1 },
      { q: 'A “digital first” approach means…', options: ['Closing every branch', 'Designing for digital channels from the start', 'Only hiring developers', 'Printing everything twice'], answer: 1 },
    ],
  },
  'technology-strategy': { kind: 'code', title: 'Strategy in three words', intro: 'Ask the team for their top technology priority. Once you’ve chatted, they’ll give you the code word.', code: 'NORTHSTAR' },
  'emerging-technology': {
    kind: 'quiz', title: 'Quantum leap', intro: 'How much do you know about quantum computing?', questions: [
      { q: 'What is the basic unit of quantum information?', options: ['Byte', 'Qubit', 'Pixel', 'Quark'], answer: 1 },
      { q: 'A qubit being 0 and 1 at the same time is called…', options: ['Superposition', 'Compression', 'Encryption', 'Recursion'], answer: 0 },
      { q: 'Large quantum computers could one day break some of today’s…', options: ['Screens', 'Keyboards', 'Encryption', 'Cables'], answer: 2 },
    ],
  },
  'cloud-contact-centres': { kind: 'order', title: 'Route the call', intro: 'Tap the steps of a customer call in the right order.', steps: ['Customer calls in', 'Chooses an option in the phone menu', 'Call is routed to the right team', 'An agent helps the customer', 'Customer rates the call'] },
  'ecm-customer': { kind: 'code', title: 'Document detective', intro: 'Guess how many documents the team looks after, then ask for the real number. They’ll give you the code word.', code: 'ARCHIVE' },
  'book-a-banker': { kind: 'scramble', title: 'Booking scramble', intro: 'Unscramble the words. Tap the letters in order.', words: [{ word: 'BANKER', hint: 'Who you’re booking time with' }, { word: 'BOOKING', hint: 'What you make to see them' }, { word: 'CALENDAR', hint: 'Where the time slot goes' }] },
  'loan-builder': { kind: 'order', title: 'Build a home loan', intro: 'Put the home loan journey in order.', steps: ['Work out your budget', 'Apply for the loan', 'The bank assesses the application', 'The loan is approved', 'Settlement day'] },
  'merchant-banking': {
    kind: 'quiz', title: 'Tap and go', intro: 'What happens when you pay at a shop?', questions: [
      { q: 'The device you tap your card on at a shop is a…', options: ['Router', 'Payment terminal', 'Modem', 'Kiosk'], answer: 1 },
      { q: 'Tap-and-go payments use which technology?', options: ['NFC', 'Bluetooth', 'Infrared', 'Wi-Fi'], answer: 0 },
      { q: 'A business that accepts card payments is called a…', options: ['Merchant', 'Broker', 'Trustee', 'Lender'], answer: 0 },
    ],
  },
  'westpac-one': { kind: 'code', title: 'What’s the “One”?', intro: 'Ask the team what the “One” in Westpac One stands for. They’ll give you the code word.', code: 'UNITY' },
  'everyday-banking': {
    kind: 'quiz', title: 'Bank smart', intro: 'Everyday banking, done safely.', questions: [
      { q: 'Which of these makes online banking safer?', options: ['Reusing one password', 'Two-factor authentication', 'Sharing your login', 'Turning off updates'], answer: 1 },
      { q: 'Your bank will never ask you to…', options: ['Update the app', 'Share your password or one-time code', 'Set a strong PIN', 'Check your statements'], answer: 1 },
      { q: 'The safest place to download a banking app is…', options: ['A link in a text message', 'The official app store', 'A pop-up ad', 'A file a friend sent'], answer: 1 },
    ],
  },
  'cloud-services': {
    kind: 'quiz', title: 'Head in the clouds', intro: 'Three quick questions on cloud computing.', questions: [
      { q: 'What does “the cloud” mean in technology?', options: ['Weather data for apps', 'Computing services delivered over the internet', 'A type of hard drive', 'The office Wi-Fi'], answer: 1 },
      { q: 'Adding capacity automatically on a busy day is called…', options: ['Latency', 'Encryption', 'Elastic scaling', 'Caching'], answer: 2 },
      { q: 'Which of these is a cloud provider?', options: ['AWS', 'Excel', 'Notepad', 'Paint'], answer: 0 },
    ],
  },
  'ecm-perform': { kind: 'code', title: 'Numbers that matter', intro: 'Find out what ECM - Perform measures and one number the team is proud of. They’ll give you the code word.', code: 'MOMENTUM' },
  'ethan-indigenous': { kind: 'code', title: 'Learn and share', intro: 'Learn one thing about Ethan Indigenous’s work. The team will give you the code word.', code: 'CONNECT' },
  'tour-de-cure': { kind: 'pedal', title: 'Pedal power', intro: 'Tap as fast as you can to ride 60 pedal strokes in 10 seconds.' },
  'asset-management': {
    kind: 'quiz', title: 'App audit', intro: 'Three questions on looking after the bank’s apps and assets.', questions: [
      { q: 'An IT asset register keeps track of…', options: ['Customer savings balances', 'Every app, device and licence we own', 'Meeting room bookings', 'Office plants'], answer: 1 },
      { q: 'Switching off an app that’s no longer needed is called…', options: ['Decommissioning', 'Onboarding', 'Refactoring', 'Branching'], answer: 0 },
      { q: 'Why keep track of software licences?', options: ['To make apps run faster', 'To change the logo', 'To stay compliant and stop paying for unused ones', 'To back up emails'], answer: 2 },
    ],
  },
  bcm: { kind: 'simon', title: 'Control check', intro: 'Monitoring alerts are lighting up. Watch the order, then repeat it. Reach a sequence of 5.' },
  testing: { kind: 'bugs', title: 'Bug hunt', intro: 'Tap the line with the bug in each snippet. Find 2 of 3.' },
  'family-feud': {
    kind: 'quiz', title: 'Feud facts', intro: 'Do you know when and where the big game is?', questions: [
      { q: 'Who’s facing off in Family Feud?', options: ['Interns vs Execs', 'GMs vs Grads', 'Front vs Back', 'Engineers vs Designers'], answer: 1 },
      { q: 'What time does Family Feud start?', options: ['12pm', '1pm', '2pm', '3pm'], answer: 2 },
      { q: 'Where is it on?', options: ['The Kitchen', 'The Auditorium', 'The Tech Bar', 'Kogarah Back'], answer: 1 },
    ],
  },
  'cyber-trusted-access': { kind: 'match', title: 'Access granted', intro: 'Match each access control to what it does.', pairs: [['MFA', 'A second check, like a code on your phone'], ['Least privilege', 'Only the access you need for your job'], ['Single sign-on', 'One login for many systems'], ['Access review', 'Regularly checking who can access what']] },
  'cyber-job-zero': { kind: 'password', title: 'Lock it down', intro: 'Security is job zero, starting with your own login. Build a passphrase that passes every check. It never leaves your device.' },
  'cyber-critical-systems': { kind: 'code', title: 'Guard the crown jewels', intro: 'Ask the team which system they’d protect first, and why. They’ll give you the code word.', code: 'FORTRESS' },
  'cyber-threats-247': { kind: 'order', title: 'Threat response', intro: 'A threat has been spotted. Put the response steps in order.', steps: ['Detect the threat', 'Contain it', 'Remove it', 'Recover systems', 'Learn and improve'] },
  'cyber-people-safe': { kind: 'phish', title: 'Spot the phish', intro: 'Is each message safe or a phish? Get 5 of 6 right.' },
  eag: { kind: 'code', title: 'Have your say', intro: 'Share one idea that would make Westpac a better place to work. The team will give you the code word.', code: 'VOICE' },
  'linkedin-learning': {
    kind: 'quiz', title: 'Profile pro', intro: 'Three questions to level up your LinkedIn.', questions: [
      { q: 'Which profile section lists what you’re good at?', options: ['Skills', 'Activity', 'Groups', 'Events'], answer: 0 },
      { q: 'The short line under your name is called your…', options: ['Tagline', 'Headline', 'Caption', 'Byline'], answer: 1 },
      { q: 'LinkedIn recommendations are written by…', options: ['You', 'Other people you’ve worked with', 'LinkedIn', 'Recruiters only'], answer: 1 },
    ],
  },
  'people-tools': { kind: 'code', title: 'Time saver', intro: 'Find the tool that would save you the most time this week. The team will give you the code word.', code: 'TOOLKIT' },
  'motivate-plus': { kind: 'code', title: 'Say thanks', intro: 'Find out how to recognise someone who helped you this month. The team will give you the code word.', code: 'THANKYOU' },
  'emerging-talent': {
    kind: 'quiz', title: 'TECHx26 trivia', intro: 'How well do you know today’s event?', questions: [
      { q: 'How many booths are at TECHx26?', options: ['24', '36', String(exhibits.length), '50'], answer: 2 },
      { q: 'How many wings is the museum split into?', options: ['4', String(wings.length), '8', '10'], answer: 1 },
      { q: 'Which two areas is the museum spread across?', options: ['Kogarah Front and Back', 'Levels 1 and 2', 'East and West', 'North and South'], answer: 0 },
    ],
  },
  'head-shot-photo-booth': { kind: 'code', title: 'Say cheese', intro: 'Get your photo at the Rapid Photo Booth. The photographer will give you the code word.', code: 'SMILE' },
  'women-in-technology': {
    kind: 'quiz', title: 'Tech trailblazers', intro: 'Women who changed technology.', questions: [
      { q: 'Who is often called the first computer programmer?', options: ['Ada Lovelace', 'Marie Curie', 'Grace Kelly', 'Rosalind Franklin'], answer: 0 },
      { q: 'Grace Hopper popularised which computing term, after a moth was found in a computer?', options: ['Cookie', 'Bug', 'Spam', 'Cloud'], answer: 1 },
      { q: 'Margaret Hamilton led the software team for which missions?', options: ['Apollo moon landings', 'Mars rovers', 'The Hubble telescope', 'The first iPhone'], answer: 0 },
    ],
  },
  'dei-rising-women': { kind: 'code', title: 'One inclusive action', intro: 'Learn about Rising Women and pick one action for your team. The team will give you the code word.', code: 'BELONG' },
  'engineering-practice': {
    kind: 'quiz', title: 'Craft check', intro: 'Three questions on engineering practice.', questions: [
      { q: 'What does CI stand for?', options: ['Continuous Integration', 'Code Inspection', 'Cloud Infrastructure', 'Central Interface'], answer: 0 },
      { q: 'Refactoring means changing code’s…', options: ['Behaviour', 'Structure, without changing behaviour', 'Programming language', 'Licence'], answer: 1 },
      { q: 'Pair programming is when…', options: ['Two engineers work together on the same code', 'Code is written twice', 'Two apps share a database', 'Tests run in pairs'], answer: 0 },
    ],
  },
  'architecture-practice': { kind: 'match', title: 'Building blocks', intro: 'Match each architecture term to what it does.', pairs: [['API', 'A contract that lets systems talk'], ['Microservice', 'A small, independently deployable service'], ['Cache', 'A fast copy of frequently used data'], ['Load balancer', 'Spreads traffic across servers']] },
  'design-practice': { kind: 'contrast', title: 'Contrast check', intro: 'Accessible design starts with readable text. Pick the easier-to-read option. Get 3 of 4.' },
  'data-ai-practice': { kind: 'match', title: 'AI decoder', intro: 'Match each AI term to its meaning.', pairs: [['LLM', 'A model trained on huge amounts of text'], ['Prompt', 'The instruction you give a model'], ['Hallucination', 'A confident answer that’s wrong'], ['Training data', 'Examples a model learns from']] },
  'product-ownership-practice': { kind: 'roadmap', title: 'Roadmap on a budget', intro: 'You have 10 points of team capacity. Pick features worth at least 19 customer value.' },
  'delivery-practice': { kind: 'order', title: 'Sprint in order', intro: 'Tap the sprint events in the order they happen.', steps: ['Sprint planning', 'Daily stand-up', 'Sprint review', 'Retrospective'] },
  'service-operations': {
    kind: 'quiz', title: 'Keep it running', intro: 'Three questions on service operations.', questions: [
      { q: 'In IT, an “incident” is…', options: ['A planned upgrade', 'An unplanned interruption to a service', 'A new feature', 'A team meeting'], answer: 1 },
      { q: 'What does SLA stand for?', options: ['Service Level Agreement', 'System Login Access', 'Secure Line Adapter', 'Software Licence Audit'], answer: 0 },
      { q: 'ServiceNow is mainly used to…', options: ['Edit photos', 'Manage IT requests and incidents', 'Write code', 'Host websites'], answer: 1 },
    ],
  },
  'ai-sdlc': { kind: 'order', title: 'Ship it', intro: 'Put the service delivery life cycle in order.', steps: ['Understand the need', 'Design the service', 'Build and test', 'Release', 'Operate and support', 'Improve'] },
  wdlc: { kind: 'code', title: 'Stage favourite', intro: 'Ask the team which stage of the Westpac Delivery Life Cycle matters most to them. They’ll give you the code word.', code: 'FLOW' },
  'snowflake-adapt': {
    kind: 'quiz', title: 'Data drill', intro: 'Three questions on data.', questions: [
      { q: 'Snowflake is best known as a…', options: ['Cloud data platform', 'Weather app', 'Design tool', 'Video service'], answer: 0 },
      { q: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Question Logic', 'System Quality Level', 'Secure Query Link'], answer: 0 },
      { q: 'In a database table, a row usually represents…', options: ['One record', 'One column', 'The whole database', 'A password'], answer: 0 },
    ],
  },
  github: { kind: 'match', title: 'Git it', intro: 'Match each Git action to what it does.', pairs: [['Clone', 'Copy a repository to your machine'], ['Commit', 'Save a snapshot of your changes'], ['Push', 'Send your commits to the remote'], ['Pull request', 'Propose changes for review']] },
  'jira-confluence': { kind: 'order', title: 'Ticket to done', intro: 'Move the ticket through the board in order.', steps: ['To do', 'In progress', 'In review', 'Done'] },
  'engineering-excellence': { kind: 'scramble', title: 'Craft scramble', intro: 'Unscramble the words. Tap the letters in order.', words: [{ word: 'QUALITY', hint: 'What excellence looks like' }, { word: 'REVIEW', hint: 'A second pair of eyes on code' }, { word: 'AUTOMATE', hint: 'Let the pipeline do the repetitive work' }] },
}

export const phishMessages = [
  { from: 'Westpac Security', text: 'Your account is locked! Verify within 1 hour at westpac-secure-login.co', phish: true, why: 'Urgency plus a look-alike web address.' },
  { from: 'Internal Comms', text: 'Hi team, the townhall slides are on the intranet under News.', phish: false, why: 'No link, no pressure, nothing to hand over.' },
  { from: 'IT Support', text: 'Reply with your password so we can upgrade your mailbox today.', phish: true, why: 'IT will never ask for your password.' },
  { from: 'Westpac', text: 'Your one-time code is 482913. Never share this code with anyone.', phish: false, why: 'A code you asked for, with a warning not to share it.' },
  { from: 'Your CEO', text: 'I need you to buy gift cards urgently and send me the codes. Keep this quiet.', phish: true, why: 'Gift cards, urgency and secrecy are classic scam signs.' },
  { from: 'TECHx26', text: 'Reminder: TECHx26 is on 27 November at Kogarah. See you there!', phish: false, why: 'Expected, specific and asks for nothing.' },
]

export const bugSnippets = [
  { lines: ['function average(nums) {', '  let total = 0', '  for (let i = 0; i <= nums.length; i++) {', '    total += nums[i]', '  }', '  return total / nums.length', '}'], bug: 2, why: '<= runs one step past the end of the array. It should be <.' },
  { lines: ['function canVote(age) {', '  if (age = 18) {', '    return true', '  }', '  return age > 18', '}'], bug: 1, why: 'A single = assigns instead of comparing. It should be ===.' },
  { lines: ['const prices = [10, 20, 30]', 'const total = prices.reduce((sum, p) => sum + p)', 'const withGst = total * 0.1', 'console.log(withGst)'], bug: 2, why: 'This gives only the GST. Adding 10% means multiplying by 1.1.' },
]

export const roadmapFeatures = [
  { name: 'Instant payments', cost: 4, value: 8 },
  { name: 'Dark mode', cost: 1, value: 2 },
  { name: 'Smarter search', cost: 2, value: 5 },
  { name: 'Savings goals', cost: 3, value: 6 },
  { name: 'New login screen', cost: 3, value: 5 },
  { name: 'Chat support', cost: 5, value: 7 },
]

export const contrastRounds: [string, string][][] = [
  [['#ffffff', '#ffd166'], ['#160c19', '#ffd166']],
  [['#c0c0c0', '#ffffff'], ['#5f5763', '#ffffff']],
  [['#ef1721', '#9619df'], ['#ffffff', '#9619df']],
  [['#1fbfa6', '#ffffff'], ['#0b5e52', '#ffffff']],
]
