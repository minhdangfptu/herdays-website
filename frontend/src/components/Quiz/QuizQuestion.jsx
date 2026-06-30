import "./QuizQuestion.scss";
import { Clock } from "lucide-react";
import quizIntro from "../../assets/quiz_intro.png"
// 1. MÀN INTRO
export const IntroStep = ({ data }) => (
  <div className="flex flex-col items-center text-center w-full max-w-[600px] mx-auto px-4">
    <div className="w-46 h-46 rounded-full overflow-hidden mb-6 shadow-md bg-pink-100 border-4 border-white">
      <img src={quizIntro} alt="Intro" className="w-full h-full object-cover" />
    </div>
    <h2 className="text-[28px] md:text-[32px] font-bold text-[#F176A9] mb-4">{data?.title}</h2>
    <p className="text-gray-600 text-[15px] md:text-base leading-relaxed px-4">{data?.description}</p>
  </div>
);

// 2. MÀN CHỌN NGÀY
export const DatePickerStep = ({ data, value, onChange }) => (
  <div className="flex flex-col items-center w-full max-w-[500px] mx-auto">
    <h2 className="text-[28px] md:text-[32px] font-bold text-[#F176A9] mb-8 text-center">{data?.title}</h2>
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="quiz-input w-full max-w-[340px] px-5 py-3 rounded-xl border border-gray-200 bg-white outline-none text-gray-700 font-medium shadow-sm focus:border-[#F176A9] transition-colors cursor-pointer"
    />
  </div>
);

// 3. MÀN 1 Ô NHẬP SỐ
export const SingleNumberInputStep = ({ data, value, onChange }) => (
  <div className="flex flex-col items-center w-full max-w-[600px] mx-auto">
    <h2 className="text-[28px] md:text-[32px] font-bold text-[#F176A9] mb-8 text-center leading-tight">{data?.title}</h2>
    <div className="relative w-full max-w-[340px] mb-8">
      <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="number"
        placeholder="Nhập số ngày"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="quiz-input w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 bg-white outline-none text-gray-700 shadow-sm focus:border-[#F176A9] transition-colors"
      />
    </div>
    <div className="flex gap-3 justify-center flex-wrap">
      {(data?.quickOptions || [3, 4, 5, 6]).map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(String(num))}
          className="px-6 py-2 bg-[#E5E7EB] hover:bg-[#F176A9] text-gray-600 hover:text-white rounded-full text-sm font-medium transition-all"
        >
          {num} ngày
        </button>
      ))}
    </div>
  </div>
);

export const ShortAnswerStep = ({ data, value, onChange }) => (
  <div className="flex flex-col items-center w-full max-w-[600px] mx-auto">
    <h2 className="text-[28px] md:text-[32px] font-bold text-[#F176A9] mb-8 text-center leading-tight">{data?.title}</h2>
    <input
      type="text"
      placeholder={data?.placeholder || "Nhập câu trả lời"}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="quiz-input w-full max-w-[420px] px-5 py-3 rounded-xl border border-gray-200 bg-white outline-none text-gray-700 shadow-sm focus:border-[#F176A9] transition-colors"
    />
  </div>
);

// 4. MÀN 2 Ô NHẬP SỐ
export const DoubleNumberInputStep = ({ data, value = { week: "", day: "" }, onChange }) => (
  <div className="flex flex-col items-center w-full max-w-[600px] mx-auto">
    <h2 className="text-[28px] md:text-[32px] font-bold text-[#F176A9] mb-8 text-center leading-tight">{data?.title}</h2>
    <div className="flex flex-col gap-4 w-full max-w-[340px] mb-8">
      <div className="relative w-full">
        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="number"
          placeholder="Nhập số tuần"
          value={value.week || ""}
          onChange={(e) => onChange({ ...value, week: e.target.value })}
          className="quiz-input w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 bg-white outline-none text-gray-700 shadow-sm focus:border-[#F176A9] transition-colors"
        />
      </div>
      <div className="relative w-full">
        <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="number"
          placeholder="Nhập số ngày"
          value={value.day || ""}
          onChange={(e) => onChange({ ...value, day: e.target.value })}
          className="quiz-input w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 bg-white outline-none text-gray-700 shadow-sm focus:border-[#F176A9] transition-colors"
        />
      </div>
    </div>
  </div>
);

// 5. MÀN CHỌN 1 ĐÁP ÁN (DỌC)
export const VerticalSingleChoiceStep = ({ data, value, onChange }) => (
  <div className="flex flex-col items-center w-full max-w-[700px] mx-auto">
    <h2 className="text-[28px] md:text-[32px] font-bold text-[#F176A9] mb-8 text-center">{data?.title}</h2>
    <div className="flex flex-col gap-3 w-full">
      {data?.options?.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full text-left px-6 py-4 rounded-xl border transition-all shadow-sm font-medium !font-medium ${
            value === opt.value
              ? "border-[#F176A9] bg-[#FFF0F5] text-[#F176A9] !font-semibold"
              : "border-white bg-white text-gray-600 hover:border-pink-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

// 6. MÀN CHỌN 1 ĐÁP ÁN (LƯỚI 2 CỘT)
export const GridSingleChoiceStep = ({ data, value, onChange }) => (
  <div className="flex flex-col items-center w-full max-w-[800px] mx-auto">
    <h2 className="text-[28px] md:text-[32px] font-bold text-[#F176A9] mb-8 text-center leading-tight">{data?.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {data?.options?.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`w-full text-left px-5 py-4 rounded-xl border transition-all shadow-sm min-h-[72px] flex items-center font-medium !font-medium ${
            value === opt.value
              ? "border-[#F176A9] bg-[#FFF0F5] text-[#F176A9] !font-semibold"
              : "border-white bg-white text-gray-600 hover:border-pink-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

// 7. MÀN CHỌN NHIỀU ĐÁP ÁN (CHECKBOX)
export const CheckboxGridStep = ({ data, value = [], onChange }) => (
  <div className="flex flex-col items-center w-full max-w-[800px] mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-[28px] md:text-[32px] font-bold text-[#F176A9] mb-2 leading-tight">{data?.title}</h2>
      <p className="text-gray-500 text-sm">Chọn nhiều đáp án</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {data?.options?.map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center px-5 py-4 rounded-xl border cursor-pointer transition-all shadow-sm font-medium !font-medium ${
            value.includes(opt.value)
              ? "border-[#F176A9] bg-[#FFF0F5] text-[#F176A9] !font-semibold"
              : "border-white bg-white text-gray-600 hover:border-pink-200"
          }`}
        >
          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={() => {
              value.includes(opt.value)
                ? onChange(value.filter((v) => v !== opt.value))
                : onChange([...value, opt.value]);
            }}
            className="quiz-checkbox"
          />
          <span className="ml-4 text-[15px]">{opt.label}</span>
        </label>
      ))}
    </div>
  </div>
);
