import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import FormInput, {
  validateEmail,
  validateRequired,
} from "../components/FormInput";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { API_BASE } from "../utils/api";

const Contact = () => {
  const [query, setQuery] = useState({
    userName: "",
    userEmail: "",
    userQuery: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setQuery({
      ...query,
      [name]: value,
    });

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  }

  function validateForm() {
    const newErrors = {};

    newErrors.userName = validateRequired(query.userName, "Name");
    newErrors.userEmail = validateEmail(query.userEmail);
    newErrors.userQuery = validateRequired(query.userQuery, "Message");

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== "");
  }

  async function handleForm(e) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/userquery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Query submitted successfully!");
        setQuery({
          userName: "",
          userEmail: "",
          userQuery: "",
        });
        setErrors({});
      } else {
        toast.error(result.message || "Failed to submit query");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to submit query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 text-lg">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">
              Send us a Message
            </h2>

            <form onSubmit={handleForm} className="space-y-6">
              <FormInput
                label="Your Name"
                type="text"
                name="userName"
                value={query.userName}
                onChange={handleChange}
                error={errors.userName}
                placeholder="Enter your full name"
                required
              />

              <FormInput
                label="Email Address"
                type="email"
                name="userEmail"
                value={query.userEmail}
                onChange={handleChange}
                error={errors.userEmail}
                placeholder="your.email@example.com"
                required
              />

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="userQuery"
                  value={query.userQuery}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows="5"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.userQuery
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  }`}
                />
                {errors.userQuery && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.userQuery}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" message="" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  <>
                    <FaEnvelope className="mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Contact Information
              </h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <FaEnvelope className="text-green-500 text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600">support@choppertown.com</p>
                    <p className="text-gray-600">info@choppertown.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaPhone className="text-green-500 text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Phone</h4>
                    <p className="text-gray-600">+91 94331 37660</p>
                    <p className="text-gray-600">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-green-500 text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Address</h4>
                    <p className="text-gray-600">123 Commerce Street</p>
                    <p className="text-gray-600">Kolkata, West Bengal 700001</p>
                    <p className="text-gray-600">India</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaClock className="text-green-500 text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Business Hours
                    </h4>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM
                    </p>
                    <p className="text-gray-600">
                      Saturday: 10:00 AM - 4:00 PM
                    </p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Frequently Asked Questions
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    How long does shipping take?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Standard shipping typically takes 3-5 business days within
                    India.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    What is your return policy?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We offer a 30-day return policy for unused items in original
                    packaging.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Do you offer customer support?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Yes! Our support team is available during business hours to
                    help you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
