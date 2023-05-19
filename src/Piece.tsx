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
    const square = squares[file][rank];
    const piece = square.piece;

    let className = "piece";

    function handleClick() {
        const isSelected = square.isSelected;
        square.setSelected(!isSelected);
        const moves = legalMoves(squares, file, rank);
        moves.forEach(([file, rank]) => {
            squares[file][rank].setDestination(!isSelected);
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

    return <div className={className} onClick={handleClick}></div>;
}

function legalMoves(squares: SquareData[][], file: number, rank: number) {
    const piece = squares[file][rank].piece;
    switch (piece.type) {
        case Type.King:
            return kingMoves(squares, file, rank);
        case Type.Queen:
            return queenMoves(squares, file, rank);
        case Type.Rook:
            return rookMoves(squares, file, rank);
        case Type.Bishop:
            return bishopMoves(squares, file, rank);
        case Type.Knight:
            return knightMoves(squares, file, rank);
        case Type.Pawn:
            break;
        default:
            break;
    }

    return [];
}

function kingMoves(squares: SquareData[][], file: number, rank: number) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of KING_DIRECTIONS) {
        const newFile = file + move[0];
        const newRank = rank + move[1];
        if (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) continue;
            moves.push([newFile, newRank]);
        }
    }

    return moves;
}

function queenMoves(squares: SquareData[][], file: number, rank: number) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of QUEEN_DIRECTIONS) {
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

function rookMoves(squares: SquareData[][], file: number, rank: number) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of ROOK_DIRECTIONS) {
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

function bishopMoves(squares: SquareData[][], file: number, rank: number) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of BISHOP_DIRECTIONS) {
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

    for (const move of KNIGHT_DIRECTIONS) {
        const newFile = file + move[0];
        const newRank = rank + move[1];
        if (newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS) continue;
        else if (squares[newFile][newRank].piece.colour === piece.colour) continue;
        moves.push([newFile, newRank]);
    }

    return moves;
}

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
