// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/kit/shadcn/select";
import { useLocation, useNavigate, useParams } from "react-router";
import { Locale, LocaleData } from "@repo/types/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/kit/shadcn/dropdown-menu";
import { Button } from "@/kit/shadcn/button";
import { Languages } from "lucide-react";

/**
 * 语言切换器组件 - 提供多语言切换功能
 *
 * @param locale - 当前选中的语言代码
 * @param localeData - 语言数据对象，包含各语言的名称和旗帜图标
 */
export default function LocaleSelector({
  localeData,
}: {
  _locale: Locale;
  localeData: LocaleData;
}) {
  const pathname = useLocation().pathname;
  const params = useParams();
  const navigate = useNavigate();

  const setLocale = (locale: Locale) => {
    let newPathname = pathname;
    if (params.locale) {
      const segments = pathname.split("/");
      segments[1] = locale;
      newPathname = segments.join("/");
    } else {
      if (pathname === "/") {
        newPathname = `/${locale}`;
      } else {
        newPathname = `/${locale}${pathname}`;
      }
    }
    void navigate(newPathname);
  };

  return (
    // <Select defaultValue={locale} value={locale} onValueChange={setLocale}>
    //   <SelectTrigger className="cursor-pointer">
    //     <SelectValue>
    //       {locale && (
    //         <div className="flex items-center gap-2">
    //           <span className="text-lg">{localeData[locale].flag}</span>
    //           <span>{localeData[locale].name}</span>
    //         </div>
    //       )}
    //     </SelectValue>
    //   </SelectTrigger>
    //   <SelectContent>
    //     {Object.entries(localeData).map(([cur, data]) => (
    //       <SelectItem
    //         key={cur}
    //         value={cur}
    //         className="cursor-pointer flex items-center gap-2"
    //       >
    //         <div className="flex items-center gap-2">
    //           {data.flag && <span className="text-md">{data.flag}</span>}
    //           <span>{data.name}</span>
    //         </div>
    //       </SelectItem>
    //     ))}
    //   </SelectContent>
    // </Select>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0.5 border border-border rounded-full cursor-pointer"
        >
          <Languages className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(localeData).map(([localeOption, data]) => (
          <DropdownMenuItem
            key={localeOption}
            onClick={() => {
              setLocale(localeOption as Locale);
            }}
            className="cursor-pointer"
          >
            {data.flag && <span className="mr-2 text-md">{data.flag}</span>}
            <span className="text-sm">{data.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
