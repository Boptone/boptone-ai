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
      <SelectTrigger className="w-[160px] h-10 bg-background border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
        <SelectValue />
      </SelectTrigger>
      <SelectContent 
        className="z-[9999] bg-white border border-gray-200 shadow-2xl"
        position="popper"
        side="right"
        align="end"
        sideOffset={8}
      >
        {languages.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            className="text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
