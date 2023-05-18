import React from "react";
import useForceUpdate from "use-force-update";
import "./Board.css";
import { Colour, PieceData, Type } from "./Piece";
import Square, { SquareData } from "./Square";

const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
export const RANKS = 8;
export const FILES = 8;

type BoardData = {
    squares: SquareData[][];
};

export const BoardContext = React.createContext<BoardData>(Object.create(null));

function Board() {
    const forceUpdate = useForceUpdate();
    const files = FEN.split("/");
    const fenBoard = files.map((rank) => rank.split(""));
    const pieces = fenBoard.map((rank) => rank.flatMap(parsePiece));

    const squares = pieces.map((filePieces, f) =>
        filePieces.map(
            (piece, r) =>
                ({
                    file: f,
                    rank: r,
                    piece,
                } as SquareData)
        )
    );

    return (
        <BoardContext.Provider value={{ squares }}>
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
            const number = parseInt(piece);
            if (isNaN(number)) throw new Error("Invalid FEN");
            return Array.from({ length: number }, () => ({
                type: Type.None,
                colour: Colour.None,
            }));
    }
}

export default Board;
