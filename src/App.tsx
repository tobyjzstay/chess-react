import React from 'react';
import './App.css';
import Board from './Board';

const STARTING_POSITION =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const RANKS = 8;
export const FILES = 8;

/**
 * App component
 * @return {JSX.Element} App
 */
function App(): JSX.Element {
  return <Board files={FILES} ranks={RANKS} fen={STARTING_POSITION} />;
}

export default App;
