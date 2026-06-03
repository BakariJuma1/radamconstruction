import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { SiteSettingsContext } from "../SiteSettingsContext";

const AdminDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const { refreshSettings } = useContext(SiteSettingsContext);
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [hardwareCategories, setHardwareCategories] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    whatsapp_number: "",
    google_business_name: "",
    google_reviews_json: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  // New service form state
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    price: "",
    images: [],
    alt_text: "",
  });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState("");

  // New portfolio item form state
  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    description: "",
    images: [],
    alt_text: "",
  });
  const [seoLoading, setSeoLoading] = useState("");
  const [newHardwareCategory, setNewHardwareCategory] = useState({
    name: "",
    description: "",
  });
  const [editingHardwareCategoryId, setEditingHardwareCategoryId] = useState(null);
  const [newHardwareItem, setNewHardwareItem] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    unit: "",
    image: null,
  });
  const [editingHardwareItemId, setEditingHardwareItemId] = useState(null);
  const [newTeamMember, setNewTeamMember] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [editingTeamMemberId, setEditingTeamMemberId] = useState(null);
  const [aiLoading, setAiLoading] = useState("");
  const [replyDraft, setReplyDraft] = useState({ open: false, generating: false, sending: false, to: "", toName: "", subject: "", body: "", sent: false });
  const [changePassword, setChangePassword] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [showTeamPassword, setShowTeamPassword] = useState(false);
  const [triageData, setTriageData] = useState({});
  const [triageLoading, setTriageLoading] = useState(false);

  const enhanceDescription = async (text, type, setter, field) => {
    if (!text.trim()) {
      showMessage("Write a short description first, then enhance it.", "error");
      return;
    }
    setAiLoading(type);
    try {
      const res = await axios.post(
        "https://radamconstruction.onrender.com/ai/enhance-description",
        { text, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setter((prev) => ({ ...prev, [field]: res.data.enhanced }));
    } catch (err) {
      showMessage("AI enhancement failed. Please try again.", "error");
    } finally {
      setAiLoading("");
    }
  };

  const generateSeo = async (title, description, type, setter) => {
    if (!title.trim()) {
      showMessage("Enter a title first before generating SEO content.", "error");
      return;
    }
    setSeoLoading(type);
    try {
      const res = await axios.post(
        "https://radamconstruction.onrender.com/ai/generate-seo",
        { title, description, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setter((prev) => ({ ...prev, alt_text: res.data.alt_text || "" }));
      showMessage("SEO content generated — review and save.", "success");
    } catch {
      showMessage("Failed to generate SEO content. Try again.", "error");
    } finally {
      setSeoLoading("");
    }
  };

  const generateReplyDraft = async (item, type) => {
    setReplyDraft({ open: true, generating: true, sending: false, to: item.email, toName: item.name, subject: "", body: "", sent: false });
    try {
      const res = await axios.post(
        "https://radamconstruction.onrender.com/ai/draft-reply",
        { type, data: item },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyDraft((prev) => ({ ...prev, generating: false, subject: res.data.subject, body: res.data.body }));
    } catch {
      setReplyDraft((prev) => ({ ...prev, generating: false }));
      showMessage("Failed to generate reply. Please try again.", "error");
    }
  };

  const sendReplyEmail = async () => {
    setReplyDraft((prev) => ({ ...prev, sending: true }));
    try {
      await axios.post(
        "https://radamconstruction.onrender.com/ai/send-reply",
        { to: replyDraft.to, toName: replyDraft.toName, subject: replyDraft.subject, body: replyDraft.body },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyDraft((prev) => ({ ...prev, sending: false, sent: true }));
      showMessage("Reply sent successfully!", "success");
      setTimeout(() => setReplyDraft({ open: false, generating: false, sending: false, to: "", toName: "", subject: "", body: "", sent: false }), 2000);
    } catch {
      setReplyDraft((prev) => ({ ...prev, sending: false }));
      showMessage("Failed to send reply. Please try again.", "error");
    }
  };

  const runTriageBookings = async (bookingList) => {
    if (triageLoading || !bookingList.length) return;
    setTriageLoading(true);
    try {
      const res = await axios.post(
        "https://radamconstruction.onrender.com/ai/triage-bookings",
        { bookings: bookingList.map((b) => ({ id: b.id, name: b.name, message: b.message, service: b.service })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const map = {};
      (res.data.results || []).forEach((t) => { map[t.id] = t; });
      setTriageData((prev) => ({ ...prev, ...map }));
    } catch (e) {
      console.error("Triage failed", e);
    } finally {
      setTriageLoading(false);
    }
  };

  const [bookingFilters, setBookingFilters] = useState({
    search: "",
    status: "all",
    service: "all",
    assignee: "all",
  });
  const [contactFilters, setContactFilters] = useState({
    search: "",
    type: "all",
  });

  // Toggle item expansion for mobile
  const toggleItemExpansion = (itemId) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const useAuthValidation = () => {
    const validateAuth = () => {
      if (!token) {
        showMessage("Authentication required. Please log in.", "error");
        return false;
      }

      try {
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
          showMessage("Invalid authentication token", "error");
          logout();
          return false;
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          showMessage("Session expired. Please log in again.", "error");
          logout();
          return false;
        }

        return true;
      } catch (error) {
        console.error("Token validation error:", error);
        showMessage("Authentication error. Please log in again.", "error");
        logout();
        return false;
      }
    };

    return { validateAuth };
  };

  const { validateAuth } = useAuthValidation();

  // API call with retry logic
  const apiCallWithRetry = async (apiCall, maxRetries = 2) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (error.response?.status === 401) {
          throw error;
        }

        if (i === maxRetries - 1) throw error;

        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
      }
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.log("No token available");
        return;
      }

      if (!validateAuth()) {
        return;
      }

      setLoading(true);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        await apiCallWithRetry(async () => {
          switch (activeTab) {
            case "bookings":
              const [bookingsRes, bookingsTeamRes, bookingServicesRes] = await Promise.all([
                axios.get("https://radamconstruction.onrender.com/bookings", config),
                axios.get("https://radamconstruction.onrender.com/users", config),
                axios.get("https://radamconstruction.onrender.com/services"),
              ]);
              setBookings(bookingsRes.data);
              setTeamMembers(bookingsTeamRes.data);
              setServices(bookingServicesRes.data);
              break;
            case "contacts":
              const contactsRes = await axios.get(
                "https://radamconstruction.onrender.com/contacts",
                config
              );
              setContacts(contactsRes.data);
              break;
            case "services":
              const servicesRes = await axios.get(
                "https://radamconstruction.onrender.com/services"
              );
              setServices(servicesRes.data);
              break;
            case "portfolio":
              const portfolioRes = await axios.get(
                "https://radamconstruction.onrender.com/portfolio"
              );
              setPortfolio(portfolioRes.data);
              break;
            case "hardware":
              const hardwareRes = await axios.get(
                "https://radamconstruction.onrender.com/hardware-categories"
              );
              setHardwareCategories(hardwareRes.data);
              break;
            case "settings":
              const settingsRes = await axios.get(
                "https://radamconstruction.onrender.com/settings",
                config
              );
              setSiteSettings({
                whatsapp_number: settingsRes.data.whatsapp_number || "",
                google_business_name:
                  settingsRes.data.google_business_name || "",
                google_reviews_json:
                  settingsRes.data.google_reviews_json || "",
              });
              break;
            case "team":
              const teamRes = await axios.get(
                "https://radamconstruction.onrender.com/users",
                config
              );
              setTeamMembers(teamRes.data);
              break;
            default:
              break;
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          showMessage("Session expired. Please log in again.", "error");
          logout();
        } else {
          showMessage("Error fetching data", "error");
        }
      } finally {
        setLoading(false);
        setExpandedItems(new Set()); // Reset expanded items on tab change
      }
    };

    fetchData();
  }, [activeTab, token, logout]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  useEffect(() => {
    if (newService.images.length === 0) {
      setServiceImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(newService.images[0]);
    setServiceImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [newService.images]);

  useEffect(() => {
    if (activeTab === "bookings" && bookings.length > 0) {
      const untriaged = bookings.filter((b) => !triageData[b.id]);
      if (untriaged.length > 0) runTriageBookings(untriaged);
    }
  }, [bookings]);

  const resetServiceForm = () => {
    setNewService({ title: "", description: "", price: "", images: [], alt_text: "" });
    setServiceImagePreview("");
    setEditingServiceId(null);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();

    if (!validateAuth()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", newService.title);
      formData.append("description", newService.description);
      if (newService.price) {
        formData.append("price", parseFloat(newService.price));
      }
      if (newService.alt_text) {
        formData.append("alt_text", newService.alt_text);
      }
      newService.images.forEach((image) => {
        formData.append("images", image);
      });

      await apiCallWithRetry(async () => {
        const endpoint = editingServiceId
          ? `https://radamconstruction.onrender.com/services/${editingServiceId}`
          : "https://radamconstruction.onrender.com/services";
        const method = editingServiceId ? "put" : "post";

        await axios[method](endpoint, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      });

      showMessage(
        editingServiceId
          ? "Service updated successfully"
          : "Service created successfully",
        "success"
      );
      resetServiceForm();

      const servicesRes = await axios.get(
        "https://radamconstruction.onrender.com/services"
      );
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Error saving service:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage(
          error.response?.data?.error || "Error saving service",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();

    if (!validateAuth()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", newPortfolio.title);
      formData.append("description", newPortfolio.description);
      if (newPortfolio.alt_text) {
        formData.append("alt_text", newPortfolio.alt_text);
      }
      newPortfolio.images.forEach((image) => {
        formData.append("images", image);
      });

      await apiCallWithRetry(async () => {
        await axios.post(
          "https://radamconstruction.onrender.com/portfolio",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      });

      showMessage("Portfolio item created successfully", "success");
      setNewPortfolio({ title: "", description: "", images: [], alt_text: "" });

      const portfolioRes = await axios.get(
        "https://radamconstruction.onrender.com/portfolio"
      );
      setPortfolio(portfolioRes.data);
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage("Error creating portfolio item", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    if (!validateAuth()) return;

    try {
      await apiCallWithRetry(async () => {
        await axios.put(
          `https://radamconstruction.onrender.com/bookings/${bookingId}`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );

      showMessage("Booking status updated", "success");
    } catch (error) {
      console.error("Error updating booking:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage("Error updating booking", "error");
      }
    }
  };

  const updateBookingAssignment = async (bookingId, assignedUserId) => {
    if (!validateAuth()) return;

    try {
      const payload = {
        assigned_user_id: assignedUserId ? Number(assignedUserId) : null,
      };

      await apiCallWithRetry(async () => {
        await axios.put(
          `https://radamconstruction.onrender.com/bookings/${bookingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                assigned_user_id: payload.assigned_user_id,
                assigned_user:
                  teamMembers.find(
                    (member) => member.id === payload.assigned_user_id
                  ) || null,
              }
            : booking
        )
      );

      showMessage("Booking assignment updated", "success");
    } catch (error) {
      console.error("Error updating booking assignment:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage("Error updating booking assignment", "error");
      }
    }
  };

  const markItemAsRead = async (type, id) => {
    if (!validateAuth()) return;

    try {
      if (type === "booking") {
        await axios.put(
          `https://radamconstruction.onrender.com/bookings/${id}`,
          { is_read: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookings((current) =>
          current.map((booking) =>
            booking.id === id ? { ...booking, is_read: true } : booking
          )
        );
      }

      if (type === "contact") {
        await axios.put(
          `https://radamconstruction.onrender.com/contacts/${id}`,
          { is_read: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setContacts((current) =>
          current.map((contact) =>
            contact.id === id ? { ...contact, is_read: true } : contact
          )
        );
      }
    } catch (error) {
      console.error(`Error marking ${type} as read:`, error);
    }
  };

  const deleteItem = async (type, id) => {
    if (!validateAuth()) return;

    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    try {
      let endpoint = "";

      switch (type) {
        case "service":
          endpoint = `https://radamconstruction.onrender.com/services/${id}`;
          break;
        case "portfolio":
          endpoint = `https://radamconstruction.onrender.com/portfolio/${id}`;
          break;
        case "contact":
          endpoint = `https://radamconstruction.onrender.com/contacts/${id}`;
          break;
        case "hardware-category":
          endpoint = `https://radamconstruction.onrender.com/hardware-categories/${id}`;
          break;
        case "hardware-item":
          endpoint = `https://radamconstruction.onrender.com/hardware-items/${id}`;
          break;
        case "team-member":
          endpoint = `https://radamconstruction.onrender.com/users/${id}`;
          break;
        default:
          return;
      }

      await apiCallWithRetry(async () => {
        await axios.delete(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
      });

      switch (type) {
        case "service":
          setServices(services.filter((item) => item.id !== id));
          break;
        case "portfolio":
          setPortfolio(portfolio.filter((item) => item.id !== id));
          break;
        case "contact":
          setContacts(contacts.filter((item) => item.id !== id));
          break;
        case "hardware-category":
        case "hardware-item":
          await refreshHardwareCategories();
          break;
        case "team-member":
          setTeamMembers(teamMembers.filter((member) => member.id !== id));
          if (editingTeamMemberId === id) {
            resetTeamMemberForm();
          }
          break;
        default:
          break;
      }

      showMessage(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
        "success"
      );
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage(`Error deleting ${type}`, "error");
      }
    }
  };

  const handleImageUpload = (e, setter, field) => {
    const files = Array.from(e.target.files);
    setter((prev) => ({ ...prev, [field]: files }));
  };

  const refreshHardwareCategories = async () => {
    const response = await axios.get(
      "https://radamconstruction.onrender.com/hardware-categories"
    );
    setHardwareCategories(response.data);
  };

  const startServiceEdit = (service) => {
    setEditingServiceId(service.id);
    setNewService({
      title: service.name || "",
      description: service.description || "",
      price: service.price || "",
      images: [],
      alt_text: service.alt_text || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHardwareCategorySubmit = async (e) => {
    e.preventDefault();

    if (!validateAuth()) return;

    setLoading(true);
    try {
      const endpoint = editingHardwareCategoryId
        ? `https://radamconstruction.onrender.com/hardware-categories/${editingHardwareCategoryId}`
        : "https://radamconstruction.onrender.com/hardware-categories";
      const method = editingHardwareCategoryId ? "put" : "post";

      await axios[method](endpoint, newHardwareCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setNewHardwareCategory({ name: "", description: "" });
      setEditingHardwareCategoryId(null);
      await refreshHardwareCategories();
      showMessage(
        editingHardwareCategoryId
          ? "Hardware category updated"
          : "Hardware category added",
        "success"
      );
    } catch (error) {
      console.error("Error creating hardware category:", error);
      showMessage(
        error.response?.data?.error || "Error creating hardware category",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHardwareItemSubmit = async (e) => {
    e.preventDefault();

    if (!validateAuth()) return;

    setLoading(true);
    try {
      const endpoint = editingHardwareItemId
        ? `https://radamconstruction.onrender.com/hardware-items/${editingHardwareItemId}`
        : "https://radamconstruction.onrender.com/hardware-items";
      const method = editingHardwareItemId ? "put" : "post";
      const formData = new FormData();
      formData.append("category_id", newHardwareItem.category_id);
      formData.append("name", newHardwareItem.name);
      formData.append("description", newHardwareItem.description);
      formData.append("price", newHardwareItem.price);
      formData.append("unit", newHardwareItem.unit);
      if (newHardwareItem.image) {
        formData.append("image", newHardwareItem.image);
      }

      await axios[method](endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setNewHardwareItem({
        category_id: "",
        name: "",
        description: "",
        price: "",
        unit: "",
        image: null,
      });
      setEditingHardwareItemId(null);
      await refreshHardwareCategories();
      showMessage(
        editingHardwareItemId ? "Hardware item updated" : "Hardware item added",
        "success"
      );
    } catch (error) {
      console.error("Error creating hardware item:", error);
      showMessage(
        error.response?.data?.error || "Error creating hardware item",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const startHardwareCategoryEdit = (category) => {
    setEditingHardwareCategoryId(category.id);
    setNewHardwareCategory({
      name: category.name || "",
      description: category.description || "",
    });
  };

  const startHardwareItemEdit = (item) => {
    setEditingHardwareItemId(item.id);
    setNewHardwareItem({
      category_id: item.category_id ? String(item.category_id) : "",
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      unit: item.unit || "",
      image: null,
    });
  };

  const cancelHardwareCategoryEdit = () => {
    setEditingHardwareCategoryId(null);
    setNewHardwareCategory({ name: "", description: "" });
  };

  const cancelHardwareItemEdit = () => {
    setEditingHardwareItemId(null);
    setNewHardwareItem({
      category_id: "",
      name: "",
      description: "",
      price: "",
      unit: "",
      image: null,
    });
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();

    if (!validateAuth()) return;

    setLoading(true);
    try {
      const response = await axios.put(
        "https://radamconstruction.onrender.com/settings",
        siteSettings,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSiteSettings({
        whatsapp_number: response.data.whatsapp_number || "",
        google_business_name: response.data.google_business_name || "",
        google_reviews_json: response.data.google_reviews_json || "",
      });
      await refreshSettings();
      showMessage("Site settings updated", "success");
    } catch (error) {
      console.error("Error updating settings:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else if (error.response?.data?.error) {
        showMessage(error.response.data.error, "error");
      } else {
        showMessage("Error updating settings", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validateAuth()) return;
    setChangePasswordLoading(true);
    try {
      await axios.post(
        "https://radamconstruction.onrender.com/change-password",
        changePassword,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChangePassword({ current_password: "", new_password: "", confirm_password: "" });
      showMessage("Password changed successfully", "success");
    } catch (error) {
      showMessage(error.response?.data?.error || "Failed to change password", "error");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const refreshTeamMembers = async () => {
    const response = await axios.get(
      "https://radamconstruction.onrender.com/users",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setTeamMembers(response.data);
  };

  const resetTeamMemberForm = () => {
    setNewTeamMember({ username: "", email: "", password: "" });
    setEditingTeamMemberId(null);
    setShowTeamPassword(false);
  };

  const handleTeamMemberSubmit = async (e) => {
    e.preventDefault();

    if (!validateAuth()) return;

    setLoading(true);
    try {
      const endpoint = editingTeamMemberId
        ? `https://radamconstruction.onrender.com/users/${editingTeamMemberId}`
        : "https://radamconstruction.onrender.com/users";
      const method = editingTeamMemberId ? "put" : "post";

      await axios[method](endpoint, newTeamMember, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await refreshTeamMembers();
      showMessage(
        editingTeamMemberId
          ? "Team member updated"
          : "Team member added",
        "success"
      );
      resetTeamMemberForm();
    } catch (error) {
      console.error("Error saving team member:", error);
      showMessage(
        error.response?.data?.error || "Error saving team member",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const startTeamMemberEdit = (member) => {
    setEditingTeamMemberId(member.id);
    setNewTeamMember({ username: member.username || "", email: member.email || "", password: "" });
    setShowTeamPassword(false);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      confirmed: { color: "bg-green-100 text-green-800", text: "Confirmed" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  // Mobile-friendly table row component
  const MobileTableRow = ({ item, type, children }) => (
    <div
      className={`bg-white border-b border-gray-200 ${
        expandedItems.has(item.id) ? "expanded" : ""
      }`}
      onClick={() => window.innerWidth < 768 && toggleItemExpansion(item.id)}
    >
      {children}
    </div>
  );

  // Improved loading spinner
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-gray-500">
          Loading...
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = ({ message, icon }) => (
    <div className="text-center py-12 px-4">
      {icon ? <div className="text-gray-400 text-4xl mb-4">{icon}</div> : null}
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );

  const navTabs = [
    { id: "bookings", label: "Bookings", tone: "from-sky-500 to-blue-600" },
    { id: "contacts", label: "Contacts", tone: "from-emerald-500 to-teal-600" },
    { id: "services", label: "Services", tone: "from-amber-500 to-orange-600" },
    { id: "portfolio", label: "Portfolio", tone: "from-fuchsia-500 to-pink-600" },
    { id: "hardware", label: "Hardware", tone: "from-violet-500 to-purple-600" },
    { id: "team", label: "Team", tone: "from-cyan-500 to-sky-600" },
    { id: "settings", label: "Settings", tone: "from-slate-500 to-slate-700" },
  ];

  const activeTabMeta =
    navTabs.find((tab) => tab.id === activeTab) || navTabs[0];

  const totalManagedItems =
    bookings.length +
    contacts.length +
    services.length +
    portfolio.length +
    teamMembers.length +
    hardwareCategories.reduce(
      (total, category) => total + 1 + category.items.length,
      0
    );

  const summaryCards = [
    {
      label: "Bookings",
      value: bookings.length,
      helper: "Incoming quote and site visit requests",
    },
    {
      label: "Contacts",
      value: contacts.length,
      helper: "Direct messages from the contact form",
    },
    {
      label: "Catalog",
      value:
        services.length +
        portfolio.length +
        hardwareCategories.reduce((total, category) => total + category.items.length, 0),
      helper: "Services, projects, and hardware items",
    },
    {
      label: "Categories",
      value: hardwareCategories.length,
      helper: "Hardware sections currently managed",
    },
    {
      label: "Team",
      value: teamMembers.length,
      helper: "Staff accounts receiving booking notifications",
    },
  ];

  const unreadBookingsCount = bookings.filter((booking) => !booking.is_read).length;
  const unreadContactsCount = contacts.filter((contact) => !contact.is_read).length;
  const filteredBookings = bookings.filter((booking) => {
    const searchText = bookingFilters.search.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      booking.name?.toLowerCase().includes(searchText) ||
      booking.email?.toLowerCase().includes(searchText) ||
      booking.phone?.toLowerCase().includes(searchText) ||
      booking.service?.name?.toLowerCase().includes(searchText);
    const matchesStatus =
      bookingFilters.status === "all" ||
      (booking.status || "pending") === bookingFilters.status;
    const matchesService =
      bookingFilters.service === "all" ||
      String(booking.service?.id || "") === bookingFilters.service;
    const matchesAssignee =
      bookingFilters.assignee === "all" ||
      (bookingFilters.assignee === "unassigned"
        ? !booking.assigned_user_id
        : String(booking.assigned_user_id || "") === bookingFilters.assignee);

    return matchesSearch && matchesStatus && matchesService && matchesAssignee;
  });
  const filteredContacts = contacts.filter((contact) => {
    const searchText = contactFilters.search.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      contact.name?.toLowerCase().includes(searchText) ||
      contact.email?.toLowerCase().includes(searchText) ||
      contact.phone?.toLowerCase().includes(searchText) ||
      contact.subject?.toLowerCase().includes(searchText);
    const matchesType =
      contactFilters.type === "all" ||
      (contactFilters.type === "rfq"
        ? contact.subject === "hardware-rfq"
        : contact.subject !== "hardware-rfq");

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row overflow-x-hidden">
      {/* Main Content */}
      <div className="order-2 flex-1 min-w-0 md:pl-80">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3 px-3 py-3 sm:px-6 sm:py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500 sm:text-xs">
                Control Center
              </p>
              <h2 className="text-base font-semibold text-slate-900 capitalize sm:text-xl">
                {activeTabMeta.label}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm text-white font-bold">
                  {user?.name?.[0] || user?.email?.[0] || "A"}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || "Administrator"}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[160px]">{user?.email}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white">
                {totalManagedItems} items
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mb-6 sm:rounded-[1.75rem]">
            <div className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 sm:text-xs">
                    Admin Workspace
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-slate-900 sm:mt-2 sm:text-3xl">
                    {activeTabMeta.label}
                  </h1>
                  <p className="mt-1 hidden max-w-2xl text-sm text-slate-600 sm:mt-2 sm:block">
                    Review activity, update content, and keep the site current from one dashboard.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                  {summaryCards.map((card) => (
                    <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                      <div className="text-lg font-bold text-slate-900 sm:text-2xl">{card.value}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                        {card.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-600 md:grid md:grid-cols-4 bg-slate-50/70">
              {summaryCards.map((card) => (
                <div key={`${card.label}-helper`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-900">{card.label}</p>
                  <p className="mt-1">{card.helper}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Enhanced Message Alert */}
          {message.text && (
            <div
              className={`mb-6 rounded-2xl p-4 border-l-4 shadow-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border-green-400"
                  : "bg-red-50 text-red-800 border-red-400"
              }`}
            >
              <div className="flex items-center">
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Enhanced Loading Indicator */}
          {loading && <LoadingSpinner />}

          {/* Authentication Check */}
          {!token && !loading && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <span>Please log in to access the admin dashboard.</span>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && token && !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Booking Requests ({bookings.length})
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    type="text"
                    value={bookingFilters.search}
                    onChange={(e) =>
                      setBookingFilters((current) => ({
                        ...current,
                        search: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search customer, phone, email, or service"
                  />
                  <select
                    value={bookingFilters.status}
                    onChange={(e) =>
                      setBookingFilters((current) => ({
                        ...current,
                        status: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={bookingFilters.service}
                    onChange={(e) =>
                      setBookingFilters((current) => ({
                        ...current,
                        service: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All services</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={bookingFilters.assignee}
                    onChange={(e) =>
                      setBookingFilters((current) => ({
                        ...current,
                        assignee: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All assignees</option>
                    <option value="unassigned">Unassigned</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <EmptyState message="No booking requests found" icon="" />
                ) : (
                  filteredBookings.map((booking) => (
                    <MobileTableRow
                      key={booking.id}
                      item={booking}
                      type="booking"
                    >
                      <div
                        className={`p-4 sm:p-6 ${
                          booking.is_read ? "" : "bg-sky-50/70"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {booking.name}
                              </h4>
                              {!booking.is_read ? (
                                <span className="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                                  New
                                </span>
                              ) : null}
                              {triageData[booking.id] ? (
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  triageData[booking.id].priority === "urgent"
                                    ? "bg-red-100 text-red-700"
                                    : triageData[booking.id].priority === "normal"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                                }`}>
                                  {triageData[booking.id].label}
                                </span>
                              ) : triageLoading ? (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-400">
                                  Analysing…
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {booking.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <StatusBadge status={booking.status || "pending"} />
                            <button
                              onClick={() => toggleItemExpansion(booking.id)}
                              className="md:hidden text-gray-400 hover:text-gray-600"
                            >
                              <svg
                                className={`w-5 h-5 transform transition-transform ${
                                  expandedItems.has(booking.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-700">
                              Phone:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {booking.phone || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Date:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {new Date(
                                booking.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-medium text-gray-700">
                              Service:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {booking.service?.name || "Not specified"}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-medium text-gray-700">
                              Assigned to:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {booking.assigned_user?.username || "Unassigned"}
                            </span>
                          </div>
                        </div>

                        {(expandedItems.has(booking.id) ||
                          window.innerWidth >= 768) && (
                          <div className="space-y-4 border-t border-gray-100 pt-4">
                            <div>
                              <span className="font-medium text-gray-700 block mb-1">
                                Message:
                              </span>
                              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                                {booking.message}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                              <div className="flex-1 grid gap-3 lg:grid-cols-2">
                                <div>
                                  <label
                                    htmlFor={`assignee-${booking.id}`}
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Assign To:
                                  </label>
                                  <select
                                    id={`assignee-${booking.id}`}
                                    value={booking.assigned_user_id || ""}
                                    onChange={(e) =>
                                      updateBookingAssignment(
                                        booking.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Unassigned</option>
                                    {teamMembers.map((member) => (
                                      <option key={member.id} value={member.id}>
                                        {member.username}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label
                                    htmlFor={`status-${booking.id}`}
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Update Status:
                                  </label>
                                  <select
                                    id={`status-${booking.id}`}
                                    value={booking.status || "pending"}
                                    onChange={(e) =>
                                      updateBookingStatus(
                                        booking.id,
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => generateReplyDraft(booking, "booking")}
                                  className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
                                >
                                  ✦ Draft Reply
                                </button>
                                {!booking.is_read ? (
                                  <button
                                    type="button"
                                    onClick={() => markItemAsRead("booking", booking.id)}
                                    className="rounded-lg bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-200"
                                  >
                                    Mark as read
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </MobileTableRow>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && token && !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Contact Messages ({contacts.length})
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    value={contactFilters.search}
                    onChange={(e) =>
                      setContactFilters((current) => ({
                        ...current,
                        search: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by customer, phone, email, or subject"
                  />
                  <select
                    value={contactFilters.type}
                    onChange={(e) =>
                      setContactFilters((current) => ({
                        ...current,
                        type: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All messages</option>
                    <option value="contact">General contacts</option>
                    <option value="rfq">Hardware RFQs</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredContacts.length === 0 ? (
                  <EmptyState message="No contact messages found" icon="" />
                ) : (
                  filteredContacts.map((contact) => (
                    <MobileTableRow
                      key={contact.id}
                      item={contact}
                      type="contact"
                    >
                      <div
                        className={`p-4 sm:p-6 ${
                          contact.is_read ? "" : "bg-sky-50/70"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {contact.name}
                              </h4>
                              {!contact.is_read ? (
                                <span className="rounded-full bg-sky-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                                  New
                                </span>
                              ) : null}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {contact.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {contact.subject}
                            </span>
                            <button
                              onClick={() => toggleItemExpansion(contact.id)}
                              className="md:hidden text-gray-400 hover:text-gray-600"
                            >
                              <svg
                                className={`w-5 h-5 transform transition-transform ${
                                  expandedItems.has(contact.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                          {contact.phone && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Phone:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {contact.phone}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-700">
                              Date:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {new Date(
                                contact.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {(expandedItems.has(contact.id) ||
                          window.innerWidth >= 768) && (
                          <div className="space-y-4 border-t border-gray-100 pt-4">
                            <div>
                              <span className="font-medium text-gray-700 block mb-1">
                                Message:
                              </span>
                              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
                                {contact.message}
                              </p>
                            </div>

                            <div className="flex justify-end">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                  type="button"
                                  onClick={() => generateReplyDraft(contact, "contact")}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors duration-200 text-sm font-medium"
                                >
                                  ✦ Draft Reply
                                </button>
                                {!contact.is_read ? (
                                  <button
                                    type="button"
                                    onClick={() => markItemAsRead("contact", contact.id)}
                                    className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors duration-200"
                                  >
                                    Mark as read
                                  </button>
                                ) : null}
                                <button
                                  onClick={() =>
                                    deleteItem("contact", contact.id)
                                  }
                                  className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                  aria-label="Delete message"
                                >
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </MobileTableRow>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "services" && token && !loading && (
            <div className="space-y-6">
              {/* Enhanced Add New Service Form */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingServiceId ? "Edit Service" : "Add New Service"}
                </h3>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={newService.title}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter service title"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Internal Price Reference
                      </label>
                      <input
                        type="text"
                        id="price"
                        value={newService.price}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Optional internal reference"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        This stays in admin only and is not shown on the public
                        services page.
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <button
                        type="button"
                        disabled={aiLoading === "service"}
                        onClick={() => enhanceDescription(newService.description, "service", setNewService, "description")}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                      >
                        {aiLoading === "service" ? (
                          <><div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />Enhancing...</>
                        ) : (
                          <>✦ Enhance with AI</>
                        )}
                      </button>
                    </div>
                    <textarea
                      id="description"
                      rows={4}
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-vertical"
                      placeholder="Describe the service in plain English — AI will enhance it..."
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Image Alt Text
                        <span className="ml-1 text-xs font-normal text-gray-400">(SEO)</span>
                      </label>
                      <button
                        type="button"
                        disabled={seoLoading === "service"}
                        onClick={() => generateSeo(newService.title, newService.description, "service", setNewService)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {seoLoading === "service" ? (
                          <><div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />Generating…</>
                        ) : <>✦ Generate SEO</>}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newService.alt_text}
                      onChange={(e) => setNewService({ ...newService, alt_text: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Descriptive text for the image — improves Google visibility"
                      maxLength={125}
                    />
                    {newService.alt_text && (
                      <p className="text-xs text-gray-400 mt-1 text-right">{newService.alt_text.length}/125 characters</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="service-images"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {editingServiceId
                        ? "Replace Service Image"
                        : "Service Image"}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-200">
                      <input
                        type="file"
                        id="service-images"
                        multiple
                        onChange={(e) =>
                          handleImageUpload(e, setNewService, "images")
                        }
                        className="hidden"
                      />
                      <label
                        htmlFor="service-images"
                        className="cursor-pointer"
                      >
                        <div className="text-gray-400 mb-2">
                          <svg
                            className="w-8 h-8 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">
                          {editingServiceId
                            ? "Click to replace the current image"
                            : "Click to upload an image"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                    </div>
                    {editingServiceId &&
                      newService.images.length === 0 &&
                      services.find((service) => service.id === editingServiceId)
                        ?.images?.[0] && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">
                            Current image
                          </p>
                          <img
                            src={
                              services.find(
                                (service) => service.id === editingServiceId
                              ).images[0]
                            }
                            alt={newService.title || "Current service"}
                            className="w-full max-w-xs h-40 object-contain bg-white border border-gray-200 rounded-lg"
                          />
                        </div>
                      )}
                    {newService.images.length > 0 && (
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-green-600">
                          {newService.images.length} file(s) selected
                        </p>
                        {serviceImagePreview && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">
                              Selected image preview
                            </p>
                            <img
                              src={serviceImagePreview}
                              alt="Selected service upload preview"
                              className="w-full max-w-xs h-48 object-contain bg-white border border-gray-200 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {editingServiceId
                            ? "Saving Service..."
                            : "Adding Service..."}
                        </span>
                      ) : editingServiceId ? (
                        "Save Changes"
                      ) : (
                        "Add Service"
                      )}
                    </button>
                    {editingServiceId && (
                      <button
                        type="button"
                        onClick={resetServiceForm}
                        className="w-full sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-200 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Enhanced Services List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Existing Services ({services.length})
                </h3>
                {services.length === 0 ? (
                  <EmptyState
                    message="No services found. Add your first service!"
                    icon=""
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        {service.images && service.images.length > 0 && (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-48 object-contain bg-white"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2 truncate">
                            {service.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                          {service.price && (
                            <p className="text-blue-600 font-medium mb-4 truncate text-sm">
                              Internal reference:{" "}
                              {service.price}
                            </p>
                          )}
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => startServiceEdit(service)}
                              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                            >
                              Edit Service
                            </button>
                            <button
                              onClick={() => deleteItem("service", service.id)}
                              className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete Service
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && token && !loading && (
            <div className="space-y-6">
              {/* Enhanced Add New Portfolio Item Form */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Add New Portfolio Item
                </h3>
                <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="portfolio-title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="portfolio-title"
                      value={newPortfolio.title}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter portfolio item title"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="portfolio-description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <button
                        type="button"
                        disabled={aiLoading === "portfolio"}
                        onClick={() => enhanceDescription(newPortfolio.description, "portfolio", setNewPortfolio, "description")}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                      >
                        {aiLoading === "portfolio" ? (
                          <><div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />Enhancing...</>
                        ) : (
                          <>✦ Enhance with AI</>
                        )}
                      </button>
                    </div>
                    <textarea
                      id="portfolio-description"
                      rows={4}
                      value={newPortfolio.description}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-vertical"
                      placeholder="Describe the project in plain English — AI will enhance it..."
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Image Alt Text
                        <span className="ml-1 text-xs font-normal text-gray-400">(SEO)</span>
                      </label>
                      <button
                        type="button"
                        disabled={seoLoading === "portfolio"}
                        onClick={() => generateSeo(newPortfolio.title, newPortfolio.description, "portfolio", setNewPortfolio)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {seoLoading === "portfolio" ? (
                          <><div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />Generating…</>
                        ) : <>✦ Generate SEO</>}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newPortfolio.alt_text}
                      onChange={(e) => setNewPortfolio({ ...newPortfolio, alt_text: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Descriptive text for the image — improves Google visibility"
                      maxLength={125}
                    />
                    {newPortfolio.alt_text && (
                      <p className="text-xs text-gray-400 mt-1 text-right">{newPortfolio.alt_text.length}/125 characters</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="portfolio-images"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-200">
                      <input
                        type="file"
                        id="portfolio-images"
                        multiple
                        onChange={(e) =>
                          handleImageUpload(e, setNewPortfolio, "images")
                        }
                        className="hidden"
                        required
                      />
                      <label
                        htmlFor="portfolio-images"
                        className="cursor-pointer"
                      >
                        <div className="text-gray-400 mb-2">
                          <svg
                            className="w-8 h-8 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">
                          Click to upload project images
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                    </div>
                    {newPortfolio.images.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        {newPortfolio.images.length} file(s) selected
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding Item...
                      </span>
                    ) : (
                      "Add Portfolio Item"
                    )}
                  </button>
                </form>
              </div>

              {/* Enhanced Portfolio Items List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Portfolio Items ({portfolio.length})
                </h3>
                {portfolio.length === 0 ? (
                  <EmptyState
                    message="No portfolio items found. Add your first project!"
                    icon=""
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        {item.images && item.images.length > 0 && (
                          <img
                            src={item.images[0].image_url}
                            alt={item.title}
                            className="w-full h-48 object-contain bg-white"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2 truncate">
                            {item.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                          <button
                            onClick={() => deleteItem("portfolio", item.id)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Item
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && token && !loading && (
            <div className="space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Site Settings
                </h3>
                <form onSubmit={handleSettingsSave} className="space-y-5">
                  <div>
                    <label
                      htmlFor="whatsapp-number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      id="whatsapp-number"
                      value={siteSettings.whatsapp_number}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          whatsapp_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="254700123456"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use international format without plus signs or spaces.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="google-business-name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Google Business Name
                    </label>
                    <input
                      type="text"
                      id="google-business-name"
                      value={siteSettings.google_business_name}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          google_business_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Radamjaribu Builders"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="google-reviews-json"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Google Reviews JSON
                    </label>
                    <textarea
                      id="google-reviews-json"
                      rows={10}
                      value={siteSettings.google_reviews_json}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          google_reviews_json: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-vertical font-mono text-sm"
                      placeholder='[{"author_name":"Jane","text":"Excellent work","rating":5,"relative_time_description":"2 weeks ago"}]'
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      When this field has reviews, the homepage uses them. When
                      it is empty, the app falls back to the built-in testimonials.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Save Settings
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Change Your Password</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Logged in as <span className="font-medium text-gray-700">{user?.email}</span>
                </p>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current password
                    </label>
                    <input
                      type="password"
                      value={changePassword.current_password}
                      onChange={(e) => setChangePassword({ ...changePassword, current_password: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New password
                    </label>
                    <input
                      type="password"
                      value={changePassword.new_password}
                      onChange={(e) => setChangePassword({ ...changePassword, new_password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      value={changePassword.confirm_password}
                      onChange={(e) => setChangePassword({ ...changePassword, confirm_password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Repeat new password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changePasswordLoading}
                    className="w-full sm:w-auto bg-slate-900 text-white py-3 px-6 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {changePasswordLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Changing…
                      </span>
                    ) : "Change password"}
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeTab === "team" && token && !loading && (
            <div className="space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col gap-2 mb-5">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {editingTeamMemberId ? "Edit Team Member" : "Add Team Member"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Team members can log in to the admin dashboard and receive new booking email alerts automatically.
                  </p>
                </div>
                <form onSubmit={handleTeamMemberSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="team-name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        id="team-name"
                        type="text"
                        value={newTeamMember.username}
                        onChange={(e) =>
                          setNewTeamMember({
                            ...newTeamMember,
                            username: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter team member name"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="team-email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        id="team-email"
                        type="email"
                        value={newTeamMember.email}
                        onChange={(e) =>
                          setNewTeamMember({
                            ...newTeamMember,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>
                  {/* Password — shown when adding a new member, or when editing your own record */}
                  {(!editingTeamMemberId || editingTeamMemberId === user?.id) && (
                    <div>
                      <label
                        htmlFor="team-password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {editingTeamMemberId ? "New Password" : "Password"}
                      </label>
                      <div className="relative">
                        <input
                          id="team-password"
                          type={showTeamPassword ? "text" : "password"}
                          value={newTeamMember.password}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, password: e.target.value })}
                          className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={editingTeamMemberId ? "Leave blank to keep current password" : "Minimum 8 characters"}
                          required={!editingTeamMemberId}
                        />
                        <button
                          type="button"
                          onClick={() => setShowTeamPassword((v) => !v)}
                          className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {showTeamPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {editingTeamMemberId && (
                        <p className="text-xs text-gray-500 mt-2">
                          Leave blank to keep your current password.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {editingTeamMemberId ? "Save Team Member" : "Add Team Member"}
                    </button>
                    {editingTeamMemberId ? (
                      <button
                        type="button"
                        onClick={resetTeamMemberForm}
                        className="w-full sm:w-auto bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Team Members ({teamMembers.length})
                </h3>
                {teamMembers.length === 0 ? (
                  <EmptyState message="No team members found yet." icon="" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {member.username}
                              </h4>
                              {member.id === user?.id && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {member.email}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => startTeamMemberEdit(member)}
                              className="text-blue-600 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteItem("team-member", member.id)}
                              className="text-red-600 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "hardware" && token && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {editingHardwareCategoryId
                      ? "Edit Hardware Category"
                      : "Add Hardware Category"}
                  </h3>
                  <form onSubmit={handleHardwareCategorySubmit} className="space-y-4">
                    <input
                      type="text"
                      value={newHardwareCategory.name}
                      onChange={(e) =>
                        setNewHardwareCategory({
                          ...newHardwareCategory,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Category name"
                      required
                    />
                    <div className="relative">
                      <textarea
                        rows={4}
                        value={newHardwareCategory.description}
                        onChange={(e) =>
                          setNewHardwareCategory({
                            ...newHardwareCategory,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="Optional category description — AI can enhance it..."
                      />
                      <button
                        type="button"
                        disabled={aiLoading === "hardware_category"}
                        onClick={() => enhanceDescription(newHardwareCategory.description, "hardware_category", setNewHardwareCategory, "description")}
                        className="mt-1 flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                      >
                        {aiLoading === "hardware_category" ? (
                          <><div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />Enhancing...</>
                        ) : (
                          <>✦ Enhance with AI</>
                        )}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {editingHardwareCategoryId ? "Save Category" : "Add Category"}
                    </button>
                    {editingHardwareCategoryId ? (
                      <button
                        type="button"
                        onClick={cancelHardwareCategoryEdit}
                        className="w-full sm:w-auto sm:ml-3 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </form>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {editingHardwareItemId ? "Edit Hardware Item" : "Add Hardware Item"}
                  </h3>
                  <form onSubmit={handleHardwareItemSubmit} className="space-y-4">
                    <select
                      value={newHardwareItem.category_id}
                      onChange={(e) =>
                        setNewHardwareItem({
                          ...newHardwareItem,
                          category_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select category</option>
                      {hardwareCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newHardwareItem.name}
                      onChange={(e) =>
                        setNewHardwareItem({
                          ...newHardwareItem,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Item name"
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newHardwareItem.price}
                        onChange={(e) =>
                          setNewHardwareItem({
                            ...newHardwareItem,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="Price (optional)"
                      />
                      <input
                        type="text"
                        value={newHardwareItem.unit}
                        onChange={(e) =>
                          setNewHardwareItem({
                            ...newHardwareItem,
                            unit: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="Unit e.g. bag, piece"
                      />
                    </div>
                    <div className="relative">
                      <textarea
                        rows={4}
                        value={newHardwareItem.description}
                        onChange={(e) =>
                          setNewHardwareItem({
                            ...newHardwareItem,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="Optional item description — AI can enhance it..."
                      />
                      <button
                        type="button"
                        disabled={aiLoading === "hardware_item"}
                        onClick={() => enhanceDescription(newHardwareItem.description, "hardware_item", setNewHardwareItem, "description")}
                        className="mt-1 flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                      >
                        {aiLoading === "hardware_item" ? (
                          <><div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />Enhancing...</>
                        ) : (
                          <>✦ Enhance with AI</>
                        )}
                      </button>
                    </div>
                    <div>
                      <label
                        htmlFor="hardware-item-image"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Item Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-200">
                        <input
                          type="file"
                          id="hardware-item-image"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) =>
                            setNewHardwareItem({
                              ...newHardwareItem,
                              image: e.target.files?.[0] || null,
                            })
                          }
                          className="hidden"
                        />
                        <label
                          htmlFor="hardware-item-image"
                          className="cursor-pointer"
                        >
                          <div className="text-gray-400 mb-2">
                            <svg
                              className="w-8 h-8 mx-auto"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7h4l2-2h6l2 2h4v12H3V7zm9 9a4 4 0 100-8 4 4 0 000 8z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">
                            Upload image or use camera
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Mobile devices can open the camera directly here
                          </p>
                        </label>
                      </div>
                      {newHardwareItem.image ? (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {newHardwareItem.image.name}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {editingHardwareItemId ? "Save Item" : "Add Item"}
                    </button>
                    {editingHardwareItemId ? (
                      <button
                        type="button"
                        onClick={cancelHardwareItemEdit}
                        className="w-full sm:w-auto sm:ml-3 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </form>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Hardware Catalog ({hardwareCategories.length} categories)
                </h3>
                {hardwareCategories.length === 0 ? (
                  <EmptyState
                    message="No hardware categories found yet. Add your first category."
                    icon=""
                  />
                ) : (
                  hardwareCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {category.name}
                          </h4>
                          {category.description ? (
                            <p className="text-sm text-gray-600 mt-2">
                              {category.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startHardwareCategoryEdit(category)}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
                          >
                            Edit Category
                          </button>
                          <button
                            onClick={() => deleteItem("hardware-category", category.id)}
                            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium"
                          >
                            Delete Category
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {category.items.length === 0 ? (
                          <div className="text-sm text-gray-500">
                            No items in this category yet.
                          </div>
                        ) : (
                          category.items.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-lg border border-gray-200 p-4 bg-gray-50"
                            >
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-32 object-contain rounded-lg bg-white mb-3"
                                />
                              ) : null}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h5 className="font-semibold text-gray-900">
                                    {item.name}
                                  </h5>
                                  {item.description ? (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {item.description}
                                    </p>
                                  ) : null}
                                  {item.price || item.unit ? (
                                    <p className="text-sm text-blue-700 mt-2 font-medium">
                                      {item.price
                                        ? `KES ${Number(item.price).toLocaleString()}`
                                        : "Price on request"}
                                      {item.unit ? ` / ${item.unit}` : ""}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <button
                                    onClick={() => startHardwareItemEdit(item)}
                                    className="text-blue-600 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteItem("hardware-item", item.id)}
                                    className="text-red-600 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Sidebar */}
      <div
        className={`order-1 fixed top-0 bottom-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white text-slate-900 shadow-xl transition-transform duration-300 ease-in-out md:top-0 md:w-80 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* flex-col with h-full; only the nav scrolls */}
        <div className="flex h-full flex-col">
          {/* Sidebar header — shrink-0 so it never scrolls away */}
          <div className="shrink-0 bg-slate-900 px-4 py-4 text-white">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Radamjaribu Builders
                </p>
                <h1 className="mt-0.5 text-base font-bold leading-tight">Admin</h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                aria-label="Close menu"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {user && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/15 text-xs font-bold text-white">
                  {user.name?.[0] || user.email?.[0] || "A"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">{user.name || "Administrator"}</p>
                  <p className="truncate text-[10px] text-slate-400">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Nav — flex-1 + min-h-0 + overflow-y-auto = scrollable middle section */}
          <nav className="min-h-0 flex-1 overflow-y-auto p-2.5">
            <p className="mb-1.5 px-2 text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Navigation
            </p>
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={`mb-0.5 flex w-full items-center rounded-lg px-2.5 py-2.5 text-left transition-all duration-150 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className={`mr-2.5 h-6 w-0.5 shrink-0 rounded-full ${
                  activeTab === tab.id ? `bg-gradient-to-b ${tab.tone}` : "bg-slate-200"
                }`} />
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight">{tab.label}</span>
                  <span className={`block truncate text-[10px] ${activeTab === tab.id ? "text-slate-300" : "text-slate-400"}`}>
                    {tab.id === "bookings" && `${unreadBookingsCount} new · ${bookings.length} total`}
                    {tab.id === "contacts" && `${unreadContactsCount} new · ${contacts.length} total`}
                    {tab.id === "services" && `${services.length} services`}
                    {tab.id === "portfolio" && `${portfolio.length} projects`}
                    {tab.id === "hardware" && `${hardwareCategories.length} categories`}
                    {tab.id === "team" && `${teamMembers.length} members`}
                    {tab.id === "settings" && "Controls"}
                  </span>
                </div>
                {((tab.id === "bookings" && unreadBookingsCount > 0) ||
                  (tab.id === "contacts" && unreadContactsCount > 0)) && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    activeTab === tab.id ? "bg-white/15 text-white" : "bg-sky-100 text-sky-700"
                  }`}>
                    {tab.id === "bookings" ? unreadBookingsCount : unreadContactsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout — shrink-0 so it stays pinned at the bottom */}
          <div className="shrink-0 border-t border-slate-100 p-2.5">
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-rose-600 transition-colors hover:bg-rose-50"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* AI Reply Draft Modal */}
      {replyDraft.open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reply to {replyDraft.toName}
                </h3>
                <p className="text-sm text-gray-500">{replyDraft.to}</p>
              </div>
              <button
                onClick={() => setReplyDraft((prev) => ({ ...prev, open: false }))}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {replyDraft.generating ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Generating professional reply…</p>
              </div>
            ) : replyDraft.sent ? (
              <div className="flex flex-col items-center gap-3 py-16 text-green-600">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg font-semibold">Email sent!</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={replyDraft.subject}
                    onChange={(e) => setReplyDraft((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Body</label>
                    <span className="text-xs text-gray-400">AI-generated — edit before sending</span>
                  </div>
                  <textarea
                    rows={14}
                    value={replyDraft.body}
                    onChange={(e) => setReplyDraft((prev) => ({ ...prev, body: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-vertical font-mono text-sm leading-relaxed"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setReplyDraft((prev) => ({ ...prev, open: false }))}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendReplyEmail}
                    disabled={replyDraft.sending || !replyDraft.subject || !replyDraft.body}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 font-medium"
                  >
                    {replyDraft.sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : "Send Email"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
