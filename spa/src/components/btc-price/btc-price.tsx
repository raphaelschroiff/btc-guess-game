import { useQuery } from "@tanstack/react-query";
import { formatPrice, priceQuery } from "../../data/price";
import styles from "./btc-price.module.css";
import { useAnimateOnUpdate } from "../../hooks/useAnimateOnUpdate";
import { LoadingIndicator } from "../loading-indicator/loading-indicator";


export function BtcPrice() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['btcPrice'],
    queryFn: priceQuery,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const animationStyle = useAnimateOnUpdate(data, 'wiggle', '0.3s', 'ease-in-out');

  <LoadingIndicator isLoading={isLoading} />;

  if (error) {
    return <div>Error loading BTC price.</div>;
  }

  return (
    <div class={styles.priceContainer}>
      <span>Current BTC Price:&nbsp;</span>
      <span class={styles.price} style={animationStyle}>{formatPrice(data)}</span>
    </div>
  );
}
