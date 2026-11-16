import { createInquiryHandler } from '../server/inquiry-service.js';

export const config = { maxDuration: 20 };
export default createInquiryHandler();
