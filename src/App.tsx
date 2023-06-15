/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css';
import Board from './Board';

export const STARTING_POSITION =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const CASTLING_POSITION = 'r3k2r/pppp1ppp/8/8/8/8/PPPP1PPP/R3K2R w KQkq - 0 1';
const EN_PASSANT_POSITION = '3k4/4p1p1/8/5P1P/1p1p4/8/P1P5/3K4 w - - 0 1';
const PROMOTION_POSITION = '8/1K4P1/8/8/8/8/1k4p1/8 w - - 0 1';
const CHECKMATE_POSITION = '6k1/4Rppp/8/8/8/8/5PPP/6K1 w - - 0 1';
const STALEMATE_POSITION = '8/8/8/8/8/3pk3/8/4K3 b - - 0 1';

export const RANKS = 8;
export const FILES = 8;

/**
 * App component
 * @return {JSX.Element} App
 */
function App(): JSX.Element {
  return <Board fen={STARTING_POSITION} files={FILES} ranks={RANKS} />;
}

export default App;
