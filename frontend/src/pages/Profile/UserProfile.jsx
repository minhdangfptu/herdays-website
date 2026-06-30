import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiInfo, FiX } from "react-icons/fi";
import { AiOutlineUser, AiOutlineCheck } from "react-icons/ai";
import { Phone, Mail, Calendar, Briefcase, MapPin, Heart } from "lucide-react";
import DeleteAccountModal from "../../components/DeleteAccountModal";
import toast from "react-hot-toast";
import { profileApi } from "../../services/apiService.js";
import "./UserProfile.scss";

const targetStatusLabels = {
  tryingToConceive: "Đang mong con",
  pregnant: "Đang trong thai kỳ",
  ivf: "IVF",
  normal: "Chăm sóc sức khỏe",
  periodTracking: "Theo dõi chu kỳ",
  relatives: "Người thân",
};

const accountTypeLabels = {
  user_free: "User_free",
  user_premium: "User_premium",
  admin: "Admin",
  others: "Khác",
};

const mapProfileToForm = (profile) => ({
  displayName: profile.fullName || profile.email || "HERDAYS user",
  email: profile.email || "",
  phone: profile.phone || "",
  fullName: profile.fullName || "",
  dateOfBirth: profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
    : "",
  accountType: accountTypeLabels[profile.accountClass] || profile.accountClass || "",
  goal: targetStatusLabels[profile.targetStatus] || profile.targetStatus || "",
  address: profile.address || "",
  joinDate: "",
});

const getInitials = (name, email) => {
  const source = name || email || "Herdays";
  const words = source
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
};

export default function UserProfile() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedProfile, setSavedProfile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    fullName: "",
    dateOfBirth: "",
    accountType: "",
    goal: "",
    address: "",
    joinDate: "",
  });

  useEffect(() => {
    let isActive = true;

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await profileApi.getProfile();
        if (!isActive) return;
        const nextProfile = mapProfileToForm(profile);
        setSavedProfile(nextProfile);
        setFormData(nextProfile);
      } catch (error) {
        if (isActive) toast.error(error.message || "Không thể tải hồ sơ.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const userData = {
    displayName: formData.displayName,
    email: formData.email,
    phone: formData.phone,
    status: "Đang hoạt động",
    accountType: formData.accountType || "User_free",
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const loadingToast = toast.loading("Đang cập nhật hồ sơ...");

    try {
      const result = await profileApi.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });
      const nextProfile = mapProfileToForm(result.profile);
      setSavedProfile(nextProfile);
      setFormData(nextProfile);
      setIsEditing(false);
      toast.success(result.message || "Cập nhật hồ sơ thành công.", { id: loadingToast });
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật hồ sơ.", { id: loadingToast });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (savedProfile) setFormData(savedProfile);
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
      readOnly: true,
    },
    {
      label: "Hạng tài khoản",
      field: "accountType",
      icon: Briefcase,
      readValue: formData.accountType,
      readOnly: true,
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
        {isLoading && (
          <p className="mb-4 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-600 shadow-sm">
            Đang tải hồ sơ...
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
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

        <div className="grid md:grid-cols-[1fr_2fr] gap-6 lg:gap-10">
          <div className="user-profile-card">
            <div className="user-profile-avatar-section">
              <div className="user-profile-avatar user-profile-avatar--fallback" aria-hidden="true">
                {getInitials(userData.displayName, userData.email)}
              </div>
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
          toast.error("Backend hiện chưa có endpoint xóa tài khoản.");
        }}
      />
    </main>
  );
}