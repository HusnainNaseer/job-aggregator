import { NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:5000/api/jobs";

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const search = searchParams.get("search");
        const country = searchParams.get("country");
        const category = searchParams.get("category");
        const skillCategory = searchParams.get("skillCategory");
        const city = searchParams.get("city");
        const page = searchParams.get("page");
        const limit = searchParams.get("limit");

        const params = new URLSearchParams();

        if (search) {
            params.set("search", search);
        }

        if (country) {
            params.set("country", country);
        }

        if (category) {
            params.set("category", category);
        }

        if (skillCategory) {
            params.set("skillCategory", skillCategory);
        }

        if (city) {
            params.set("city", city);
        }

        if (page) {
            params.set("page", page);
        }

        if (limit) {
            params.set("limit", limit);
        }

        const response = await fetch(
            `${BACKEND_URL}?${params.toString()}`,
            {
                cache: "no-store",
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                {
                    message: "Backend request failed",
                },
                {
                    status: response.status,
                }
            );
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("API proxy error:", error);

        return NextResponse.json(
            {
                message: "Unable to connect to backend",
            },
            {
                status: 500,
            }
        );
    }
}