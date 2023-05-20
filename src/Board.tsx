import React from "react";
import "./Board.css";
import { Colour, PieceData, Type } from "./Piece";
import Square, { SquareData } from "./Square";

const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const puzzleFen = "r1b2r1k/4qp1p/p1Nppb1Q/4nP2/1p2P3/2N5/PPP4P/2KR1BR1 b - - 5 18";

export const RANKS = 8;
export const FILES = 8;

type BoardData = {
    squares: SquareData[][];
    turn: Colour;
    castling: string;
    enPassant: string;
    halfMove: number;
    fullMove: number;
};

export const BoardContext = React.createContext<BoardData>(Object.create(null));

function Board() {
    const boardData = parseFen(puzzleFen);

    return (
        <BoardContext.Provider value={boardData}>
            <div className="board">
                <div className="file">
                    {Array.from({ length: FILES }, (_, file) => (
                        <div key={file} className="rank">
                            {Array.from({ length: RANKS }, (_, rank) => (
                                <Square key={rank} file={file} rank={rank} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </BoardContext.Provider>
    );
}

function parseFen(fen: string): BoardData {
    const data = fen.split(" ");
    const [pieceData, turn, castling, enPassant, halfMove, fullMove] = data;

    return {
        squares: parsePieceData(pieceData),
        turn: parseTurn(turn),
        castling: parseCastling(castling),
        enPassant: parseEnPassant(enPassant),
        halfMove: parseHalfMove(halfMove),
        fullMove: parseFullMove(fullMove),
    };
}

function parsePieceData(pieceData: string): SquareData[][] {
    const files = pieceData.split("/");
    const filePieces = files.map((rank) => rank.split(""));
    const pieces = filePieces.map((rank) => rank.flatMap(parsePiece));

    return pieces.map((filePieces, f) =>
        filePieces.map(
            (piece, r) =>
                ({
                    file: f,
                    rank: r,
                    piece,
                } as SquareData)
        )
    );
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

function parseCastling(castling: string): string {
    return castling;
}

function parseEnPassant(enPassant: string): string {
    return enPassant;
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
