import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currencies: { code: Currency; name: string; symbol: string }[] = [
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
    <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
      <SelectTrigger className="w-[160px] h-10 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
        <SelectValue />
      </SelectTrigger>
      <SelectContent 
        className="z-[200] bg-popover border-border"
        position="popper"
        side="top"
        sideOffset={8}
      >
        {currencies.map((curr) => (
          <SelectItem 
            key={curr.code} 
            value={curr.code}
            className="text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            {curr.code} ({curr.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
