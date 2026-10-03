import { NextResponse } from "next/server";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export async function GET() {
    try {
        const countryNames = countries.getNames("en", {
            select: "official",
        });

        const countryList = Object.entries(countryNames)
            .map(([code, name]) => ({
                code,
                name,
            }))
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            );

        return NextResponse.json(countryList);
    } catch (error) {
        console.error("Countries API error:", error);

        return NextResponse.json(
            {
                message: "Unable to load countries",
            },
            {
                status: 500,
            }
        );
    }
}