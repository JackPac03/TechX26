export type Wing = {
  id: string
  number: string
  title: string
  shortTitle: string
  description: string
  colour: string
  badge: string
}

export type Area = 'Kogarah Front' | 'Kogarah Back'

export type Exhibit = {
  id: string
  booth: number
  area: Area
  wingId: string
  title: string
  description: string
  hosts: string[]
  partners: string[]
  activity?: boolean
}

export const wings: Wing[] = [
  { id: 'strategy', number: '01', title: 'Strategy, Data & AI', shortTitle: 'Strategy', description: 'Where we’re heading, and the tech taking us there.', colour: '#ef1721', badge: 'Future Forecaster' },
  { id: 'customer', number: '02', title: 'Customer & Banking', shortTitle: 'Customer', description: 'The products and platforms our customers use every day.', colour: '#ff7a3d', badge: 'Customer Champion' },
  { id: 'cyber', number: '03', title: 'Cyber & Resilience', shortTitle: 'Cyber', description: 'Keeping the bank and our customers safe and running.', colour: '#d4147a', badge: 'Cyber Sentinel' },
  { id: 'engineering', number: '04', title: 'Engineering & Craft', shortTitle: 'Engineering', description: 'Our practices, and the tools we use to build software.', colour: '#9b3cf0', badge: 'Master Builder' },
  { id: 'careers', number: '05', title: 'Learning & Careers', shortTitle: 'Careers', description: 'Grow your skills, your profile and your career.', colour: '#4f7cff', badge: 'Lifelong Learner' },
  { id: 'community', number: '06', title: 'Culture & Community', shortTitle: 'Community', description: 'The people, partners and causes that make us who we are.', colour: '#1fbfa6', badge: 'Community Heart' },
]

const front: Area = 'Kogarah Front'
const back: Area = 'Kogarah Back'

export const exhibits: Exhibit[] = [
  { id: 'sns', booth: 2, area: front, wingId: 'cyber', title: 'Secure Network Services (SNS)', description: 'Meet the Secure Network Services team and partners Cisco and Elastic.', hosts: ['Kristy Dainton'], partners: ['Cisco', 'Elastic'] },
  { id: 'engineering-collaboration-tools', booth: 3, area: front, wingId: 'engineering', title: 'Engineering Collaboration Tools', description: 'Explore the tools that help our engineers work together, with Apple.', hosts: ['Vicky Fallaver'], partners: ['Apple'] },
  { id: 'digital-strategy', booth: 4, area: back, wingId: 'strategy', title: 'Digital Strategy', description: 'Hear where digital is heading at Westpac, with Google.', hosts: ['Chris Bradford', 'Brooke'], partners: ['Google'] },
  { id: 'technology-strategy', booth: 5, area: back, wingId: 'strategy', title: 'Technology Strategy', description: 'Get the big picture on Westpac’s technology direction and priorities.', hosts: ['Paris Whitaker', 'Rachel Boschen'], partners: [] },
  { id: 'emerging-technology', booth: 6, area: back, wingId: 'strategy', title: 'Emerging Technology', description: 'Look over the horizon at emerging technology, including quantum, with Quantum Australia.', hosts: ['Paris Whitaker', 'Rachel Boschen'], partners: ['Quantum Australia'] },
  { id: 'cloud-contact-centres', booth: 7, area: front, wingId: 'customer', title: 'Cloud Contact Centres', description: 'See how cloud contact centres built with AWS are changing the way we serve customers.', hosts: ['Debbie Moore'], partners: ['AWS'] },
  { id: 'ecm-customer', booth: 8, area: front, wingId: 'customer', title: 'ECM - Customer', description: 'Explore ECM for customers with the team and IBM.', hosts: ['Rebecca Huggi', 'Alice Zheng'], partners: ['IBM'] },
  { id: 'book-a-banker', booth: 9, area: front, wingId: 'customer', title: 'Book A Banker', description: 'See how customers book time with a banker.', hosts: ['Shravan Madaan'], partners: [] },
  { id: 'loan-builder', booth: 10, area: front, wingId: 'customer', title: 'Loan Builder', description: 'Walk through Loan Builder and the lending journey it supports.', hosts: ['Shravan Madaan'], partners: [] },
  { id: 'merchant-banking', booth: 11, area: front, wingId: 'customer', title: 'Merchant Payments', description: 'Discover the technology behind Merchant Payments.', hosts: ['Rochelle Dassanayake', 'Sharon Bellamy'], partners: [] },
  { id: 'westpac-one', booth: 12, area: front, wingId: 'customer', title: 'Westpac One', description: 'Explore Westpac One with the team building it.', hosts: ['Greg Sarlas', 'Michael Jones', 'Chris Daley'], partners: [] },
  { id: 'everyday-banking', booth: 13, area: front, wingId: 'customer', title: 'Everyday Banking', description: 'See what’s new in everyday banking, with IBM.', hosts: ['Kassem Farhat', 'Nano Knowles', 'Pedro Gonzalez', 'Amy Stock', 'Sumathi Mathiyazhakan', 'Mehmet Yakan', 'Nithyanandh Ramani'], partners: ['IBM'] },
  { id: 'cloud-services', booth: 48, area: front, wingId: 'customer', title: 'Cloud Services', description: 'Find out how cloud services power the bank behind the scenes.', hosts: [], partners: [] },
  { id: 'ecm-perform', booth: 14, area: front, wingId: 'customer', title: 'ECM - Perform', description: 'Explore ECM - Perform with the team.', hosts: ['Anna Karmacharya'], partners: [] },
  { id: 'ethan-indigenous', booth: 16, area: front, wingId: 'community', title: 'Ethan Indigenous', description: 'Connect with Ethan Indigenous and learn about their work with Westpac.', hosts: ['Belinda Ramirez'], partners: ['Ethan Indigenous'] },
  { id: 'tour-de-cure', booth: 17, area: front, wingId: 'community', title: 'Tour De Cure', description: 'Learn about Tour De Cure and how you can get involved.', hosts: ['Thomas Bauch', 'Mel McCafferty'], partners: ['Tour De Cure'] },
  { id: 'asset-management', booth: 19, area: front, wingId: 'customer', title: 'App and Asset Management', description: 'Talk application and asset management with the team.', hosts: ['Grant Chapman', 'Dal McNamara'], partners: [] },
  { id: 'bcm', booth: 20, area: front, wingId: 'cyber', title: 'Business Controls and Monitoring (BCM)', description: 'See how business controls and monitoring keep the bank on track.', hosts: ['Stephan Borg', 'Jurgen Richter', 'Jess Barrett'], partners: [] },
  { id: 'testing', booth: 21, area: front, wingId: 'engineering', title: 'Testing and Cyber Mate', description: 'Explore modern testing with the team and Perforce (Perfecto), then meet Cyber Mate and learn how to stay cyber safe.', hosts: ['Erwin Klomp', 'Innes Phillips', 'Cameron Bowman', 'Rochelle Michelutt', 'Michael Piliaris'], partners: ['Perforce (Perfecto)'] },
  { id: 'family-feud', booth: 22, area: front, wingId: 'community', title: 'Family Feud', description: 'GMs versus Grads, 2–3pm in the Auditorium. Come and cheer them on.', hosts: ['Ashley Nicol', 'Jyotsna Arora', 'Kanu Agarwal'], partners: [], activity: true },
  { id: 'cyber-trusted-access', booth: 23, area: front, wingId: 'cyber', title: 'Trusted access for a connected Westpac', description: 'See how identity and access keep the right people connected to the right systems.', hosts: ['Ashley Nicol'], partners: [] },
  { id: 'cyber-job-zero', booth: 44, area: front, wingId: 'cyber', title: 'Never forget security – it’s job zero', description: 'Find out why security comes first in everything we build and run.', hosts: ['Ashley Nicol'], partners: [] },
  { id: 'cyber-critical-systems', booth: 45, area: front, wingId: 'cyber', title: 'Keeping all critical systems and customer data secure', description: 'Meet the team protecting the bank’s critical systems and customer data.', hosts: ['Ashley Nicol'], partners: [] },
  { id: 'cyber-threats-247', booth: 46, area: front, wingId: 'cyber', title: 'Protecting our customers and you from cyber threats 24/7', description: 'Go behind the scenes of round-the-clock cyber defence.', hosts: ['Ashley Nicol'], partners: [] },
  { id: 'cyber-people-safe', booth: 47, area: front, wingId: 'cyber', title: 'Empowering our people to use technology safely', description: 'Pick up simple habits that help everyone use technology safely.', hosts: ['Ashley Nicol'], partners: [] },
  { id: 'eag', booth: 50, area: front, wingId: 'careers', title: 'Employee Advocacy Group (EAG)', description: 'Meet the colleagues who champion employee voices at Westpac, and find out how to share ideas that shape where we work.', hosts: [], partners: [] },
  { id: 'linkedin-learning', booth: 25, area: back, wingId: 'careers', title: 'LinkedIn Learning', description: 'Discover what you can learn on LinkedIn Learning.', hosts: ['Yvette Gilhooly', 'Cat Huynh', 'Paul Hamilton'], partners: ['LinkedIn'] },
  { id: 'people-tools', booth: 26, area: back, wingId: 'careers', title: 'People Tools', description: 'Explore the tools that support you at work.', hosts: ['Laura Harris'], partners: [] },
  { id: 'motivate-plus', booth: 27, area: back, wingId: 'careers', title: 'Motivate+', description: 'Find out about Motivate+.', hosts: ['Rob Hadley', 'Paul Hamilton'], partners: [] },
  { id: 'emerging-talent', booth: 28, area: front, wingId: 'careers', title: 'Emerging Talent and Youth in Technology (YIT)', description: 'Meet the Emerging Talent team and Youth in Technology (YIT).', hosts: ['Jasmine Haddad'], partners: ['YIT'] },
  { id: 'head-shot-photo-booth', booth: 29, area: back, wingId: 'careers', title: 'Rapid Photo Booth', description: 'Refresh your profile with a professional head shot.', hosts: [], partners: [], activity: true },
  { id: 'women-in-technology', booth: 30, area: back, wingId: 'community', title: 'Women in Technology', description: 'Connect with the Women in Technology community.', hosts: ['Carol Englishby', 'Christine Apikian', 'Natasha Naickar'], partners: [] },
  { id: 'dei-rising-women', booth: 31, area: back, wingId: 'community', title: 'Technology DEI and Rising Women', description: 'Learn about Technology Diversity, Equity and Inclusion (DEI), and Rising Women.', hosts: ['Sarah De Jager', 'Andrea Lai'], partners: [] },
  { id: 'engineering-practice', booth: 32, area: back, wingId: 'engineering', title: 'Engineering Practice', description: 'Connect with the Engineering Practice and how it grows our craft.', hosts: ['Rowena Fairclough'], partners: [] },
  { id: 'architecture-practice', booth: 33, area: back, wingId: 'engineering', title: 'Architecture Practice', description: 'Connect with the Architecture Practice and how it grows our craft.', hosts: ['Rowena Fairclough'], partners: [] },
  { id: 'design-practice', booth: 34, area: back, wingId: 'engineering', title: 'Design Practice', description: 'Connect with the Design Practice and how it grows our craft.', hosts: ['Rowena Fairclough'], partners: [] },
  { id: 'data-ai-practice', booth: 35, area: back, wingId: 'engineering', title: 'Data & AI Practice', description: 'Connect with the Data & AI Practice and how it grows our craft.', hosts: ['Rowena Fairclough'], partners: [] },
  { id: 'product-ownership-practice', booth: 36, area: back, wingId: 'engineering', title: 'Product Ownership Practice', description: 'Connect with the Product Ownership Practice and how it grows our craft.', hosts: ['Rowena Fairclough'], partners: [] },
  { id: 'delivery-practice', booth: 37, area: back, wingId: 'engineering', title: 'Delivery Practice', description: 'Connect with the Delivery Practice and how it grows our craft.', hosts: ['Rowena Fairclough'], partners: [] },
  { id: 'service-operations', booth: 38, area: back, wingId: 'cyber', title: 'Service Operations', description: 'See how Service Operations keeps services running, with ServiceNow.', hosts: ['Jaemie Diakomichalis'], partners: ['ServiceNow'] },
  { id: 'ai-sdlc', booth: 39, area: back, wingId: 'strategy', title: 'AI and Service Delivery Life Cycle (AI SDLC)', description: 'See how AI is reshaping the way we deliver services, from idea to operations.', hosts: ['Poornima Tom'], partners: [] },
  { id: 'wdlc', booth: 40, area: back, wingId: 'engineering', title: 'Westpac Delivery Life Cycle (WDLC)', description: 'Meet the team behind the Westpac Delivery Life Cycle.', hosts: ['Leanne Owers', 'Margaret Wales-Brown', 'Nathan Baltoski', 'Bethan Timmins'], partners: [] },
  { id: 'snowflake-adapt', booth: 41, area: back, wingId: 'strategy', title: 'Snowflake & Adapt', description: 'Meet the Snowflake & Adapt team.', hosts: ['Sam Stevanoski', 'Sarah-Jane Suriya', 'Nick Milis'], partners: [] },
  { id: 'github', booth: 42, area: back, wingId: 'engineering', title: 'GitHub', description: 'Explore GitHub with Microsoft.', hosts: ['Allistair Thomas'], partners: ['Microsoft'] },
  { id: 'jira-confluence', booth: 43, area: back, wingId: 'engineering', title: 'Jira & Confluence', description: 'Explore Jira and Confluence with Atlassian and Glintech.', hosts: ['Andrew Fowlds'], partners: ['Atlassian', 'Glintech'] },
  { id: 'engineering-excellence', booth: 49, area: back, wingId: 'engineering', title: 'Engineering Excellence', description: 'See how we raise the bar on engineering quality and craft.', hosts: [], partners: [] },
]

// Conversation starters for each booth's hosts.
export type BoothGuide = { ask: [string, string] }
export const boothGuides: Record<string, BoothGuide> = {
  sns: { ask: ['What does a normal day of network traffic look like at Westpac?', 'How do Cisco and Elastic help you spot problems early?'] },
  'engineering-collaboration-tools': { ask: ['Which tool has changed how engineers work together the most?', 'What’s coming next for the engineer toolkit?'] },
  'digital-strategy': { ask: ['What will digital banking feel like for customers in five years?', 'How do you decide which ideas make the roadmap?'] },
  'technology-strategy': { ask: ['How does technology strategy show up in what customers feel?', 'What’s one big bet the bank is making?'] },
  'emerging-technology': { ask: ['Which emerging technology is closest to being useful here?', 'What could quantum change for banking security?'] },
  'cloud-contact-centres': { ask: ['What changed when contact centres moved to the cloud?', 'How does AWS help on the busiest days?'] },
  'ecm-customer': { ask: ['What is enterprise content management, in plain English?', 'Where does IBM fit into the platform?'] },
  'book-a-banker': { ask: ['What do customers book time with a banker for most?', 'What makes a booking feel effortless?'] },
  'loan-builder': { ask: ['Which part of the lending journey got faster with Loan Builder?', 'How do bankers and customers use it differently?'] },
  'merchant-banking': { ask: ['Who uses Merchant Payments?', 'What’s the toughest technical problem behind payments?'] },
  'westpac-one': { ask: ['What can customers do in Westpac One?', 'What’s the next feature on the way?'] },
  'everyday-banking': { ask: ['What’s new in everyday banking this year?', 'How do you test changes with real customers?'] },
  'cloud-services': { ask: ['What runs in the cloud at Westpac today?', 'How do you keep cloud services secure and reliable?'] },
  'ecm-perform': { ask: ['How is ECM - Perform different from ECM - Customer?', 'Who uses it day to day?'] },
  'ethan-indigenous': { ask: ['How did the partnership with Westpac begin?', 'How can teams get involved?'] },
  'tour-de-cure': { ask: ['Where does the money raised go?', 'Can non-riders get involved?'] },
  'asset-management': { ask: ['How many apps does the bank look after?', 'How do you decide when to retire an app?'] },
  bcm: { ask: ['What do business controls and monitoring look after?', 'How do you spot a control that isn’t working?'] },
  testing: { ask: ['How do you test across so many devices?', 'What’s Cyber Mate’s top tip for spotting a scam?'] },
  eag: { ask: ['How can I get involved with the EAG?', 'What’s one change the group has helped make happen?'] },
  'family-feud': { ask: ['Who’s the favourite: GMs or Grads?', 'How were the questions chosen?'] },
  'cyber-trusted-access': { ask: ['Why do we use multi-factor authentication everywhere?', 'How do you decide who gets access to what?'] },
  'cyber-job-zero': { ask: ['What does “job zero” mean for my team?', 'What’s the easiest security win for a new project?'] },
  'cyber-critical-systems': { ask: ['Which systems count as critical?', 'How is customer data protected end to end?'] },
  'cyber-threats-247': { ask: ['What does a day in security operations look like?', 'Which threat are you seeing most right now?'] },
  'cyber-people-safe': { ask: ['Which everyday habit keeps me safest online?', 'What should I do if I click a bad link?'] },
  'linkedin-learning': { ask: ['Which learning paths are most popular?', 'How do I connect my account?'] },
  'people-tools': { ask: ['Which people tool is the newest?', 'Where do I go for help?'] },
  'motivate-plus': { ask: ['What is Motivate+ and how does it work?', 'What kind of recognition means the most?'] },
  'emerging-talent': { ask: ['What programs are there for grads and interns?', 'How can I get involved with Youth in Technology?'] },
  'head-shot-photo-booth': { ask: ['Any tips for a great profile photo?', 'When will I get my photo?'] },
  'women-in-technology': { ask: ['What does the community do through the year?', 'How can allies get involved?'] },
  'dei-rising-women': { ask: ['What does Rising Women offer?', 'Which small habits make the biggest difference?'] },
  'engineering-practice': { ask: ['How does the practice grow engineers’ skills?', 'How can I join a guild or community?'] },
  'architecture-practice': { ask: ['What does an architect do day to day?', 'How do big architecture decisions get made?'] },
  'design-practice': { ask: ['How do designers test ideas with customers?', 'What tools does the practice use?'] },
  'data-ai-practice': { ask: ['Where is AI already helping customers?', 'How do you make sure AI is used responsibly?'] },
  'product-ownership-practice': { ask: ['What makes a great product owner?', 'How do you say no to good ideas?'] },
  'delivery-practice': { ask: ['How does delivery work across so many teams?', 'What does good delivery look like?'] },
  'service-operations': { ask: ['How does ServiceNow help keep services running?', 'What happens when an incident is raised?'] },
  'ai-sdlc': { ask: ['Where is AI helping across the service delivery life cycle?', 'Where do people still matter most?'] },
  wdlc: { ask: ['Who uses WDLC?', 'What’s coming next?'] },
  'snowflake-adapt': { ask: ['What is Snowflake used for at Westpac?', 'What does Adapt do?'] },
  github: { ask: ['How do Westpac teams use GitHub day to day?', 'What’s the best way to get started?'] },
  'jira-confluence': { ask: ['What are the most underused features?', 'How do Atlassian and Glintech support the bank?'] },
  'engineering-excellence': { ask: ['What does engineering excellence look like day to day?', 'Which practice has made the biggest difference to quality?'] },
}

export type Tour = { id: string; title: string; audience: string; minutes: number; colour: string; description: string; stops: string[] }

// Stops are listed in walking order, starting from the Kogarah Front entrance.
export const tours: Tour[] = [
  { id: 'ai-edit', title: 'The AI Edit', audience: 'For the curious', minutes: 30, colour: '#ef1721', description: 'From strategy to quantum, and how AI is changing the way we build.', stops: ['digital-strategy', 'emerging-technology', 'technology-strategy', 'snowflake-adapt', 'ai-sdlc', 'data-ai-practice'] },
  { id: 'under-the-hood', title: 'Under the Hood', audience: 'For engineers', minutes: 45, colour: '#9b3cf0', description: 'The tools, practices and platforms our engineers use every day.', stops: ['testing', 'engineering-collaboration-tools', 'github', 'jira-confluence', 'engineering-excellence', 'engineering-practice', 'architecture-practice', 'delivery-practice', 'wdlc'] },
  { id: 'front-of-house', title: 'Front of House', audience: 'For customer champions', minutes: 40, colour: '#ff7a3d', description: 'Every product and platform our customers touch, end to end.', stops: ['ecm-customer', 'cloud-services', 'everyday-banking', 'cloud-contact-centres', 'book-a-banker', 'loan-builder', 'westpac-one', 'merchant-banking'] },
  { id: 'safe-and-sound', title: 'Safe & Sound', audience: 'For the security-minded', minutes: 35, colour: '#d4147a', description: 'Meet the teams keeping the bank secure, resilient and running.', stops: ['cyber-people-safe', 'cyber-critical-systems', 'cyber-trusted-access', 'cyber-job-zero', 'cyber-threats-247', 'bcm', 'testing', 'sns', 'service-operations'] },
  { id: 'grow-your-career', title: 'Grow Your Career', audience: 'For grads and growers', minutes: 30, colour: '#4f7cff', description: 'Learning, communities and a fresh head shot along the way.', stops: ['emerging-talent', 'women-in-technology', 'head-shot-photo-booth', 'people-tools', 'motivate-plus', 'linkedin-learning'] },
  { id: 'heart-of-westpac', title: 'Heart of Westpac', audience: 'For everyone', minutes: 25, colour: '#1fbfa6', description: 'The people, partners and causes that make us who we are.', stops: ['ethan-indigenous', 'tour-de-cure', 'eag', 'family-feud', 'dei-rising-women'] },
  { id: 'first-look', title: 'First Look', audience: 'No jargon', minutes: 20, colour: '#b31789', description: 'A quick loop through the unmissable highlights.', stops: ['everyday-banking', 'cyber-threats-247', 'github', 'emerging-technology', 'head-shot-photo-booth'] },
]

export const eventDate = '2026-11-27'

export type Session = { start: string; end?: string; title: string; detail: string; place: string; kind: string; exhibit?: string }

// Placeholder run sheet: only Family Feud's time is confirmed. Update with the final schedule.
export const schedule: Session[] = [
  { start: '09:30', title: 'Doors open', detail: 'Pick up your showbag and get your passport ready.', place: 'Showbag Pick-Up, Kogarah Front', kind: 'Arrival' },
  { start: '10:00', end: '10:30', title: 'Welcome to TECHx26', detail: 'Opening remarks to launch the Museum of Technology.', place: 'Auditorium', kind: 'Keynote' },
  { start: '10:30', end: '17:00', title: 'The museum is open', detail: `All ${exhibits.length} booths across Kogarah Front and Back.`, place: 'Kogarah Front & Back', kind: 'All day' },
  { start: '10:30', end: '17:00', title: 'Rapid photo booth', detail: 'Refresh your profile photo while you explore.', place: 'Booth 29, Kogarah Back', kind: 'Activity', exhibit: 'head-shot-photo-booth' },
  { start: '12:00', end: '13:00', title: 'Lunch', detail: 'Refuel and swap notes on your favourite booths.', place: 'Kitchen, Kogarah Back', kind: 'Break' },
  { start: '14:00', end: '15:00', title: 'Family Feud: GMs vs Grads', detail: 'Come and cheer them on.', place: 'Auditorium', kind: 'Activity', exhibit: 'family-feud' },
  { start: '17:00', title: 'Museum closes', detail: 'Last chance to collect your stamps and download your explorer card.', place: 'Kogarah Front & Back', kind: 'Wrap-up' },
]

export const boothNumber = (exhibit: Exhibit) => String(exhibit.booth).padStart(2, '0')

// Booth QR codes deep-link here; opening the link reveals the booth and awards its stamp.
export const exhibitUrl = (id: string) => `${window.location.origin}${import.meta.env.BASE_URL}exhibits/${id}`
