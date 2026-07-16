// Shared tool definitions — used by both Tools.jsx and ToolsCalculate.jsx
// Each entry maps to a React component in src/components/Tools/

import OvulationCalculator from '../../components/Tools/OvulationCalculator';
import BetahCGDoublingTimeCalculator from '../../components/Tools/BetahCGDoublingTimeCalculator';
import PregnancyTestCalculator from '../../components/Tools/PregnancyTestCalculator';
import MenstrualCycleCalculator from '../../components/Tools/MenstrualCycleCalculator';
import PeriodCalculator from '../../components/Tools/PeriodCalculator';
import ImplantationCalculator from '../../components/Tools/ImplantationCalculator';
import PregnancyWeeksToMonths from '../../components/Tools/PregnancyWeeksToMonths';
import PregnancyDueDateCalculator from '../../components/Tools/PregnancyDueDateCalculator';
import IVFDueDateCalculator from '../../components/Tools/IVFDueDateCalculator';
import DueDateCalculatorByUltrasound from '../../components/Tools/DueDateCalculatorByUltrasound';

export const TOOLS = [
  {
    id: 'ovulation',
    name: 'Tính ngày rụng trứng',
    description: 'Phân tích chu kỳ để tìm ra "cửa sổ thụ thai", giúp bạn chủ động kế hoạch đón bé yêu.',
    image: 'tool1',
    component: OvulationCalculator,
  },
  {
    id: 'beta-hcg',
    name: 'Tính thời gian nhân đôi Beta hCG',
    description: 'Đánh giá tốc độ tăng trưởng nồng độ Beta hCG để theo dõi sức khỏe thai kỳ giai đoạn đầu.',
    image: 'tool2',
    component: BetahCGDoublingTimeCalculator,
  },
  {
    id: 'pregnancy-test',
    name: 'Tính ngày thử thai',
    description: 'Dự đoán thời điểm nồng độ hormone đủ cao để que thử thai hiện rõ 2 vạch chuẩn xác nhất.',
    image: 'tool3',
    component: PregnancyTestCalculator,
  },
  {
    id: 'menstrual-cycle',
    name: 'Tính chu kỳ kinh nguyệt',
    description: 'Ghi chép và phân tích chu kỳ, giúp thấu hiểu cơ thể và phát hiện sớm các dấu hiệu bất thường.',
    image: 'tool4',
    component: MenstrualCycleCalculator,
  },
  {
    id: 'period',
    name: 'Dự đoán kỳ kinh',
    description: 'Dựa trên dữ liệu cá nhân để dự báo ngày "rớt dâu" tiếp theo, giúp bạn luôn tự tin, chủ động.',
    image: 'tool5',
    component: PeriodCalculator,
  },
  {
    id: 'implantation',
    name: 'Tính ngày phôi làm tổ',
    description: 'Dự đoán thời gian phôi thai làm tổ, giúp bạn tối ưu chế độ nghỉ ngơi ở giai đoạn nhạy cảm này.',
    image: 'tool6',
    component: ImplantationCalculator,
  },
  {
    id: 'pregnancy-weeks-months',
    name: 'Chuyển đổi tuần sang tháng thai kỳ',
    description: 'Quy đổi siêu tốc tuổi thai từ số tuần y khoa sang số tháng để dễ dàng theo dõi và chia sẻ.',
    image: 'tool7',
    component: PregnancyWeeksToMonths,
  },
  {
    id: 'due-date',
    name: 'Tính ngày dự sinh',
    description: 'Chỉ cần nhập ngày đầu kỳ kinh cuối, công cụ sẽ tính ngay cột mốc dự kiến bé yêu chào đời.',
    image: 'tool8',
    component: PregnancyDueDateCalculator,
  },
  {
    id: 'ivf',
    name: 'Tính ngày dự sinh IVF',
    description: 'Dự đoán ngày sinh chuẩn xác cho mẹ bầu IVF dựa trên ngày chuyển phôi và độ tuổi của phôi.',
    image: 'tool9',
    component: IVFDueDateCalculator,
  },
  {
    id: 'ultrasound',
    name: 'Tính ngày dự sinh theo siêu âm',
    description: 'Cập nhật ngày dự sinh sát với thực tế phát triển của thai nhi dựa trên các chỉ số siêu âm.',
    image: 'tool10',
    component: DueDateCalculatorByUltrasound,
  },
];

export const getToolById = (id) => TOOLS.find((tool) => tool.id === id);
