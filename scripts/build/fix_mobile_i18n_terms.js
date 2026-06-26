const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'new', 'asset', 'i18n', 'ko.json');

const replacements = [
  [/DietOn/g, 'DietOn'],
  [/DietOn/g, 'DietOn'],
  [/탈모성지/g, '다이어트 성지'],
  [/탈모커뮤니티/g, '다이어트 커뮤니티'],
  [/탈모 커뮤니티/g, '다이어트 커뮤니티'],
  [/탈모병원/g, '비만클리닉'],
  [/탈모 병원/g, '비만클리닉'],
  [/탈모의사/g, '다이어트 전문가'],
  [/탈모 의사/g, '다이어트 전문가'],
  [/탈모의약품/g, '비만치료제'],
  [/탈모 의약품/g, '비만치료제'],
  [/탈모약/g, '비만치료제'],
  [/탈모샴푸/g, '다이어트 보조제'],
  [/탈모제품/g, '다이어트 제품'],
  [/탈모 제품/g, '다이어트 제품'],
  [/탈모건기식/g, '다이어트 건기식'],
  [/탈모기능식품/g, '다이어트 기능식품'],
  [/탈모치료/g, '비만치료'],
  [/탈모 치료/g, '비만치료'],
  [/탈모관리/g, '체중관리'],
  [/탈모 관리/g, '체중관리'],
  [/탈모후기/g, '다이어트 후기'],
  [/탈모 후기/g, '다이어트 후기'],
  [/탈모톡톡/g, '다이어트톡톡'],
  [/탈모 톡톡/g, '다이어트 톡톡'],
  [/탈모수다/g, '다이어트수다'],
  [/탈모 수다/g, '다이어트 수다'],
  [/탈모뉴스/g, '다이어트 뉴스'],
  [/탈모FAQ/g, '다이어트 FAQ'],
  [/탈모자가진단/g, '비만도 자가진단'],
  [/탈모전문가/g, '다이어트 전문가'],
  [/탈모고수/g, '다이어트 고수'],
  [/탈모 고민/g, '체중 고민'],
  [/탈모유형/g, '체형 유형'],
  [/탈모 유형/g, '체형 유형'],
  [/탈모/g, '다이어트'],
  [/모발이식/g, '비만치료'],
  [/자가 모발이식/g, '맞춤 비만치료'],
  [/모발케어/g, '체형관리'],
  [/모발 케어/g, '체형관리'],
  [/모발제품/g, '체형관리 제품'],
  [/모발 제품/g, '체형관리 제품'],
  [/모발/g, '체형'],
  [/모낭/g, '감량 목표'],
  [/두피문신/g, '체형관리'],
  [/두피 문신/g, '체형관리'],
  [/두피치료/g, '체형관리'],
  [/두피 치료/g, '체형관리'],
  [/두피제품/g, '다이어트 제품'],
  [/두피 제품/g, '다이어트 제품'],
  [/두피케어/g, '체형관리'],
  [/두피 케어/g, '체형관리'],
  [/두피/g, '체형'],
  [/맞춤가발/g, '맞춤 식단'],
  [/부분가발/g, '부분 감량'],
  [/여자가발/g, '여성 바디프로필'],
  [/남성맞춤가발/g, '남성 맞춤 식단'],
  [/여성맞춤가발/g, '여성 맞춤 식단'],
  [/가발업체/g, '바디프로필 업체'],
  [/가발/g, '바디프로필'],
  [/증모업체/g, '식단상담처'],
  [/증모술/g, '식단관리'],
  [/증모/g, '식단관리'],
  [/헤어라인/g, '바디라인'],
  [/머리빨/g, '관리빨'],
  [/머리/g, '몸매'],
  [/샴푸/g, '보조제'],
  [/정수리/g, '복부'],
  [/M자/g, '복부형'],
  [/대머리/g, '고도비만'],
  [/득모/g, '감량'],
  [/AGA/g, '비만'],
  [/피나스테리드/g, '식욕조절제'],
  [/두타스테리드/g, '식욕조절제'],
  [/미녹시딜/g, '다이어트 보조제'],
  [/프로페시아/g, '다이어트 보조제'],
  [/아보다트/g, '다이어트 보조제'],
];

function replaceText(value) {
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function walk(value) {
  if (typeof value === 'string') return replaceText(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, walk(child)]));
  }
  return value;
}

const json = JSON.parse(fs.readFileSync(file, 'utf8'));
fs.writeFileSync(file, `${JSON.stringify(walk(json), null, 2)}\n`, 'utf8');
console.log('Updated mobile i18n residual hair-loss terms.');
