import "./Piece.css";

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

function Piece({ piece }: { piece: PieceData }) {
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

export default Piece;
