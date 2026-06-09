"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#111",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#b91c1c", fontWeight: 500, margin: 0 }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, margin: 0 }}>
            Unexpected error
          </h1>
          <p style={{ color: "#6b7280", maxWidth: "28rem", margin: 0 }}>
            An error occurred while loading the application. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
              background: "#111",
              color: "#fff",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
