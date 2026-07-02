import quizBg from '../../assets/quiz_bg.png';
const QuizLayout = ({ children, onBack, onNext, isLastStep, isNextDisabled = false, isSubmitting = false }) => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-[#fdf2f8]"
      style={{ backgroundImage: `url(${quizBg})` }}
    >
      <div className="w-full max-w-[900px] p-6 flex flex-col items-center">

        <div className="w-full grow flex items-center justify-center min-h-[400px]">
          {children}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-w-[140px] rounded-full border border-[#F176A9] bg-white px-8 py-3 font-semibold text-[#F176A9] transition-all hover:bg-[#FFF0F5] active:scale-95"
            >
              Quay lại
            </button>
          )}
          <button
            type="button"
            style={{ fontWeight: '600' }}
            onClick={onNext}
            disabled={isNextDisabled || isSubmitting}
            className="min-w-[200px] rounded-full bg-[#F176A9] px-16 py-3 font-bold text-white shadow-md transition-all hover:bg-[#D96593] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Đang lưu..." : isLastStep ? "Hoàn thành" : "Tiếp tục"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuizLayout;
