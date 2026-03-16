import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import WhatsAppButton from "../components/WhatsAppButton";
import { API_BASE_URL } from "../config";
import { caseStudyItems, testimonialItems } from "../data/siteContent";
import { SiteSettingsContext } from "../SiteSettingsContext";

export default function HomePage() {
  const { settings } = useContext(SiteSettingsContext);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);

  const reviewsToShow =
    settings?.google_reviews?.length > 0
      ? settings.google_reviews.slice(0, 3).map((review, index) => ({
          id: review.id || `google-${index}`,
          name: review.author_name || review.name || "Google reviewer",
          location: settings.google_business_name || "Google Review",
          project: review.relative_time_description || "Verified review",
          result: review.rating
            ? `${review.rating}/5 rating on Google`
            : "Google review",
          quote: review.text || review.comment || "",
        }))
      : testimonialItems;

  const serviceVisuals = services
    .filter((service) => service.image_url)
    .slice(0, 2)
    .map((service) => ({
      id: `service-${service.id}`,
      image: service.image_url,
      title: service.name,
      tag: "Service",
    }));

  const portfolioVisuals = portfolio
    .map((project) => ({
      id: `portfolio-${project.id}`,
      image: project.image_url || project.images?.[0]?.image_url,
      title: project.title || project.tittle,
      tag: "Project",
    }))
    .filter((project) => project.image)
    .slice(0, 2);

  const heroVisuals = [...portfolioVisuals, ...serviceVisuals].slice(0, 4);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/services`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.services || [];
        setServices(data.slice(0, 3));
      })
      .catch((error) => console.error("Failed to fetch services", error))
      .finally(() => setIsLoadingServices(false));

    axios
      .get(`${API_BASE_URL}/portfolio`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.portfolio || [];
        setPortfolio(data.slice(0, 3));
      })
      .catch((error) => console.error("Failed to fetch portfolio", error))
      .finally(() => setIsLoadingPortfolio(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(254,240,138,0.35),_transparent_28%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_48%,#0f766e_100%)] py-12 text-white sm:py-14 md:py-20 lg:py-24">
        <div className="container mx-auto grid gap-8 px-4 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200 sm:text-sm sm:tracking-[0.35em]">
              Build with confidence
            </p>
            <h1 className="mt-4 max-w-3xl text-[1.85rem] font-bold leading-tight sm:text-4xl md:text-5xl lg:text-[3.7rem]">
              Professional construction services and reliable hardware supply
              for every stage of your project
            </h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] text-slate-200 sm:mt-5 sm:text-lg">
              From new builds and renovations to plumbing works and material
              sourcing, Radamjaribu Builders helps clients move from idea to
              site execution with clear quotations and dependable delivery.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/booking"
                className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-200"
              >
                Request a free quote
              </Link>
              <Link
                to="/hardware"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Browse hardware supplies
              </Link>
            </div>
            <div className="mt-4">
              <WhatsAppButton
                label="WhatsApp the team"
                message="Hello Radamjaribu Builders, I would like help with a construction quotation and materials."
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] bg-white/10 p-4 backdrop-blur">
              {heroVisuals.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {heroVisuals.map((item, index) => (
                    <article
                      key={item.id}
                      className={`group overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/20 ${
                        index === 0
                          ? "h-52 sm:col-span-2 sm:h-56"
                          : "h-40 sm:h-40"
                      }`}
                    >
                      <div className="relative h-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                            {item.tag}
                          </span>
                          <p className="mt-2 text-sm font-semibold text-white md:text-base">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xl font-bold sm:text-3xl">60+</div>
                    <div className="mt-1 text-xs text-slate-200 sm:text-sm">Projects completed</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xl font-bold sm:text-3xl">10+</div>
                    <div className="mt-1 text-xs text-slate-200 sm:text-sm">Years experience</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xl font-bold sm:text-3xl">Reliable</div>
                    <div className="mt-1 text-xs text-slate-200 sm:text-sm">Construction delivery</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-xl font-bold sm:text-3xl">Fast</div>
                    <div className="mt-1 text-xs text-slate-200 sm:text-sm">Hardware response</div>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur sm:p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xl font-bold sm:text-3xl">60+</div>
                  <div className="mt-1 text-xs text-slate-200 sm:text-sm">Projects completed</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xl font-bold sm:text-3xl">10+</div>
                  <div className="mt-1 text-xs text-slate-200 sm:text-sm">Years experience</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xl font-bold sm:text-3xl">Build</div>
                  <div className="mt-1 text-xs text-slate-200 sm:text-sm">Construction and renovation</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-xl font-bold sm:text-3xl">Supply</div>
                  <div className="mt-1 text-xs text-slate-200 sm:text-sm">Materials and hardware RFQ</div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 sm:text-sm sm:tracking-[0.3em]">
                Start with the service you need
              </p>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">Construction and renovation</p>
                  <p className="mt-1">
                    Request quotations for homes, rental units, commercial spaces,
                    finishes, and upgrades.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Plumbing and fit-outs</p>
                  <p className="mt-1">
                    Get support for water systems, drainage, fixtures, and repair work.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Hardware supplies</p>
                  <p className="mt-1">
                    Send your materials list for pricing, availability, and delivery options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 sm:text-sm sm:tracking-[0.35em]">
            Trusted suppliers and brands
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-center text-sm font-semibold text-slate-600 md:grid-cols-4 lg:grid-cols-7">
            {[
              "Bamburi Cement",
              "Doshi",
              "Simba Cement",
              "Rai Cement",
              "Lakhi",
              "Basco",
              "Crown Paints",
            ].map((name) => (
              <div key={name} className="rounded-2xl bg-stone-50 px-3 py-4">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
              Services
            </p>
            <h2 className="mt-2 text-3xl font-bold">Professional service lines</h2>
          </div>
          <Link to="/services" className="font-semibold text-blue-700">
            View all services
          </Link>
        </div>
        {isLoadingServices ? (
          <div className="rounded-3xl bg-white p-8 shadow-lg">Loading services...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="group overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-60 bg-slate-100">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">
                    Service
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Link to="/booking" className="font-semibold text-blue-700">
                      Request quote
                    </Link>
                    <WhatsAppButton
                      label="WhatsApp"
                      message={`Hello Radamjaribu Builders, I want a quote for ${service.name}.`}
                      className="px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-900 py-14 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                Case Studies
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                See the standard of work before you request a quotation
              </h2>
            </div>
            <Link to="/portfolio" className="font-semibold text-amber-300">
              View portfolio
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {caseStudyItems.map((item) => (
              <article key={item.id} className="rounded-3xl bg-white/10 p-6 backdrop-blur">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-200">{item.summary}</p>
                <div className="mt-5 rounded-2xl bg-white/10 p-4">
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Project outcome
                  </span>
                  <p className="mt-2 text-sm text-amber-100">{item.impact}</p>
                </div>
              </article>
            ))}
          </div>

          {!isLoadingPortfolio && portfolio.length > 0 ? (
            <div className="mt-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                    Project Gallery
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-white">
                    Real images from completed and ongoing works
                  </h3>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
              {portfolio.map((project) => (
                <article
                  key={project.id}
                  className="group overflow-hidden rounded-3xl bg-white text-slate-900 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-64 bg-slate-100">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title || project.tittle}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : project.images?.[0]?.image_url ? (
                      <img
                        src={project.images[0].image_url}
                        alt={project.title || project.tittle}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900">
                      Featured Project
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">
                      {project.title || project.tittle}
                    </h3>
                    <p className="mt-3 text-sm text-slate-600">{project.description}</p>
                    {project.images && project.images.length > 1 ? (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {project.images.slice(0, 3).map((image, index) => (
                          <div
                            key={image.id || index}
                            className="h-20 overflow-hidden rounded-xl bg-slate-100"
                          >
                            <img
                              src={image.image_url}
                              alt={`${project.title || project.tittle} ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
            Testimonials
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {settings?.google_reviews?.length > 0
              ? "Live social proof from Google reviews"
              : "Proof that speaks to new clients"}
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {reviewsToShow.map((item) => (
            <article key={item.id} className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-lg leading-8 text-slate-700">"{item.quote}"</p>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-slate-500">
                  {item.project} • {item.location}
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.result}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-amber-100 py-14">
        <div className="container mx-auto rounded-[2rem] bg-slate-900 px-6 py-10 text-white shadow-2xl md:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                Hardware Store
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Check available supplies and request pricing directly from the store
              </h2>
              <p className="mt-4 max-w-2xl text-slate-300">
                Browse construction, plumbing, and finishing supplies, then send
                your list for pricing, availability, and delivery options.
              </p>
            </div>
            <Link
              to="/hardware"
              className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-200"
            >
              View hardware supplies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
