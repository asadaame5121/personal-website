export default function ({ title, description }) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        fontSize: 40,
        fontWeight: 700,
        color: "#222",
        padding: 40,
        boxSizing: "border-box",
        fontFamily: '"Shippori Mincho B1", serif',
      }}
    >
      <svg width="75" viewBox="0 0 75 65" fill="#1A1A1A" style={{ margin: "0 75px" }}>
        <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
      </svg>
      <div
        style={{
          marginTop: 40,
          textAlign: "center",
          color: "#1A1A1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            marginTop: 20,
            fontSize: 24,
            fontWeight: 400,
            color: "#555",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
