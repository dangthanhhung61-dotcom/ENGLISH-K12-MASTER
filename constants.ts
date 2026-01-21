
import { User, Question } from './types';

export const COLORS = {
  primary: '#000088',
  success: '#00ff66',
  danger: '#ff0088',
  white: '#ffffff',
  gray: '#64748b'
};

export const INITIAL_USERS: User[] = [
  { userId: 'u1', role: 'teacher', fullName: 'Admin Teacher', username: 'admin' },
  { userId: 'u2', role: 'student', fullName: 'Nguyễn Văn A', username: 'student1', class: 5 },
  { userId: 'u3', role: 'student', fullName: 'Trần Thị B', username: 'student2', class: 12 }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    grade: 5,
    type: 'grammar',
    question: 'She _____ to school every day.',
    options: ['go', 'goes', 'going', 'went'],
    correctAnswer: 'goes',
    explanation: "Thì hiện tại đơn với chủ ngữ số ít 'She' thì động từ thêm 'es'."
  },
  {
    id: 'q2',
    grade: 5,
    type: 'vocabulary',
    question: 'I like to eat _____.',
    options: ['apples', 'books', 'pencils', 'tables'],
    correctAnswer: 'apples',
    explanation: 'Apples là một loại trái cây có thể ăn được.'
  },
  {
    id: 'q3',
    grade: 12,
    type: 'grammar',
    question: 'If I _____ you, I would take the job.',
    options: ['am', 'was', 'were', 'been'],
    correctAnswer: 'were',
    explanation: 'Câu điều kiện loại 2, dùng "were" cho tất cả các ngôi.'
  },
  {
    id: 'q4',
    grade: 12,
    type: 'grammar',
    question: 'The car _____ by the mechanic yesterday.',
    options: ['is repaired', 'repairs', 'was repaired', 'repairing'],
    correctAnswer: 'was repaired',
    explanation: 'Câu bị động ở thì quá khứ đơn.'
  },
  {
    id: 'q5',
    grade: 5,
    type: 'grammar',
    question: 'They _____ playing football now.',
    options: ['is', 'am', 'are', 'be'],
    correctAnswer: 'are',
    explanation: 'Thì hiện tại tiếp diễn với chủ ngữ số nhiều "They".'
  }
];
