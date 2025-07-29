// 이용자 로컬 스토리지에 책 샘플 데이터를 저장
const STORAGE_KEY = 'readingBooks';
const STORAGE_KEY2 = 'wishBook';
const STORAGE_KEY3 = 'myMemo';
// 샘플 데이터
const SAMPLE_BOOKS = [
    { title: '앵무새 죽이기', totalPage: 300, readPage: 120 },
    { title: '나니아 연대기', totalPage: 200, readPage: 50 }
];
const SAMPLE_BOOKS2 = [
    { title : '아가미', author:'구병모' , totalPrice: 13000 }
]
const SAMPLE_BOOKS3 = [
    { title: '마션', pages: '388', contents: '문제가 생기면 하나씩 해결해. 그러다 보면 집에 갈 수 있어.'}
]