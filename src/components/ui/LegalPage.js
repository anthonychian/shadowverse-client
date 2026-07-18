import React from "react";
import { Link } from "react-router-dom";
import "../../css/Legal.css";

// Shared shell for the static legal pages (/terms, /privacy).
export default function LegalPage({ title, updated, children }) {
  return (
    <div className="legal-root">
      <div className="legal-content">
        <Link className="legal-home-link" to="/">
          ← Back to Shadowverse Evolve Simulator
        </Link>
        <h1>{title}</h1>
        <div className="legal-updated">Last updated: {updated}</div>
        {children}
      </div>
    </div>
  );
}
