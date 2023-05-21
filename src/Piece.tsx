import React from "react";
import { BoardContext, Colour, FILES, RANKS } from "./Board";
import "./Piece.css";
import { SquareContext, SquareData } from "./Square";

export type PieceData = {
    colour: Colour;
    type: Type;
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

export type Position = [number, number];

function Piece() {
    const { squares, turn } = React.useContext(BoardContext);
    const { file, rank } = React.useContext(SquareContext);
    const square = squares[file][rank];
    const piece = square.piece;

    let className = "piece";

    switch (piece.colour) {
        case Colour.White:
            className += " white";
            break;
        case Colour.Black:
            className += " black";
            break;
        default:
            return null;
    }

    switch (piece.type) {
        case Type.King:
            className += " king";
            break;
        case Type.Queen:
            className += " queen";
            break;
        case Type.Rook:
            className += " rook";
            break;
        case Type.Bishop:
            className += " bishop";
            break;
        case Type.Knight:
            className += " knight";
            break;
        case Type.Pawn:
            className += " pawn";
            break;
        default:
            return null;
    }

    function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (piece.colour !== turn) return;
        const isSelected = square.isSelected;
        square.setSelected(!isSelected);
        const moves = legalMoves(squares, file, rank, false);
        moves.forEach(([file, rank]) => {
            squares[file][rank].setDestination(!isSelected);
        });
        event.stopPropagation();
    }

    return <div className={className} onClick={handleClick}></div>;
}

function legalMoves(squares: SquareData[][], file: number, rank: number, pseudo: boolean) {
    const piece = squares[file][rank].piece;
    switch (piece.type) {
        case Type.King:
            return kingMoves(squares, file, rank, pseudo);
        case Type.Queen:
            return queenMoves(squares, file, rank, pseudo);
        case Type.Rook:
            return rookMoves(squares, file, rank, pseudo);
        case Type.Bishop:
            return bishopMoves(squares, file, rank, pseudo);
        case Type.Knight:
            return knightMoves(squares, file, rank, pseudo);
        case Type.Pawn:
            return pawnMoves(squares, file, rank, pseudo);
        default:
            break;
    }

    return [];
}

function kingMoves(squares: SquareData[][], file: number, rank: number, pseudo: boolean) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of KING_DIRECTIONS) {
        const newFile = file + move[0];
        const newRank = rank + move[1];
        if (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) continue;
            else if (!pseudo && isKingInCheck(squares, file, rank, piece, newFile, newRank)) continue;
            moves.push([newFile, newRank]);
        }
    }

    return moves;
}

function isKingInCheck(
    squares: SquareData[][],
    file: number,
    rank: number,
    piece: PieceData,
    newFile: number,
    newRank: number
) {
    // copy squares
    const newSquares = squares.map((row) => row.map((square) => ({ ...square })));

    newSquares[file][rank].piece = { type: Type.None, colour: Colour.None };
    newSquares[newFile][newRank].piece = piece;

    for (let f = 0; f < FILES; f++) {
        for (let r = 0; r < RANKS; r++) {
            const p = newSquares[f][r].piece;
            if (p.colour === piece.colour && p.type === Type.King) {
                if (isSquareAttacked(newSquares, f, r, p.colour)) return true;
            }
        }
    }

    return false;
}

export function isSquareAttacked(squares: SquareData[][], file: number, rank: number, colour: Colour) {
    for (let f = 0; f < FILES; f++) {
        for (let r = 0; r < RANKS; r++) {
            const piece = squares[f][r].piece;
            if (piece.colour === colour) continue;
            const moves = legalMoves(squares, f, r, true);
            for (const move of moves) {
                if (move[0] === file && move[1] === rank) return true;
            }
        }
    }

    return false;
}

function queenMoves(squares: SquareData[][], file: number, rank: number, pseudo: boolean) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of QUEEN_DIRECTIONS) {
        let newFile = file + move[0];
        let newRank = rank + move[1];
        while (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) break;
            else if (!pseudo && isKingInCheck(squares, file, rank, piece, newFile, newRank)) break;
            moves.push([newFile, newRank]);
            if (squares[newFile][newRank].piece.colour !== Colour.None) break;
            newFile += move[0];
            newRank += move[1];
        }
    }

    return moves;
}

function rookMoves(squares: SquareData[][], file: number, rank: number, pseudo: boolean) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of ROOK_DIRECTIONS) {
        let newFile = file + move[0];
        let newRank = rank + move[1];
        while (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) break;
            else if (!pseudo && isKingInCheck(squares, file, rank, piece, newFile, newRank)) break;
            moves.push([newFile, newRank]);
            if (squares[newFile][newRank].piece.colour !== Colour.None) break;
            newFile += move[0];
            newRank += move[1];
        }
    }

    return moves;
}

function bishopMoves(squares: SquareData[][], file: number, rank: number, pseudo: boolean) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of BISHOP_DIRECTIONS) {
        let newFile = file + move[0];
        let newRank = rank + move[1];
        while (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) break;
            else if (!pseudo && isKingInCheck(squares, file, rank, piece, newFile, newRank)) break;
            moves.push([newFile, newRank]);
            if (squares[newFile][newRank].piece.colour !== Colour.None) break;
            newFile += move[0];
            newRank += move[1];
        }
    }

    return moves;
}

function knightMoves(squares: SquareData[][], file: number, rank: number, pseudo: boolean) {
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of KNIGHT_DIRECTIONS) {
        const newFile = file + move[0];
        const newRank = rank + move[1];
        if (newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS) continue;
        else if (squares[newFile][newRank].piece.colour === piece.colour) continue;
        else if (!pseudo && isKingInCheck(squares, file, rank, piece, newFile, newRank)) continue;
        moves.push([newFile, newRank]);
    }

    return moves;
}

function pawnMoves(squares: SquareData[][], file: number, rank: number, pseudo: boolean) {
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
        const move = PAWN_DIRECTIONS[index];

        const newFile = file + move[0] * direction;
        const newRank = rank + move[1] * direction;

        if (newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS) continue;

        switch (index) {
            // move
            case "0":
                if (squares[newFile][newRank].piece.colour !== Colour.None) continue;
                break;
            // start move
            case "1":
                if (file !== 1 && file !== 6) continue;
                // if the first move is blocked, the second move is also blocked
                else if (moves.length === 0) continue;
                else if (squares[newFile][newRank].piece.colour !== Colour.None) continue;
                break;
            // capture
            case "2":
            case "3":
                // eslint-disable-next-line no-case-declarations
                const colour = squares[newFile][newRank].piece.colour;
                if (colour === Colour.None) continue;
                else if (colour === piece.colour) continue;
                break;
            default:
                break;
        }

        if (squares[newFile][newRank].piece.colour === piece.colour) continue;
        else if (!pseudo && isKingInCheck(squares, file, rank, piece, newFile, newRank)) continue;
        moves.push([newFile, newRank]);
    }

    return moves;
}

const PAWN_DIRECTIONS: Position[] = [
    [1, 0],
    [2, 0],
    [1, 1],
    [1, -1],
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
