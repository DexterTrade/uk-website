import CityLanding, { cityMetadata } from "../components/CityLanding";

const SLUG = "cargo-to-pakistan-from-nottingham";

export const metadata = cityMetadata(SLUG);

export default function Page() {
  return <CityLanding slug={SLUG} />;
}
