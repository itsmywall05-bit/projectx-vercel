import { getStrategies } from "@/lib/data/queries";
import StrategyVaultClient from "@/components/strategy/StrategyVaultClient";

export default async function StrategyVaultPage() {
    const strategies = await getStrategies();
    return <StrategyVaultClient initialStrategies={strategies} />;
}
