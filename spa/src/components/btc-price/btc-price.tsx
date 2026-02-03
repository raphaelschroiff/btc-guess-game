import { useQuery } from "@tanstack/react-query";
import { formatPrice, priceQuery } from "../../data/price";
import styles from "./btc-price.module.css";
import { useAnimateOnUpdate } from "../../hooks/useAnimateOnUpdate";


export function BtcPrice() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['btcPrice'],
    queryFn: priceQuery,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const animationStyle = useAnimateOnUpdate(data, 'wiggle', '0.3s', 'ease-in-out');

  if (isLoading) {
    return <div>Loading BTC price...</div>;
  }

  if (error) {
    return <div>Error loading BTC price.</div>;
  }

  return (
    <div class={styles.priceContainer}>
      Current BTC Price:&nbsp;
      <span class={styles.price} style={animationStyle}>{formatPrice(data)}</span>
    </div>
  );
}
