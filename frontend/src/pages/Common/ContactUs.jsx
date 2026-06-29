import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  AtSign,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
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
  const [fieldErrors, setFieldErrors] = useState({});

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
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");


    const loadingToast = toast.loading("Đang gửi liên hệ...");

    try {
      const result = await contactApi.submitContact(formData);
      toast.success(result.message || "Gửi thông tin liên hệ thành công!", { id: loadingToast });
      setStatus("success");
      setFieldErrors({});
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
      toast.error(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.", { id: loadingToast });
      setStatus("error");
      const errors = contactApi.getFieldErrors(err);
      if (Object.values(errors).some(Boolean)) {
        setFieldErrors(errors);
      }
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
                <Mail size={14} className="text-[#ED77A5]" strokeWidth={2.5} />
              </div>
              <span className="text-[#ED77A5] text-sm font-semibold">
                Liên hệ
              </span>
            </div>
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Hôm nay chúng tôi có thể <br></br>giúp gì cho bạn?
            </h1>
            {/* Description */}
            <p className="text-gray-600 text-base mb-4 leading-relaxed">
              Đội ngũ hỗ trợ của chúng tôi sẽ hỗ trợ bạn chỉ trong phút mốt, vậy
              nên <br></br>đừng ngần ngại liên hệ nhé
            </p>
            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {contactCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    {/* Icon Circle */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ED77A5] shrink-0">
                      <IconComponent
                        size={18}
                        className="text-white"
                        strokeWidth={2}
                      />
                    </div>

                    <div>
                      {/* Card Title */}
                      <p className="text-gray-800 font-light text-sm mb-0.5">
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
                {/* Name + Phone Row */}
                <div className="grid grid-cols-2 gap-4">
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
                        className={`contact-control w-full pl-9 pr-4 py-2 h-10 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none placeholder:text-sm${fieldErrors.name ? ' is-error' : ''}`}
                      />
                      {fieldErrors.name && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                      )}
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
                        placeholder="Nhập số điện thoại"
                        className={`contact-control w-full pl-9 pr-4 py-2 h-10 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none placeholder:text-sm${fieldErrors.phone ? ' is-error' : ''}`}
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                      )}
                    </div>
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
                      className={`contact-control w-full pl-9 pr-4 py-2 h-10 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none placeholder:text-sm${fieldErrors.email ? ' is-error' : ''}`}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                    )}
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
                      className={`contact-control w-full px-4 py-2 h-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none placeholder:text-sm text-base${fieldErrors.address ? ' is-error' : ''}`}
                    />
                    {fieldErrors.address && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.address}</p>
                    )}
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
                        className={`contact-control w-full px-4 py-2 h-10 border border-gray-300 rounded-lg text-base focus:outline-none appearance-none bg-white text-gray-600${fieldErrors.city ? ' is-error' : ''}`}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {/* 5 thành phố trực thuộc trung ương */}
                        <option value="Thành phố Hà Nội">
                          Thành phố Hà Nội
                        </option>
                        <option value="Thành phố Hồ Chí Minh">
                          Thành phố Hồ Chí Minh
                        </option>
                        <option value="Thành phố Hải Phòng">
                          Thành phố Hải Phòng
                        </option>
                        <option value="Thành phố Đà Nẵng">
                          Thành phố Đà Nẵng
                        </option>
                        <option value="Thành phố Cần Thơ">
                          Thành phố Cần Thơ
                        </option>
                        <option value="Thành phố Huế">Thành phố Huế</option>

                        <option value="Tỉnh An Giang">Tỉnh An Giang</option>
                        <option value="Tỉnh Bắc Ninh">Tỉnh Bắc Ninh</option>
                        <option value="Tỉnh Cà Mau">Tỉnh Cà Mau</option>
                        <option value="Tỉnh Cao Bằng">Tỉnh Cao Bằng</option>
                        <option value="Tỉnh Đắk Lắk">Tỉnh Đắk Lắk</option>
                        <option value="Tỉnh Điện Biên">Tỉnh Điện Biên</option>
                        <option value="Tỉnh Đồng Nai">Tỉnh Đồng Nai</option>
                        <option value="Tỉnh Đồng Tháp">Tỉnh Đồng Tháp</option>
                        <option value="Tỉnh Gia Lai">Tỉnh Gia Lai</option>
                        <option value="Tỉnh Hà Tĩnh">Tỉnh Hà Tĩnh</option>
                        <option value="Tỉnh Hưng Yên">Tỉnh Hưng Yên</option>
                        <option value="Tỉnh Khánh Hoà">Tỉnh Khánh Hoà</option>
                        <option value="Tỉnh Lai Châu">Tỉnh Lai Châu</option>
                        <option value="Tỉnh Lâm Đồng">Tỉnh Lâm Đồng</option>
                        <option value="Tỉnh Lạng Sơn">Tỉnh Lạng Sơn</option>
                        <option value="Tỉnh Lào Cai">Tỉnh Lào Cai</option>
                        <option value="Tỉnh Nghệ An">Tỉnh Nghệ An</option>
                        <option value="Tỉnh Ninh Bình">Tỉnh Ninh Bình</option>
                        <option value="Tỉnh Phú Thọ">Tỉnh Phú Thọ</option>
                        <option value="Tỉnh Quảng Ngãi">Tỉnh Quảng Ngãi</option>
                        <option value="Tỉnh Quảng Ninh">Tỉnh Quảng Ninh</option>
                        <option value="Tỉnh Quảng Trị">Tỉnh Quảng Trị</option>
                        <option value="Tỉnh Sơn La">Tỉnh Sơn La</option>
                        <option value="Tỉnh Tây Ninh">Tỉnh Tây Ninh</option>
                        <option value="Tỉnh Thái Nguyên">
                          Tỉnh Thái Nguyên
                        </option>
                        <option value="Tỉnh Thanh Hóa">Tỉnh Thanh Hóa</option>
                        <option value="Tỉnh Tuyên Quang">
                          Tỉnh Tuyên Quang
                        </option>
                        <option value="Tỉnh Vĩnh Long">Tỉnh Vĩnh Long</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                      />
                    </div>
                    {/* {fieldErrors.city && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>
                    )} */}
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
                      className={`contact-control w-full px-4 py-2 h-10 border border-gray-300 rounded-lg text-base focus:outline-none appearance-none bg-white text-gray-600${fieldErrors.subject ? ' is-error' : ''}`}
                    >
                      <option value="">Chọn chủ đề bạn quan tâm</option>
                      <option value="general">Sản phẩm</option>
                      <option value="account">Tài khoản</option>
                      <option value="technical">Hỗ trợ kỹ thuật</option>
                      <option value="partnership">Hợp tác</option>
                      <option value="feedback">Góp ý</option>
                      <option value="other">Khác</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-3 text-gray-400 pointer-events-none"
                    />
                  </div>
                  {fieldErrors.subject && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.subject}</p>
                  )}
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
                    className={`contact-control w-full px-4 py-2 border border-gray-300 rounded-lg text-base placeholder-gray-400 focus:outline-none resize-none placeholder:text-sm${fieldErrors.message ? ' is-error' : ''}`}
                  ></textarea>
                  {fieldErrors.message && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[#ED77A5] text-white py-2.5 rounded-lg font-semibold text-base hover:bg-[#D46893] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
