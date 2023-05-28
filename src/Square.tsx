import React from 'react';
import {BoardContext, BoardData, Colour} from './Board';
import Piece, {PieceData, Type, isSquareAttacked} from './Piece';
import './Square.css';

export type SquareData = {
  file: number; // a-h
  rank: number; // 1-8
  piece: PieceData;
  isDestination: boolean;
  setDestination: (value: boolean) => void;
  isSelected: boolean;
  setSelected: (value: boolean) => void;
};

export const SquareContext = React.createContext<{
  file: number;
  rank: number;
}>(Object.create(null));

/**
 * Square component
 * @param {{number, number}} props file, rank
 * @return {JSX.Element}
 */
function Square({file, rank}: {file: number; rank: number}): JSX.Element {
  const boardData = React.useContext(BoardContext);
  const {files, ranks, squares, turn} = boardData;
  const piece = squares[file][rank].piece;

  const [destination, setDestination] = React.useState(false);
  const [selected, setSelected] = React.useState(false);

  squares[file][rank].isDestination = destination;
  squares[file][rank].setDestination = setDestination;

  squares[file][rank].isSelected = selected;
  squares[file][rank].setSelected = (value: boolean) => {
    if (value) {
      for (let r = 0; r < ranks; r++) {
        for (let f = 0; f < files; f++) {
          if (f === file && r === rank) continue;
          squares[f][r].setSelected(false);
          squares[f][r].setDestination(false);
        }
      }
    }
    setSelected(value);
  };

  let squareClassName = 'square';

  if (rank % 2 === file % 2) squareClassName += ' white';
  else squareClassName += ' black';

  let overlayClassName = squareClassName;

  if (selected) overlayClassName += ' selected';

  if (destination) {
    overlayClassName += ' destination';
    if (piece.type !== Type.None) overlayClassName += ' capture';
  }

  if (
    turn === piece.colour &&
    piece.type === Type.King &&
    isSquareAttacked(boardData, file, rank, piece.colour)
  ) {
    overlayClassName += ' check';
  }

  /**
   * Handle click event
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} event
   */
  function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (destination) movePiece(boardData, file, rank);
    for (let rank = 0; rank < ranks; rank++) {
      for (let file = 0; file < files; file++) {
        squares[file][rank].setSelected(false);
        squares[file][rank].setDestination(false);
      }
    }
    event.stopPropagation();
  }

  return (
    <SquareContext.Provider value={{file, rank}}>
      <div className={squareClassName} onClick={handleClick}>
        <div className={overlayClassName}>
          {/* <p className="coord debug">
            {'[file:' + file + ', rank:' + rank + ']'}
          </p> */}
          {ranks - 1 === rank && (
            <p className="coord file">
              {String.fromCharCode('a'.charCodeAt(0) + file)}
            </p>
          )}
          {files - 1 === file && <p className="coord rank">{ranks - rank}</p>}
          <Piece />
        </div>
      </div>
    </SquareContext.Provider>
  );
}

/**
 * Move piece to destination
 * @param {BoardData} boardData
 * @param {number} file
 * @param {number} rank
 * @return {void}
 */
function movePiece(boardData: BoardData, file: number, rank: number): void {
  const {files, ranks, squares} = boardData;
  const selected = getSelected(files, ranks, squares);
  if (!selected) return;
  squares[file][rank].piece = selected.piece;
  selected.piece = {type: Type.None, colour: Colour.None};
  boardData.setTurn(
    boardData.turn === Colour.White ? Colour.Black : Colour.White
  );
  boardData.setEnPassant(null);
  if (
    squares[file][rank].piece.type === Type.Pawn &&
    Math.abs(selected.file - rank) === 2
  ) {
    boardData.setEnPassant([file, rank + (selected.file - rank) / 2]);
  }
}

/**
 * Get selected square
 * @param {number} files
 * @param {number} ranks
 * @param {(SquareData[])[]} squares
 * @return {SquareData | null}
 */
function getSelected(
  files: number,
  ranks: number,
  squares: SquareData[][]
): SquareData | null {
  for (let rank = 0; rank < ranks; rank++) {
    for (let file = 0; file < files; file++) {
      if (squares[file][rank].isSelected) return squares[file][rank];
    }
  }
  return null;
}

export default Square;
