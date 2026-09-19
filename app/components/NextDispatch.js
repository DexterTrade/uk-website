import Link from "next/link";

export default function NextDispatch({ date, note }) {
  if (!date) return null;

  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / 86400000);

  if (diffDays < 0) return null;

  const formatted = target.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="wrap">
      <div className="dispatch-banner">
        <div className="dispatch-count">
          {diffDays === 0 ? (
            <span className="dispatch-n dispatch-n-today">Today</span>
          ) : (
            <>
              <span className="dispatch-n">{diffDays}</span>
              <span className="dispatch-l">{diffDays === 1 ? "day left" : "days left"}</span>
            </>
          )}
        </div>
        <div className="dispatch-info">
          <span className="dispatch-tag">Next sea cargo departure</span>
          <h3>{formatted}</h3>
          {note && <p>{note}</p>}
        </div>
        <Link className="btn btn-green" href="/contact-us">Book your space</Link>
      </div>
    </div>
  );
}
