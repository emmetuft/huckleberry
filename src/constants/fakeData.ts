import { Message } from 'models/interfaces/message';

export const fakeMessages: Message[] = [
  {
    id: 'user-1',
    role: 'user',
    content: 'What are the main trends in our sales data for Q4?',
    timestamp: Date.now() - 300000, // 5 minutes ago
  },
  {
    id: 'assistant-1',
    role: 'assistant',
    content:
      'Based on the sales data for Q4, I can see three main trends: 1) A 23% increase in online sales compared to Q3, 2) Strong performance in the electronics category with a 45% growth, and 3) A slight decline in physical store sales of about 8%.',
    timestamp: Date.now() - 280000,
    response: {
      output:
        'Based on the sales data for Q4, I can see three main trends: 1) A 23% increase in online sales compared to Q3, 2) Strong performance in the electronics category with a 45% growth, and 3) A slight decline in physical store sales of about 8%.',
      context: {
        nodes: [],
        relationships: [],
      },
    },
  },
  {
    id: 'user-2',
    role: 'user',
    content: 'Can you break down the electronics sales by product category?',
    timestamp: Date.now() - 240000,
  },
  {
    id: 'assistant-2',
    role: 'assistant',
    content:
      "Here's the breakdown of electronics sales by category:\n\n- Smartphones: $2.3M (40% of electronics)\n- Laptops: $1.8M (31%)\n- Tablets: $950K (16%)\n- Accessories: $750K (13%)\n\nSmartphones saw the highest growth rate at 52% compared to Q3.",
    timestamp: Date.now() - 220000,
    response: {
      output:
        "Here's the breakdown of electronics sales by category:\n\n- Smartphones: $2.3M (40% of electronics)\n- Laptops: $1.8M (31%)\n- Tablets: $950K (16%)\n- Accessories: $750K (13%)\n\nSmartphones saw the highest growth rate at 52% compared to Q3.",
      context: {
        nodes: [],
        relationships: [],
      },
    },
  },
  {
    id: 'user-3',
    role: 'user',
    content: 'What regions had the strongest performance?',
    timestamp: Date.now() - 180000,
  },
  {
    id: 'assistant-3',
    role: 'assistant',
    content:
      'The strongest performing regions were:\n\n1. West Coast: +35% YoY, driven by tech sector demand\n2. Southeast: +28% YoY, expanding customer base\n3. Midwest: +15% YoY, steady growth\n\nThe Northeast region remained flat at +2% YoY.',
    timestamp: Date.now() - 160000,
    response: {
      output:
        'The strongest performing regions were:\n\n1. West Coast: +35% YoY, driven by tech sector demand\n2. Southeast: +28% YoY, expanding customer base\n3. Midwest: +15% YoY, steady growth\n\nThe Northeast region remained flat at +2% YoY.',
      context: {
        nodes: [],
        relationships: [],
      },
    },
  },
];
