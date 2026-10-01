// Sea vs air at a glance, as a real HTML table so search engines can read it.
// Shared by the homepage and the city pages; the figures come from the `rates`
// table through rateFacts(), never typed in here.
export default function RatesComparison({ sea, air }) {
  const rows = [
    ["Rate", sea.rateLabel, air.rateLabel],
    ["Minimum weight", `${sea.minKg} kg`, `${air.minKg} kg`],
    ["Handling fee", sea.fee, air.fee],
    ["Door-to-door time", sea.time, air.time],
    ["Departures", "Regular containers to Karachi", "Weekly consolidated flights"],
    ["Best for", "Furniture, appliances, business stock, house moves", "Parcels, documents, gifts, urgent items"],
  ];
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <td aria-hidden="true" className="border-b border-line bg-bg-soft" />
            <th scope="col">Sea cargo</th>
            <th scope="col">Air cargo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, s, a]) => (
            <tr key={label}>
              <th scope="row">
                {label}
              </th>
              <td className={label === "Rate" ? "rate" : undefined}>{s}</td>
              <td className={label === "Rate" ? "rate" : undefined}>{a}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
