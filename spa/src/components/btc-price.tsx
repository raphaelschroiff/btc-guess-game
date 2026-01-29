import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../constants";
import { priceQuery } from "../data/price";


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
    <div>
      Current BTC Price: {data}
    </div>
  );
}
