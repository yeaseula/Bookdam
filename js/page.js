document.addEventListener('DOMContentLoaded', function () {

    const $ = (node) => document.querySelector(node);
    const sheetId = '1EiQpFub62jL2VZOULwozl_f3hkz1J-wVec9rcSbR5CU';
    const gid = '1116419757';

    // 이용자 로컬 스토리지에 샘플 데이터를 저장
    const STORAGE_KEY = 'readingBooks';

    // 샘플 데이터
    const SAMPLE_BOOKS = [
        { title: '앵무새 죽이기', totalPage: 300, readPage: 120 },
        { title: '나니아 연대기', totalPage: 200, readPage: 50 }
    ];

    // 데이터 불러오기
    function getBooks() {
        let books = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // 최초 방문 시 샘플 데이터 저장
        if (!books.length) {
            books = SAMPLE_BOOKS;
            setBooks(books);
        }
        return books;
    }

    // 데이터 저장
    function setBooks(books) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }

    function calcProgress(readPage, totalPage) {
        if (!totalPage || totalPage === 0) return '0%';
        const percent = Math.round((readPage / totalPage) * 1000) / 10; // 소수점 첫째자리 반올림
        return `${percent}%`;
    }

    let lastTap = 0;

    if(currentpage == 'write') {
        //별점 포인트
        let selectedScore = null;
        const starButtons = document.querySelectorAll('.star-point button');
        const form = document.getElementById('bookForm');

            // 별점 버튼 클릭 시 처리
        starButtons.forEach(button => {
            button.addEventListener('click', () => {
            selectedScore = button.getAttribute('data-score');

            // 시각적으로 선택된 별 강조 표시
            starButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            });
        });


        //입력 함수
        document.getElementById('submitBtn').addEventListener('click', function() {
            const form = document.getElementById('bookForm');
            const category = form['category'].value.trim();
            const title = form['book-title'].value.trim();
            const author = form['book-author'].value.trim();
            const startDate = form['start-date'].value.trim();
            const endDate = form['end-date'].value.trim();
            const oneline = form['oneline'].value.trim();
            const reviewContent = form['review-content'].value.trim();

            if (!category || !title || !author || !startDate || !endDate || !oneline || !reviewContent || selectedScore == null) {
                    alert('모든 항목을 입력해 주세요.');
                return; // 입력 안된 경우 함수 종료
            }

            saveData({
                category, title, author, startDate, endDate, oneline, reviewContent, selectedScore
            });
        });

        function saveData(data) {
            const formData = new FormData();

            //구글 폼은 연/월/일 나눠 저장=>합치는 과정 필요
            function appendDate(entryId, dateStr) {
                const [year, month, day] = dateStr.split('-');
                formData.append(`${entryId}_year`, year);
                formData.append(`${entryId}_month`, month);
                formData.append(`${entryId}_day`, day);
            }

            appendDate('entry.978124758', data.startDate);
            appendDate('entry.1886080629', data.endDate);
            formData.append('entry.111606111', data.category);
            formData.append('entry.2133626741', data.title);
            formData.append('entry.1121788773', data.author);
            formData.append('entry.2051817365', data.oneline);
            formData.append('entry.464459771', data.reviewContent);
            formData.append('entry.782264585', data.selectedScore);

        fetch('https://docs.google.com/forms/d/e/1FAIpQLSdOJ4LDIzpxZ-b1SVLv4RB0O-cMKsqUN4eTBzNs5-ec2ko4WQ/formResponse', {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        }).then(() => {
            // 저장 후 done.html로 이동
            window.location.href = 'done.html';
        }).catch(() => {
            alert('등록 중 오류가 발생했습니다.');
        });
        }
    }

    //kakao api로 북커버 호출 함수 (공통)
    async function fetchBookCover(title,author) {
        try {
            const query = `${title} ${author}`;
            const apiUrl = `https://dapi.kakao.com/v3/search/book?target=all&query=${encodeURIComponent(query)}`;

            const res = await fetch(apiUrl, {
                headers: {
                    Authorization: `KakaoAK ${kakaoKey}`
                }
            });
            const data = await res.json();
            const filtered = data.documents.find(book =>
                book.title.includes(title) && book.authors.join(',').includes(author)
            );

            return (filtered || data.documents[0])?.thumbnail || '';

            } catch (e) {
                console.error('카카오 API 오류:', e);
                return '';
            }
    }

    //구글 시트 데이터 호출 함수 (공통)
    async function loadGoogle(sheetId, gid) {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
        const text = await fetch(url).then(r => r.text());
        const json = JSON.parse(
        text
            .replace("/*O_o*/", "")
            .replace("google.visualization.Query.setResponse(", "")
            .slice(0, -2)
        );
        return json.table.rows;
    }

    if(currentpage == 'review') {
        //구글 시트에서 데이터 불러오기
        async function loadReviews() {
            const rows = await loadGoogle(sheetId, gid);

            rows.sort((a, b) => {
                const rawA = a.c[0]?.v || '';
                const rawB = b.c[0]?.v || '';
                const parseDate = (raw) => {
                    const match = raw.match(/Date\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/);
                    if (!match) return new Date(0);
                    const [ , y, m, d, h, min, s ] = match.map(Number);
                    return new Date(y, m, d, h, min, s);
                };
                return parseDate(rawB) - parseDate(rawA);
            });

            const container = document.querySelector('.my-review-list');
            container.innerHTML = '';

            for (const row of rows) {
                const title = row.c[2]?.v || '';
                const oneline = row.c[6]?.v || '';
                const author = row.c[3]?.v || '';
                const rawDate = row.c[0]?.v || '';

                let formattedDate = '';

                const dateMatch = rawDate.match(/Date\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/);

                if (dateMatch) {
                    const year = parseInt(dateMatch[1]);
                    const month = parseInt(dateMatch[2]); // 0부터 시작
                    const day = parseInt(dateMatch[3]);
                    const hour = parseInt(dateMatch[4]);
                    const minute = parseInt(dateMatch[5]);
                    const second = parseInt(dateMatch[6]);

                    const dateObj = new Date(year, month, day, hour, minute, second);

                // 원하는 포맷으로 변환 (예: 2025-07-23 09:20)
                    const formattedMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const formattedDay = String(dateObj.getDate()).padStart(2, '0');
                    const formattedHour = String(dateObj.getHours()).padStart(2, '0');
                    const formattedMinute = String(dateObj.getMinutes()).padStart(2, '0');

                    formattedDate = `${dateObj.getFullYear()}-${formattedMonth}-${formattedDay} ${formattedHour}:${formattedMinute}`;
                } else {
                    console.warn('날짜 파싱 실패:', rawDate);
                }


                const thumb = await fetchBookCover(title,author);
                const item = document.createElement('div');
                item.className = 'list-item';
                item.innerHTML = `
                    <a href="review-content.html?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}"></a>
                    <div class="list-img" style="background-image:url('${thumb}')"></div>
                    <div class="list-cont">
                    <p class="list-title">${title}</p>
                    <p class="list-summary">${oneline}</p>
                    <p class="list-date">${formattedDate}</p>
                    </div>`;
                container.appendChild(item);
            }
        }

        loadReviews();
    }
    if(currentpage == 'reviewcontent') {
        // 쿼리값(title, author) 읽기
        const params = new URLSearchParams(window.location.search);
        const title = params.get('title');
        const author = params.get('author');

        //google 시트의 날짜 형식은 Date(2025, 5, 10) 형태의 문자열로 출력, 변환처리 필요
        function sheetDateFormat(rawDate) {
            const dateMatch = rawDate.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (!dateMatch) return rawDate;
            const year = dateMatch[1];
            const month = String(Number(dateMatch[2]) + 1).padStart(2, '0'); // 0부터 시작
            const day = String(dateMatch[3]).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // 구글 시트에서 데이터 불러와서 일치하는 리뷰 찾기
        async function loadReviewDetail() {
            const rows = await loadGoogle(sheetId, gid);

            // 제목, 작가 모두 일치하는 row 찾기
            const review = rows.find(row =>
                (row.c[2]?.v || '') === title && (row.c[3]?.v || '') === author
            );
            if (!review) {
                alert('리뷰 데이터를 찾을 수 없습니다.');
                return;
            }

            // 시트 인덱스에 따라 데이터 추출
            const cate = review.c[1]?.v || '';
            const startDateRaw = review.c[4]?.v || '';
            const endDateRaw = review.c[5]?.v || '';
            const oneline = review.c[6]?.v || '';
            const reviewTextRaw = review.c[7]?.v || '';
            const star = review.c[8]?.v || '';

            // 날짜 형식 변환
            const startDate = sheetDateFormat(startDateRaw);
            const endDate = sheetDateFormat(endDateRaw);

            //textarea로 받은 값은 줄바꿈없이 출력됩니다. 변환필요
            const reviewText = reviewTextRaw.replace(/\n/g, `<br>`);

            // DOM에 값 넣기
            document.getElementById('book-cate').textContent = cate;
            document.getElementById('book-title').textContent = title;
            document.querySelector('.page-title').textContent = title;
            document.getElementById('book-author').textContent = author + ' 저';
            document.getElementById('start-date').textContent = startDate;
            document.getElementById('end-date').textContent = endDate;
            document.querySelector('.my-oneline-cont').textContent = oneline;
            document.querySelector('.my-review-cont').innerHTML = reviewText;
            document.querySelector('.point-number').textContent = star;

            // 별점(예: 8.5라면 4개 반 별 등) 처리는 필요시 추가
            MyRaiting(star);
            // 커버 이미지 넣기
            const thumb = await fetchBookCover(title, author);
            if (thumb) {
                document.querySelector('.book-cover-img').style.backgroundImage = `url('${thumb}')`;
            }
        }

        loadReviewDetail();

        function MyRaiting(star) {
            const score = star;
            const total = 10;
            document.querySelector('.icons-wrap').setAttribute(
                'aria-label',
                `내가 준 평점: ${total}점 만점에 ${score}점`
            );
        }
    }
    if(currentpage == 'reading') {
        // 리스트 렌더링
        function renderBooks() {
            const books = getBooks();
            const list = document.querySelector('.reading-book-list');
            list.innerHTML = '<h2 class="sr-only">읽고있는 책 목록</h2>';
            books.forEach((book, idx) => {
                list.innerHTML += `
                <div class="list-item" data-idx="${idx}">
                    <div class="check-field">
                        <input type="checkbox" name="list-check" id="list${idx}" aria-label="목록 선택">
                        <label for="list${idx}"><i class="ri-check-line" aria-hidden="true"></i></label>
                    </div>
                    <div class="list-infor">
                        <div>
                            <p class="book-title">${book.title}</p>
                            <p class="reading-number" ondblclick="editField(this, 'reading', ${idx})" ontouchstart="touchEdit(event, this, 'reading', ${idx})">
                                <img src="assets/img/pencil-fill.svg" alt="읽은 페이지 수정">
                                <span>${book.readPage}페이지 읽는 중</span>
                            </p>
                        </div>
                        <div>
                            <p class="reading-progress">${Math.round(book.readPage / book.totalPage * 100)}%</p>
                            <p class="total-number" ondblclick="editField(this, 'total', ${idx})" ontouchstart="touchEdit(event, this, 'total', ${idx})">
                                <img src="assets/img/pencil-fill.svg" alt="총 페이지 수정">
                                <span>총 ${book.totalPage}페이지</span>
                            </p>
                        </div>
                    </div>
                </div>`;
            });
        }

        // 책 추가
        document.querySelector('.book-add-field form').addEventListener('submit', function(e) {
            e.preventDefault();
            const title = this['rd-book-title'].value.trim();
            const totalPage = Number(this['total-book-page'].value);
            const readPage = Number(this['readed-book-page'].value);
            if (!title || !totalPage || !readPage) return alert('모든 값을 입력하세요.');
            const books = getBooks();
            books.unshift({ title, totalPage, readPage }); // 최신순
            setBooks(books);
            renderBooks();
            this.reset();
        });

        // 더블클릭/더블터치로 수정
        window.editField = function editField(el, type, idx) {
            const books = getBooks();
            const book = books[idx];
            const span = el.querySelector('span');
            const oldValue = type === 'reading' ? book.readPage : book.totalPage;
            const input = document.createElement('input');
            input.type = 'number';
            input.value = oldValue;
            input.style.width = '80px';
            span.replaceWith(input);
            input.focus();

            function save() {
                const val = Number(input.value);
                if (!val) return;
                if (type === 'reading') book.readPage = val;
                else book.totalPage = val;
                setBooks(books);
                renderBooks();
            }
            input.addEventListener('blur', save);
            input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
        }

        // 모바일 더블터치 감지
        window.touchEdit = function touchEdit(e, el, type, idx) {
            const now = Date.now();
            if (now - lastTap < 300) {
                editField(el, type, idx);
                e.preventDefault();
            }
            lastTap = now;
        }

        // 페이지 로드 시 렌더링
        renderBooks();
        // ...existing code...

        // 삭제 버튼 기능
        document.getElementById('delete_btn').addEventListener('click', function() {
            const books = getBooks();
            // 체크된 항목의 인덱스 수집
            const checked = Array.from(document.querySelectorAll('.reading-book-list input[type="checkbox"]:checked'))
                .map(input => Number(input.closest('.list-item').dataset.idx));
            if (!checked.length) {
                alert('삭제할 책을 선택하세요.');
                return;
            }
            // 체크된 인덱스 제외하고 새 배열 생성
            const newBooks = books.filter((_, idx) => !checked.includes(idx));
            setBooks(newBooks);
            renderBooks();
        });
    }
    if(currentpage == 'mypage') {
        async function loadReviews() {
            const rows = await loadGoogle(sheetId, gid)

            const now = new Date();
            const thisYear = now.getFullYear();
            const thisMonth = now.getMonth() + 1;

            let yearCount=0;
            let monthCount=0;

            function sheetDateFormat(rawDate) {
                const dateMatch = rawDate.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
                //console.log(dateMatch) ['Date(2025,6,19)', '2025', '6', '19',...] 형태반환
                if (!dateMatch) return rawDate;
                    return {
                        year: Number(dateMatch[1]),
                        month: Number(dateMatch[2]) + 1,
                        day: Number(dateMatch[3])
                    };
                }

            for (const row of rows) {
                const endDateRaw = row.c[5]?.v || '';
                const dateObj = sheetDateFormat(endDateRaw);
                //console.log(dateObj)
                if (!dateObj) continue;
                if (dateObj.year === thisYear) yearCount++;
                if (dateObj.year === thisYear && dateObj.month === thisMonth) monthCount++;
            }

            document.getElementById('total_year_read').textContent = `${yearCount} 권`;
            document.getElementById('total_month_read').textContent = `${monthCount} 권`;
        }
        loadReviews();
    }
    if(currentpage == 'done') {
        const animations = {
            done: lottie.loadAnimation({
                container: document.getElementById('lottie-animation'),
                renderer: 'svg',
                loop: false,
                autoplay: (currentpage === 'done'),
                path: 'nav-animation/Celebrations.json'
            }),
        };
    }
});

