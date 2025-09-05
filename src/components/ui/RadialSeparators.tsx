import React from "react";

const RadialSeparators = ({
  count,
  style,
}: {
  count: number;
  style: React.CSSProperties;
}) => {
  const turns = 1 / count;
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            height: "100%",
            transform: `rotate(${index * turns}turn)`,
          }}
        >
          <div style={style} />
        </div>
      ))}
    </>
  );
};

export default RadialSeparators;
