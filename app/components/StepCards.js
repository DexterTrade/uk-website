// "How it works" as numbered cards. Each page passes its own steps, so no two
// service pages end up sharing the same text.
export default function StepCards({ steps }) {
  return (
    <div className="cards">
      {steps.map((s, i) => (
        <div className="step" key={s.title}>
          <span className="k">STEP {i + 1}</span>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
        </div>
      ))}
    </div>
  );
}
