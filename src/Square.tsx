import React from 'react';
import {BoardContext, BoardData, Colour, PromotionContext} from './Board';
import Piece, {
  PieceData,
  PiecePromotion,
  Type,
  isSquareAttacked,
} from './Piece';
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
 * @return {JSX.Element} Square
 */
function Square({file, rank}: {file: number; rank: number}): JSX.Element {
  const boardData = React.useContext(BoardContext);
  const [, setPromotion] = React.useContext(PromotionContext);
  const {files, ranks, squares, turn} = boardData;
  const piece = squares[file][rank].piece;

  const [destination, setDestination] = React.useState(false);
  const [selected, setSelected] = React.useState(false);

  squares[file][rank].isDestination = destination;
  squares[file][rank].setDestination = setDestination;

  squares[file][rank].isSelected = selected;
  squares[file][rank].setSelected = (value: boolean) => {
    if (value)
      // clear all other selected squares
      for (let r = 0; r < ranks; r++) {
        for (let f = 0; f < files; f++) {
          if (f === file && r === rank) continue;
          squares[f][r].setSelected(false);
          squares[f][r].setDestination(false);
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
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} event The mouse event
   * @return {void}
   */
  function handleClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    if (destination) movePiece(boardData, file, rank, setPromotion);
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
 * Square promotion option
 * @param {{PieceData}} props The piece to promote to
 * @return {JSX.Element} The promotion square option
 */
export function SquarePromotion({
  promotionPiece,
}: {
  promotionPiece: PieceData;
}): JSX.Element {
  return (
    <div className="square promotion">
      <PiecePromotion promotionPiece={promotionPiece} />
    </div>
  );
}

/**
 * Move piece to destination
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the piece
 * @param {number} rank The rank of the piece
 * @return {void}
 */
function movePiece(
  boardData: BoardData,
  file: number,
  rank: number,
  setPromotion: React.Dispatch<React.SetStateAction<SquareData | null>>
): void {
  const {files, ranks, squares} = boardData;
  const selected = getSelected(files, ranks, squares);
  if (!selected) return;

  // move piece
  squares[file][rank].piece = selected.piece;
  selected.piece = {type: Type.None, colour: Colour.None};

  boardData.setEnPassant(null);

  // handle special moves
  switch (squares[file][rank].piece.type) {
    case Type.Pawn:
      if (Math.abs(selected.file - rank) === 2)
        // add en passant
        boardData.setEnPassant([file, rank + (selected.file - rank) / 2]);
      else if (
        boardData.enPassant !== null &&
        file === boardData.enPassant[0] &&
        rank === boardData.enPassant[1]
      ) {
        // en passant
        squares[file][
          rank + (squares[file][rank].piece.colour === Colour.White ? 1 : -1)
        ].piece = {type: Type.None, colour: Colour.None};
      } else if (rank === 0 || rank === ranks - 1)
        // promotion
        setPromotion(squares[file][rank]);
      break;
    case Type.King:
      // remove castling rights
      boardData.setCastling(
        boardData.castling.filter(
          castling => castling.colour !== squares[file][rank].piece.colour
        )
      );
      // castling
      // eslint-disable-next-line no-case-declarations
      const dx = file - selected.rank;
      if (Math.abs(dx) === 2) {
        if (dx > 0) {
          // kingside
          squares[file - 1][rank].piece = squares[files - 1][rank].piece;
          squares[files - 1][rank].piece = {
            type: Type.None,
            colour: Colour.None,
          };
        } else {
          // queenside
          squares[file + 1][rank].piece = squares[0][rank].piece;
          squares[0][rank].piece = {
            type: Type.None,
            colour: Colour.None,
          };
        }
      }
      break;
    case Type.Rook:
      // remove castling rights
      boardData.setCastling(
        boardData.castling.filter(
          castling =>
            castling.colour !== squares[file][rank].piece.colour ||
            (file !== 0 && castling.type === Type.Queen) ||
            (file !== files - 1 && castling.type === Type.King)
        )
      );
      break;
    default:
      break;
  }

  // change turn
  // boardData.setTurn(
  //   boardData.turn === Colour.White ? Colour.Black : Colour.White
  // );

  boardData.incrementTurn(squares[file][rank].piece.type === Type.Pawn);
}

/**
 * Get selected square
 * @param {number} files The number of files
 * @param {number} ranks The number of ranks
 * @param {(SquareData[])[]} squares The board squares
 * @return {SquareData | null} The selected square
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
