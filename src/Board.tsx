import React from "react";
import "./Board.css";
import { PieceData, Position, Type } from "./Piece";
import Square, { SquareData } from "./Square";

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
    enPassant: Position | null;
    setEnPassant: (value: Position | null) => void;
    halfMove: number;
    fullMove: number;
};

export const BoardContext = React.createContext<BoardData>(Object.create(null));

function Board({ fen, files, ranks }: { fen: string; files: number; ranks: number }) {
    const boardData = React.useMemo(() => parseFen(fen, files, ranks), []);

    const [turn, setTurn] = React.useState<Colour>(boardData.turn);
    const [enPassant, setEnPassant] = React.useState<Position | null>(boardData.enPassant);

    boardData.turn = turn;
    boardData.setTurn = setTurn;

    boardData.enPassant = enPassant;
    boardData.setEnPassant = setEnPassant;

    console.log(boardToString(boardData, files, ranks));

    return (
        <BoardContext.Provider value={boardData}>
            <div className="board">
                {/* <div className="board promotion">
                    <div className="square promotion">
                        <div className="piece promotion white queen" />
                    </div>
                    <div className="square promotion">
                        <div className="piece promotion white knight" />
                    </div>
                    <div className="square promotion">
                        <div className="piece promotion white rook" />
                    </div>
                    <div className="square promotion">
                        <div className="piece promotion white bishop" />
                    </div>
                </div> */}
                {Array.from({ length: boardData.ranks }, (_, rank) => (
                    <div key={rank} className="rank">
                        {Array.from({ length: boardData.files }, (_, file) => (
                            <Square key={file} file={file} rank={rank} />
                        ))}
                    </div>
                ))}
            </div>
        </BoardContext.Provider>
    );
}

function boardToString(boardData: BoardData, files: number, ranks: number) {
    const { squares } = boardData;

    let board = "";
    for (let rank = 0; rank < ranks; rank++) {
        for (let file = 0; file < files; file++) {
            const piece = squares[file][rank].piece;
            if (piece.type === Type.None) board += piece.type;
            else if (piece.colour === Colour.White) board += piece.type.toUpperCase();
            else board += piece.type;
        }
        board += "\n";
    }

    return board;
}

function parseFen(fen: string, files: number, ranks: number): BoardData {
    const data = fen.split(" ");
    const [pieceData, turn, castling, enPassant, halfMove, fullMove] = data;

    return {
        files,
        ranks,
        squares: parsePieceData(pieceData, files, ranks),
        turn: parseTurn(turn),
        setTurn: () => undefined,
        castling: parseCastling(castling),
        enPassant: parseEnPassant(enPassant, ranks),
        setEnPassant: () => undefined,
        halfMove: parseHalfMove(halfMove),
        fullMove: parseFullMove(fullMove),
    };
}

function parsePieceData(pieceData: string, files: number, ranks: number): SquareData[][] {
    const boardPieces = pieceData.split("/");
    const rankPieces = boardPieces.map((rank) => rank.split(""));
    const pieces = rankPieces.map((piece) => piece.flatMap(parsePiece));

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

function parsePiece(piece: string): PieceData[] {
    switch (piece) {
        case "k":
            return [{ type: Type.King, colour: Colour.Black }];
        case "q":
            return [{ type: Type.Queen, colour: Colour.Black }];
        case "r":
            return [{ type: Type.Rook, colour: Colour.Black }];
        case "b":
            return [{ type: Type.Bishop, colour: Colour.Black }];
        case "n":
            return [{ type: Type.Knight, colour: Colour.Black }];
        case "p":
            return [{ type: Type.Pawn, colour: Colour.Black }];
        case "K":
            return [{ type: Type.King, colour: Colour.White }];
        case "Q":
            return [{ type: Type.Queen, colour: Colour.White }];
        case "R":
            return [{ type: Type.Rook, colour: Colour.White }];
        case "B":
            return [{ type: Type.Bishop, colour: Colour.White }];
        case "N":
            return [{ type: Type.Knight, colour: Colour.White }];
        case "P":
            return [{ type: Type.Pawn, colour: Colour.White }];
        default:
            // eslint-disable-next-line no-case-declarations
            const number = parseInt(piece);
            if (isNaN(number)) throw new Error("Invalid FEN");
            return Array.from({ length: number }, () => ({
                type: Type.None,
                colour: Colour.None,
            }));
    }
}

function parseTurn(turn: string): Colour {
    switch (turn) {
        case "w":
            return Colour.White;
        case "b":
            return Colour.Black;
        default:
            throw new Error("Invalid FEN");
    }
}

function parseCastling(castling: string): Castling[] {
    const castlingRegex = /^[KQkq-]{1,4}$/;
    if (!castlingRegex.test(castling)) throw new Error("Invalid FEN");

    const castlingArray: Castling[] = [];
    if (castling === "-") return castlingArray;

    const castlingSides = castling.split("");
    for (const castlingSide of castlingSides) {
        switch (castlingSide) {
            case "K":
                castlingArray.push({
                    colour: Colour.White,
                    type: Type.King,
                });
                break;
            case "Q":
                castlingArray.push({
                    colour: Colour.White,
                    type: Type.Queen,
                });
                break;
            case "k":
                castlingArray.push({
                    colour: Colour.Black,
                    type: Type.King,
                });
                break;
            case "q":
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

function parseEnPassant(enPassant: string, ranks: number): Position | null {
    if (enPassant === "-") return null;
    const regex = /^[a-h][1-8]$/;
    if (!regex.test(enPassant)) throw new Error("Invalid FEN");

    const [file, rank] = enPassant.split("");
    const fileIndex = file.charCodeAt(0) - "a".charCodeAt(0);
    const rankIndex = ranks - parseInt(rank);

    return [fileIndex, rankIndex];
}

function parseHalfMove(halfMove: string): number {
    const hm = parseInt(halfMove);
    if (isNaN(hm)) throw new Error("Invalid FEN");
    return hm;
}

function parseFullMove(fullMove: string): number {
    const fm = parseInt(fullMove);
    if (isNaN(fm)) throw new Error("Invalid FEN");
    return fm;
}

export default Board;
