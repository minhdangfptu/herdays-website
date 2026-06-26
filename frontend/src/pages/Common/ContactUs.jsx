import React, { useState } from "react";
import { Phone, Mail, MapPin, AtSign, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import { contactApi } from "../../services/apiService";
import mapContact from "../../assets/contact_map.png";
import "./ContactUs.scss";
export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [responseMessage, setResponseMessage] = useState("");

  const contactCards = [
    {
      icon: Phone,
      title: "Hotline",
      description: "0363.274.012 (Ms. Hương Ly)",
    },
    {
      icon: MapPin,
      title: "Facebook",
      description: "Herdaysvn",
    },
    {
      icon: Mail,
      title: "Email",
      description: "herdays.team@gmail.com",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      description: "Hoà Lạc, Hà Nội",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setResponseMessage("");
    try {
      const result = await contactApi.submitContact(formData);
      setStatus("success");
      setResponseMessage(result.message || "Gửi thông tin liên hệ thành công!");
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setResponseMessage(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <main className="contact-us bg-gray-50 py-5 px-4 font-roboto">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Left Column - Contact Information */}
          <div className="pt-4 md:pt-8 lg:pt-10 flex flex-col">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-4 w-fit bg-white border border-gray-200 rounded-[8px] px-4 py-2 shadow-sm">
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-pink-100">
                <Mail size={14} className="text-pink-500" strokeWidth={2.5} />
              </div>
              <span className="text-pink-500 text-sm font-semibold">
                Liên hệ
              </span>
            </div>
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Hôm nay chúng tôi có thể giúp gì cho bạn?
            </h1>
            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 leading-tight">
              Đội ngũ hỗ trợ của chúng tôi sẽ hỗ trợ bạn chỉ trong phút mốt, vậy
              nên đừng ngần ngại liên hệ nhé
            </p>
            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {contactCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    {/* Icon Circle */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 shrink-0">
                      <IconComponent
                        size={18}
                        className="text-white"
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      {/* Card Title */}
                      <p className="text-gray-800 font-medium text-sm mb-0.5">
                        {card.title}
                      </p>

                      {/* Card Description */}
                      <p className="text-gray-700 font-semibold text-sm wrap-break-word">
                        {card.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Map Image */}
            <div className="rounded-2xl overflow-hidden h-40 md:h-56">
              <img
                src={mapContact}
                alt="Contact Map"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex flex-col justify-start">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200">
              {/* Form Title */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Để lại thông tin cá nhân
              </h2>

              {/* Form Description */}
              <p className="text-gray-600 text-sm mb-6">
                Để lại thông tin để nhân những thông báo mới nhất về Herdays
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-2">
                    Tên của bạn
                  </label>
                  <div className="relative">
                    <AtSign
                      size={16}
                      className="absolute left-3 top-3 text-gray-400"
                      strokeWidth={2}
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập tên của bạn"
                      className="contact-control w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-3 text-gray-400"
                      strokeWidth={2}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ Email của bạn"
                      className="contact-control w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-3 text-gray-400"
                      strokeWidth={2}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại của bạn"
                      className="contact-control w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Address and City Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-2">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ của bạn"
                      className="contact-control w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs font-medium mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <div className="relative">
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="contact-control w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:outline-none text-gray-600"
                      >
                        <option value="">Chọn thành phố</option>
                        <option value="hanoi">Hà Nội</option>
                        <option value="hcm">TP. Hồ Chí Minh</option>
                        <option value="danang">Đà Nẵng</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-2">
                    Chủ đề bạn quan tâm
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="contact-control w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:outline-none text-gray-600"
                    >
                      <option value="">Chọn chủ đề bạn quan tâm</option>
                      <option value="product">Sản phẩm</option>
                      <option value="support">Hỗ trợ</option>
                      <option value="other">Khác</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="block text-gray-700 text-xs font-medium mb-2">
                    Nội dung bạn quan tâm
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Điền nội dung bạn quan tâm"
                    rows="4"
                    className="contact-control w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none resize-none"
                  ></textarea>
                </div>

                {/* Status Message */}
                {status !== "idle" && (
                  <div
                    className={`status-message flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
                      status === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {status === "success" ? (
                      <CheckCircle size={16} strokeWidth={2} />
                    ) : (
                      <AlertCircle size={16} strokeWidth={2} />
                    )}
                    <span>{responseMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-pink-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Đang gửi..." : "Gửi"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
