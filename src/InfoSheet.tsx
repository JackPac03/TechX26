import { useState, type ReactNode } from 'react'
import { Accessibility, CircleHelp, ShieldCheck, X } from 'lucide-react'
import { challengeBase, challengeBonus, secretPoints, stampPoints } from './scoring'
import { syncEnabled } from './sync'
import './InfoSheet.css'

export type InfoTopic = 'help' | 'accessibility' | 'privacy'

const topics: { id: InfoTopic; label: string; icon: ReactNode }[] = [
  { id: 'help', label: 'Help', icon: <CircleHelp size={16} /> },
  { id: 'accessibility', label: 'Accessibility', icon: <Accessibility size={16} /> },
  { id: 'privacy', label: 'Privacy', icon: <ShieldCheck size={16} /> },
]

// Draft wording for the footer pages. The welcome desk, venue access and privacy details need
// confirming with the organisers, and Privacy should be reviewed before the live leaderboard is switched on.
function Help() {
  return (
    <>
      <h2 id="info-title">How can we help?</h2>
      <p className="info-lead">Quick answers for the day. Still stuck? Ask any booth host or a TECHx26 crew member at the welcome desk.</p>
      <div className="info-faq">
        <details open><summary>How do I collect a stamp?</summary><p>Tap <b>Scan QR</b> and point your camera at the QR poster at the booth. The booth opens and its stamp lands in your passport. You can also scan the poster with your phone’s camera app.</p></details>
        <details><summary>My camera won’t open</summary><p>Tap <b>Enter booth code instead</b> in the scanner and type the 6-character code printed under the QR on the poster. If you’d rather use the camera, check that your browser is allowed to use it in your phone’s settings.</p></details>
        <details><summary>How do points work?</summary><p>Each stamp is worth {stampPoints} points and each hidden exhibit {secretPoints}. A booth challenge is worth {challengeBase}, plus up to {challengeBonus} more for how well you do. Only your best score at each booth counts, so replay to improve it.</p></details>
        <details><summary>My stamps disappeared</summary><p>Your passport is saved in the browser you use. Stick to the same phone and browser all day, avoid private or incognito tabs, and don’t clear your browser data until after the event.</p></details>
        <details><summary>How do prizes work?</summary><p>After your first challenge win you’ll pick a nickname. You also get a four-character player code, shown on your passport and next to your name on the leaderboard. To claim a prize, show staff your nickname and code on your phone.</p></details>
        <details><summary>Where do I get my explorer sticker?</summary><p>Take the “What kind of explorer are you?” quiz under Follow your curiosity, then show your explorer card at the welcome desk.</p></details>
        <details><summary>Where is everything?</summary><p>The museum fills Kogarah Front and Kogarah Back. Use the <a href="#map">venue map</a> to find a booth, and the <a href="#schedule">schedule</a> for keynotes, lunch and activities.</p></details>
      </div>
    </>
  )
}

function AccessibilityInfo() {
  return (
    <>
      <h2 id="info-title">Made for every explorer.</h2>
      <p className="info-lead">We want everyone to enjoy the museum, whichever way you get around it.</p>
      <ul className="info-list">
        <li><b>No camera needed.</b> Every booth has a number you can type in the scanner instead of scanning its QR code.</li>
        <li><b>Keyboard and screen readers.</b> The guide is designed to work with both. Pop-ups move focus to their content, and updates like new stamps are announced.</li>
        <li><b>Less motion.</b> If your device is set to reduce motion, we skip the opening doors and other big animations.</li>
        <li><b>Zoom friendly.</b> Text grows with your browser’s zoom and text size settings.</li>
        <li><b>Your pace.</b> Some booth challenges are timed. Every stamp can be collected without playing, and booth hosts are happy to help.</li>
        <li><b>Optional extras.</b> Hidden games and secrets are just for fun. You never need them for stamps or prizes.</li>
      </ul>
      <p className="info-note">Need help at the venue, like step-free access or somewhere quiet to sit? Ask at the welcome desk. Something on this site didn’t work for you? Let a crew member know so we can fix it.</p>
    </>
  )
}

function Privacy() {
  return (
    <>
      <h2 id="info-title">Your data stays with you.</h2>
      <p className="info-lead">This guide is built to collect as little as possible.</p>
      <ul className="info-list">
        <li><b>Saved on your phone.</b> Your passport, points, quiz result, saved booths and ticket are stored in this browser on your device.{!syncEnabled && ' Right now nothing is sent to a server.'}</li>
        <li><b>Just a nickname.</b> After your first challenge win you pick a nickname for the leaderboard. We never ask for your real name or email.</li>
        {syncEnabled && <li><b>The live leaderboard.</b> Once you have a nickname, it’s saved with your player code, stamps, points and explorer type on the TECHx26 leaderboard, hosted by Supabase. None of it identifies you.</li>}
        <li><b>The camera.</b> The scanner reads QR codes on your device. Footage is never recorded or uploaded.</li>
        <li><b>Cards and tickets.</b> Images you download are made on your device and only go where you share them.</li>
        <li><b>No tracking.</b> There are no analytics or advertising trackers. The page loads its fonts from Google Fonts.</li>
      </ul>
      <p className="info-note">To remove everything, clear this site’s data in your browser settings. Questions about your data? Ask the TECHx26 organisers.</p>
    </>
  )
}

// Help, accessibility and privacy information, opened from the footer.
export function InfoSheet({ topic: initial, onClose }: { topic: InfoTopic; onClose: () => void }) {
  const [topic, setTopic] = useState(initial)
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="info-sheet" role="dialog" aria-modal="true" aria-labelledby="info-title" onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === 'Escape') onClose() }}>
        <button className="modal-close" onClick={onClose} aria-label="Close" autoFocus><X /></button>
        <p className="kicker">TECHx26 · Museum of Technology</p>
        <div className="info-tabs" role="tablist" aria-label="Information">
          {topics.map((item) => (
            <button key={item.id} role="tab" id={`info-tab-${item.id}`} aria-selected={topic === item.id} aria-controls="info-panel" onClick={() => setTopic(item.id)}>{item.icon}{item.label}</button>
          ))}
        </div>
        <div className="info-panel" id="info-panel" role="tabpanel" aria-labelledby={`info-tab-${topic}`} onClick={(event) => { if ((event.target as HTMLElement).closest('a')) onClose() }}>
          {topic === 'help' ? <Help /> : topic === 'accessibility' ? <AccessibilityInfo /> : <Privacy />}
        </div>
      </section>
    </div>
  )
}
