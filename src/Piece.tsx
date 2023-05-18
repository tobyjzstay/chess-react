import React from "react";
import { BoardContext, FILES, RANKS } from "./Board";
import "./Piece.css";
import { SquareContext, SquareData } from "./Square";

export type PieceData = {
    type: Type;
    colour: Colour;
};

export enum Type {
    None = 0,
    King = 1,
    Queen = 2,
    Rook = 3,
    Bishop = 4,
    Knight = 5,
    Pawn = 6,
}

export enum Colour {
    None = 0,
    White = 1,
    Black = 2,
}

export type Position = [number, number];

function Piece() {
    const { squares } = React.useContext(BoardContext);
    const { file, rank } = React.useContext(SquareContext);
    const piece = squares[file][rank].piece;

    let className = "piece";

    function handleMouseEnter() {
        const moves = legalMoves(squares, file, rank);
        moves.forEach(([file, rank]) => {
            squares[file][rank].highlight(true);
        });
    }

    function handleMouseLeave() {
        const moves = legalMoves(squares, file, rank);
        moves.forEach(([file, rank]) => {
            squares[file][rank].highlight(false);
        });
    }

    switch (piece.type) {
        case Type.King:
            className += " piece__king";
            break;
        case Type.Queen:
            className += " piece__queen";
            break;
        case Type.Rook:
            className += " piece__rook";
            break;
        case Type.Bishop:
            className += " piece__bishop";
            break;
        case Type.Knight:
            className += " piece__knight";
            break;
        case Type.Pawn:
            className += " piece__pawn";
            break;
        default:
            return null;
    }

    switch (piece.colour) {
        case Colour.White:
            className += " piece__white";
            break;
        case Colour.Black:
            className += " piece__black";
            break;
        default:
            return null;
    }

    return <div className={className} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}></div>;
}

function legalMoves(squares: SquareData[][], file: number, rank: number) {
    const piece = squares[file][rank].piece;
    switch (piece.type) {
        case Type.King:
            break;
        case Type.Queen:
            return queenMoves(squares, file, rank);
        case Type.Rook:
            break;
        case Type.Bishop:
            break;
        case Type.Knight:
            return knightMoves(squares, file, rank);
        case Type.Pawn:
            break;
        default:
            break;
    }

    return [];
}

function queenMoves(squares: SquareData[][], file: number, rank: number) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    const QUEEN_MOVES: Position[] = [
        [-1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
    ];

    for (const move of QUEEN_MOVES) {
        let newFile = file + move[0];
        let newRank = rank + move[1];
        while (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) break;
            moves.push([newFile, newRank]);
            if (squares[newFile][newRank].piece.colour !== Colour.None) break;
            newFile += move[0];
            newRank += move[1];
        }
    }

    return moves;
}

function knightMoves(squares: SquareData[][], file: number, rank: number) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    const KNIGHT_MOVES: Position[] = [
        [-2, 1],
        [-1, 2],
        [1, 2],
        [2, 1],
        [2, -1],
        [1, -2],
        [-1, -2],
        [-2, -1],
    ];

    for (const move of KNIGHT_MOVES) {
        const newFile = file + move[0];
        const newRank = rank + move[1];
        if (newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS) continue;
        else if (squares[newFile][newRank].piece.colour === piece.colour) continue;
        moves.push([newFile, newRank]);
    }

    return moves;
}

export default Piece;
