import { useState } from "react";
import { FiEdit2, FiTrash2, FiInfo, FiX } from "react-icons/fi";
import { AiOutlineUser, AiOutlineCheck } from "react-icons/ai";
import { Phone, Mail, Calendar, Briefcase, MapPin, Heart } from "lucide-react";
import DeleteAccountModal from "../../components/DeleteAccountModal";
import "./UserProfile.scss";

export default function UserProfile() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "Nhật Handsome",
    email: "nhat.handsome.hihi@gmail.com",
    phone: "+84 912 345 678",
    fullName: "Nguyễn Thị Mai Anh",
    dateOfBirth: "30/02/2000",
    accountType: "free_user",
    goal: "Đang trong thai kỳ",
    address: "Hoà Lạc, Hà Nội",
    joinDate: "15/03/2024",
  });

  const userData = {
    displayName: formData.displayName,
    email: formData.email,
    phone: formData.phone,
    status: "Đang hoạt động",
    accountType: "User_free",
    avatar: "https://via.placeholder.com/200?text=User+Avatar",
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: gọi API cập nhật thông tin
    console.log("Lưu thông tin:", formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset về dữ liệu ban đầu nếu cần
    setFormData({
      displayName: "Nhật Handsome",
      email: "nhat.handsome.hihi@gmail.com",
      phone: "+84 912 345 678",
      fullName: "Nguyễn Thị Mai Anh",
      dateOfBirth: "30/02/2000",
      accountType: "free_user",
      goal: "Đang trong thai kỳ",
      address: "Hoà Lạc, Hà Nội",
      joinDate: "15/03/2024",
    });
  };

  const fieldConfigs = [
    {
      label: "Họ và tên",
      field: "fullName",
      icon: AiOutlineUser,
      readValue: formData.fullName,
    },
    {
      label: "Email",
      field: "email",
      icon: Mail,
      readValue: formData.email,
      readOnly: true,
    },
    {
      label: "Số điện thoại",
      field: "phone",
      icon: Phone,
      readValue: formData.phone,
    },
    {
      label: "Ngày sinh",
      field: "dateOfBirth",
      icon: Calendar,
      readValue: formData.dateOfBirth,
    },
    {
      label: "Hạng tài khoản",
      field: "accountType",
      icon: Briefcase,
      readValue: formData.accountType,
    },
    {
      label: "Mục tiêu",
      field: "goal",
      icon: Heart,
      readValue: formData.goal,
      readOnly: true,
      changeGoalText: "Thay đổi mục tiêu",
    },
    {
      label: "Ngày tham gia",
      field: "joinDate",
      icon: Calendar,
      readValue: formData.joinDate,
      readOnly: true,
    },
    {
      label: "Địa chỉ",
      field: "address",
      icon: MapPin,
      readValue: formData.address,
    },
  ];

  return (
    <main className="contact-us bg-gray-50 py-5 px-4 font-roboto">
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            {/* Badge */}
            <div
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="inline-flex items-center gap-2 mb-3 w-fit bg-white border border-gray-200 rounded-[8px] px-4 py-2 shadow-sm"
            >
              <div className="flex items-center justify-center w-4 h-4 rounded-full">
                <AiOutlineUser size={30} className="text-[#ED77A5]" strokeWidth={4} />
              </div>
              <span className="text-[#ED77A5] text-sm font-semibold">
                Chi tiết Người dùng
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  className="user-profile-btn user-profile-btn--save"
                  onClick={handleSave}
                >
                  <AiOutlineCheck size={16} />
                  Lưu
                </button>
                <button
                  className="user-profile-btn user-profile-btn--cancel-edit"
                  onClick={handleCancel}
                >
                  <FiX size={16} />
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  className="user-profile-btn user-profile-btn--edit"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit2 size={16} />
                  Chỉnh sửa
                </button>
                <button
                  className="user-profile-btn user-profile-btn--delete"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FiTrash2 size={16} />
                  Xóa tài khoản
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-6 lg:gap-10">

          {/* Left Column - Profile Card */}
          <div className="user-profile-card">
            <div className="user-profile-avatar-section">
              <img
                src={userData.avatar}
                alt={userData.displayName}
                className="user-profile-avatar"
              />
              <div className="user-profile-avatar-edit">
                <FiEdit2 size={14} />
              </div>
            </div>

            <h2 className="user-profile-name">{userData.displayName}</h2>
            <p className="user-profile-email">{userData.email}</p>

            <div className="user-profile-badges">
              <span className="user-profile-badge user-profile-badge--active">
                <span className="user-profile-badge-dot"></span>
                {userData.status}
              </span>
              <span className="user-profile-badge user-profile-badge--type">
                <FiInfo size={14} />
                {userData.accountType}
              </span>
            </div>

            <div className="user-profile-details-mini">
              <div className="user-profile-detail-item">
                <span className="user-profile-detail-label">Số điện thoại</span>
                <span className="user-profile-detail-value">{formData.phone}</span>
              </div>
              <div className="user-profile-detail-item">
                <span className="user-profile-detail-label">Mục tiêu</span>
                <span className="user-profile-detail-value">{formData.goal}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="user-profile-details-card">
            <div className="user-profile-details-header">
              <FiInfo size={20} className="user-profile-details-icon" />
              <h2 className="user-profile-details-title">Thông tin chi tiết</h2>
            </div>

            <div className="user-profile-details-grid">
              {fieldConfigs.map(({ label, field, icon: Icon, readValue, readOnly, changeGoalText }) => (
                <div key={field} className="user-profile-detail-row">
                  <span className="user-profile-detail-label">{label}</span>
                  {isEditing && !readOnly ? (
                    <div className="relative">
                      <Icon
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        strokeWidth={2}
                      />
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="user-profile-input w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#ED77A5]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="user-profile-detail-value">{readValue}</span>
                      {changeGoalText && (
                        <span className="user-profile-goal-link">{changeGoalText}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          // TODO: gọi API xóa tài khoản
          console.log("Xóa tài khoản");
        }}
      />
    </main>
  );
}
