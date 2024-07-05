import Game from "./pages/Game";
import Home from "./pages/Home";
import CreateDeck from "./pages/CreateDeck";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/deck" element={<CreateDeck />} />
        <Route path="/deck/:id" element={<CreateDeck />} />
      </Routes>
    </Router>
  );
}

export default App;
