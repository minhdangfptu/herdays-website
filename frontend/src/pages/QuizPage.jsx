import React, { useState } from 'react';
import QuizLayout from '../components/Quiz/QuizLayout';
import { 
  IntroStep, 
  DatePickerStep, 
  SingleNumberInputStep, 
  DoubleNumberInputStep, 
  VerticalSingleChoiceStep, 
  GridSingleChoiceStep, 
  CheckboxGridStep 
} from '../components/Quiz/QuizQuestion';

// Data mẫu giả lập từ Backend
const mockQuizData = [
  { id: 'q1', questionType: 'INTRO', title: 'Cùng tìm hiểu chính mình nhé!', description: 'Chào bạn, mỗi cơ thể là một vũ trụ riêng! Để HerDays trở thành người bạn đồng hành hiểu cậu nhất, hãy dành vài phút hoàn thành khảo sát này nhé!' },
  { id: 'q2', questionType: 'DATE_PICKER', title: 'Độ tuổi của bạn?' },
  { id: 'q3', questionType: 'SINGLE_NUMBER', title: 'Chu kỳ của bạn thường kéo dài bao nhiêu ngày?' },
  { id: 'q4', questionType: 'DOUBLE_NUMBER', title: 'Chu kỳ kinh nguyệt của bạn bao nhiêu tuần và ngày?' },
  { id: 'q5', questionType: 'VERTICAL_CHOICE', title: 'Kinh nguyệt của bạn có đều không?', options: [
      { id: 1, label: 'Rất đều (đúng ngày)', value: 'very_regular' },
      { id: 2, label: 'Đều (dao động 1-3 ngày)', value: 'regular' }
  ]},
  { id: 'q6', questionType: 'GRID_CHOICE', title: 'Chọn mức độ đều của kinh nguyệt?', options: [
      { id: 1, label: 'Rất đều', value: 'a' }, { id: 2, label: 'Tương đối', value: 'b' },
      { id: 3, label: 'Không đều', value: 'c' }, { id: 4, label: 'Rất không đều', value: 'd' }
  ]},
  { id: 'q7', questionType: 'CHECKBOX_GRID', title: 'Triệu chứng thường gặp?', options: [
      { id: 1, label: 'Cáu gắt', value: 'cau_gat' }, { id: 2, label: 'Buồn bã', value: 'buon_ba' },
      { id: 3, label: 'Đau lưng', value: 'dau_lung' }, { id: 4, label: 'Thèm ăn', value: 'them_an' }
  ]}
];

const QuizPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = mockQuizData[currentIndex];
  const isLastStep = currentIndex === mockQuizData.length - 1;

  // Cập nhật State khi user thao tác
  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  // Logic chuyển trang
  const handleNext = () => {
    if (isLastStep) {
      console.log('🎉 Hoàn thành Quiz! Data chuẩn bị gửi API:', answers);
      alert('Kiểm tra Console log để xem data thu được nhé!');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Switch Case để map UI
  const renderInteractiveArea = () => {
    const val = answers[currentQuestion.id];

    switch (currentQuestion.questionType) {
      case 'INTRO':
        return <IntroStep data={currentQuestion} />;
      case 'DATE_PICKER':
        return <DatePickerStep data={currentQuestion} value={val} onChange={handleAnswer} />;
      case 'SINGLE_NUMBER':
        return <SingleNumberInputStep data={currentQuestion} value={val} onChange={handleAnswer} />;
      case 'DOUBLE_NUMBER':
        return <DoubleNumberInputStep data={currentQuestion} value={val} onChange={handleAnswer} />;
      case 'VERTICAL_CHOICE':
        return <VerticalSingleChoiceStep data={currentQuestion} value={val} onChange={handleAnswer} />;
      case 'GRID_CHOICE':
        return <GridSingleChoiceStep data={currentQuestion} value={val} onChange={handleAnswer} />;
      case 'CHECKBOX_GRID':
        return <CheckboxGridStep data={currentQuestion} value={val} onChange={handleAnswer} />;
      default:
        return <div className="text-gray-500">Đang tải UI...</div>;
    }
  };

  return (
    <QuizLayout onNext={handleNext} isLastStep={isLastStep}>
      {renderInteractiveArea()}
    </QuizLayout>
  );
};

export default QuizPage;