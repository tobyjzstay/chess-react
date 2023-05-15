import "./Square.css";

function Square({ rank, file }: { rank: number; file: number }) {
    return <div className={"square square__" + (rank % 2 === file % 2 ? "white" : "black")}></div>;
}

export default Square;
