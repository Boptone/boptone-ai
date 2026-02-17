import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिन्दी" },
  { code: "ar", name: "العربية" },
];

export function LanguagePicker() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    // Update HTML dir attribute for RTL languages
    document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] h-8 text-xs bg-transparent border-muted-foreground/20 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="text-xs">
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
