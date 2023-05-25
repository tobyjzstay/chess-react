import React from "react";
import { BoardContext, BoardData, Colour, FILES, RANKS } from "./Board";
import "./Piece.css";
import { SquareContext } from "./Square";

export type PieceData = {
    colour: Colour;
    type: Type;
};

export enum Type {
    None = ".",
    King = "k",
    Queen = "q",
    Rook = "r",
    Bishop = "b",
    Knight = "n",
    Pawn = "p",
}

export type Position = [number, number]; // [file, rank]

function Piece() {
    const boardData = React.useContext(BoardContext);
    const { squares, turn } = boardData;
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
        const moves = legalMoves(boardData, file, rank, false);
        moves.forEach(([file, rank]) => {
            squares[file][rank].setDestination(!isSelected);
        });
        event.stopPropagation();
    }

    return <div className={className} onClick={handleClick}></div>;
}

function legalMoves(boardData: BoardData, file: number, rank: number, pseudo: boolean) {
    const { squares } = boardData;
    const piece = squares[file][rank].piece;
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

function kingMoves(boardData: BoardData, file: number, rank: number, pseudo: boolean) {
    const { squares, castling } = boardData;
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of KING_DIRECTIONS) {
        const newFile = file + move[0];
        const newRank = rank + move[1];
        if (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) continue;
            else if (!pseudo && isIllegalMove(boardData, file, rank, piece, newFile, newRank)) continue;
            moves.push([newFile, newRank]);
        }
    }

    if (!pseudo && !isSquareAttacked(boardData, file, rank, piece.colour))
        for (const castle of castling) {
            if (castle.colour !== piece.colour) continue;

            const rankPieces = squares.map((fileSquares) => fileSquares[rank].piece);

            switch (castle.type) {
                case Type.Queen:
                    if (rankPieces[0].type !== Type.Rook) continue;
                    for (let f = 1; f <= file; f++) {
                        if (!pseudo && isSquareAttacked(boardData, f, rank, piece.colour)) break;
                        else if (rankPieces[f].type === Type.King) {
                            if (f < 2) continue;
                            moves.push([f - 2, rank], [0, rank]);
                        } else if (rankPieces[f].type !== Type.None) continue;
                    }
                    break;
                case Type.King:
                    if (rankPieces[FILES - 1].type !== Type.Rook) continue;
                    for (let f = FILES - 2; f >= file; f--) {
                        if (!pseudo && isSquareAttacked(boardData, f, rank, piece.colour)) break;
                        else if (rankPieces[f].type === Type.King) {
                            if (FILES - 1 - f < 2) continue;
                            moves.push([f + 2, rank], [FILES - 1, rank]);
                        } else if (rankPieces[f].type !== Type.None) continue;
                    }
                    break;
                default:
                    break;
            }
        }

    return moves;
}

function isIllegalMove(
    boardData: BoardData,
    file: number,
    rank: number,
    piece: PieceData,
    newFile: number,
    newRank: number
) {
    const { squares } = boardData;
    const newSquares = squares.map((row) => row.map((square) => ({ ...square })));

    newSquares[file][rank].piece = { type: Type.None, colour: Colour.None };
    newSquares[newFile][newRank].piece = piece;

    for (let r = 0; r < RANKS; r++) {
        for (let f = 0; f < FILES; f++) {
            const p = newSquares[f][r].piece;
            if (p.colour === piece.colour && p.type === Type.King) {
                if (isSquareAttacked(boardData, f, r, p.colour)) return true;
            }
        }
    }

    return false;
}

export function isSquareAttacked(boardData: BoardData, file: number, rank: number, colour: Colour) {
    const { squares } = boardData;
    for (let r = 0; r < RANKS; r++) {
        for (let f = 0; f < FILES; f++) {
            if (f === file && r === rank) continue;
            const piece = squares[f][r].piece;
            if (piece.colour === colour) continue;
            const moves = legalMoves(boardData, f, r, true);
            for (const move of moves) {
                if (move[0] === file && move[1] === rank) return true;
            }
        }
    }

    return false;
}

function queenMoves(boardData: BoardData, file: number, rank: number, pseudo: boolean) {
    const { squares } = boardData;
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of QUEEN_DIRECTIONS) {
        let newFile = file + move[0];
        let newRank = rank + move[1];
        while (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) break;
            else if (!pseudo && isIllegalMove(boardData, file, rank, piece, newFile, newRank)) break;
            moves.push([newFile, newRank]);
            if (squares[newFile][newRank].piece.colour !== Colour.None) break;
            newFile += move[0];
            newRank += move[1];
        }
    }

    return moves;
}

function rookMoves(boardData: BoardData, file: number, rank: number, pseudo: boolean) {
    const { squares } = boardData;
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of ROOK_DIRECTIONS) {
        let newFile = file + move[0];
        let newRank = rank + move[1];
        while (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) break;
            else if (!pseudo && isIllegalMove(boardData, file, rank, piece, newFile, newRank)) break;
            moves.push([newFile, newRank]);
            if (squares[newFile][newRank].piece.colour !== Colour.None) break;
            newFile += move[0];
            newRank += move[1];
        }
    }

    return moves;
}

function bishopMoves(boardData: BoardData, file: number, rank: number, pseudo: boolean) {
    const { squares } = boardData;
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of BISHOP_DIRECTIONS) {
        let newFile = file + move[0];
        let newRank = rank + move[1];
        while (!(newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS)) {
            if (squares[newFile][newRank].piece.colour === piece.colour) break;
            else if (!pseudo && isIllegalMove(boardData, file, rank, piece, newFile, newRank)) break;
            moves.push([newFile, newRank]);
            if (squares[newFile][newRank].piece.colour !== Colour.None) break;
            newFile += move[0];
            newRank += move[1];
        }
    }

    return moves;
}

function knightMoves(boardData: BoardData, file: number, rank: number, pseudo: boolean) {
    const { squares } = boardData;
    const piece = squares[file][rank].piece;
    const moves: Position[] = [];

    for (const move of KNIGHT_DIRECTIONS) {
        const newFile = file + move[0];
        const newRank = rank + move[1];
        if (newFile < 0 || newFile >= FILES || newRank < 0 || newRank >= RANKS) continue;
        else if (squares[newFile][newRank].piece.colour === piece.colour) continue;
        else if (!pseudo && isIllegalMove(boardData, file, rank, piece, newFile, newRank)) continue;
        moves.push([newFile, newRank]);
    }

    return moves;
}

function pawnMoves(boardData: BoardData, file: number, rank: number, pseudo: boolean) {
    const { squares, enPassant } = boardData;
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
                if (rank !== 1 && rank !== 6) continue;
                // if the first move is blocked, the second move is also blocked
                else if (moves.length === 0) continue;
                else if (squares[newFile][newRank].piece.colour !== Colour.None) continue;
                break;
            // capture
            case "2":
            case "3":
                // eslint-disable-next-line no-case-declarations
                const colour = squares[newFile][newRank].piece.colour;
                if (colour === piece.colour) continue;
                if (colour === Colour.None) {
                    if (enPassant === null) continue;
                    else if (enPassant[0] !== newFile || enPassant[1] !== newRank) continue;
                }
                break;
            default:
                break;
        }

        if (squares[newFile][newRank].piece.colour === piece.colour) continue;
        else if (!pseudo && isIllegalMove(boardData, file, rank, piece, newFile, newRank)) continue;
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
