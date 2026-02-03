import { useQuery } from "@tanstack/react-query";
import { formatPrice, priceQuery } from "../../data/price";
import styles from "./btc-price.module.css";


export function BtcPrice() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['btcPrice'],
    queryFn: priceQuery,
    refetchInterval: 60000, // Refetch every 60 seconds
  });
  if (isLoading) {
    return <div>Loading BTC price...</div>;
  }

  if (error) {
    return <div>Error loading BTC price.</div>;
  }

  return (
    <div class={styles.priceContainer}>
      Current BTC Price: <span class={styles.price}>{formatPrice(data)}</span>
    </div>
  );
}
