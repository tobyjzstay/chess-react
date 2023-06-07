import React from 'react';
import {BoardContext, BoardData, Colour, PromotionContext} from './Board';
import './Piece.css';
import {SquareContext} from './Square';

export type PieceData = {
  colour: Colour;
  type: Type;
};

export enum Type {
  None = '.',
  King = 'k',
  Queen = 'q',
  Rook = 'r',
  Bishop = 'b',
  Knight = 'n',
  Pawn = 'p',
}

export type Position = [number, number]; // [file, rank]

/**
 * Piece component
 * @return {JSX.Element} Piece
 */
function Piece(): JSX.Element | null {
  const boardData = React.useContext(BoardContext);
  const {squares, turn} = boardData;
  const {file, rank} = React.useContext(SquareContext);

  const square = squares[file][rank];
  const piece = square.piece;

  const className = getPieceClassName(piece, 'piece');
  if (className === null) return null;

  /**
   * Handle click event
   * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} event The mouse event
   * @return {void}
   */
  function handleClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void {
    if (piece.colour !== turn) return;
    const isSelected = square.isSelected;
    square.setSelected(!isSelected);
    const moves = legalMoves(boardData, file, rank, false, turn);
    moves.forEach(([file, rank]) => {
      squares[file][rank].setDestination(!isSelected);
    });
    event.stopPropagation();
  }

  return <div className={className} onClick={handleClick}></div>;
}

/**
 * Piece promotion component
 * @param {{PieceData}} props The piece to promote to
 * @return {JSX.Element} The promotion piece option
 */
export function PiecePromotion({
  promotionPiece,
}: {
  promotionPiece: PieceData;
}): JSX.Element {
  const {promote} = React.useContext(BoardContext);
  const [promotion] = React.useContext(PromotionContext);
  const className = getPieceClassName(promotionPiece, 'piece promotion')!;
  return (
    <div
      className={className}
      onClick={() => promote(promotion!, promotionPiece)}
    />
  );
}

/**
 * Get the class name for a piece
 * @param {PieceData} piece The piece
 * @param {prefix} prefix The class name prefix
 * @return {string | null} The class name
 */
function getPieceClassName(piece: PieceData, prefix: string): string | null {
  let className = prefix;
  switch (piece.colour) {
    case Colour.White:
      className += ' white';
      break;
    case Colour.Black:
      className += ' black';
      break;
    default:
      return null;
  }

  switch (piece.type) {
    case Type.King:
      className += ' king';
      break;
    case Type.Queen:
      className += ' queen';
      break;
    case Type.Rook:
      className += ' rook';
      break;
    case Type.Bishop:
      className += ' bishop';
      break;
    case Type.Knight:
      className += ' knight';
      break;
    case Type.Pawn:
      className += ' pawn';
      break;
    default:
      return null;
  }

  return className;
}

/**
 * Get legal moves for a piece
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the piece
 * @param {number} rank The rank of the piece
 * @param {boolean} pseudo Whether to check for pseudo-legal moves
 * @return {Position[]} The legal moves
 */
export function legalMoves(
  boardData: BoardData,
  file: number,
  rank: number,
  pseudo: boolean,
  colour: Colour
): Position[] {
  const {squares} = boardData;
  const piece = squares[file][rank].piece;
  if (piece.colour !== colour) return [];
  switch (piece.type) {
    case Type.King:
      return kingMoves(boardData, file, rank, pseudo);
    case Type.Queen:
      return queenMoves(boardData, file, rank, pseudo);
    case Type.Rook:
      return rookMoves(boardData, file, rank, pseudo);
    case Type.Bishop:
      return bishopMoves(boardData, file, rank, pseudo);
    case Type.Knight:
      return knightMoves(boardData, file, rank, pseudo);
    case Type.Pawn:
      return pawnMoves(boardData, file, rank, pseudo);
    default:
      break;
  }

  return [];
}

/**
 * Get legal moves for a king
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the king
 * @param {number} rank The rank of the king
 * @param {boolean} pseudo Whether to check for pseudo-legal moves
 * @return {Position[]} The legal moves
 */
function kingMoves(
  boardData: BoardData,
  file: number,
  rank: number,
  pseudo: boolean
): Position[] {
  const {files, ranks, squares, castling} = boardData;
  const piece = squares[file][rank].piece;
  const moves: Position[] = [];

  for (const move of KING_DIRECTIONS) {
    const newFile = file + move[0];
    const newRank = rank + move[1];
    if (!(newFile < 0 || newFile >= files || newRank < 0 || newRank >= ranks)) {
      if (squares[newFile][newRank].piece.colour === piece.colour) {
        continue;
      } else if (
        !pseudo &&
        isIllegalMove(boardData, file, rank, piece, newFile, newRank)
      ) {
        continue;
      }
      moves.push([newFile, newRank]);
    }
  }

  if (!pseudo && !isSquareAttacked(boardData, file, rank, piece.colour)) {
    for (const castle of castling) {
      if (castle.colour !== piece.colour) continue;

      const rankPieces = squares.map(fileSquares => fileSquares[rank].piece);

      switch (castle.type) {
        case Type.Queen:
          // queenside castling
          if (rankPieces[0].type !== Type.Rook) continue;
          for (let f = 1; f <= file; f++) {
            if (!pseudo && isSquareAttacked(boardData, f, rank, piece.colour))
              break;
            else if (rankPieces[f].type === Type.King) {
              if (f < 2) continue;
              moves.push([f - 2, rank], [0, rank]);
            } else if (rankPieces[f].type !== Type.None) break;
          }
          break;
        case Type.King:
          // kingside castling
          if (rankPieces[files - 1].type !== Type.Rook) continue;
          for (let f = files - 2; f >= file; f--) {
            if (!pseudo && isSquareAttacked(boardData, f, rank, piece.colour))
              break;
            else if (rankPieces[f].type === Type.King) {
              if (files - 1 - f < 2) break;
              moves.push([f + 2, rank], [files - 1, rank]);
            } else if (rankPieces[f].type !== Type.None) break;
          }
          break;
        default:
          break;
      }
    }
  }

  return moves;
}

/**
 * Check if the move is illegal
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the piece
 * @param {number} rank The rank of the piece
 * @param {PieceData} piece The piece data
 * @param {number} newFile The new file of the piece
 * @param {number} newRank The new rank of the piece
 * @return {boolean} Whether the move is illegal
 */
function isIllegalMove(
  boardData: BoardData,
  file: number,
  rank: number,
  piece: PieceData,
  newFile: number,
  newRank: number
): boolean {
  // make a copy of the board data to test the move
  const _boardData = JSON.parse(JSON.stringify(boardData)) as BoardData;
  const {files, ranks, squares} = _boardData;

  squares[file][rank].piece = {type: Type.None, colour: Colour.None};
  squares[newFile][newRank].piece = piece;

  // check if the king is in check
  for (let r = 0; r < ranks; r++) {
    for (let f = 0; f < files; f++) {
      const p = squares[f][r].piece;
      if (p.colour === piece.colour && p.type === Type.King) {
        if (isSquareAttacked(_boardData, f, r, p.colour)) return true;
      }
    }
  }

  return false;
}

/**
 * Check if a square is attacked by a piece of a certain colour
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the square
 * @param {number} rank The rank of the square
 * @param {Colour} colour The colour of the attacking piece
 * @return {boolean} Whether the square is attacked
 */
export function isSquareAttacked(
  boardData: BoardData,
  file: number,
  rank: number,
  colour: Colour
): boolean {
  const {files, ranks, squares} = boardData;
  for (let r = 0; r < ranks; r++) {
    for (let f = 0; f < files; f++) {
      if (f === file && r === rank) continue; // ignore the square itself
      const piece = squares[f][r].piece;
      if (piece.colour === colour) continue; // ignore pieces of the same colour
      const moves = legalMoves(boardData, f, r, true, piece.colour);
      for (const move of moves) {
        // check if the square is attacked by the piece
        if (move[0] === file && move[1] === rank) return true;
      }
    }
  }

  return false;
}

/**
 * Get legal moves for a queen
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the queen
 * @param {number} rank The rank of the queen
 * @param {boolean} pseudo Whether to check for pseudo-legal moves
 * @return {Position[]} The legal moves
 */
function queenMoves(
  boardData: BoardData,
  file: number,
  rank: number,
  pseudo: boolean
): Position[] {
  const {squares, files, ranks} = boardData;
  const piece = squares[file][rank].piece;
  const moves: Position[] = [];

  for (const move of QUEEN_DIRECTIONS) {
    let newFile = file + move[0];
    let newRank = rank + move[1];
    // traverse in the direction of the move
    while (
      !(newFile < 0 || newFile >= files || newRank < 0 || newRank >= ranks)
    ) {
      if (squares[newFile][newRank].piece.colour === piece.colour) break;
      else if (
        !pseudo &&
        isIllegalMove(boardData, file, rank, piece, newFile, newRank)
      ) {
        newFile += move[0];
        newRank += move[1];
        continue;
      }
      moves.push([newFile, newRank]);
      if (squares[newFile][newRank].piece.colour !== Colour.None) break;
      // move to the next square
      newFile += move[0];
      newRank += move[1];
    }
  }

  return moves;
}

/**
 * Get legal moves for a rook
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the rook
 * @param {number} rank The rank of the rook
 * @param {boolean} pseudo Whether to check for pseudo-legal moves
 * @return {Position[]} The legal moves
 */
function rookMoves(
  boardData: BoardData,
  file: number,
  rank: number,
  pseudo: boolean
): Position[] {
  const {files, ranks, squares} = boardData;
  const piece = squares[file][rank].piece;
  const moves: Position[] = [];

  for (const move of ROOK_DIRECTIONS) {
    let newFile = file + move[0];
    let newRank = rank + move[1];
    // traverse in the direction of the move
    while (
      !(newFile < 0 || newFile >= files || newRank < 0 || newRank >= ranks)
    ) {
      if (squares[newFile][newRank].piece.colour === piece.colour) break;
      else if (
        !pseudo &&
        isIllegalMove(boardData, file, rank, piece, newFile, newRank)
      ) {
        newFile += move[0];
        newRank += move[1];
        continue;
      }
      moves.push([newFile, newRank]);
      if (squares[newFile][newRank].piece.colour !== Colour.None) break;
      // move to the next square
      newFile += move[0];
      newRank += move[1];
    }
  }

  return moves;
}

/**
 * Get legal moves for a bishop
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the bishop
 * @param {number} rank The rank of the bishop
 * @param {boolean} pseudo Whether to check for pseudo-legal moves
 * @return {Position[]} The legal moves
 */
function bishopMoves(
  boardData: BoardData,
  file: number,
  rank: number,
  pseudo: boolean
): Position[] {
  const {files, ranks, squares} = boardData;
  const piece = squares[file][rank].piece;
  const moves: Position[] = [];

  for (const move of BISHOP_DIRECTIONS) {
    let newFile = file + move[0];
    let newRank = rank + move[1];
    // traverse in the direction of the move
    while (
      !(newFile < 0 || newFile >= files || newRank < 0 || newRank >= ranks)
    ) {
      if (squares[newFile][newRank].piece.colour === piece.colour) break;
      else if (
        !pseudo &&
        isIllegalMove(boardData, file, rank, piece, newFile, newRank)
      ) {
        newFile += move[0];
        newRank += move[1];
        continue;
      }
      moves.push([newFile, newRank]);
      if (squares[newFile][newRank].piece.colour !== Colour.None) break;
      // move to the next square
      newFile += move[0];
      newRank += move[1];
    }
  }

  return moves;
}

/**
 * Get legal moves for a knight
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the knight
 * @param {number} rank The rank of the knight
 * @param {boolean} pseudo Whether to check for pseudo-legal moves
 * @return {Position[]} The legal moves
 */
function knightMoves(
  boardData: BoardData,
  file: number,
  rank: number,
  pseudo: boolean
): Position[] {
  const {files, ranks, squares} = boardData;
  const piece = squares[file][rank].piece;
  const moves: Position[] = [];

  for (const move of KNIGHT_DIRECTIONS) {
    const newFile = file + move[0];
    const newRank = rank + move[1];
    if (newFile < 0 || newFile >= files || newRank < 0 || newRank >= ranks) {
      continue;
    } else if (squares[newFile][newRank].piece.colour === piece.colour) {
      continue;
    } else if (
      !pseudo &&
      isIllegalMove(boardData, file, rank, piece, newFile, newRank)
    )
      continue;
    moves.push([newFile, newRank]);
  }

  return moves;
}

/**
 * Get legal moves for a pawn
 * @param {BoardData} boardData The board data
 * @param {number} file The file of the pawn
 * @param {number} rank The rank of the pawn
 * @param {boolean} pseudo Whether to check for pseudo-legal moves
 * @return {Position[]} The legal moves
 */
function pawnMoves(
  boardData: BoardData,
  file: number,
  rank: number,
  pseudo: boolean
): Position[] {
  const {files, ranks, squares, enPassant} = boardData;
  const piece = squares[file][rank].piece;
  const moves: Position[] = [];

  let direction;
  // direction is inverted as board origin is top left
  switch (piece.colour) {
    case Colour.White:
      direction = -1;
      break;
    case Colour.Black:
      direction = 1;
      break;
    default:
      return [];
  }

  for (const index in PAWN_DIRECTIONS) {
    if (!Object.prototype.hasOwnProperty.call(PAWN_DIRECTIONS, index)) {
      continue;
    }

    const move = PAWN_DIRECTIONS[index];

    const newFile = file + move[0] * direction;
    const newRank = rank + move[1] * direction;

    if (newFile < 0 || newFile >= files || newRank < 0 || newRank >= ranks) {
      continue;
    }

    switch (index) {
      case '0':
        // move
        if (squares[newFile][newRank].piece.colour !== Colour.None) {
          continue;
        }
        break;
      case '1':
        // start move
        if (rank !== 1 && rank !== 6) continue;
        // if the first move is blocked, the second move is also blocked
        else if (moves.length === 0) continue;
        else if (squares[newFile][newRank].piece.colour !== Colour.None) {
          continue;
        }
        break;
      case '2':
      case '3':
        // capture
        // eslint-disable-next-line no-case-declarations
        const colour = squares[newFile][newRank].piece.colour;
        if (colour === piece.colour) continue;
        if (colour === Colour.None) {
          if (enPassant === null) continue;
          else if (enPassant[0] !== newFile || enPassant[1] !== newRank) {
            continue;
          }
          // en passant
        }
        break;
      default:
        break;
    }

    if (squares[newFile][newRank].piece.colour === piece.colour) continue;
    else if (
      !pseudo &&
      isIllegalMove(boardData, file, rank, piece, newFile, newRank)
    ) {
      continue;
    }
    moves.push([newFile, newRank]);
  }

  return moves;
}

const PAWN_DIRECTIONS: Position[] = [
  [0, 1],
  [0, 2],
  [1, 1],
  [-1, 1],
];

const KNIGHT_DIRECTIONS: Position[] = [
  [-2, 1],
  [-1, 2],
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
];

const BISHOP_DIRECTIONS: Position[] = [
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1],
];

const ROOK_DIRECTIONS: Position[] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

const QUEEN_DIRECTIONS: Position[] = [...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS];

const KING_DIRECTIONS: Position[] = QUEEN_DIRECTIONS;

export default Piece;
