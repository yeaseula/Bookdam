export default async function handler(req, res) {
  const kakaoKey = process.env.KAKAO_REST_KEY;

  if (!kakaoKey) {
    return res.status(500).json({ error: 'KAKAO_REST_KEY is not set' });
  }

  const { query } = req.query;
  const apiUrl = `https://dapi.kakao.com/v3/search/book?target=all&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `KakaoAK ${kakaoKey}` }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: '카카오 API 호출 실패' });
  }
}