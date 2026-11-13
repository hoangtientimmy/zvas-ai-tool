import React from 'react';

/** Icon AI: 2 sao 4 cánh (1 lớn, 1 nhỏ) — dùng cho các nút tạo ảnh. Tô bằng currentColor. */
export const AiSparkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M9.5 5.5Q11.66 12.34 18.5 14.5Q11.66 16.66 9.5 23.5Q7.34 16.66 0.5 14.5Q7.34 12.34 9.5 5.5Z" />
    <path d="M18.5 0.5Q19.7 4.3 23.5 5.5Q19.7 6.7 18.5 10.5Q17.3 6.7 13.5 5.5Q17.3 4.3 18.5 0.5Z" />
  </svg>
);
