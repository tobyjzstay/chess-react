import React from "react";
import { BoardContext, FILES, RANKS } from "./Board";
import "./Piece.css";

export type PieceData = {
  type: Type;
  colour: Colour;
  file: number;
  rank: number;
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

function Piece({ piece }: { piece: PieceData }) {
  const { board } = React.useContext(BoardContext);
  let className = "piece";

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

  return <div className={className}></div>;
}

function legalMoves(board: PieceData[][], piece: PieceData) {
  switch (piece.type) {
    case Type.King:
      break;
    case Type.Queen:
      return queenMoves(board, piece);
    case Type.Rook:
      break;
    case Type.Bishop:
      break;
    case Type.Knight:
      return knightMoves(board, piece);
    case Type.Pawn:
      break;
    default:
      return [];
  }
}

function queenMoves(board: PieceData[][], piece: PieceData) {
  if (piece.type !== Type.Queen) throw new Error("Invalid piece type");
  const moves = [];

  const QUEEN_MOVES = [
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
    let file = piece.file + move[0];
    let rank = piece.rank + move[1];
    while (!(file < 0 || file >= FILES || rank < 0 || rank >= RANKS)) {
      if (board[file][rank].colour === piece.colour) break;
      moves.push([file, rank]);
      file += move[0];
      rank += move[1];
    }
  }

  return moves;
}

function knightMoves(board: PieceData[][], piece: PieceData) {
  if (piece.type !== Type.Knight) throw new Error("Invalid piece type");
  const moves = [];

  const KNIGHT_MOVES = [
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
    const file = piece.file + move[0];
    const rank = piece.rank + move[1];
    if (file < 0 || file >= FILES || rank < 0 || rank >= RANKS) continue;
    else if (board[file][rank].colour === piece.colour) continue;
    moves.push([file, rank]);
  }

  return moves;
}

export default Piece;
