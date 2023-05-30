import React from 'react';
import './Board.css';
import {PieceData, Position, Type} from './Piece';
import Square, {SquareData, SquarePromotion} from './Square';

export enum Colour {
  None = 0,
  White = 1,
  Black = 2,
}

export type Castling = {
  colour: Colour;
  type: Type;
};

export type BoardData = {
  files: number;
  ranks: number;
  squares: SquareData[][];
  turn: Colour;
  setTurn: (value: Colour) => void;
  castling: Castling[];
  setCastling: (value: Castling[]) => void;
  enPassant: Position | null;
  setEnPassant: (value: Position | null) => void;
  halfMove: number;
  fullMove: number;
  promote: (square: SquareData, piece: PieceData) => void;
};

export const BoardContext = React.createContext<BoardData>(Object.create(null));
export const PromotionContext = React.createContext<
  [SquareData | null, React.Dispatch<React.SetStateAction<SquareData | null>>]
>([null, () => undefined]);

/**
 * Board component
 * @param {{string, number, number}} props fen, files, ranks
 * @return {JSX.Element} Board
 */
function Board({
  fen,
  files,
  ranks,
}: {
  fen: string;
  files: number;
  ranks: number;
}): JSX.Element {
  const boardData = React.useMemo(() => parseFen(fen, files, ranks), []);

  const [turn, setTurn] = React.useState<Colour>(boardData.turn);
  const [castling, setCastling] = React.useState<Castling[]>(
    boardData.castling
  );
  const [enPassant, setEnPassant] = React.useState<Position | null>(
    boardData.enPassant
  );

  const [promotion, setPromotion] = React.useState<SquareData | null>(null);

  boardData.turn = turn;
  boardData.setTurn = setTurn;

  boardData.castling = castling;
  boardData.setCastling = setCastling;

  boardData.enPassant = enPassant;
  boardData.setEnPassant = setEnPassant;

  boardData.promote = (square: SquareData, piece: PieceData) => {
    const {file, rank} = square;
    const squares = boardData.squares;
    squares[rank][file].piece = piece;
    setPromotion(null);
  };

  React.useEffect(() => {
    if (promotion !== null) return;
    console.log(boardToString(boardData));
    console.log(boardToFen(boardData));
  }, [JSON.stringify(boardData)]);

  return (
    <BoardContext.Provider value={boardData}>
      <PromotionContext.Provider value={[promotion, setPromotion]}>
        <div className="board">
          {Array.from({length: boardData.ranks}, (_, rank) => (
            <div key={rank} className="rank">
              {Array.from({length: boardData.files}, (_, file) => (
                <Square key={file} file={file} rank={rank} />
              ))}
            </div>
          ))}
          <BoardPromotion />
        </div>
      </PromotionContext.Provider>
    </BoardContext.Provider>
  );
}

/**
 * Board promotion component
 * @return {JSX.Element | null} Board promotion
 */
function BoardPromotion(): JSX.Element | null {
  const [promotion] = React.useContext(PromotionContext);
  if (!promotion) return null;
  const colour = promotion.piece.colour;

  let className = 'board promotion';
  switch (colour) {
    case Colour.White:
      className += ' white';
      break;
    case Colour.Black:
      className += ' black';
      break;
    default:
      break;
  }

  return (
    <div className={className}>
      <SquarePromotion promotionPiece={{colour: colour, type: Type.Queen}} />
      <SquarePromotion promotionPiece={{colour: colour, type: Type.Knight}} />
      <SquarePromotion promotionPiece={{colour: colour, type: Type.Rook}} />
      <SquarePromotion promotionPiece={{colour: colour, type: Type.Bishop}} />
    </div>
  );
}

/**
 * Get the board as a string
 * @param {BoardData} boardData The board data
 * @return {string} The board as a string
 */
function boardToString(boardData: BoardData): string {
  const {squares, files, ranks} = boardData;

  let board = '';
  for (let rank = 0; rank < ranks; rank++) {
    for (let file = 0; file < files; file++) {
      const piece = squares[file][rank].piece;
      if (piece.type === Type.None) board += piece.type;
      else if (piece.colour === Colour.White) {
        board += piece.type.toUpperCase();
      } else board += piece.type;
    }
    board += '\n';
  }

  return board;
}

function boardToFen(boardData: BoardData) {
  const {squares, turn, castling, enPassant, halfMove, fullMove, files, ranks} =
    boardData;

  let fen = '';
  for (let rank = 0; rank < ranks; rank++) {
    let empty = 0;
    for (let file = 0; file < files; file++) {
      const piece = squares[file][rank].piece;
      if (piece.type === Type.None) empty++;
      else {
        if (empty > 0) fen += empty;
        empty = 0;
        if (piece.colour === Colour.White) {
          fen += piece.type.toUpperCase();
        } else fen += piece.type;
      }
    }
    if (empty > 0) fen += empty;
    if (rank < ranks - 1) fen += '/';
  }

  switch (turn) {
    case Colour.White:
      fen += ' w';
      break;
    case Colour.Black:
      fen += ' b';
      break;
    default:
      break;
  }

  fen += ' ';
  castling.forEach(castle => {
    if (castle.colour === Colour.None) fen += '-';
    fen +=
      castle.colour === Colour.White
        ? castle.type.toUpperCase()
        : castle.type.toLowerCase();
  });

  if (enPassant === null) fen += ' -';
  else {
    fen += ' ' + String.fromCharCode('a'.charCodeAt(0) + enPassant[0]);
    fen += ranks - enPassant[1];
  }

  fen += ' ' + halfMove;
  fen += ' ' + fullMove;

  return fen;
}

/**
 * Parse the FEN string
 * @param {string} fen FEN string
 * @param {number} files The number of files
 * @param {number} ranks The number of ranks
 * @return {BoardData} The board data
 */
function parseFen(fen: string, files: number, ranks: number): BoardData {
  const data = fen.split(' ');
  const [pieceData, turn, castling, enPassant, halfMove, fullMove] = data;

  return {
    files,
    ranks,
    squares: parsePieceData(pieceData, files, ranks),
    turn: parseTurn(turn),
    setTurn: () => undefined,
    castling: parseCastling(castling),
    setCastling: () => undefined,
    enPassant: parseEnPassant(enPassant, ranks),
    setEnPassant: () => undefined,
    halfMove: parseHalfMove(halfMove),
    fullMove: parseFullMove(fullMove),
    promote: () => undefined,
  };
}

/**
 * Parse the FEN piece data
 * @param {string} pieceData FEN piece data string
 * @param {number} files The number of files
 * @param {number} ranks The number of ranks
 * @return {(SquareData[])[]} 2D array of SquareData
 */
function parsePieceData(
  pieceData: string,
  files: number,
  ranks: number
): SquareData[][] {
  const boardPieces = pieceData.split('/');
  const rankPieces = boardPieces.map(rank => rank.split(''));
  const pieces = rankPieces.map(piece => piece.flatMap(parsePiece));

  const squares: SquareData[][] = [];

  for (let rank = 0; rank < ranks; rank++) {
    const row: SquareData[] = [];
    for (let file = 0; file < files; file++) {
      row.push({
        file,
        rank,
        piece: pieces[file][rank],
      } as SquareData);
    }
    squares.push(row);
  }

  return squares;
}

/**
 * Parse the FEN piece
 * @param {string} piece FEN piece string
 * @return {PieceData[]} Array of PieceData
 */
function parsePiece(piece: string): PieceData[] {
  switch (piece) {
    case 'k':
      return [{type: Type.King, colour: Colour.Black}];
    case 'q':
      return [{type: Type.Queen, colour: Colour.Black}];
    case 'r':
      return [{type: Type.Rook, colour: Colour.Black}];
    case 'b':
      return [{type: Type.Bishop, colour: Colour.Black}];
    case 'n':
      return [{type: Type.Knight, colour: Colour.Black}];
    case 'p':
      return [{type: Type.Pawn, colour: Colour.Black}];
    case 'K':
      return [{type: Type.King, colour: Colour.White}];
    case 'Q':
      return [{type: Type.Queen, colour: Colour.White}];
    case 'R':
      return [{type: Type.Rook, colour: Colour.White}];
    case 'B':
      return [{type: Type.Bishop, colour: Colour.White}];
    case 'N':
      return [{type: Type.Knight, colour: Colour.White}];
    case 'P':
      return [{type: Type.Pawn, colour: Colour.White}];
    default:
      // eslint-disable-next-line no-case-declarations
      const number = parseInt(piece);
      if (isNaN(number)) throw new Error('Invalid FEN');
      return Array.from({length: number}, () => ({
        type: Type.None,
        colour: Colour.None,
      }));
  }
}

/**
 * Parse the FEN turn
 * @param {string} turn FEN turn string
 * @return {Colour} Colour of the turn
 */
function parseTurn(turn: string): Colour {
  switch (turn) {
    case 'w':
      return Colour.White;
    case 'b':
      return Colour.Black;
    default:
      throw new Error('Invalid FEN');
  }
}

/**
 * Parse the FEN castling
 * @param {string} castling FEN castling string
 * @return {Castling[]} Array of Castling
 */
function parseCastling(castling: string): Castling[] {
  const castlingRegex = /^[KQkq-]{1,4}$/;
  if (!castlingRegex.test(castling)) throw new Error('Invalid FEN');

  const castlingArray: Castling[] = [];
  if (castling === '-') return castlingArray;

  const castlingSides = castling.split('');
  for (const castlingSide of castlingSides) {
    switch (castlingSide) {
      case 'K':
        castlingArray.push({
          colour: Colour.White,
          type: Type.King,
        });
        break;
      case 'Q':
        castlingArray.push({
          colour: Colour.White,
          type: Type.Queen,
        });
        break;
      case 'k':
        castlingArray.push({
          colour: Colour.Black,
          type: Type.King,
        });
        break;
      case 'q':
        castlingArray.push({
          colour: Colour.Black,
          type: Type.Queen,
        });
        break;
      default:
        break;
    }
  }

  return castlingArray;
}

/**
 * Parse the FEN en passant
 * @param {string} enPassant FEN en passant string
 * @param {number} ranks The number of ranks
 * @return {Position | null} Position of the en passant square
 */
function parseEnPassant(enPassant: string, ranks: number): Position | null {
  if (enPassant === '-') return null;
  const regex = /^[a-h][1-8]$/;
  if (!regex.test(enPassant)) throw new Error('Invalid FEN');

  const [file, rank] = enPassant.split('');
  const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0);
  const rankIndex = ranks - parseInt(rank);

  return [fileIndex, rankIndex];
}

/**
 * Parse the FEN half move
 * @param {string} halfMove FEN half move string
 * @return {number} The number of half moves
 */
function parseHalfMove(halfMove: string): number {
  const hm = parseInt(halfMove);
  if (isNaN(hm)) throw new Error('Invalid FEN');
  return hm;
}

/**
 * Parse the FEN full move
 * @param {string} fullMove FEN full move string
 * @return {number} The number of full moves
 */
function parseFullMove(fullMove: string): number {
  const fm = parseInt(fullMove);
  if (isNaN(fm)) throw new Error('Invalid FEN');
  return fm;
}

export default Board;
