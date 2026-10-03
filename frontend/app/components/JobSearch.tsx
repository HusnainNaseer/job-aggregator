"use client";

import { useEffect, useRef, useState } from "react";

type Country = {
    code: string;
    name: string;
};

type SearchFilters = {
    search: string;
    country: string;
    category: string;
    skillCategory: string;
    city: string;
};

type JobSearchProps = {
    onSearch: (filters: SearchFilters) => void;
    initialFilters: SearchFilters;
};

export default function JobSearch({ onSearch, initialFilters }: JobSearchProps) {
    const initialCountry = useRef(initialFilters.country);
    const [search, setSearch] = useState(initialFilters.search);

    const [country, setCountry] = useState(initialFilters.country);
    const [countryName, setCountryName] = useState(initialFilters.country);

    const [countries, setCountries] = useState<Country[]>([]);
    const [showCountries, setShowCountries] = useState(false);

    const [category, setCategory] = useState(initialFilters.category);
    const [skillCategory, setSkillCategory] = useState(initialFilters.skillCategory);
    const [city, setCity] = useState(initialFilters.city);

    useEffect(() => {
        async function loadCountries() {
            try {
                const response = await fetch("/api/countries");

                if (!response.ok) {
                    throw new Error("Failed to load countries");
                }

                const data: Country[] = await response.json();

                setCountries(data);
                const selectedCountry = data.find(
                    (item) => item.code.toLowerCase() === initialCountry.current.toLowerCase()
                );
                if (selectedCountry) {
                    setCountryName(selectedCountry.name);
                }
            } catch (error) {
                console.error("Failed to load countries:", error);
            }
        }

        loadCountries();
    }, []);

    const filteredCountries = countries
        .filter((item) =>
            item.name
                .toLowerCase()
                .includes(countryName.toLowerCase())
        )
        .slice(0, 8);

    function handleCountryChange(value: string) {
        setCountryName(value);

        const matchedCountry = countries.find(
            (item) =>
                item.name.toLowerCase() ===
                value.trim().toLowerCase()
        );

        if (matchedCountry) {
            setCountry(matchedCountry.code);
        } else {
            setCountry("");
        }

        setShowCountries(true);
    }

    function selectCountry(selectedCountry: Country) {
        setCountry(selectedCountry.code);
        setCountryName(selectedCountry.name);
        setShowCountries(false);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let selectedCountryCode = country;

        if (!selectedCountryCode && countryName.trim()) {
            const matchedCountry = countries.find(
                (item) =>
                    item.name.toLowerCase() ===
                    countryName.trim().toLowerCase()
            );

            if (matchedCountry) {
                selectedCountryCode = matchedCountry.code;
            }
        }

        onSearch({
            search,
            country: selectedCountryCode,
            category,
            skillCategory,
            city,
        });

        setShowCountries(false);
    }

    return (
        <form className="job-search-form" onSubmit={handleSubmit}>
            <div className="search-field search-field--wide">
                <label htmlFor="job-search">Search jobs</label>
                <input
                    id="job-search"
                    type="text"
                    placeholder="Role, company, or keyword"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />
            </div>

            <div className="search-field">
                <label htmlFor="job-country">Country</label>
                <input
                    id="job-country"
                    type="text"
                    placeholder="Any country"
                    value={countryName}
                    onChange={(event) =>
                        handleCountryChange(event.target.value)
                    }
                    onFocus={() => setShowCountries(true)}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showCountries && Boolean(countryName)}
                    aria-controls="country-suggestions"
                />

                {showCountries &&
                    countryName &&
                    filteredCountries.length > 0 && (
                        <div
                            className="search-country-list"
                            id="country-suggestions"
                            role="listbox"
                            aria-label="Matching countries"
                        >
                            {filteredCountries.map((item) => (
                                <button
                                    className="search-country-option"
                                    key={item.code}
                                    type="button"
                                    role="option"
                                    aria-selected={country === item.code}
                                    onClick={() =>
                                        selectCountry(item)
                                    }
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}
            </div>

            <div className="search-field">
                    <label htmlFor="job-category">Category</label>
                    <input
                        id="job-category"
                        type="text"
                        placeholder="Any category"
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                    }
                />
            </div>

            <div className="search-field">
                <label htmlFor="job-skill-category">Skill category</label>
                <input
                    id="job-skill-category"
                    type="text"
                    placeholder="Any skill"
                    value={skillCategory}
                    onChange={(event) =>
                        setSkillCategory(event.target.value)
                    }
                />
            </div>

            <div className="search-field">
                <label htmlFor="job-city">City</label>
                <input
                    id="job-city"
                    type="text"
                    placeholder="Any city"
                    value={city}
                    onChange={(event) =>
                        setCity(event.target.value)
                    }
                />
            </div>

            <button className="button-primary" type="submit">
                Search
            </button>
        </form>
    );
}