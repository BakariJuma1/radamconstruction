import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import WhatsAppButton from "../components/WhatsAppButton";
import { API_BASE_URL, buildWhatsAppLink } from "../config";
import { SiteSettingsContext } from "../SiteSettingsContext";

const initialFormState = {
  name: "",
  phone: "",
  email: "",
  service_id: "",
  projectType: "construction",
  propertyType: "residential",
  location: "",
  budgetRange: "",
  preferredDate: "",
  details: "",
};

const budgetRanges = [
  "Below KES 100,000",
  "KES 100,000 - 500,000",
  "KES 500,000 - 1,500,000",
  "KES 1,500,000 - 5,000,000",
  "Above KES 5,000,000",
];

export default function BookingPage() {
  const { settings } = useContext(SiteSettingsContext);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/services`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.services || [];
        setServices(data);
      })
      .catch((error) => {
        console.error("Failed to fetch services", error);
        setStatus({
          type: "error",
          text: "We could not load services right now. You can still continue and describe your project.",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const selectedService = useMemo(
    () =>
      services.find(
        (service) => String(service.id) === String(formData.service_id)
      ),
    [formData.service_id, services]
  );
  const hardwareWhatsappLink = buildWhatsAppLink(
    "Hello Radamjaribu Builders, I need to check hardware materials availability and prices.",
    settings?.whatsapp_number
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.phone || !formData.email) {
      setStatus({ type: "error", text: "Name, phone, and email are required." });
      return;
    }

    const message = [
      `Quote request for: ${selectedService?.name || "General inquiry"}`,
      `Project type: ${formData.projectType}`,
      `Property type: ${formData.propertyType}`,
      `Location: ${formData.location || "Not provided"}`,
      `Budget range: ${formData.budgetRange || "Not provided"}`,
      `Preferred site visit date: ${formData.preferredDate || "Flexible"}`,
      `Project details: ${formData.details || "No extra details provided."}`,
    ].join("\n");

    setIsSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      await axios.post(`${API_BASE_URL}/bookings`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service_id: formData.service_id || null,
        message,
      });

      setFormData(initialFormState);
      setStatus({
        type: "success",
        text: "Quote request submitted. The team can now follow up for a site visit or final quotation.",
      });
    } catch (error) {
      console.error("Failed to submit quote request", error);
      setStatus({
        type: "error",
        text: "Submission failed. Use WhatsApp below if you need an immediate response.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 py-12 text-white sm:py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200 sm:text-sm sm:tracking-[0.3em]">
              Booking and Quotation
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Request a site visit, quotation, or materials-assisted project plan
            </h1>
            <p className="mt-5 max-w-2xl text-base text-blue-100 sm:text-lg">
              Give the team enough detail once, and let them respond with a
              practical next step instead of forcing you through several calls.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">
              Project intake form
            </h2>
            <p className="mt-2 text-slate-600">
              This sends a structured quote request to the admin dashboard.
            </p>
          </div>

          {status.text ? (
            <div
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {status.text}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Your full name"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Phone</span>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="+254 7..."
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="name@example.com"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Service</span>
                <select
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="">General project inquiry</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Project type</span>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="construction">Construction</option>
                  <option value="renovation">Renovation</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="painting">Painting</option>
                  <option value="materials-supply">Materials supply</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Property type</span>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="institutional">Institutional</option>
                  <option value="mixed-use">Mixed use</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Preferred date</span>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Project location</span>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Town / county / site location"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Budget range</span>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="">Select a budget range</option>
                  {budgetRanges.map((budgetRange) => (
                    <option key={budgetRange} value={budgetRange}>
                      {budgetRange}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Project details</span>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={6}
                className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                placeholder="Describe the works, quantities, current site condition, deadlines, or the material list you already have."
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit quote request"}
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg sm:p-6">
            <h2 className="text-xl font-semibold sm:text-2xl">Need a faster response?</h2>
            <p className="mt-3 text-sm text-slate-300">
              Use WhatsApp for instant follow-up on quotations, site visits, or
              hardware availability.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <WhatsAppButton
                label="Quote on WhatsApp"
                message={`Hello Radamjaribu Builders, I want a quotation for ${
                  selectedService?.name || "a construction project"
                }.`}
                className="justify-center"
              />
              {hardwareWhatsappLink ? (
                <a
                  href={hardwareWhatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Check store stock
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
              What improves your quotation speed
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Clear location and scope of work.</li>
              <li>Approximate budget or target finish level.</li>
              <li>Desired timeline for site visit or mobilization.</li>
              <li>Material list, sketches, or reference photos on WhatsApp.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-300 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Service loading status
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isLoading
                ? "Loading available services..."
                : `${services.length} service options loaded for project matching.`}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
