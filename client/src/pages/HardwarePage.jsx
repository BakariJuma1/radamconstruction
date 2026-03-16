import { useEffect, useState } from "react";
import axios from "axios";
import WhatsAppButton from "../components/WhatsAppButton";
import { API_BASE_URL } from "../config";
import { hardwareCategories } from "../data/siteContent";

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
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Hardware Catalog
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Construction, plumbing, and finishing materials
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-200">
            This is the catalog and RFQ phase, not full e-commerce. Clients can
            browse categories, send lists, and request pricing or delivery.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6 md:grid-cols-2">
          {mergedCategories.map((category) => (
            <article key={category.id} className="rounded-3xl bg-white p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-900">
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
                      <div className="flex items-start justify-between gap-3">
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
                          <span className="text-xs font-semibold text-blue-700 whitespace-nowrap">
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
          ))}
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
