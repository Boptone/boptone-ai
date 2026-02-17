import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger className="w-[120px] h-8 text-xs bg-transparent border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code} className="text-xs">
            {curr.code} ({curr.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
