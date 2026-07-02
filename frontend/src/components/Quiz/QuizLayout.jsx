import quizBg from '../../assets/quiz_bg.png';
const QuizLayout = ({ children, onNext, isLastStep }) => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-[#fdf2f8]"
      style={{ backgroundImage: `url(${quizBg})` }} // Sửa lại đường dẫn ảnh của bạn
    >
      <div className="w-full max-w-[900px] p-6 flex flex-col items-center">

        {/* Vùng chứa nội dung câu hỏi */}
        <div className="w-full grow flex items-center justify-center min-h-[400px]">
          {children}
        </div>

        {/* Nút Tiếp tục dùng chung */}
        <button 
        style={{ fontWeight: '600' }}
          onClick={onNext} 
          className="mt-10 bg-[#F176A9] text-white px-16 py-3 rounded-full font-bold hover:bg-[#D96593] transition-all shadow-md active:scale-95 min-w-[200px]"
        >
          {isLastStep ? "Hoàn thành" : "Tiếp tục"}
        </button>

      </div>
    </div>
  );
};

export default QuizLayout;