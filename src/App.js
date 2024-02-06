import Game from "./pages/Game";
import Home2 from "./pages/Home2";
import CreateDeck from "./pages/CreateDeck";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home2 />} />
        <Route path="/game" element={<Game />} />
        <Route path="/deck" element={<CreateDeck />} />
      </Routes>
    </Router>
  );
}

export default App;
