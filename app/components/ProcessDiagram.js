export default function ProcessDiagram({ steps }) {
  return (
    <div className="mt-9 flex flex-col md:flex-row md:items-stretch md:gap-0">
      {steps.map((s, i) => (
        <div key={s.title} className="flex flex-1 flex-col md:flex-row md:items-stretch">
          <div className="flex-1 rounded-xl border border-line bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-soft font-head font-bold text-green">
              {i + 1}
            </div>
            <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-[1.6] text-muted">{s.body}</p>
          </div>

          {i < steps.length - 1 && (
            <>
              <div className="flex items-center justify-center py-2 text-xl font-bold text-green md:hidden" aria-hidden="true">
                &darr;
              </div>
              <div className="hidden w-10 flex-none items-center justify-center text-2xl font-bold text-green md:flex" aria-hidden="true">
                &rarr;
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
