import React from "react";
import "./Board.css";
import { Colour, PieceData, Type } from "./Piece";
import Square from "./Square";

const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
const RANKS = 8;
const FILES = 8;

type BoardData = {
    board: PieceData[][];
};

export const BoardContext = React.createContext<BoardData>(Object.create(null));

function Board() {
    const boardContext = React.useContext(BoardContext);

    boardContext.board = React.useMemo(() => parseFen(FEN), []);
    console.log(boardContext.board);

    return (
        <div className="board">
            <div className="file">
                {Array.from({ length: FILES }, (_, file) => (
                    <div className="rank">
                        {Array.from({ length: RANKS }, (_, rank) => (
                            <Square rank={rank} file={file} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function parseFen(fen: string) {
    const ranks = fen.split("/");
    const fenBoard = ranks.map((rank) => rank.split(""));
    const board = fenBoard.map((rank) => rank.flatMap(parsePiece));

    return board;
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
            const num = parseInt(piece);
            if (isNaN(num)) throw new Error("Invalid FEN");
            return Array.from({ length: num }, () => ({
                type: Type.None,
                colour: Colour.None,
            }));
    }
}

export default Board;
