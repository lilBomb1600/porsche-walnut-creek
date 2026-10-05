/** The four-point light signature, used as the ignition loader. */
export function FourPoints({ lit, size = 10 }: { lit: number; size?: number }) {
  return (
    <div className="grid grid-cols-2 gap-[0.55em]" style={{ fontSize: size }} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="block h-[1em] w-[2.2em] rounded-[0.5em] transition-[background-color,box-shadow] duration-500"
          style={{
            background: i < lit ? "#eef4ff" : "rgb(238 244 255 / 0.08)",
            boxShadow: i < lit ? "0 0 10px rgb(238 244 255 / .9), 0 0 28px rgb(180 205 255 / .5)" : "none",
          }}
        />
      ))}
    </div>
  );
}
