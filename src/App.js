import Game from "./pages/Game";
import Home from "./pages/Home";
import CreateDeck from "./pages/CreateDeck";
import SharedDeck from "./pages/SharedDeck";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/deck" element={<CreateDeck />} />
        <Route path="/deck/:id" element={<CreateDeck />} />
        {/* The one deck view: what Preview opens and what a share link points
            at. Always backed by a shared_decks row, so previewing your own deck
            needs a Discord login; a public share stays viewable by anyone. */}
        <Route path="/decks/:id" element={<SharedDeck />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Router>
  );
}

export default App;
