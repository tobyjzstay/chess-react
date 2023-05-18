import React from "react";
import "./Board.css";
import { Colour, PieceData, Type } from "./Piece";
import Square from "./Square";

const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
export const RANKS = 8;
export const FILES = 8;

type BoardData = {
    board: PieceData[][];
};

export const BoardContext = React.createContext<BoardData>(Object.create(null));

function Board() {
    const boardContext = React.useContext(BoardContext);

    boardContext.board = React.useMemo(() => parseFen(FEN), []);

    return (
        <div className="board">
            <div className="file">
                {Array.from({ length: FILES }, (_, file) => (
                    <div key={file} className="rank">
                        {Array.from({ length: RANKS }, (_, rank) => (
                            <Square key={rank} square={{ file, rank }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function parseFen(fen: string) {
    const files = fen.split("/");
    const fenBoard = files.map((rank) => rank.split(""));
    const board = fenBoard.map((rank, f) => {
        let r = 0;
        return rank.flatMap((piece) => {
            const parsed = parsePiece(piece, f, r);
            r += parsed.length;
            return parsed;
        });
    });

    return board;
}

function parsePiece(piece: string, file: number, rank: number): PieceData[] {
    switch (piece) {
        case "k":
            return [{ type: Type.King, colour: Colour.Black, file, rank }];
        case "q":
            return [{ type: Type.Queen, colour: Colour.Black, file, rank }];
        case "r":
            return [{ type: Type.Rook, colour: Colour.Black, file, rank }];
        case "b":
            return [{ type: Type.Bishop, colour: Colour.Black, file, rank }];
        case "n":
            return [{ type: Type.Knight, colour: Colour.Black, file, rank }];
        case "p":
            return [{ type: Type.Pawn, colour: Colour.Black, file, rank }];
        case "K":
            return [{ type: Type.King, colour: Colour.White, file, rank }];
        case "Q":
            return [{ type: Type.Queen, colour: Colour.White, file, rank }];
        case "R":
            return [{ type: Type.Rook, colour: Colour.White, file, rank }];
        case "B":
            return [{ type: Type.Bishop, colour: Colour.White, file, rank }];
        case "N":
            return [{ type: Type.Knight, colour: Colour.White, file, rank }];
        case "P":
            return [{ type: Type.Pawn, colour: Colour.White, file, rank }];
        default:
            const num = parseInt(piece);
            if (isNaN(num)) throw new Error("Invalid FEN");
            return Array.from({ length: num }, (_, i) => ({
                type: Type.None,
                colour: Colour.None,
                file: file,
                rank: rank + i,
            }));
    }
}

export default Board;
