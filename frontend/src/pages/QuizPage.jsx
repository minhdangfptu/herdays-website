import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import QuizLayout from '../components/Quiz/QuizLayout';
import {
  CheckboxGridStep,
  DatePickerStep,
  GridSingleChoiceStep,
  IntroStep,
  ShortAnswerStep,
  SingleNumberInputStep,
  VerticalSingleChoiceStep
} from '../components/Quiz/QuizQuestion';
import { hasAuthSession, quizApi } from '../services/apiService.js';

const INTRO_STEP = {
  id: 'intro',
  questionType: 'INTRO',
  title: 'Cùng tìm hiểu chính mình nhé!',
  description: 'Chào bạn, mỗi cơ thể là một vũ trụ riêng! Để HerDays trở thành người bạn đồng hành hiểu cậu nhất, hãy dành vài phút hoàn thành khảo sát này nhé!'
};

const ROLE_BY_GENERAL_ANSWER = {
  'Theo dõi chu kỳ kinh nguyệt': 'period',
  'Đang muốn có thai': 'fertility',
  'Đang mang thai': 'pregnancy-care',
  'Đang điều trị IVF': 'ivf'
};

const numberQuickOptions = ['26', '28', '30', '32', '35'];

const formatQuestion = (question) => ({
  id: question._id,
  source: question,
  tag: question.tag,
  index: question.index,
  questionType: question.question_type,
  title: question.content,
  placeholder: question.options?.[0] || 'Nhập câu trả lời',
  quickOptions: numberQuickOptions,
  options: (question.options || []).map((option, index) => ({
    id: `${question._id}-${index}`,
    label: option,
    value: option
  }))
});

const isNumericOptionsQuestion = (question) => (
  question.questionType === 'single_choice'
  && question.options.length > 20
  && question.options.every((option) => /^\d+$/.test(option.value))
);

const isEmptyAnswer = (answer) => (
  answer === undefined
  || answer === null
  || (typeof answer === 'string' && answer.trim().length === 0)
  || (Array.isArray(answer) && answer.length === 0)
);

const isFutureDateAnswer = (answer) => {
  if (typeof answer !== 'string') return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(answer);
  if (!match) return false;

  const [, year, month, day] = match.map(Number);
  const answerDate = new Date(year, month - 1, day);
  if (
    answerDate.getFullYear() !== year
    || answerDate.getMonth() !== month - 1
    || answerDate.getDate() !== day
  ) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return answerDate.getTime() > today.getTime();
};

const normalizeAnswer = (answer) => {
  if (Array.isArray(answer)) return answer.map(String);
  return String(answer);
};

function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/home';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [selectedRoleTag, setSelectedRoleTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!hasAuthSession()) {
      toast.error('Vui lòng đăng nhập để trả lời quiz.');
      navigate('/login', { replace: true });
      return undefined;
    }

    let isActive = true;

    const fetchGeneralQuestions = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const result = await quizApi.getQuestions('general');
        if (!isActive) return;
        setQuestions(result.questions.map(formatQuestion));
      } catch (error) {
        if (isActive) setErrorMessage(error.message || 'Không thể tải câu hỏi quiz.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchGeneralQuestions();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const steps = useMemo(() => [INTRO_STEP, ...questions], [questions]);
  const currentQuestion = steps[currentIndex];
  const currentAnswer = currentQuestion?.source ? answers[currentQuestion.id] : undefined;
  const isSubmitStep = currentIndex === steps.length - 1 && Boolean(selectedRoleTag);
  const isNextDisabled = Boolean(currentQuestion?.source && isEmptyAnswer(currentAnswer));

  const handleAnswer = (value) => {
    setErrorMessage('');
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
  };

  const fetchRoleQuestions = async (roleTag) => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await quizApi.getQuestions(roleTag);
      const generalQuestions = questions.filter((question) => question.tag === 'general');
      setQuestions([
        ...generalQuestions,
        ...result.questions.map(formatQuestion)
      ]);
      setSelectedRoleTag(roleTag);
      setCurrentIndex((value) => value + 1);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể tải câu hỏi theo mục tiêu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitQuiz = async () => {
    const questionAnswerContent = questions.map((question) => ({
      question: question.source.content,
      answer: normalizeAnswer(answers[question.id])
    }));

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await quizApi.submitAnswers(questionAnswerContent);
      toast.success(result.message || 'Đã lưu câu trả lời quiz.');
      navigate(returnTo, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || 'Không thể lưu câu trả lời quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion?.source) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    if (currentQuestion.questionType === 'date' && isFutureDateAnswer(currentAnswer)) {
      toast.error('Ngày sinh không được ở trong tương lai.');
      return;
    }

    setErrorMessage('');

    const roleTag = currentQuestion.tag === 'general' && currentQuestion.index === 2
      ? ROLE_BY_GENERAL_ANSWER[currentAnswer]
      : null;

    if (roleTag && roleTag !== selectedRoleTag) {
      await fetchRoleQuestions(roleTag);
      return;
    }

    if (isSubmitStep) {
      await submitQuiz();
      return;
    }

    setCurrentIndex((value) => Math.min(value + 1, steps.length - 1));
  };

  const handleBack = currentIndex > 0
    ? () => setCurrentIndex((value) => Math.max(0, value - 1))
    : null;

  const renderInteractiveArea = () => {
    if (isLoading) {
      return <p className="rounded-full bg-white/90 px-6 py-3 font-semibold text-[#F176A9] shadow-sm">Đang tải câu hỏi...</p>;
    }

    if (errorMessage && !currentQuestion) {
      return <p className="rounded-2xl bg-white/90 px-6 py-4 text-center font-semibold text-red-600 shadow-sm">{errorMessage}</p>;
    }

    if (!currentQuestion) {
      return <p className="rounded-2xl bg-white/90 px-6 py-4 text-center font-semibold text-gray-600 shadow-sm">Chưa có câu hỏi quiz.</p>;
    }

    if (errorMessage) {
      return (
        <div className="grid gap-4 text-center">
          <p className="rounded-2xl bg-white/90 px-6 py-4 font-semibold text-red-600 shadow-sm">{errorMessage}</p>
          {renderQuestion()}
        </div>
      );
    }

    return renderQuestion();
  };

  const renderQuestion = () => {
    if (!currentQuestion?.source) return <IntroStep data={currentQuestion} />;

    if (currentQuestion.questionType === 'date') {
      return <DatePickerStep data={currentQuestion} value={currentAnswer} onChange={handleAnswer} />;
    }

    if (currentQuestion.questionType === 'short_answer') {
      return <ShortAnswerStep data={currentQuestion} value={currentAnswer} onChange={handleAnswer} />;
    }

    if (currentQuestion.questionType === 'multiple_choice') {
      return <CheckboxGridStep data={currentQuestion} value={currentAnswer || []} onChange={handleAnswer} />;
    }

    if (isNumericOptionsQuestion(currentQuestion)) {
      return <SingleNumberInputStep data={currentQuestion} value={currentAnswer} onChange={handleAnswer} />;
    }

    if (currentQuestion.options.length <= 5) {
      return <VerticalSingleChoiceStep data={currentQuestion} value={currentAnswer} onChange={handleAnswer} />;
    }

    return <GridSingleChoiceStep data={currentQuestion} value={currentAnswer} onChange={handleAnswer} />;
  };

  return (
    <QuizLayout
      onBack={handleBack}
      onNext={handleNext}
      isLastStep={isSubmitStep}
      isNextDisabled={isNextDisabled || isLoading}
      isSubmitting={isSubmitting}
    >
      {renderInteractiveArea()}
    </QuizLayout>
  );
}

export default QuizPage;
