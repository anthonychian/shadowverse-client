import React from "react";
import { Link } from "react-router-dom";
import LegalPage from "../components/ui/LegalPage";

const DISCORD_URL =
  "https://discord.gg/shadowverse-evolve-tcg-community-928746294384677004";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="July 18, 2026">
      <p>
        This Privacy Policy explains what information the Shadowverse Evolve
        Online Simulator (the "Service") handles when you use it. The short
        version: there are no user accounts, we do not ask for your name or
        email, and we do not sell any data.
      </p>

      <h2>1. Information We Handle</h2>
      <p>The Service does not require registration. When you play, we handle:</p>
      <ul>
        <li>
          <strong>Display name (optional).</strong> If you choose one, it is
          shown to other players in the lobby and in games. It is stored in
          your own browser and relayed through our game server while you play.
        </li>
        <li>
          <strong>A random session identifier.</strong> Your browser generates
          a random ID per tab so the server can reconnect you to your game
          after a page reload. It is not linked to your identity.
        </li>
        <li>
          <strong>Game data.</strong> Room codes, deck contents, in-game
          actions, and in-game messages are relayed through our game server to
          your opponent in real time. The server keeps game state in memory
          only; it is discarded when the game ends or the server restarts. We
          do not maintain a database of players or matches.
        </li>
        <li>
          <strong>Usage analytics.</strong> We use Google Analytics to
          understand overall traffic (pages visited, approximate location,
          device type). Google Analytics sets cookies and receives your IP
          address. See Section 3.
        </li>
        <li>
          <strong>Hosting logs.</strong> Our hosting providers (Vercel for the
          website, Render for the game server) may keep standard technical
          logs, such as IP addresses, as part of operating their platforms.
        </li>
      </ul>

      <h2>2. Information Stored on Your Device</h2>
      <p>
        Decks you build, your display name, and in-progress game state are
        stored in your browser's local storage and session storage so they
        survive page reloads. This data stays on your device; you can remove
        it at any time by clearing your browser's site data for this site.
      </p>

      <h2>3. Third-Party Services</h2>
      <p>The Service relies on the following third parties:</p>
      <ul>
        <li>
          <strong>Google Analytics</strong> (traffic measurement) —{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Google Privacy Policy
          </a>
          . You can opt out with the{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noreferrer"
          >
            Google Analytics opt-out browser add-on
          </a>
          .
        </li>
        <li>
          <strong>Google Fonts</strong> (webfont delivery) — your browser
          requests fonts from Google's servers, which involves your IP
          address.
        </li>
        <li>
          <strong>Vercel</strong> (website hosting) and{" "}
          <strong>Render</strong> (game server hosting).
        </li>
      </ul>
      <p>
        We do not sell, rent, or trade any information, and we do not use it
        for advertising.
      </p>

      <h2>4. Data Retention</h2>
      <p>
        Game data on our server is transient and lives only in memory for the
        duration of a session. Data in your browser remains until you clear
        it. Analytics data is retained according to Google Analytics'
        settings and policies.
      </p>

      <h2>5. Children</h2>
      <p>
        The Service is not directed at children under 13, and we do not
        knowingly collect personal information from them. The Service collects
        no personal information beyond what is described above for any user.
      </p>

      <h2>6. Your Choices</h2>
      <ul>
        <li>Play without setting a display name.</li>
        <li>Clear your browser's site data to remove everything stored locally.</li>
        <li>Block or opt out of Google Analytics as described above.</li>
      </ul>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time; the "Last updated" date
        at the top reflects the latest revision.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about privacy can be raised in our{" "}
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          community Discord server
        </a>
        . See also our <Link to="/terms">Terms of Service</Link>.
      </p>
    </LegalPage>
  );
}
