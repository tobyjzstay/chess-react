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
  const piece = squares[rank][file].piece;

  const [destination, setDestination] = React.useState(false);
  const [selected, setSelected] = React.useState(false);

  squares[rank][file].isDestination = destination;
  squares[rank][file].setDestination = setDestination;

  squares[rank][file].isSelected = selected;
  squares[rank][file].setSelected = (value: boolean) => {
    if (value)
      // clear all other selected squares
      for (let r = 0; r < ranks; r++) {
        for (let f = 0; f < files; f++) {
          if (f === file && r === rank) continue;
          squares[r][f].setSelected(false);
          squares[r][f].setDestination(false);
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
        squares[rank][file].setSelected(false);
        squares[rank][file].setDestination(false);
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
  const [ref, setRef] = React.useState<HTMLDivElement | null>(null);
  const [promotion] = React.useContext(PromotionContext);

  React.useEffect(() => {
    if (!ref || !promotion) return;
    const sqaure = ref?.getBoundingClientRect();
    const size = sqaure?.width || 0;
    ref?.style.setProperty('left', promotion.file * size + 'px');
  }, [ref, promotion]);

  return (
    <div className="square promotion" ref={setRef}>
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

  if (squares[rank][file].piece.colour === selected.piece.colour) {
    // attempting to 'capture' own piece (castling)
    if (squares[rank][file].piece.type !== Type.Rook) return;
    const direction = file < selected.file ? -2 : 2;
    movePiece(
      boardData,
      selected.file + direction,
      selected.rank,
      setPromotion
    );
    return;
  } else {
    // move piece
    squares[rank][file].piece = selected.piece;
    selected.piece = {type: Type.None, colour: Colour.None};
  }

  boardData.setEnPassant(null);

  // handle special moves
  switch (squares[rank][file].piece.type) {
    case Type.Pawn:
      if (Math.abs(selected.rank - rank) === 2) {
        // add en passant
        boardData.setEnPassant([file, rank + (selected.rank - rank) / 2]);
      } else if (
        boardData.enPassant !== null &&
        file === boardData.enPassant[0] &&
        rank === boardData.enPassant[1]
      ) {
        // en passant
        squares[
          rank + (squares[rank][file].piece.colour === Colour.White ? 1 : -1)
        ][file].piece = {type: Type.None, colour: Colour.None};
      } else if (rank === 0 || rank === ranks - 1)
        // promotion
        setPromotion(squares[rank][file]);
      break;
    case Type.King:
      // remove castling rights
      boardData.setCastling(
        boardData.castling.filter(
          castling => castling.colour !== squares[rank][file].piece.colour
        )
      );
      // castling
      // eslint-disable-next-line no-case-declarations
      const dx = file - selected.file;
      if (Math.abs(dx) === 2) {
        if (dx > 0) {
          // kingside
          squares[rank][file - 1].piece = squares[rank][files - 1].piece;
          squares[rank][files - 1].piece = {
            type: Type.None,
            colour: Colour.None,
          };
        } else {
          // queenside
          squares[rank][file + 1].piece = squares[rank][0].piece;
          squares[rank][0].piece = {
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
            castling.colour !== squares[rank][file].piece.colour ||
            (file !== 0 && castling.type === Type.Queen) ||
            (file !== files - 1 && castling.type === Type.King)
        )
      );
      break;
    default:
      break;
  }

  // change turn
  boardData.incrementTurn(squares[rank][file].piece.type === Type.Pawn);
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
      if (squares[rank][file].isSelected) return squares[rank][file];
    }
  }
  return null;
}

export default Square;
