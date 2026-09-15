import type { NextConfig } from 'next';
const config: NextConfig = { output: process.env.DUZE_STANDALONE === '1' ? 'standalone' : undefined };
export default config;
