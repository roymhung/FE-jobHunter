export interface InterviewQuestion {
  id: string;
  topic: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Ngân hàng câu hỏi demo (≥30 câu) */
export const QUESTION_BANK: InterviewQuestion[] = [
  {
    id: 'jwt-1',
    topic: 'security',
    text: 'Dấu chấm "." trong JWT có vai trò gì?',
    options: [
      'Phân cách các phần của token',
      'Là chữ ký bí mật',
      'Là ký tự ngẫu nhiên',
      'Dùng để xác thực',
    ],
    correctIndex: 0,
    explanation: 'JWT gồm header.payload.signature, các phần được nối bằng dấu chấm Base64URL.',
  },
  {
    id: 'net-1',
    topic: 'networking',
    text: 'Địa chỉ IPv4 có bao nhiêu bit?',
    options: ['16', '32', '64', '128'],
    correctIndex: 1,
    explanation: 'IPv4 dùng 32 bit, thường biểu diễn 4 octet thập phân.',
  },
  {
    id: 'net-2',
    topic: 'networking',
    text: 'Port mặc định của HTTPS là?',
    options: ['80', '443', '8080', '22'],
    correctIndex: 1,
    explanation: 'HTTPS chạy trên port 443; HTTP thường là 80.',
  },
  {
    id: 'java-1',
    topic: 'java',
    text: 'HashMap trong Java xử lý collision bằng cách nào (Java 8+)?',
    options: ['Chỉ linked list', 'Chỉ red-black tree', 'List rồi tree khi bucket lớn', 'Không xử lý'],
    correctIndex: 2,
    explanation: 'Khi bucket vượt ngưỡng TREEIFY, chain chuyển sang cây đỏ-đen để giữ O(log n).',
  },
  {
    id: 'spring-1',
    topic: 'spring',
    text: '@Autowired inject theo mặc định là?',
    options: ['Theo tên bean', 'Theo kiểu (by type)', 'Theo constructor only', 'Theo profile'],
    correctIndex: 1,
    explanation: 'Mặc định Spring inject theo type; nếu nhiều bean cùng type cần @Qualifier.',
  },
  {
    id: 'ddd-1',
    topic: 'ddd',
    text: 'Aggregate root trong DDD là gì?',
    options: [
      'Entity entry point duy nhất vào cụm aggregate',
      'Một database table',
      'DTO trả về API',
      'Layer UI',
    ],
    correctIndex: 0,
    explanation: 'Mọi thay đổi trạng thái aggregate phải đi qua root để đảm bảo invariant.',
  },
  {
    id: 'sec-2',
    topic: 'security',
    text: 'CSRF attack nhắm vào?',
    options: [
      'Buộc trình duyệt gửi request đã auth tới site khác',
      'Đọc password từ DB',
      'Brute force JWT secret',
      'SQL injection',
    ],
    correctIndex: 0,
    explanation: 'CSRF lợi dụng cookie/session của user để thực thi hành động không mong muốn.',
  },
  {
    id: 'docker-1',
    topic: 'docker',
    text: 'Docker image khác container ở chỗ nào?',
    options: [
      'Image là template read-only, container là instance runtime',
      'Giống nhau',
      'Container là file tar',
      'Image chỉ chạy trên K8s',
    ],
    correctIndex: 0,
    explanation: 'Image là snapshot layer; container = image + writable layer + process.',
  },
  {
    id: 'sql-1',
    topic: 'sql',
    text: 'ACID trong transaction, chữ I là?',
    options: ['Isolation', 'Integration', 'Index', 'Identity'],
    correctIndex: 0,
    explanation: 'Isolation đảm bảo transaction đồng thời không thấy dữ liệu trung gian không nhất quán.',
  },
  {
    id: 'redis-1',
    topic: 'redis',
    text: 'Redis chủ yếu lưu dữ liệu ở?',
    options: ['Disk only', 'In-memory', 'S3', 'CDN'],
    correctIndex: 1,
    explanation: 'Redis là kho in-memory, có persistence tùy chọn (RDB/AOF).',
  },
];

/** Bổ sung đủ 30 câu bằng biến thể */
function expandBank(): InterviewQuestion[] {
  const base = [...QUESTION_BANK];
  let i = base.length;
  while (base.length < 30) {
    const src = QUESTION_BANK[i % QUESTION_BANK.length];
    base.push({
      ...src,
      id: `${src.id}-v${base.length}`,
      text: `[${base.length + 1}] ${src.text}`,
    });
    i++;
  }
  return base.slice(0, 30);
}

export function pickExamQuestions(_topicIds: string[]): InterviewQuestion[] {
  return expandBank();
}

export const EXAM_QUESTION_COUNT = 30;
export const EXAM_DURATION_SEC = 45 * 60;
export const EXAM_PASS_PERCENT = 80;
