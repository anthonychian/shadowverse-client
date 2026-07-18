import React from "react";
import { Link } from "react-router-dom";
import LegalPage from "../components/ui/LegalPage";

const DISCORD_URL =
  "https://discord.gg/shadowverse-evolve-tcg-community-928746294384677004";

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="July 18, 2026">
      <p>
        These Terms of Service ("Terms") govern your use of the Shadowverse
        Evolve Online Simulator (the "Service"), a free, fan-made online
        simulator for the Shadowverse: Evolve trading card game. By using the
        Service you agree to these Terms. If you do not agree, please do not
        use the Service.
      </p>

      <h2>1. About the Service</h2>
      <p>
        The Service is a non-commercial fan project. It lets players build
        decks and play simulated matches of Shadowverse: Evolve against other
        players in real time. The Service is provided free of charge, requires
        no account, and sells nothing.
      </p>

      <h2>2. Intellectual Property</h2>
      <p>
        Shadowverse: Evolve, its card names, card artwork, characters, and
        related materials are the property of their respective owners,
        including Cygames, Inc. and Bushiroad Inc. This project is not
        affiliated with, endorsed by, or sponsored by Cygames, Bushiroad, or
        any of their partners. All such materials are used for non-commercial,
        fan purposes only. If you are a rights holder and would like content
        removed, please contact us (see Contact below) and we will comply
        promptly.
      </p>

      <h2>3. Acceptable Use</h2>
      <p>When using the Service you agree not to:</p>
      <ul>
        <li>
          use offensive, hateful, or impersonating display names or transmit
          abusive content to other players;
        </li>
        <li>
          disrupt matches, harass other players, or intentionally degrade the
          Service for others;
        </li>
        <li>
          attempt to gain unauthorized access to the Service, its servers, or
          other players' sessions, or interfere with the Service by means such
          as automated traffic, scraping at disruptive volume, or exploiting
          bugs;
        </li>
        <li>use the Service for any unlawful purpose.</li>
      </ul>

      <h2>4. Availability</h2>
      <p>
        The Service is a hobby project and is provided on an "as is" and "as
        available" basis. We do not guarantee uptime, and matches, rooms, or
        game state may be lost at any time (for example when a server
        restarts). We may modify, suspend, or discontinue the Service at any
        time without notice.
      </p>

      <h2>5. Disclaimer of Warranties and Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, the Service is provided
        without warranties of any kind, express or implied. To the maximum
        extent permitted by law, the operators of the Service shall not be
        liable for any indirect, incidental, special, consequential, or
        punitive damages, or any loss of data, arising out of or relating to
        your use of the Service.
      </p>

      <h2>6. Termination</h2>
      <p>
        We may restrict or block access to the Service for anyone who violates
        these Terms or abuses the Service, at our discretion and without
        notice.
      </p>

      <h2>7. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. The "Last updated" date
        at the top of this page reflects the most recent revision. Continued
        use of the Service after changes take effect constitutes acceptance of
        the revised Terms.
      </p>

      <h2>8. Privacy</h2>
      <p>
        Our <Link to="/privacy">Privacy Policy</Link> describes what
        information the Service handles and how.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms can be raised in our{" "}
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          community Discord server
        </a>
        .
      </p>
    </LegalPage>
  );
}
