import { useEffect, useState, useRef } from "react";
import axios from "axios";
import WhatsAppButton from "../components/WhatsAppButton";
import { API_BASE_URL } from "../config";
import { hardwareCategories } from "../data/siteContent";
import { HardwareCategorySkeleton } from "../components/Skeleton";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "hardware-rfq",
  message: "",
};

export default function HardwarePage() {
  const [formData, setFormData] = useState(initialForm);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/hardware-categories`)
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setCatalogCategories(data);
      })
      .catch((error) => {
        console.error("Failed to fetch hardware catalog", error);
        setCatalogCategories([]);
      })
      .finally(() => setLoadingCatalog(false));
  }, []);

  const apiCategories = catalogCategories.map((category) => ({
    id: `api-${category.id}`,
    title: category.name,
    description: category.description,
    items: category.items || [],
  }));

  const defaultCategories = hardwareCategories.map((category) => ({
    ...category,
    id: `default-${category.id}`,
  }));

  const mergedCategories = [
    ...defaultCategories,
    ...apiCategories.filter(
      (apiCategory) =>
        !defaultCategories.some(
          (defaultCategory) =>
            defaultCategory.title.trim().toLowerCase() ===
            apiCategory.title.trim().toLowerCase()
        )
    ),
  ];

  const doHardwareSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/ai/hardware-search`, { query: searchQuery.trim() });
      setSearchResults(res.data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      await axios.post(`${API_BASE_URL}/contacts`, formData);
      setFormData(initialForm);
      setStatus("RFQ sent successfully. The team can now price and confirm availability.");
    } catch (error) {
      console.error("Failed to submit hardware RFQ", error);
      setStatus("RFQ submission failed. Use the WhatsApp button below for immediate help.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-emerald-900 via-slate-900 to-blue-900 py-16 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300 sm:text-sm sm:tracking-[0.3em]">
            Hardware Catalog
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl md:text-5xl">
            Construction, plumbing, and finishing materials
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-200 sm:text-lg">
            This is the catalog and RFQ phase, not full e-commerce. Clients can
            browse categories, send lists, and request pricing or delivery.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 pt-8 pb-4 md:px-8">
        <form onSubmit={doHardwareSearch} className="flex items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Ask in plain English — e.g. "what do I need to lay a foundation?"'
              className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 disabled:opacity-50"
          >
            {isSearching ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Searching…</>
            ) : (
              <>✦ AI Search</>
            )}
          </button>
          {hasSearched && (
            <button type="button" onClick={clearSearch} className="rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Clear
            </button>
          )}
        </form>
        {hasSearched && (
          <p className="mt-2 text-xs text-slate-500 pl-1">
            {searchResults.length > 0
              ? `${searchResults.length} item${searchResults.length !== 1 ? "s" : ""} matched for "${searchQuery}"`
              : `No items matched "${searchQuery}" — try different keywords`}
          </p>
        )}
      </section>

      <section className="container mx-auto grid gap-8 px-4 pb-12 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6 md:grid-cols-2">
          {hasSearched ? (
            searchResults.length === 0 ? (
              <div className="md:col-span-2 rounded-3xl bg-white p-8 shadow-lg text-center">
                <p className="text-slate-500 text-lg">No products matched your search.</p>
                <p className="text-slate-400 text-sm mt-2">Try rephrasing — e.g. "tiles for flooring" or "PVC water pipes".</p>
                <button onClick={clearSearch} className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Back to full catalog
                </button>
              </div>
            ) : (
              searchResults.map((item) => (
                <article key={item.id} className="rounded-3xl bg-white p-5 shadow-lg sm:p-6 border-2 border-violet-100">
                  <span className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 mb-3">
                    {item.category}
                  </span>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-full h-36 object-contain bg-slate-50 rounded-xl mb-3" />
                  )}
                  <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  )}
                  {(item.price || item.unit) && (
                    <p className="mt-3 text-sm font-semibold text-blue-700">
                      {item.price ? `KES ${Number(item.price).toLocaleString()}` : "Price on request"}
                      {item.unit ? ` / ${item.unit}` : ""}
                    </p>
                  )}
                </article>
              ))
            )
          ) : loadingCatalog ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => <HardwareCategorySkeleton key={i} />)}
            </>
          ) : (
          mergedCategories.map((category) => (
            <article key={category.id} className="rounded-3xl bg-white p-5 shadow-lg sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                {category.title}
              </h2>
              {category.description ? (
                <p className="mt-2 text-sm text-slate-500">{category.description}</p>
              ) : null}
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {category.items.map((item) => (
                  <li
                    key={typeof item === "string" ? item : item.id}
                    className="rounded-xl bg-slate-50 px-3 py-2"
                  >
                    {typeof item === "string" ? (
                      item
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-16 w-16 rounded-lg object-contain bg-white flex-shrink-0"
                            />
                          ) : null}
                          <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          {item.description ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {item.description}
                            </p>
                          ) : null}
                          </div>
                        </div>
                        {item.price || item.unit ? (
                          <span className="text-xs font-semibold text-blue-700 sm:whitespace-nowrap">
                            {item.price
                              ? `KES ${Number(item.price).toLocaleString()}`
                              : "Price on request"}
                            {item.unit ? ` / ${item.unit}` : ""}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">
              Request materials pricing
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Paste your materials list, quantities, delivery location, and
              preferred pickup or transport option.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {loadingCatalog
                ? "Loading hardware catalog..."
                : catalogCategories.length > 0
                ? "Showing built-in hardware categories together with admin-added categories."
                : "Showing built-in hardware categories."}
            </p>

            {status ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {status}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Full name"
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Email"
                  required
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Phone"
                />
              </div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={8}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Example: 50 bags cement, 30 lengths 1/2 inch PVC pipe, 4 toilets, delivery to Kakamega town..."
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send hardware RFQ"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl bg-emerald-600 p-6 text-white shadow-lg">
            <h3 className="text-xl font-semibold">Need stock confirmation now?</h3>
            <p className="mt-2 text-sm text-emerald-50">
              Send your list on WhatsApp and the team can confirm availability,
              alternatives, and delivery options faster.
            </p>
            <div className="mt-5">
              <WhatsAppButton
                label="Order via WhatsApp"
                message="Hello Radamjaribu Builders, I want to request pricing and availability for hardware materials."
                className="justify-center"
                light
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
