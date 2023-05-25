import "./App.css";
import Board from "./Board";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const PUZZLE_FEN = "r3k2r/pppp1ppp/8/8/8/8/PPPP1PPP/R3K2R w KQkq - 0 1";

export const RANKS = 8;
export const FILES = 8;

function App() {
    // eslint-disable-next-line react/react-in-jsx-scope
    return <Board files={FILES} ranks={RANKS} fen={PUZZLE_FEN} />;
}

export default App;
